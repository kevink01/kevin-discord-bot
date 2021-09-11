const { Discord } = require('../main')
module.exports = {
    name: 'messageDelete',
    on: true,
    snipes: new Discord.Collection(),
    execute(message) {
        this.snipes.set(message.channel.id, message);
    }
}