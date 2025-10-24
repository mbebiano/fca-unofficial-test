/**
 * Basic tests for Chat IA framework
 * These are simple validation tests to ensure the modules load correctly
 */

const assert = require('assert');

describe('Chat IA Framework', () => {
    describe('Contracts', () => {
        it('should load MessageContract', () => {
            const MessageContract = require('../chat-ia/contracts/message');
            assert.ok(MessageContract);
            assert.strictEqual(typeof MessageContract.validateIncoming, 'function');
            assert.strictEqual(typeof MessageContract.validateOutgoing, 'function');
        });

        it('should load EventContract', () => {
            const { EventContract, EventTypes } = require('../chat-ia/contracts/event');
            assert.ok(EventContract);
            assert.ok(EventTypes);
            assert.strictEqual(typeof EventContract.validate, 'function');
        });

        it('should load AI Provider contracts', () => {
            const { AIProvider, AIRequestBuilder, ConversationMemory } = require('../chat-ia/contracts/ai-provider');
            assert.ok(AIProvider);
            assert.ok(AIRequestBuilder);
            assert.ok(ConversationMemory);
        });

        it('should load User and Thread contracts', () => {
            const { UserContract, ThreadContract } = require('../chat-ia/contracts/user-thread');
            assert.ok(UserContract);
            assert.ok(ThreadContract);
            assert.strictEqual(typeof UserContract.validate, 'function');
            assert.strictEqual(typeof ThreadContract.validate, 'function');
        });
    });

    describe('Services', () => {
        it('should load FacebookChatService', () => {
            const { FacebookChatService } = require('../chat-ia/services');
            assert.ok(FacebookChatService);
        });

        it('should load MessageProcessorService', () => {
            const { MessageProcessorService } = require('../chat-ia/services');
            assert.ok(MessageProcessorService);
        });
    });

    describe('Providers', () => {
        it('should load OpenAIProvider', () => {
            const { OpenAIProvider } = require('../chat-ia/providers');
            assert.ok(OpenAIProvider);
        });

        it('should load MockAIProvider', () => {
            const { MockAIProvider } = require('../chat-ia/providers');
            assert.ok(MockAIProvider);
        });

        it('should create MockAIProvider instance', () => {
            const { MockAIProvider } = require('../chat-ia/providers');
            const provider = new MockAIProvider();
            assert.ok(provider);
        });
    });

    describe('Handlers', () => {
        it('should load AIChatHandler', () => {
            const { AIChatHandler } = require('../chat-ia/handlers');
            assert.ok(AIChatHandler);
        });

        it('should load CommandHandler', () => {
            const { CommandHandler } = require('../chat-ia/handlers');
            assert.ok(CommandHandler);
        });

        it('should create CommandHandler instance', () => {
            const { CommandHandler } = require('../chat-ia/handlers');
            const handler = new CommandHandler();
            assert.ok(handler);
            assert.ok(handler.hasCommand('help'));
            assert.ok(handler.hasCommand('info'));
            assert.ok(handler.hasCommand('ping'));
        });
    });

    describe('Utils', () => {
        it('should load logger', () => {
            const { logger } = require('../chat-ia/utils');
            assert.ok(logger);
            assert.strictEqual(typeof logger.info, 'function');
            assert.strictEqual(typeof logger.error, 'function');
        });

        it('should load ConfigManager', () => {
            const { ConfigManager } = require('../chat-ia/utils');
            assert.ok(ConfigManager);
        });
    });

    describe('Main Module', () => {
        it('should load main module', () => {
            const chatIA = require('../chat-ia');
            assert.ok(chatIA);
            assert.strictEqual(typeof chatIA.createBot, 'function');
        });

        it('should export all contracts', () => {
            const chatIA = require('../chat-ia');
            assert.ok(chatIA.MessageContract);
            assert.ok(chatIA.EventContract);
            assert.ok(chatIA.AIProvider);
            assert.ok(chatIA.UserContract);
            assert.ok(chatIA.ThreadContract);
        });

        it('should export all services', () => {
            const chatIA = require('../chat-ia');
            assert.ok(chatIA.FacebookChatService);
            assert.ok(chatIA.MessageProcessorService);
        });

        it('should export all providers', () => {
            const chatIA = require('../chat-ia');
            assert.ok(chatIA.OpenAIProvider);
            assert.ok(chatIA.MockAIProvider);
        });

        it('should export all handlers', () => {
            const chatIA = require('../chat-ia');
            assert.ok(chatIA.AIChatHandler);
            assert.ok(chatIA.CommandHandler);
        });
    });

    describe('AIRequestBuilder', () => {
        it('should build a valid AI request', () => {
            const { AIRequestBuilder } = require('../chat-ia/contracts/ai-provider');
            const builder = new AIRequestBuilder();
            const request = builder
                .setPrompt('Hello')
                .setConversationId('test-123')
                .addHistory('user', 'Previous message')
                .addContext('userName', 'John')
                .build();

            assert.strictEqual(request.prompt, 'Hello');
            assert.strictEqual(request.conversationId, 'test-123');
            assert.strictEqual(request.history.length, 1);
            assert.strictEqual(request.context.userName, 'John');
        });

        it('should auto-generate conversation ID if not provided', () => {
            const { AIRequestBuilder } = require('../chat-ia/contracts/ai-provider');
            const builder = new AIRequestBuilder();
            const request = builder.setPrompt('Hello').build();

            assert.ok(request.conversationId);
            assert.ok(request.conversationId.startsWith('conv_'));
        });
    });

    describe('ConversationMemory', () => {
        it('should store and retrieve conversation history', () => {
            const { ConversationMemory } = require('../chat-ia/contracts/ai-provider');
            const memory = new ConversationMemory(5);
            
            memory.addMessage('thread-1', 'user', 'Hello');
            memory.addMessage('thread-1', 'assistant', 'Hi there!');
            
            const history = memory.getHistory('thread-1');
            assert.strictEqual(history.length, 2);
            assert.strictEqual(history[0].role, 'user');
            assert.strictEqual(history[1].role, 'assistant');
        });

        it('should limit history size', () => {
            const { ConversationMemory } = require('../chat-ia/contracts/ai-provider');
            const memory = new ConversationMemory(3);
            
            for (let i = 0; i < 5; i++) {
                memory.addMessage('thread-1', 'user', `Message ${i}`);
            }
            
            const history = memory.getHistory('thread-1');
            assert.strictEqual(history.length, 3);
        });

        it('should clear conversation history', () => {
            const { ConversationMemory } = require('../chat-ia/contracts/ai-provider');
            const memory = new ConversationMemory();
            
            memory.addMessage('thread-1', 'user', 'Hello');
            memory.clearHistory('thread-1');
            
            const history = memory.getHistory('thread-1');
            assert.strictEqual(history.length, 0);
        });
    });

    describe('MockAIProvider', () => {
        it('should generate a response', async () => {
            const { MockAIProvider } = require('../chat-ia/providers');
            const { AIRequestBuilder } = require('../chat-ia/contracts/ai-provider');
            const provider = new MockAIProvider({ delay: 10 });
            
            const request = new AIRequestBuilder()
                .setPrompt('Hello')
                .setConversationId('test')
                .build();
            
            const response = await provider.generate(request);
            
            assert.ok(response);
            assert.ok(response.text);
            assert.strictEqual(response.conversationId, 'test');
            assert.ok(response.tokensUsed > 0);
        });
    });
});
