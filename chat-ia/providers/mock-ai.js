/**
 * Mock AI Provider
 * Simple provider for testing without real API calls
 */

const { AIProvider } = require('../contracts');

class MockAIProvider extends AIProvider {
    constructor(config = {}) {
        super(config);
        
        this.config = {
            model: 'mock-model',
            responses: [
                'Hello! How can I help you today?',
                'That\'s interesting! Tell me more.',
                'I understand. Is there anything else you\'d like to know?',
                'Great question! Let me think about that.',
                'I\'m here to help with any questions you have.',
            ],
            delay: 1000, // Simulate API delay
            ...config
        };
    }

    /**
     * Generate a mock response
     * @param {AIRequest} request
     * @returns {Promise<AIResponse>}
     */
    async generate(request) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, this.config.delay));

        // Select a response based on the prompt
        const responseIndex = Math.floor(Math.random() * this.config.responses.length);
        const text = this.config.responses[responseIndex];

        return {
            text: text,
            conversationId: request.conversationId,
            metadata: {
                model: this.config.model,
                mock: true
            },
            tokensUsed: text.split(' ').length * 1.3, // Rough token estimate
            model: this.config.model
        };
    }

    /**
     * Generate streaming mock response
     * @param {AIRequest} request
     * @param {Function} onChunk
     * @returns {Promise<AIResponse>}
     */
    async generateStream(request, onChunk) {
        const response = await this.generate(request);
        
        // Simulate streaming by sending word by word
        const words = response.text.split(' ');
        for (const word of words) {
            await new Promise(resolve => setTimeout(resolve, 50));
            onChunk(word + ' ');
        }

        return response;
    }

    validateConfig() {
        return true; // Mock provider doesn't need validation
    }
}

module.exports = MockAIProvider;
