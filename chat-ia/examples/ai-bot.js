/**
 * AI Chat Bot Example
 * Bot with AI integration using the Chat IA framework
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

    // Create bot with AI integration
    const bot = createBot(api, {
        facebook: {
            autoMarkRead: true,
            listenEvents: true,
            selfListen: false
        },
        processor: {
            commandPrefix: '/',
            ignoreOwnMessages: true
        },
        ai: {
            enabled: true,
            provider: 'mock', // Change to 'openai' for real AI
            maxHistoryLength: 10,
            includeUserInfo: true,
            typingIndicator: true
        },
        // For OpenAI, uncomment and configure:
        // openai: {
        //     apiKey: process.env.OPENAI_API_KEY,
        //     model: 'gpt-3.5-turbo',
        //     maxTokens: 1000,
        //     temperature: 0.7,
        //     systemPrompt: 'You are a helpful assistant in Facebook Messenger.'
        // }
    });

    // Add custom commands
    bot.registerCommand('clear', {
        description: 'Clear conversation history',
        handler: async (context) => {
            bot.aiHandler.clearHistory(context.message.threadId);
            await context.reply('✅ Conversation history cleared!');
        }
    });

    bot.registerCommand('hello', {
        description: 'Say hello',
        handler: async (context) => {
            const name = context.userInfo?.firstName || 'there';
            await context.reply(`👋 Hello, ${name}!`);
        }
    });

    // Add middleware for logging
    bot.use(async (context) => {
        console.log(`📩 Message from ${context.message.senderName}: ${context.message.body}`);
        return true; // Continue processing
    });

    // Add middleware for security (example)
    bot.use(async (context) => {
        // Example: Block specific users
        const blockedUsers = []; // Add user IDs to block
        if (blockedUsers.includes(context.message.senderId)) {
            console.log(`🚫 Blocked message from ${context.message.senderId}`);
            return false; // Stop processing
        }
        return true; // Continue processing
    });

    // Handle errors
    bot.processor.on('error', (error) => {
        console.error('❌ Processor error:', error);
    });

    bot.facebook.on('error', (error) => {
        console.error('❌ Facebook service error:', error);
    });

    // Start the bot
    await bot.start();

    console.log('🤖 AI Chat Bot is running!');
    console.log('💡 Available commands:');
    console.log('   /help - Show all commands');
    console.log('   /info - Show bot info');
    console.log('   /ping - Test bot response');
    console.log('   /clear - Clear conversation history');
    console.log('   /hello - Say hello');
    console.log('\n💬 Send any message to chat with AI!');

    // Handle shutdown
    process.on('SIGINT', () => {
        console.log('\n👋 Shutting down...');
        bot.stop();
        process.exit(0);
    });
});
