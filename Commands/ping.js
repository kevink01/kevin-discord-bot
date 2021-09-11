module.exports = {
    name: 'ping',
    execute(message, args) {
        if (message.author.bot) return;
        message.channel.send('Pong!');
    }
}