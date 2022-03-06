module.exports = {
    name: 'ping',
    description: 'A basic command that replies with "pong"',
    execute(message, args) {
        if (message.author.bot) return;
        message.channel.send('Pong!');
    }
}