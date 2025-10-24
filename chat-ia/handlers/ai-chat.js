/**
 * AI Chat Handler
 * Handles messages with AI integration
 */

const { AIRequestBuilder, ConversationMemory } = require('../contracts');

class AIChatHandler {
    constructor(aiProvider, options = {}) {
        this.aiProvider = aiProvider;
        this.options = {
            maxHistoryLength: 10,
            includeUserInfo: true,
            includeThreadInfo: false,
            typingIndicator: true,
            ...options
        };
        this.memory = new ConversationMemory(this.options.maxHistoryLength);
    }

    /**
     * Handle incoming message with AI
     * @param {MessageContext} context
     */
    async handle(context) {
        try {
            const { message, service, reply, sendTyping } = context;

            // Send typing indicator
            if (this.options.typingIndicator) {
                await sendTyping();
            }

            // Build AI request
            const builder = new AIRequestBuilder()
                .setPrompt(message.body)
                .setConversationId(message.threadId)
                .setHistory(this.memory.getHistory(message.threadId));

            // Add context information
            if (this.options.includeUserInfo && context.userInfo) {
                builder.addContext('userName', context.userInfo.name);
                builder.addContext('userFirstName', context.userInfo.firstName);
            }

            if (this.options.includeThreadInfo && context.threadInfo) {
                builder.addContext('threadName', context.threadInfo.threadName);
                builder.addContext('isGroup', context.threadInfo.isGroup);
            }

            const aiRequest = builder.build();

            // Generate AI response
            const aiResponse = await this.aiProvider.generate(aiRequest);

            // Save to memory
            this.memory.addMessage(message.threadId, 'user', message.body);
            this.memory.addMessage(message.threadId, 'assistant', aiResponse.text);

            // Send response
            await reply(aiResponse.text);

        } catch (error) {
            console.error('AI Chat Handler error:', error);
            throw error;
        }
    }

    /**
     * Clear conversation history for a thread
     * @param {string} threadId
     */
    clearHistory(threadId) {
        this.memory.clearHistory(threadId);
    }

    /**
     * Get conversation history
     * @param {string} threadId
     * @returns {Array}
     */
    getHistory(threadId) {
        return this.memory.getHistory(threadId);
    }

    /**
     * Update AI provider
     * @param {AIProvider} provider
     */
    setAIProvider(provider) {
        this.aiProvider = provider;
    }
}

module.exports = AIChatHandler;
