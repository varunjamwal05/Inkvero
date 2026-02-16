const EventJob = require('../models/EventJob');

class EventQueue {
    async add(type, payload) {
        try {
            await EventJob.create({
                type,
                payload
            });
            console.log(`Job added to queue: ${type}`);
        } catch (err) {
            console.error('Failed to add job to queue:', err);
            // Fallback: Log to file or alert
        }
    }

    // A simple processor for MVP (Normally would be a separate worker process)
    async process() {
        // Logic to pick 'PENDING' jobs and execute them
        // This will be called by a cron or interval in server.js
    }
}

module.exports = new EventQueue();
