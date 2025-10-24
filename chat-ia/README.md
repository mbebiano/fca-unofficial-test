# Facebook Chat IA 🤖

A complete AI-powered chat bot framework for Facebook Messenger, built on top of [fca-unofficial](https://github.com/DongDev-VN/fca-unofficial).

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Usage Examples](#usage-examples)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Contributing](#contributing)

## ✨ Features

- 🤖 **AI Integration**: Built-in support for OpenAI GPT models and other AI providers
- 💬 **Conversation Memory**: Automatic conversation history management
- 🎯 **Command System**: Easy-to-use command framework with built-in commands
- 🔌 **Middleware Support**: Add custom logic to message processing pipeline
- 📝 **Type Contracts**: Well-defined contracts for messages, events, and AI interactions
- 🛡️ **Security**: Built-in user and thread filtering
- 🎨 **Customizable**: Highly configurable with sensible defaults
- 📊 **Event System**: Rich event system for monitoring bot activity

## 📦 Installation

This module is included in the fca-unofficial-test repository. To use it:

```bash
npm install
```

Required dependencies are already included in the main package.json.

## 🚀 Quick Start

### Basic Bot (Echo)

```javascript
const login = require('@dongdev/fca-unofficial');
const fs = require('fs');

const credentials = { 
    appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))
};

login(credentials, (err, api) => {
    if (err) return console.error(err);

    api.setOptions({ listenEvents: true });

    api.listenMqtt((err, event) => {
        if (err) return console.error(err);
        if (event.type !== 'message') return;

        api.sendMessage(`You said: ${event.body}`, event.threadID);
    });
});
```

### AI-Powered Bot

```javascript
const login = require('@dongdev/fca-unofficial');
const { createBot } = require('./chat-ia');
const fs = require('fs');

const credentials = { 
    appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))
};

login(credentials, async (err, api) => {
    if (err) return console.error(err);

    // Create bot with AI
    const bot = createBot(api, {
        ai: {
            enabled: true,
            provider: 'openai' // or 'mock' for testing
        },
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
            model: 'gpt-3.5-turbo',
            systemPrompt: 'You are a helpful assistant.'
        }
    });

    // Add custom command
    bot.registerCommand('hello', {
        description: 'Say hello',
        handler: async (context) => {
            await context.reply('👋 Hello!');
        }
    });

    // Start the bot
    await bot.start();
    console.log('🤖 Bot is running!');
});
```

## 🏗️ Architecture

The Chat IA framework is organized into several layers:

### 1. Contracts Layer (`contracts/`)

Defines the structure and validation for data types:

- **MessageContract**: Incoming/outgoing message structure
- **EventContract**: Facebook event types
- **AIProvider**: Base interface for AI providers
- **UserContract** & **ThreadContract**: User and thread data structures

### 2. Services Layer (`services/`)

Core functionality services:

- **FacebookChatService**: Wrapper around fca-unofficial API with promise-based methods
- **MessageProcessorService**: Routes messages to handlers and manages middleware

### 3. Providers Layer (`providers/`)

AI provider implementations:

- **OpenAIProvider**: Integration with OpenAI's GPT models
- **MockAIProvider**: Mock provider for testing without API calls

### 4. Handlers Layer (`handlers/`)

Message and command handlers:

- **AIChatHandler**: Handles AI conversation with memory management
- **CommandHandler**: Manages bot commands

### 5. Utils Layer (`utils/`)

Utility functions:

- **Logger**: Colored console logging
- **ConfigManager**: Configuration file management

## 📚 Usage Examples

### Command Bot

Create a bot that only responds to commands:

```javascript
const bot = createBot(api, {
    ai: { enabled: false }
});

bot.registerCommand('time', {
    description: 'Get current time',
    handler: async (context) => {
        await context.reply(`⏰ ${new Date().toLocaleString()}`);
    }
});

bot.registerCommand('quote', {
    description: 'Random quote',
    handler: async (context) => {
        const quotes = ['Quote 1', 'Quote 2', 'Quote 3'];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        await context.reply(quote);
    }
});

await bot.start();
```

### Using Middleware

Add custom logic to the message processing pipeline:

```javascript
// Logging middleware
bot.use(async (context) => {
    console.log(`Message from ${context.message.senderName}`);
    return true; // Continue processing
});

// Security middleware
bot.use(async (context) => {
    const blockedUsers = ['123456789'];
    if (blockedUsers.includes(context.message.senderId)) {
        return false; // Stop processing
    }
    return true;
});

// Rate limiting middleware
const rateLimiter = new Map();
bot.use(async (context) => {
    const userId = context.message.senderId;
    const now = Date.now();
    const lastMessage = rateLimiter.get(userId) || 0;
    
    if (now - lastMessage < 1000) { // 1 second cooldown
        await context.reply('⏱️ Please wait before sending another message');
        return false;
    }
    
    rateLimiter.set(userId, now);
    return true;
});
```

### Custom Message Handler

Override the default message handler:

```javascript
bot.onMessage(async (context) => {
    const { message, reply, sendTyping } = context;
    
    // Send typing indicator
    await sendTyping();
    
    // Custom logic
    if (message.body.includes('hello')) {
        await reply('Hello there! 👋');
    } else {
        await reply('I received your message!');
    }
});
```

### Conversation Memory

Access and manage conversation history:

```javascript
// Get conversation history
const history = bot.aiHandler.getHistory(threadId);
console.log(history);

// Clear conversation history
bot.aiHandler.clearHistory(threadId);

// Create custom command to clear history
bot.registerCommand('clear', {
    description: 'Clear chat history',
    handler: async (context) => {
        bot.aiHandler.clearHistory(context.message.threadId);
        await context.reply('✅ History cleared!');
    }
});
```

## 🔧 API Documentation

### createBot(api, options)

Creates a new bot instance.

**Parameters:**
- `api` (Object): fca-unofficial API instance
- `options` (Object): Bot configuration

**Returns:** Bot instance with methods and properties

### Bot Instance

#### Properties

- `facebook`: FacebookChatService instance
- `processor`: MessageProcessorService instance
- `aiHandler`: AIChatHandler instance (if AI enabled)
- `commandHandler`: CommandHandler instance
- `config`: ConfigManager instance
- `logger`: Logger instance

#### Methods

- `start()`: Initialize and start the bot
- `stop()`: Stop the bot
- `registerCommand(name, config)`: Register a command
- `onMessage(handler)`: Set message handler
- `use(middleware)`: Add middleware

### Message Context

The context object passed to handlers contains:

```javascript
{
    message: IncomingMessage,    // Standardized message
    rawEvent: Object,             // Original Facebook event
    api: Object,                  // fca-unofficial API
    service: FacebookChatService, // Facebook service instance
    threadInfo: ThreadInfo,       // Thread information
    userInfo: UserInfo,           // Sender information
    reply: Function,              // Quick reply function
    sendTyping: Function,         // Send typing indicator
    react: Function               // React to message
}
```

## ⚙️ Configuration

### Configuration File

Create `chat-ia-config.json` in your project root:

```json
{
    "facebook": {
        "autoMarkRead": true,
        "autoMarkDelivery": true,
        "listenEvents": true,
        "selfListen": false
    },
    "processor": {
        "commandPrefix": "/",
        "ignoreOwnMessages": true,
        "processBotMessages": false
    },
    "ai": {
        "provider": "openai",
        "enabled": true,
        "maxHistoryLength": 10,
        "includeUserInfo": true,
        "includeThreadInfo": false,
        "typingIndicator": true
    },
    "openai": {
        "apiKey": "your-api-key",
        "model": "gpt-3.5-turbo",
        "maxTokens": 1000,
        "temperature": 0.7,
        "systemPrompt": "You are a helpful assistant."
    },
    "security": {
        "allowedUsers": [],
        "blockedUsers": [],
        "allowedThreads": [],
        "blockedThreads": []
    }
}
```

### Environment Variables

```bash
OPENAI_API_KEY=your-api-key-here
DEBUG=true  # Enable debug logging
```

## 📖 Examples

See the `examples/` directory for complete examples:

- `basic-bot.js` - Simple echo bot
- `ai-bot.js` - AI-powered chat bot
- `command-bot.js` - Command-only bot

Run an example:

```bash
node chat-ia/examples/ai-bot.js
```

## 🛠️ Built-in Commands

The framework includes these built-in commands:

- `/help` - Show available commands
- `/info` - Show bot information
- `/ping` - Check bot response time

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project inherits the license from fca-unofficial (MIT License).

## 🙏 Acknowledgments

- Built on top of [fca-unofficial](https://github.com/DongDev-VN/fca-unofficial)
- Inspired by WhatsApp chat IA implementations
- OpenAI for GPT models

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the examples for usage patterns
- Review the API documentation above

---

**Happy Botting! 🤖✨**
