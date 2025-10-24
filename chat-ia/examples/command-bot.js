/**
 * Command Bot Example
 * Bot that only responds to commands
 */

const login = require('../../index'); // fca-unofficial
const { createBot } = require('../index'); // chat-ia
const fs = require('fs');

// Load credentials
const credentials = { 
    appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))
};

// Login to Facebook
login(credentials, async (err, api) => {
    if (err) {
        console.error('❌ Login error:', err);
        return;
    }

    console.log('✅ Logged in successfully!');

    // Create bot without AI
    const bot = createBot(api, {
        ai: {
            enabled: false // Disable AI
        }
    });

    // Override message handler to only respond to commands
    bot.onMessage(async (context) => {
        // Ignore non-command messages
        if (!context.message.body.startsWith('/')) {
            return;
        }
    });

    // Register custom commands
    bot.registerCommand('quote', {
        description: 'Get a random quote',
        handler: async (context) => {
            const quotes = [
                "The only way to do great work is to love what you do. - Steve Jobs",
                "Innovation distinguishes between a leader and a follower. - Steve Jobs",
                "Stay hungry, stay foolish. - Steve Jobs",
                "Life is what happens when you're busy making other plans. - John Lennon",
                "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
            ];
            const quote = quotes[Math.floor(Math.random() * quotes.length)];
            await context.reply(`💭 ${quote}`);
        }
    });

    bot.registerCommand('time', {
        description: 'Get current time',
        handler: async (context) => {
            const now = new Date();
            await context.reply(`🕐 Current time: ${now.toLocaleString()}`);
        }
    });

    bot.registerCommand('weather', {
        description: 'Get weather info (mock)',
        handler: async (context) => {
            const { args } = context;
            const city = args.join(' ') || 'Unknown';
            await context.reply(`🌤️ Weather in ${city}: Sunny, 25°C\n(This is a mock response)`);
        }
    });

    bot.registerCommand('coin', {
        description: 'Flip a coin',
        handler: async (context) => {
            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            await context.reply(`🪙 ${result}!`);
        }
    });

    bot.registerCommand('dice', {
        description: 'Roll a dice',
        handler: async (context) => {
            const result = Math.floor(Math.random() * 6) + 1;
            await context.reply(`🎲 You rolled a ${result}!`);
        }
    });

    bot.registerCommand('calc', {
        description: 'Simple calculator (usage: /calc 5 + 3)',
        handler: async (context) => {
            const { args } = context;
            if (args.length < 3) {
                await context.reply('❌ Usage: /calc <number> <operator> <number>\nExample: /calc 5 + 3');
                return;
            }

            const num1 = parseFloat(args[0]);
            const operator = args[1];
            const num2 = parseFloat(args[2]);

            if (isNaN(num1) || isNaN(num2)) {
                await context.reply('❌ Invalid numbers');
                return;
            }

            let result;
            switch (operator) {
                case '+':
                    result = num1 + num2;
                    break;
                case '-':
                    result = num1 - num2;
                    break;
                case '*':
                case 'x':
                    result = num1 * num2;
                    break;
                case '/':
                    if (num2 === 0) {
                        await context.reply('❌ Cannot divide by zero');
                        return;
                    }
                    result = num1 / num2;
                    break;
                default:
                    await context.reply('❌ Invalid operator. Use: +, -, *, /');
                    return;
            }

            await context.reply(`🔢 ${num1} ${operator} ${num2} = ${result}`);
        }
    });

    bot.registerCommand('thread', {
        description: 'Get thread information',
        handler: async (context) => {
            if (!context.threadInfo) {
                await context.reply('❌ Could not get thread information');
                return;
            }

            const info = [
                '📊 Thread Information:',
                `Name: ${context.threadInfo.threadName || 'N/A'}`,
                `Type: ${context.threadInfo.isGroup ? 'Group' : 'Direct'}`,
                `Participants: ${context.threadInfo.participantIDs.length}`,
                `Thread ID: ${context.threadInfo.threadID}`
            ].join('\n');

            await context.reply(info);
        }
    });

    // Start the bot
    await bot.start();

    console.log('🤖 Command Bot is running!');
    console.log('💡 Send /help to see all available commands');

    // Handle shutdown
    process.on('SIGINT', () => {
        console.log('\n👋 Shutting down...');
        bot.stop();
        process.exit(0);
    });
});
