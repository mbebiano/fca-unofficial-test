/**
 * User and Thread Contracts
 */

/**
 * @typedef {Object} UserInfo
 * @property {string} id - User ID
 * @property {string} name - User's display name
 * @property {string} firstName - User's first name
 * @property {string} vanity - User's vanity URL
 * @property {string} profileUrl - URL to user's profile
 * @property {string} thumbSrc - URL to user's profile picture
 * @property {string} type - User type
 * @property {boolean} isFriend - Whether user is a friend
 * @property {boolean} isBirthday - Whether today is user's birthday
 */

/**
 * @typedef {Object} ThreadInfo
 * @property {string} threadID - Thread identifier
 * @property {string} threadName - Name of the thread
 * @property {Array<string>} participantIDs - IDs of participants
 * @property {string} threadType - Type (USER or GROUP)
 * @property {string} imageSrc - Thread image URL
 * @property {string} emoji - Thread emoji
 * @property {string} color - Thread color
 * @property {string} nicknames - Participant nicknames
 * @property {Array<string>} adminIDs - Admin user IDs
 * @property {boolean} isGroup - Whether thread is a group
 * @property {boolean} isArchived - Whether thread is archived
 * @property {number} messageCount - Number of messages in thread
 */

/**
 * @typedef {Object} ThreadParticipant
 * @property {string} userID - Participant user ID
 * @property {string} name - Participant name
 * @property {string} nickname - Participant nickname in thread
 * @property {string} thumbSrc - Profile picture URL
 * @property {boolean} isAdmin - Whether participant is admin
 */

class UserContract {
    /**
     * Validate user info structure
     * @param {Object} user
     * @returns {boolean}
     */
    static validate(user) {
        return (
            user &&
            typeof user.id === 'string' &&
            typeof user.name === 'string'
        );
    }

    /**
     * Create standardized user info
     * @param {Object} fbUser - Raw Facebook user data
     * @returns {UserInfo}
     */
    static create(fbUser) {
        return {
            id: fbUser.userID || fbUser.id,
            name: fbUser.name || 'Unknown',
            firstName: fbUser.firstName || '',
            vanity: fbUser.vanity || '',
            profileUrl: fbUser.profileUrl || '',
            thumbSrc: fbUser.thumbSrc || '',
            type: fbUser.type || 'user',
            isFriend: fbUser.isFriend || false,
            isBirthday: fbUser.isBirthday || false
        };
    }
}

class ThreadContract {
    /**
     * Validate thread info structure
     * @param {Object} thread
     * @returns {boolean}
     */
    static validate(thread) {
        return (
            thread &&
            typeof thread.threadID === 'string' &&
            Array.isArray(thread.participantIDs)
        );
    }

    /**
     * Create standardized thread info
     * @param {Object} fbThread - Raw Facebook thread data
     * @returns {ThreadInfo}
     */
    static create(fbThread) {
        return {
            threadID: fbThread.threadID,
            threadName: fbThread.threadName || fbThread.name || '',
            participantIDs: fbThread.participantIDs || [],
            threadType: fbThread.threadType || (fbThread.isGroup ? 'GROUP' : 'USER'),
            imageSrc: fbThread.imageSrc || fbThread.image || '',
            emoji: fbThread.emoji || '',
            color: fbThread.color || '',
            nicknames: fbThread.nicknames || {},
            adminIDs: fbThread.adminIDs || [],
            isGroup: fbThread.isGroup || false,
            isArchived: fbThread.isArchived || false,
            messageCount: fbThread.messageCount || 0
        };
    }

    /**
     * Check if thread is a group chat
     * @param {ThreadInfo} thread
     * @returns {boolean}
     */
    static isGroup(thread) {
        return thread.isGroup || thread.participantIDs.length > 2;
    }

    /**
     * Check if user is admin in thread
     * @param {ThreadInfo} thread
     * @param {string} userId
     * @returns {boolean}
     */
    static isAdmin(thread, userId) {
        return thread.adminIDs && thread.adminIDs.includes(userId);
    }
}

module.exports = {
    UserContract,
    ThreadContract
};
