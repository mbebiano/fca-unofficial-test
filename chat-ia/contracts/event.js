/**
 * Event Contracts for Facebook Chat IA
 * Defines the structure of events in the system
 */

/**
 * @typedef {Object} ChatEvent
 * @property {string} type - Type of event (message, message_reply, message_reaction, etc.)
 * @property {string} threadId - Thread identifier
 * @property {string} userId - User who triggered the event
 * @property {number} timestamp - Unix timestamp
 * @property {Object} data - Event-specific data
 */

/**
 * Event types supported by the system
 */
const EventTypes = {
    MESSAGE: 'message',
    MESSAGE_REPLY: 'message_reply',
    MESSAGE_UNSEND: 'message_unsend',
    MESSAGE_REACTION: 'message_reaction',
    EVENT: 'event',
    TYP: 'typ', // Typing indicator
    PRESENCE: 'presence',
    READ_RECEIPT: 'read_receipt',
    // Group events
    THREAD_NAME_CHANGE: 'change_thread_name',
    THREAD_COLOR_CHANGE: 'change_thread_color',
    THREAD_ICON_CHANGE: 'change_thread_icon',
    THREAD_ADMINS_CHANGE: 'change_thread_admins',
    USER_JOINED: 'log:subscribe',
    USER_LEFT: 'log:unsubscribe',
    CALL_START: 'log:video-call',
};

/**
 * @typedef {Object} MessageEvent
 * @property {string} type - 'message'
 * @property {string} messageID - Message identifier
 * @property {string} threadID - Thread identifier
 * @property {string} senderID - Sender user ID
 * @property {string} body - Message text
 * @property {Array} attachments - Message attachments
 * @property {Object} mentions - Mentioned users
 * @property {boolean} isGroup - Whether from group chat
 */

/**
 * @typedef {Object} TypingEvent
 * @property {string} type - 'typ'
 * @property {string} threadID - Thread identifier
 * @property {string} from - User ID who is typing
 * @property {boolean} isTyping - Whether user is currently typing
 */

/**
 * @typedef {Object} PresenceEvent
 * @property {string} type - 'presence'
 * @property {string} userID - User identifier
 * @property {number} statuses - Status code (2 = online, 0 = offline)
 * @property {number} timestamp - Timestamp of status change
 */

/**
 * @typedef {Object} ReactionEvent
 * @property {string} type - 'message_reaction'
 * @property {string} threadID - Thread identifier
 * @property {string} messageID - Message that was reacted to
 * @property {string} reaction - Reaction emoji
 * @property {string} senderID - User who reacted
 * @property {string} userID - User who reacted (alias)
 */

class EventContract {
    /**
     * Validate event structure
     * @param {Object} event - Event to validate
     * @returns {boolean}
     */
    static validate(event) {
        return (
            event &&
            typeof event.type === 'string' &&
            typeof event.threadID === 'string'
        );
    }

    /**
     * Check if event is a message event
     * @param {Object} event
     * @returns {boolean}
     */
    static isMessage(event) {
        return event && event.type === EventTypes.MESSAGE;
    }

    /**
     * Check if event is a typing indicator
     * @param {Object} event
     * @returns {boolean}
     */
    static isTyping(event) {
        return event && event.type === EventTypes.TYP;
    }

    /**
     * Check if event is a presence update
     * @param {Object} event
     * @returns {boolean}
     */
    static isPresence(event) {
        return event && event.type === EventTypes.PRESENCE;
    }

    /**
     * Check if event is a group event
     * @param {Object} event
     * @returns {boolean}
     */
    static isGroupEvent(event) {
        const groupEvents = [
            EventTypes.USER_JOINED,
            EventTypes.USER_LEFT,
            EventTypes.THREAD_NAME_CHANGE,
            EventTypes.THREAD_COLOR_CHANGE,
            EventTypes.THREAD_ICON_CHANGE,
            EventTypes.THREAD_ADMINS_CHANGE
        ];
        return event && groupEvents.includes(event.type);
    }

    /**
     * Create a standardized event object
     * @param {Object} fbEvent - Raw Facebook event
     * @returns {ChatEvent}
     */
    static create(fbEvent) {
        return {
            type: fbEvent.type,
            threadId: fbEvent.threadID,
            userId: fbEvent.senderID || fbEvent.from || fbEvent.userID,
            timestamp: fbEvent.timestamp || Date.now(),
            data: { ...fbEvent }
        };
    }
}

module.exports = {
    EventContract,
    EventTypes
};
