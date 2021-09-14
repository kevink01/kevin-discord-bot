const { client, Discord } = require('../../index');

module.exports = {
    name: 'createdOn',
    args: '<user>',
    minArgs: 1,
    maxArgs: 1,
    roles: ['Staff'],
    execute(message, args) {
        let user = message.mentions.users.first() || client.users.cache.find(f => f.id === args[0]);
        if (!user) {
            message.channel.send('Could not find that user. Please provide a valid mention or ID');
            return;
        }
        const memeberEmbed = new Discord.MessageEmbed()
        .setAuthor(`${user.username}`, `${user.displayAvatarURL()}`)
        .addField('Created on', `${new Date(user.createdTimestamp).toLocaleDateString()}`);

        message.channel.send({ embeds: [memeberEmbed]});
    }
}