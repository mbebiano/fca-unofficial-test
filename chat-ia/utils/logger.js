/**
 * Logger Utility
 * Provides logging functionality for the chat IA system
 */

const chalk = require('chalk');

class Logger {
    constructor(prefix = 'ChatIA') {
        this.prefix = prefix;
        this.levels = {
            debug: { color: chalk.gray, enabled: process.env.DEBUG === 'true' },
            info: { color: chalk.blue, enabled: true },
            success: { color: chalk.green, enabled: true },
            warn: { color: chalk.yellow, enabled: true },
            error: { color: chalk.red, enabled: true }
        };
    }

    /**
     * Format log message
     * @param {string} level
     * @param {string} message
     * @returns {string}
     */
    format(level, message) {
        const timestamp = new Date().toISOString();
        const colorFn = this.levels[level]?.color || chalk.white;
        return colorFn(`[${timestamp}] [${this.prefix}] [${level.toUpperCase()}] ${message}`);
    }

    /**
     * Debug log
     * @param {string} message
     * @param {*} data
     */
    debug(message, data = null) {
        if (this.levels.debug.enabled) {
            console.log(this.format('debug', message));
            if (data) console.log(chalk.gray(JSON.stringify(data, null, 2)));
        }
    }

    /**
     * Info log
     * @param {string} message
     * @param {*} data
     */
    info(message, data = null) {
        if (this.levels.info.enabled) {
            console.log(this.format('info', message));
            if (data) console.log(chalk.blue(JSON.stringify(data, null, 2)));
        }
    }

    /**
     * Success log
     * @param {string} message
     * @param {*} data
     */
    success(message, data = null) {
        if (this.levels.success.enabled) {
            console.log(this.format('success', message));
            if (data) console.log(chalk.green(JSON.stringify(data, null, 2)));
        }
    }

    /**
     * Warning log
     * @param {string} message
     * @param {*} data
     */
    warn(message, data = null) {
        if (this.levels.warn.enabled) {
            console.warn(this.format('warn', message));
            if (data) console.warn(chalk.yellow(JSON.stringify(data, null, 2)));
        }
    }

    /**
     * Error log
     * @param {string} message
     * @param {Error|*} error
     */
    error(message, error = null) {
        if (this.levels.error.enabled) {
            console.error(this.format('error', message));
            if (error) {
                if (error instanceof Error) {
                    console.error(chalk.red(error.stack || error.message));
                } else {
                    console.error(chalk.red(JSON.stringify(error, null, 2)));
                }
            }
        }
    }

    /**
     * Set log level enabled/disabled
     * @param {string} level
     * @param {boolean} enabled
     */
    setLevel(level, enabled) {
        if (this.levels[level]) {
            this.levels[level].enabled = enabled;
        }
    }

    /**
     * Create a child logger with a different prefix
     * @param {string} prefix
     * @returns {Logger}
     */
    child(prefix) {
        return new Logger(`${this.prefix}:${prefix}`);
    }
}

// Export singleton instance
module.exports = new Logger('ChatIA');
module.exports.Logger = Logger;
