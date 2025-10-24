/**
 * Configuration Manager
 * Handles loading and validation of bot configuration
 */

const fs = require('fs');
const path = require('path');

class ConfigManager {
    constructor(configPath = null) {
        this.configPath = configPath || path.join(process.cwd(), 'chat-ia-config.json');
        this.config = this.loadConfig();
    }

    /**
     * Load configuration from file
     * @returns {Object}
     */
    loadConfig() {
        const defaultConfig = this.getDefaultConfig();

        if (!fs.existsSync(this.configPath)) {
            this.saveConfig(defaultConfig);
            return defaultConfig;
        }

        try {
            const fileContent = fs.readFileSync(this.configPath, 'utf8');
            const loadedConfig = JSON.parse(fileContent);
            return { ...defaultConfig, ...loadedConfig };
        } catch (error) {
            console.error('Error loading config, using defaults:', error.message);
            return defaultConfig;
        }
    }

    /**
     * Get default configuration
     * @returns {Object}
     */
    getDefaultConfig() {
        return {
            facebook: {
                autoMarkRead: true,
                autoMarkDelivery: true,
                listenEvents: true,
                selfListen: false
            },
            processor: {
                commandPrefix: '/',
                ignoreOwnMessages: true,
                processBotMessages: false
            },
            ai: {
                provider: 'mock', // 'openai', 'mock', etc.
                enabled: true,
                maxHistoryLength: 10,
                includeUserInfo: true,
                includeThreadInfo: false,
                typingIndicator: true
            },
            openai: {
                apiKey: process.env.OPENAI_API_KEY || '',
                model: 'gpt-3.5-turbo',
                maxTokens: 1000,
                temperature: 0.7,
                systemPrompt: 'You are a helpful assistant in a Facebook Messenger chat.'
            },
            commands: {
                enabled: true,
                allowCustomCommands: true
            },
            security: {
                allowedUsers: [], // Empty = allow all
                blockedUsers: [],
                allowedThreads: [], // Empty = allow all
                blockedThreads: []
            }
        };
    }

    /**
     * Save configuration to file
     * @param {Object} config
     */
    saveConfig(config = null) {
        const configToSave = config || this.config;
        try {
            fs.writeFileSync(
                this.configPath,
                JSON.stringify(configToSave, null, 2),
                'utf8'
            );
        } catch (error) {
            console.error('Error saving config:', error.message);
        }
    }

    /**
     * Get configuration value
     * @param {string} key - Dot notation key (e.g., 'ai.provider')
     * @param {*} defaultValue
     * @returns {*}
     */
    get(key, defaultValue = null) {
        const keys = key.split('.');
        let value = this.config;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }

        return value;
    }

    /**
     * Set configuration value
     * @param {string} key - Dot notation key
     * @param {*} value
     */
    set(key, value) {
        const keys = key.split('.');
        
        // Prevent prototype pollution
        for (const k of keys) {
            if (k === '__proto__' || k === 'constructor' || k === 'prototype') {
                throw new Error('Invalid key: Cannot set prototype properties');
            }
        }
        
        let target = this.config;

        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            // Additional check for prototype pollution
            if (k === '__proto__' || k === 'constructor' || k === 'prototype') {
                throw new Error('Invalid key: Cannot set prototype properties');
            }
            if (!Object.prototype.hasOwnProperty.call(target, k) || typeof target[k] !== 'object' || target[k] === null) {
                target[k] = {};
            }
            target = target[k];
        }

        const finalKey = keys[keys.length - 1];
        // Final check before assignment
        if (finalKey === '__proto__' || finalKey === 'constructor' || finalKey === 'prototype') {
            throw new Error('Invalid key: Cannot set prototype properties');
        }
        target[finalKey] = value;
    }

    /**
     * Validate configuration
     * @returns {Object} - { valid: boolean, errors: Array }
     */
    validate() {
        const errors = [];

        // Validate AI provider
        const aiProvider = this.get('ai.provider');
        if (this.get('ai.enabled')) {
            if (aiProvider === 'openai') {
                const apiKey = this.get('openai.apiKey');
                if (!apiKey || apiKey === '') {
                    errors.push('OpenAI API key is required when using OpenAI provider');
                }
            }
        }

        // Validate command prefix
        const commandPrefix = this.get('processor.commandPrefix');
        if (!commandPrefix || commandPrefix.length === 0) {
            errors.push('Command prefix cannot be empty');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Reload configuration from file
     */
    reload() {
        this.config = this.loadConfig();
    }

    /**
     * Get full configuration object
     * @returns {Object}
     */
    getAll() {
        return { ...this.config };
    }
}

module.exports = ConfigManager;
