/**
 * Basic Bot Example
 * Simple echo bot that repeats messages
 */

const login = require('../index'); // fca-unofficial
const fs = require('fs');

// Load credentials
const credentials = { 
    appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))
};

// Login to Facebook
login(credentials, (err, api) => {
    if (err) {
        console.error('Login error:', err);
        return;
    }

    console.log('✅ Logged in successfully!');

    // Set options
    api.setOptions({
        listenEvents: true,
        selfListen: false
    });

    // Listen for messages
    api.listenMqtt((err, event) => {
        if (err) {
            console.error('Listen error:', err);
            return;
        }

        // Only respond to messages
        if (event.type !== 'message') {
            return;
        }

        console.log(`📩 Message from ${event.senderID}: ${event.body}`);

        // Echo the message back
        if (event.body) {
            const response = `You said: ${event.body}`;
            api.sendMessage(response, event.threadID, (err) => {
                if (err) {
                    console.error('Send error:', err);
                } else {
                    console.log('✅ Reply sent!');
                }
            });
        }
    });

    console.log('🤖 Bot is running! Send a message to test it.');
});
