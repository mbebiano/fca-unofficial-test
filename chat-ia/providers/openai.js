/**
 * OpenAI Provider
 * Implementation of AI provider for OpenAI's GPT models
 */

const { AIProvider } = require('../contracts');
const axios = require('axios');

class OpenAIProvider extends AIProvider {
    constructor(config) {
        super(config);
        
        this.config = {
            apiKey: '',
            model: 'gpt-3.5-turbo',
            maxTokens: 1000,
            temperature: 0.7,
            systemPrompt: 'You are a helpful assistant in a Facebook Messenger chat.',
            apiUrl: 'https://api.openai.com/v1/chat/completions',
            ...config
        };

        if (!this.validateConfig()) {
            throw new Error('Invalid OpenAI configuration');
        }
    }

    /**
     * Generate a response from OpenAI
     * @param {AIRequest} request
     * @returns {Promise<AIResponse>}
     */
    async generate(request) {
        try {
            const messages = this.buildMessages(request);
            
            const response = await axios.post(
                this.config.apiUrl,
                {
                    model: this.config.model,
                    messages: messages,
                    max_tokens: this.config.maxTokens,
                    temperature: this.config.temperature,
                    ...request.options
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = response.data;
            
            return {
                text: data.choices[0].message.content,
                conversationId: request.conversationId,
                metadata: {
                    model: data.model,
                    finishReason: data.choices[0].finish_reason
                },
                tokensUsed: data.usage?.total_tokens || 0,
                model: data.model
            };

        } catch (error) {
            if (error.response) {
                throw new Error(`OpenAI API error: ${error.response.data.error?.message || error.response.statusText}`);
            }
            throw error;
        }
    }

    /**
     * Generate streaming response (not fully implemented)
     * @param {AIRequest} request
     * @param {Function} onChunk
     * @returns {Promise<AIResponse>}
     */
    async generateStream(request, onChunk) {
        try {
            const messages = this.buildMessages(request);
            
            const response = await axios.post(
                this.config.apiUrl,
                {
                    model: this.config.model,
                    messages: messages,
                    max_tokens: this.config.maxTokens,
                    temperature: this.config.temperature,
                    stream: true,
                    ...request.options
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'stream'
                }
            );

            let fullText = '';
            
            return new Promise((resolve, reject) => {
                response.data.on('data', (chunk) => {
                    const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;
                            
                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices[0]?.delta?.content;
                                if (content) {
                                    fullText += content;
                                    onChunk(content);
                                }
                            } catch (e) {
                                // Ignore parsing errors
                            }
                        }
                    }
                });

                response.data.on('end', () => {
                    resolve({
                        text: fullText,
                        conversationId: request.conversationId,
                        metadata: {},
                        tokensUsed: 0,
                        model: this.config.model
                    });
                });

                response.data.on('error', reject);
            });

        } catch (error) {
            if (error.response) {
                throw new Error(`OpenAI API error: ${error.response.data.error?.message || error.response.statusText}`);
            }
            throw error;
        }
    }

    /**
     * Build messages array for OpenAI API
     * @param {AIRequest} request
     * @returns {Array}
     */
    buildMessages(request) {
        const messages = [];

        // Add system prompt
        if (this.config.systemPrompt) {
            messages.push({
                role: 'system',
                content: this.config.systemPrompt
            });
        }

        // Add conversation history
        if (request.history && request.history.length > 0) {
            for (const msg of request.history) {
                messages.push({
                    role: msg.role,
                    content: msg.content
                });
            }
        }

        // Add current prompt
        messages.push({
            role: 'user',
            content: request.prompt
        });

        return messages;
    }

    /**
     * Update configuration
     * @param {Object} newConfig
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}

module.exports = OpenAIProvider;
