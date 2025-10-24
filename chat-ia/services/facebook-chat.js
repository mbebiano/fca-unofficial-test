/**
 * Facebook Chat Service
 * Wrapper around fca-unofficial with enhanced functionality
 */

const { MessageContract, ThreadContract, UserContract } = require('../contracts');
const EventEmitter = require('events');

class FacebookChatService extends EventEmitter {
    constructor(api, options = {}) {
        super();
        this.api = api;
        this.options = {
            autoMarkRead: true,
            autoMarkDelivery: true,
            listenEvents: true,
            selfListen: false,
            ...options
        };
        this.isListening = false;
        this.stopListening = null;
    }

    /**
     * Initialize the service
     */
    async initialize() {
        // Set API options
        this.api.setOptions(this.options);
        
        // Start listening for messages
        this.startListening();
        
        this.emit('initialized');
    }

    /**
     * Start listening for messages and events
     */
    startListening() {
        if (this.isListening) {
            return;
        }

        this.stopListening = this.api.listenMqtt((err, event) => {
            if (err) {
                this.emit('error', err);
                return;
            }

            // Auto mark as delivered
            if (this.options.autoMarkDelivery && event.threadID) {
                this.markAsDelivered(event.threadID, event.messageID).catch(() => {});
            }

            // Auto mark as read
            if (this.options.autoMarkRead && event.threadID) {
                this.markAsRead(event.threadID).catch(() => {});
            }

            // Emit the event
            this.emit('message', event);
        });

        this.isListening = true;
        this.emit('listening');
    }

    /**
     * Stop listening for messages
     */
    stopListeningToMessages() {
        if (this.stopListening) {
            this.stopListening();
            this.isListening = false;
            this.emit('stopped');
        }
    }

    /**
     * Send a message
     * @param {string|Object} message - Message text or message object
     * @param {string} threadId - Thread ID to send to
     * @returns {Promise<Object>}
     */
    async sendMessage(message, threadId) {
        return new Promise((resolve, reject) => {
            // Validate message
            if (typeof message === 'string') {
                message = MessageContract.createOutgoing(message);
            } else if (!MessageContract.validateOutgoing(message)) {
                return reject(new Error('Invalid message format'));
            }

            this.api.sendMessage(message, threadId, (err, messageInfo) => {
                if (err) {
                    return reject(err);
                }
                resolve(messageInfo);
            });
        });
    }

    /**
     * Send typing indicator
     * @param {string} threadId
     * @returns {Promise<void>}
     */
    async sendTyping(threadId) {
        return new Promise((resolve, reject) => {
            this.api.sendTypingIndicator(threadId, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    /**
     * Mark message as read
     * @param {string} threadId
     * @returns {Promise<void>}
     */
    async markAsRead(threadId) {
        return new Promise((resolve, reject) => {
            this.api.markAsRead(threadId, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    /**
     * Mark message as delivered
     * @param {string} threadId
     * @param {string} messageId
     * @returns {Promise<void>}
     */
    async markAsDelivered(threadId, messageId) {
        return new Promise((resolve, reject) => {
            this.api.markAsDelivered(threadId, messageId, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    /**
     * Get thread information
     * @param {string} threadId
     * @returns {Promise<ThreadInfo>}
     */
    async getThreadInfo(threadId) {
        return new Promise((resolve, reject) => {
            this.api.getThreadInfo(threadId, (err, info) => {
                if (err) return reject(err);
                const threadInfo = ThreadContract.create(info);
                resolve(threadInfo);
            });
        });
    }

    /**
     * Get user information
     * @param {string|Array<string>} userId - User ID or array of user IDs
     * @returns {Promise<Object>}
     */
    async getUserInfo(userId) {
        return new Promise((resolve, reject) => {
            this.api.getUserInfo(userId, (err, info) => {
                if (err) return reject(err);
                
                // Standardize user info
                const result = {};
                for (const [id, user] of Object.entries(info)) {
                    result[id] = UserContract.create(user);
                }
                
                resolve(result);
            });
        });
    }

    /**
     * Get thread history
     * @param {string} threadId
     * @param {number} amount - Number of messages to retrieve
     * @param {string} timestamp - Timestamp to start from
     * @returns {Promise<Array>}
     */
    async getThreadHistory(threadId, amount = 10, timestamp = null) {
        return new Promise((resolve, reject) => {
            this.api.getThreadHistory(threadId, amount, timestamp, (err, history) => {
                if (err) return reject(err);
                resolve(history);
            });
        });
    }

    /**
     * Change thread color
     * @param {string} color - Color code
     * @param {string} threadId
     * @returns {Promise<void>}
     */
    async changeThreadColor(color, threadId) {
        return new Promise((resolve, reject) => {
            this.api.changeThreadColor(color, threadId, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    /**
     * Change thread emoji
     * @param {string} emoji
     * @param {string} threadId
     * @returns {Promise<void>}
     */
    async changeThreadEmoji(emoji, threadId) {
        return new Promise((resolve, reject) => {
            this.api.changeThreadEmoji(emoji, threadId, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    /**
     * Set message reaction
     * @param {string} reaction - Reaction emoji
     * @param {string} messageId
     * @returns {Promise<void>}
     */
    async setMessageReaction(reaction, messageId) {
        return new Promise((resolve, reject) => {
            this.api.setMessageReaction(reaction, messageId, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    /**
     * Unsend message
     * @param {string} messageId
     * @returns {Promise<void>}
     */
    async unsendMessage(messageId) {
        return new Promise((resolve, reject) => {
            this.api.unsendMessage(messageId, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    /**
     * Get current user ID
     * @returns {string}
     */
    getCurrentUserId() {
        return this.api.getCurrentUserID();
    }

    /**
     * Get app state for session persistence
     * @returns {Array}
     */
    getAppState() {
        return this.api.getAppState();
    }
}

module.exports = FacebookChatService;
