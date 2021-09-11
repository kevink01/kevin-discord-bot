module.exports = {
    name: 'messageCreate',
    on: true, 
    execute(message) {
        if (message.author.bot) return;
    }
}