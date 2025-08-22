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

        // Get response
        const response = await this.getCompanionResponse(message);
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
        // Try the API call
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + 'ADD-YOUR-XAI-API-KEY-HERE'
            },
            body: JSON.stringify({
                model: 'grok-2-latest',  // Changed model name
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
            console.log('API Error. Status:', response.status);
            const errorText = await response.text();
            console.log('Error details:', errorText);
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        // Check if the response has the expected structure
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        } else {
            console.log('Unexpected response structure:', data);
            throw new Error('Unexpected API response structure');
        }
        
    } catch (error) {
        console.error('Error calling Grok:', error);
        return this.getLocalResponse(message);
    }
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
        messageDiv.textContent = message;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}  // THIS CLOSES THE CLASS

// Start the companion when page loads
document.addEventListener('DOMContentLoaded', () => {
    new STEMCompanion();
});