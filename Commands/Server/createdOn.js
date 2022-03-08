const { client, Discord } = require('../../index');

module.exports = {
    name: 'createdOn',
    args: '<user>',
    minArgs: 1,
    maxArgs: 1,
    description: 'Provids information about a user\'s joined date and created account date',
    examples: [
        '+createdOn @UserTag',
        '+createdOn 123456789012345678'
    ], 
    execute(message, args) {
        let user = message.mentions.users.first() || client.users.cache.find(f => f.id === args[0]);
        if (!user) {
            message.channel.send('Could not find that user. Please provide a valid mention or ID');
            return;
        }
        const member = message.guild.members.cache.get(user.id);
        const now = new Date();
        const created = new Date(user.createdTimestamp);
        const joined = new Date(member.joinedTimestamp);
        const createDiff = Math.ceil((now - created) / (1000 * 60 * 60 * 24));
        const joinedDiff = Math.ceil((now - joined) / (1000 * 60 * 60 * 24));

        const memeberEmbed = new Discord.MessageEmbed()
        .setAuthor(`${user.username}`, `${user.displayAvatarURL()}`)
        .addFields(
            {name: 'Created on', value: `${created.toLocaleDateString()}`, inline: true},
            {name: 'Days ago', value: `${createDiff}`, inline: true},
            {name: '\u200B', value: '\u200B', inline: true},
            {name: 'Joined on', value: `${joined.toLocaleDateString()}`, inline: true},
            {name: 'Days ago', value: `${joinedDiff}`, inline: true},
            {name: '\u200B', value: '\u200B', inline: true}
        );
        message.channel.send({ embeds: [memeberEmbed]});
    }
}