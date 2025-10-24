/**
 * Message Processor Service
 * Processes and routes messages to appropriate handlers
 */

const { MessageContract, EventContract, EventTypes } = require('../contracts');
const EventEmitter = require('events');

class MessageProcessorService extends EventEmitter {
    constructor(facebookService, options = {}) {
        super();
        this.facebookService = facebookService;
        this.options = {
            commandPrefix: '/',
            ignoreOwnMessages: true,
            processBotMessages: false,
            ...options
        };
        this.handlers = new Map();
        this.middlewares = [];
    }

    /**
     * Initialize the processor
     */
    initialize() {
        // Listen to Facebook service messages
        this.facebookService.on('message', (event) => {
            this.processEvent(event);
        });

        this.emit('initialized');
    }

    /**
     * Process an incoming event
     * @param {Object} event - Facebook event
     */
    async processEvent(event) {
        try {
            // Check if it's a message event
            if (!EventContract.isMessage(event)) {
                this.emit('non-message-event', event);
                return;
            }

            // Ignore own messages if configured
            if (this.options.ignoreOwnMessages) {
                const currentUserId = this.facebookService.getCurrentUserId();
                if (event.senderID === currentUserId) {
                    return;
                }
            }

            // Create message context
            const message = MessageContract.createIncoming(event);
            const context = await this.createMessageContext(message, event);

            // Run middlewares
            for (const middleware of this.middlewares) {
                const shouldContinue = await middleware(context);
                if (shouldContinue === false) {
                    return; // Middleware stopped processing
                }
            }

            // Check if it's a command
            if (this.isCommand(message.body)) {
                await this.processCommand(message, context);
            } else {
                await this.processMessage(message, context);
            }

        } catch (error) {
            this.emit('error', error);
        }
    }

    /**
     * Create message context
     * @param {IncomingMessage} message
     * @param {Object} rawEvent
     * @returns {Promise<MessageContext>}
     */
    async createMessageContext(message, rawEvent) {
        const context = {
            message,
            rawEvent,
            api: this.facebookService.api,
            service: this.facebookService,
            reply: async (text, options = {}) => {
                return this.facebookService.sendMessage(
                    MessageContract.createOutgoing(text, options),
                    message.threadId
                );
            },
            sendTyping: async () => {
                return this.facebookService.sendTyping(message.threadId);
            },
            react: async (reaction) => {
                return this.facebookService.setMessageReaction(reaction, message.messageId);
            }
        };

        // Try to get thread and user info
        try {
            context.threadInfo = await this.facebookService.getThreadInfo(message.threadId);
        } catch (err) {
            context.threadInfo = null;
        }

        try {
            const userInfo = await this.facebookService.getUserInfo(message.senderId);
            context.userInfo = userInfo[message.senderId];
        } catch (err) {
            context.userInfo = null;
        }

        return context;
    }

    /**
     * Check if message is a command
     * @param {string} text
     * @returns {boolean}
     */
    isCommand(text) {
        return text && text.startsWith(this.options.commandPrefix);
    }

    /**
     * Parse command from message
     * @param {string} text
     * @returns {Object}
     */
    parseCommand(text) {
        const parts = text.slice(this.options.commandPrefix.length).trim().split(/\s+/);
        return {
            command: parts[0].toLowerCase(),
            args: parts.slice(1),
            raw: text
        };
    }

    /**
     * Process a command message
     * @param {IncomingMessage} message
     * @param {MessageContext} context
     */
    async processCommand(message, context) {
        const { command, args } = this.parseCommand(message.body);
        
        const handler = this.handlers.get(`command:${command}`);
        if (handler) {
            context.command = command;
            context.args = args;
            await handler(context);
            this.emit('command-processed', { command, context });
        } else {
            this.emit('unknown-command', { command, context });
        }
    }

    /**
     * Process a regular message
     * @param {IncomingMessage} message
     * @param {MessageContext} context
     */
    async processMessage(message, context) {
        const handler = this.handlers.get('message');
        if (handler) {
            await handler(context);
            this.emit('message-processed', context);
        }
    }

    /**
     * Register a message handler
     * @param {Function} handler
     */
    onMessage(handler) {
        this.handlers.set('message', handler);
    }

    /**
     * Register a command handler
     * @param {string} command
     * @param {Function} handler
     */
    onCommand(command, handler) {
        this.handlers.set(`command:${command.toLowerCase()}`, handler);
    }

    /**
     * Register multiple command handlers
     * @param {Object} commands - Object with command names as keys and handlers as values
     */
    registerCommands(commands) {
        for (const [command, handler] of Object.entries(commands)) {
            this.onCommand(command, handler);
        }
    }

    /**
     * Add middleware
     * @param {Function} middleware - Async function that receives context and returns boolean
     */
    use(middleware) {
        this.middlewares.push(middleware);
    }

    /**
     * Remove all handlers
     */
    clearHandlers() {
        this.handlers.clear();
    }

    /**
     * Remove all middlewares
     */
    clearMiddlewares() {
        this.middlewares = [];
    }
}

module.exports = MessageProcessorService;
