/**
 * Message Contracts for Facebook Chat IA
 * Defines the structure of messages in the system
 */

/**
 * @typedef {Object} IncomingMessage
 * @property {string} messageId - Unique identifier for the message
 * @property {string} threadId - Thread/conversation identifier
 * @property {string} senderId - User ID of the sender
 * @property {string} senderName - Name of the sender
 * @property {string} body - Text content of the message
 * @property {Array<Attachment>} attachments - Array of attachments
 * @property {number} timestamp - Unix timestamp of the message
 * @property {boolean} isGroup - Whether the message is from a group chat
 * @property {Object} mentions - Mentioned users in the message
 */

/**
 * @typedef {Object} OutgoingMessage
 * @property {string} body - Text content to send
 * @property {Array<*>} attachments - Attachments to send (streams)
 * @property {string} url - URL to share
 * @property {string} sticker - Sticker ID to send
 * @property {Object} mentions - Users to mention
 */

/**
 * @typedef {Object} Attachment
 * @property {string} type - Type of attachment (photo, video, audio, file)
 * @property {string} url - URL of the attachment
 * @property {string} filename - Name of the file
 * @property {number} fileSize - Size of the file in bytes
 */

/**
 * @typedef {Object} MessageContext
 * @property {IncomingMessage} message - The original incoming message
 * @property {Object} api - Facebook API instance
 * @property {Function} reply - Quick reply function
 * @property {Function} sendTyping - Send typing indicator
 * @property {Object} threadInfo - Information about the thread
 * @property {Object} userInfo - Information about the sender
 */

class MessageContract {
    /**
     * Validate incoming message structure
     * @param {Object} message - Message to validate
     * @returns {boolean}
     */
    static validateIncoming(message) {
        return (
            message &&
            typeof message.messageId === 'string' &&
            typeof message.threadId === 'string' &&
            typeof message.senderId === 'string' &&
            typeof message.body === 'string'
        );
    }

    /**
     * Validate outgoing message structure
     * @param {Object} message - Message to validate
     * @returns {boolean}
     */
    static validateOutgoing(message) {
        return (
            message &&
            (typeof message.body === 'string' ||
                Array.isArray(message.attachments) ||
                typeof message.url === 'string' ||
                typeof message.sticker === 'string')
        );
    }

    /**
     * Create a standardized incoming message
     * @param {Object} fbMessage - Raw Facebook message
     * @returns {IncomingMessage}
     */
    static createIncoming(fbMessage) {
        return {
            messageId: fbMessage.messageID,
            threadId: fbMessage.threadID,
            senderId: fbMessage.senderID,
            senderName: fbMessage.senderName || 'Unknown',
            body: fbMessage.body || '',
            attachments: fbMessage.attachments || [],
            timestamp: fbMessage.timestamp || Date.now(),
            isGroup: fbMessage.isGroup || false,
            mentions: fbMessage.mentions || {}
        };
    }

    /**
     * Create a standardized outgoing message
     * @param {string} body - Message text
     * @param {Object} options - Additional options
     * @returns {OutgoingMessage}
     */
    static createOutgoing(body, options = {}) {
        const message = { body };
        
        if (options.attachments) {
            message.attachment = options.attachments;
        }
        if (options.url) {
            message.url = options.url;
        }
        if (options.sticker) {
            message.sticker = options.sticker;
        }
        if (options.mentions) {
            message.mentions = options.mentions;
        }

        return message;
    }
}

module.exports = MessageContract;
