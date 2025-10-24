/**
 * Facebook Chat IA - Main Entry Point
 * 
 * A complete AI-powered chat bot framework for Facebook Messenger
 * Built on top of fca-unofficial
 * 
 * @module chat-ia
 */

// Contracts
const {
    MessageContract,
    EventContract,
    EventTypes,
    AIProvider,
    AIRequestBuilder,
    ConversationMemory,
    UserContract,
    ThreadContract
} = require('./contracts');

// Services
const {
    FacebookChatService,
    MessageProcessorService
} = require('./services');

// Providers
const {
    OpenAIProvider,
    MockAIProvider
} = require('./providers');

// Handlers
const {
    AIChatHandler,
    CommandHandler
} = require('./handlers');

// Utils
const {
    logger,
    ConfigManager
} = require('./utils');

/**
 * Create a new Facebook Chat IA bot instance
 * @param {Object} fcaApi - The fca-unofficial API instance
 * @param {Object} options - Bot configuration options
 * @returns {Object} Bot instance with services and handlers
 */
function createBot(fcaApi, options = {}) {
    const config = new ConfigManager(options.configPath);
    
    // Merge options with config
    const botConfig = {
        facebook: { ...config.get('facebook'), ...options.facebook },
        processor: { ...config.get('processor'), ...options.processor },
        ai: { ...config.get('ai'), ...options.ai }
    };

    // Create Facebook service
    const facebookService = new FacebookChatService(fcaApi, botConfig.facebook);

    // Create message processor
    const messageProcessor = new MessageProcessorService(facebookService, botConfig.processor);

    // Create AI provider
    let aiProvider = null;
    if (botConfig.ai.enabled) {
        const providerType = options.aiProvider || config.get('ai.provider');
        
        if (providerType === 'openai') {
            const openaiConfig = {
                ...config.get('openai'),
                ...options.openai
            };
            aiProvider = new OpenAIProvider(openaiConfig);
        } else {
            aiProvider = new MockAIProvider();
        }
    }

    // Create handlers
    const aiHandler = aiProvider ? new AIChatHandler(aiProvider, botConfig.ai) : null;
    const commandHandler = new CommandHandler();

    // Setup message processor
    if (aiHandler) {
        messageProcessor.onMessage(async (context) => {
            await aiHandler.handle(context);
        });
    }

    // Setup command handler
    messageProcessor.on('command-processed', ({ command, context }) => {
        // Command already processed by MessageProcessor
    });

    messageProcessor.on('unknown-command', async ({ command, context }) => {
        // Check if command handler has this command
        if (commandHandler.hasCommand(command)) {
            await commandHandler.handle(command, context);
        }
    });

    return {
        // Services
        facebook: facebookService,
        processor: messageProcessor,
        
        // Handlers
        aiHandler,
        commandHandler,
        
        // Utilities
        config,
        logger,
        
        // Methods
        start: async () => {
            logger.info('Starting Facebook Chat IA bot...');
            await facebookService.initialize();
            messageProcessor.initialize();
            logger.success('Bot started successfully!');
        },
        
        stop: () => {
            logger.info('Stopping bot...');
            facebookService.stopListeningToMessages();
            logger.success('Bot stopped.');
        },

        // Command registration
        registerCommand: (name, config) => {
            commandHandler.register(name, config);
        },

        // Message handler registration
        onMessage: (handler) => {
            messageProcessor.onMessage(handler);
        },

        // Middleware
        use: (middleware) => {
            messageProcessor.use(middleware);
        }
    };
}

// Export everything
module.exports = {
    // Main factory
    createBot,
    
    // Contracts
    MessageContract,
    EventContract,
    EventTypes,
    AIProvider,
    AIRequestBuilder,
    ConversationMemory,
    UserContract,
    ThreadContract,
    
    // Services
    FacebookChatService,
    MessageProcessorService,
    
    // Providers
    OpenAIProvider,
    MockAIProvider,
    
    // Handlers
    AIChatHandler,
    CommandHandler,
    
    // Utils
    logger,
    ConfigManager
};
