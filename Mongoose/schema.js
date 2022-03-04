const mongoose = require('mongoose');

const serverSettingsSchema = new mongoose.Schema({
    guild: {
        type: String,
        required: true
    },
    prefix: {
        type: String,
        required: true
    },
    welcome: {
        type: String,
        required: true,
    },
    verification: {
        type: String
    },
    logging: {
        type: String,
        required: true,
    },
    muted: {
        type: String,
        required: true
    },
    member: {
        type: String
    }
})

const rolesSchema = new mongoose.Schema({
    guild: {
        type: String,
        required: true,
    },
    channel: {
        type: String,
        required: true,
    },
    roles: {
        type: Array,
        required: true
    }
});

const lastMessageSchema = new mongoose.Schema({
    guild: {
        type: String,
        required: true
    },
    channel: {
        type: String,
        required: true
    },
    msg: {
        type: String, 
        required: true
    },
    author: {
        type: String,
        required: true
    }
});


module.exports = {
    server: mongoose.model('Server', serverSettingsSchema, 'Server'),
    roles: mongoose.model('Roles', rolesSchema, 'Roles'),
    snipes: mongoose.model('Snipes', lastMessageSchema, 'Snipes')
}