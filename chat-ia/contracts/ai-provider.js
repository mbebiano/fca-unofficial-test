/**
 * AI Provider Contracts for Facebook Chat IA
 * Defines the structure for AI integration
 */

/**
 * @typedef {Object} AIRequest
 * @property {string} prompt - The user's message/prompt
 * @property {string} conversationId - Unique conversation identifier
 * @property {Array<ConversationMessage>} history - Conversation history
 * @property {Object} context - Additional context information
 * @property {Object} options - Provider-specific options
 */

/**
 * @typedef {Object} AIResponse
 * @property {string} text - The AI's response text
 * @property {string} conversationId - Conversation identifier
 * @property {Object} metadata - Additional response metadata
 * @property {number} tokensUsed - Number of tokens consumed
 * @property {string} model - Model used for generation
 */

/**
 * @typedef {Object} ConversationMessage
 * @property {string} role - Message role (user, assistant, system)
 * @property {string} content - Message content
 * @property {number} timestamp - Message timestamp
 */

/**
 * @typedef {Object} AIProviderConfig
 * @property {string} provider - Provider name (openai, anthropic, gemini, etc.)
 * @property {string} apiKey - API key for the provider
 * @property {string} model - Model to use
 * @property {number} maxTokens - Maximum tokens to generate
 * @property {number} temperature - Temperature for generation (0-1)
 * @property {string} systemPrompt - System prompt/instructions
 */

/**
 * Base AI Provider Interface
 */
class AIProvider {
    constructor(config) {
        if (new.target === AIProvider) {
            throw new TypeError("Cannot construct AIProvider instances directly");
        }
        this.config = config;
    }

    /**
     * Generate a response from the AI
     * @param {AIRequest} _request - The AI request
     * @returns {Promise<AIResponse>}
     */
    async generate(_request) {
        throw new Error("Method 'generate' must be implemented");
    }

    /**
     * Stream a response from the AI
     * @param {AIRequest} _request - The AI request
     * @param {Function} _onChunk - Callback for each chunk
     * @returns {Promise<AIResponse>}
     */
    async generateStream(_request, _onChunk) {
        throw new Error("Method 'generateStream' must be implemented");
    }

    /**
     * Validate the provider configuration
     * @returns {boolean}
     */
    validateConfig() {
        return (
            this.config &&
            typeof this.config.apiKey === 'string' &&
            typeof this.config.model === 'string'
        );
    }
}

/**
 * AI Request Builder
 */
class AIRequestBuilder {
    constructor() {
        this.request = {
            prompt: '',
            conversationId: '',
            history: [],
            context: {},
            options: {}
        };
    }

    /**
     * Set the prompt
     * @param {string} prompt
     * @returns {AIRequestBuilder}
     */
    setPrompt(prompt) {
        this.request.prompt = prompt;
        return this;
    }

    /**
     * Set the conversation ID
     * @param {string} conversationId
     * @returns {AIRequestBuilder}
     */
    setConversationId(conversationId) {
        this.request.conversationId = conversationId;
        return this;
    }

    /**
     * Add message to history
     * @param {string} role - user, assistant, or system
     * @param {string} content
     * @returns {AIRequestBuilder}
     */
    addHistory(role, content) {
        this.request.history.push({
            role,
            content,
            timestamp: Date.now()
        });
        return this;
    }

    /**
     * Set conversation history
     * @param {Array<ConversationMessage>} history
     * @returns {AIRequestBuilder}
     */
    setHistory(history) {
        this.request.history = history;
        return this;
    }

    /**
     * Add context information
     * @param {string} key
     * @param {*} value
     * @returns {AIRequestBuilder}
     */
    addContext(key, value) {
        this.request.context[key] = value;
        return this;
    }

    /**
     * Set options
     * @param {Object} options
     * @returns {AIRequestBuilder}
     */
    setOptions(options) {
        this.request.options = { ...this.request.options, ...options };
        return this;
    }

    /**
     * Build the final request
     * @returns {AIRequest}
     */
    build() {
        if (!this.request.prompt) {
            throw new Error("Prompt is required");
        }
        if (!this.request.conversationId) {
            this.request.conversationId = `conv_${Date.now()}`;
        }
        return { ...this.request };
    }
}

/**
 * Conversation Memory Manager
 */
class ConversationMemory {
    constructor(maxMessages = 10) {
        this.conversations = new Map();
        this.maxMessages = maxMessages;
    }

    /**
     * Add a message to conversation history
     * @param {string} conversationId
     * @param {string} role
     * @param {string} content
     */
    addMessage(conversationId, role, content) {
        if (!this.conversations.has(conversationId)) {
            this.conversations.set(conversationId, []);
        }

        const history = this.conversations.get(conversationId);
        history.push({
            role,
            content,
            timestamp: Date.now()
        });

        // Keep only the last N messages
        if (history.length > this.maxMessages) {
            history.shift();
        }
    }

    /**
     * Get conversation history
     * @param {string} conversationId
     * @returns {Array<ConversationMessage>}
     */
    getHistory(conversationId) {
        return this.conversations.get(conversationId) || [];
    }

    /**
     * Clear conversation history
     * @param {string} conversationId
     */
    clearHistory(conversationId) {
        this.conversations.delete(conversationId);
    }

    /**
     * Get all conversation IDs
     * @returns {Array<string>}
     */
    getAllConversations() {
        return Array.from(this.conversations.keys());
    }
}

module.exports = {
    AIProvider,
    AIRequestBuilder,
    ConversationMemory
};
