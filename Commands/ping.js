module.exports = {
    name: 'ping',
    roles: ['Member'],
    description: 'A basic command that replies with "pong"',
    execute(message, args) {
        if (message.author.bot) return;
        message.channel.send('Pong!');
    }
}