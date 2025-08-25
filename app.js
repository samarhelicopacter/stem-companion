// Initialize the companion
class STEMCompanion {
    constructor() {
        this.mode = 'tutor';
        this.context = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.mode = e.target.dataset.mode;
                this.addBotMessage(`Switched to ${this.mode} mode. How can I help you?`);
            });
        });
    }

    async sendMessage() {
        const input = document.getElementById('user-input');
        const message = input.value.trim();
        
        if (!message) return;
    
        // Add user message to chat
        this.addUserMessage(message);
        input.value = '';
    
        // Add loading message with a unique ID
        const loadingId = 'loading-' + Date.now();
        this.addLoadingMessage(loadingId);
    
        // Get response
        const response = await this.getCompanionResponse(message);
        
        // Remove loading and add real response
        document.getElementById(loadingId).remove();
        this.addBotMessage(response);
    }

    async getCompanionResponse(message) {
        const systemPrompt = `You are Dr. Marie, a professional female scientist and STEM educator. 
        You are warm, encouraging, and passionate about science education.
        IMPORTANT: You maintain strict professional boundaries - never flirt, never make personal comments.
        You focus exclusively on science, research, and inspiring learning.
        
        Current mode: ${this.mode}
        - Tutor mode: Explain concepts clearly, use analogies, be patient
        - Research mode: Discuss methodology, papers, experimental design  
        - Inspiration mode: Share stories of diverse scientists, especially women in STEM`;

        try {
            const response = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (localStorage.getItem('xai-JBTzlquBcJvd1xddqPKozNBctAmohRp4SaOz9CYAnO9H0qlfiYIRnwQpwPCPbCyIYTOq0WOVWTTme9Q0')
                },
        
                body: JSON.stringify({
                    model: 'grok-2-latest',
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user', 
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Details:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText,
                    timestamp: new Date().toISOString()
                });
                
                // Return more helpful error messages
                if (response.status === 429) {
                    return "Dr. Marie needs a moment to catch up - too many questions at once! Please try again in a few seconds.";
                } else if (response.status === 401) {
                    return "There's an issue with my credentials. Please check the API key configuration.";
                } else {
                    throw new Error(`API returned ${response.status}`);
                }
            }

            const data = await response.json();
            console.log('Successful API Response');
            
            if (data && data.choices && data.choices[0] && data.choices[0].message) {
                return data.choices[0].message.content;
            } else {
                console.error('Unexpected response structure:', data);
                throw new Error('Unexpected API response structure');
            }
            
        } catch (error) {
            console.error('Error calling Grok:', {
                error: error.message,
                timestamp: new Date().toISOString(),
                userMessage: message,
                mode: this.mode
            });
            
            // Better fallback responses
            return this.getSmartFallback(message);
        }
    }

    getSmartFallback(message) {
        const lowerMessage = message.toLowerCase();
        
        // Add specific responses for common topics when API fails
        if (lowerMessage.includes('cancer')) {
            return "I apologize - I'm having trouble connecting to my full knowledge base right now. But I can tell you that cancer biology involves uncontrolled cell growth due to DNA mutations. These mutations affect genes controlling cell division, repair, and death. For a more detailed explanation, please try again in a moment!";
        }
        
        if (lowerMessage.includes('stem cell')) {
            return "I'm having connection issues, but briefly: stem cells are undifferentiated cells that can develop into specialized cell types. They're crucial for development, repair, and potential therapies. Please try again for a more comprehensive explanation!";
        }

        if (lowerMessage.includes('krebs') || lowerMessage.includes('citric acid')) {
            return "Connection issue, but here's a quick overview: The Krebs cycle (citric acid cycle) is a series of chemical reactions in cells that generates energy through the oxidation of acetyl-CoA. It's central to cellular respiration. Please try again for a detailed explanation!";
        }

        if (lowerMessage.includes('photosynth')) {
            return "Having connection troubles, but briefly: Photosynthesis converts light energy into chemical energy in plants and some bacteria, using CO2 and water to produce glucose and oxygen. Try again for a complete explanation!";
        }
        
        // Default to the existing local response
        return this.getLocalResponse(message);
    }

    getLocalResponse(message) {
        const responses = {
            tutor: this.getTutorResponse(message),
            research: this.getResearchResponse(message),
            inspiration: this.getInspirationResponse(message)
        };
        
        return responses[this.mode];
    }

    getTutorResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('protein')) {
            return "Great question about proteins! Proteins are made of amino acids linked together. They fold into specific 3D shapes that determine their function. Would you like to explore protein structure, synthesis, or their role in the cell?";
        }
        
        if (lowerMessage.includes('dna')) {
            return "DNA is fascinating! It's a double helix structure that stores genetic information using just 4 bases: A, T, G, and C. What aspect interests you most - replication, transcription, or maybe how mutations work?";
        }
        
        return "That's an interesting question! Let me help you understand this concept step by step. What's your current level of knowledge on this topic - are you a beginner, intermediate, or advanced?";
    }

    getResearchResponse(message) {
        return "From a research perspective, that's a great area to explore. Have you considered: 1) What's already known in the literature? 2) What methods could test your hypothesis? 3) What controls would you need? Let's develop your research approach together.";
    }

    getInspirationResponse(message) {
        const inspirations = [
            "Did you know Marie Curie was the first woman to win a Nobel Prize and the only person to win Nobel Prizes in two different sciences?",
            "Katherine Johnson's calculations were critical for NASA's space missions, including the moon landing!",
            "Rosalind Franklin's X-ray crystallography was key to understanding DNA's structure.",
            "Your curiosity today could lead to tomorrow's breakthrough!"
        ];
        
        return inspirations[Math.floor(Math.random() * inspirations.length)] + " Now, about your question - let's explore it together!";
    }

    addUserMessage(message) {
        const chatHistory = document.getElementById('chat-history');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = message;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    addBotMessage(message) {
        const chatHistory = document.getElementById('chat-history');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        // Convert markdown to HTML
        messageDiv.innerHTML = marked.parse(message);
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    addLoadingMessage(id) {
        const chatHistory = document.getElementById('chat-history');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.id = id;
        messageDiv.innerHTML = '<em>Dr. Marie is thinking of the best way to explain this...</em>';
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}

// Start the companion when page loads
document.addEventListener('DOMContentLoaded', () => {
    new STEMCompanion();
});
