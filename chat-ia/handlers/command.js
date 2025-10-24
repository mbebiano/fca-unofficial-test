/**
 * Command Handler
 * Built-in commands for bot control
 */

class CommandHandler {
    constructor(options = {}) {
        this.options = {
            adminOnly: {},
            ...options
        };
        this.commands = new Map();
        this.registerDefaultCommands();
    }

    /**
     * Register default commands
     */
    registerDefaultCommands() {
        // Help command
        this.register('help', {
            description: 'Show available commands',
            handler: async (context) => {
                const commands = Array.from(this.commands.entries())
                    .map(([name, cmd]) => `/${name} - ${cmd.description}`)
                    .join('\n');
                
                await context.reply(`Available commands:\n${commands}`);
            }
        });

        // Info command
        this.register('info', {
            description: 'Show bot information',
            handler: async (context) => {
                const info = [
                    '🤖 Facebook Chat IA Bot',
                    `📊 Active conversations: ${context.service ? 'Available' : 'N/A'}`,
                    `👤 Your ID: ${context.message.senderId}`,
                    `💬 Thread ID: ${context.message.threadId}`,
                ].join('\n');
                
                await context.reply(info);
            }
        });

        // Ping command
        this.register('ping', {
            description: 'Check if bot is responding',
            handler: async (context) => {
                const start = Date.now();
                await context.reply(`🏓 Pong! Response time: ${Date.now() - start}ms`);
            }
        });
    }

    /**
     * Register a command
     * @param {string} name - Command name
     * @param {Object} config - Command configuration
     */
    register(name, config) {
        this.commands.set(name.toLowerCase(), {
            name: name.toLowerCase(),
            description: config.description || 'No description',
            handler: config.handler,
            adminOnly: config.adminOnly || false
        });
    }

    /**
     * Handle command
     * @param {string} command - Command name
     * @param {MessageContext} context
     */
    async handle(command, context) {
        const cmd = this.commands.get(command.toLowerCase());
        
        if (!cmd) {
            await context.reply(`❌ Unknown command: /${command}\nUse /help to see available commands.`);
            return;
        }

        // Check if command is admin only
        if (cmd.adminOnly) {
            // Check if user is admin (requires thread info)
            if (context.threadInfo) {
                const isAdmin = context.threadInfo.adminIDs?.includes(context.message.senderId);
                if (!isAdmin) {
                    await context.reply('❌ This command is only available to group admins.');
                    return;
                }
            }
        }

        try {
            await cmd.handler(context);
        } catch (error) {
            console.error(`Command error (${command}):`, error);
            await context.reply('❌ An error occurred while executing the command.');
        }
    }

    /**
     * Get all commands
     * @returns {Map}
     */
    getCommands() {
        return this.commands;
    }

    /**
     * Check if command exists
     * @param {string} name
     * @returns {boolean}
     */
    hasCommand(name) {
        return this.commands.has(name.toLowerCase());
    }

    /**
     * Remove a command
     * @param {string} name
     */
    unregister(name) {
        this.commands.delete(name.toLowerCase());
    }
}

module.exports = CommandHandler;
