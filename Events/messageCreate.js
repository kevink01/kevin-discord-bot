const { client } = require('../index');

module.exports = {
    name: 'messageCreate',
    on: true, 
    execute(message) {
        if (message.channel.id === '864502428958588968') {
            const embed = message.embeds[0];
            if (!embed) {
                return;
            }
            else if (embed.title === 'You have failed verification!' || (embed.description !== null && embed.description.toString().startsWith('You are already being verified'))) {
                setTimeout(() => {
                    message.delete();
                }, 5000);
            }
        }
    }
}