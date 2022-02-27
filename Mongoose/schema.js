const mongoose = require('mongoose');

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
    roles: mongoose.model('Roles', rolesSchema, 'Roles'),
    snipes: mongoose.model('Snipes', lastMessageSchema, 'Snipes')
}