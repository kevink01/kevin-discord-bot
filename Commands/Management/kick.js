const { Discord, client } = require('../../index')
const { delay } = require('../../Utility/functions.js')

module.exports = {
    name: 'kick',
    args: '<user> [reason]',
    minArgs: 1,
    maxArgs: 2,
    permissions: 'KICK_MEMBERS',
    description: 'Kicks a user from the server',
    examples: [
        '+kick @User -> Kicks user (no reason given)',
        '+kick @User [reason] -> Kicks user (with reason)'
    ],
    async execute(message, args) {
        let reason = args[1];
        if (!reason) reason = "Not specified";
        const user = await message.mentions.members.first();
        if (!user) {
            await message.channel.send('Cannot find user');
            await delay(2000);
            message.channel.bulkDelete(2);
            return;
        }
        if (!user.kickable) {
            await message.channel.send('You cannot kick this member.');
            await delay(2000);
            message.channel.bulkDelete(2);
            return;
        }
        const embed = new Discord.MessageEmbed()
        .setColor('DARK_RED')
        .setAuthor(`${client.user.username}`, client.user.displayAvatarURL())
        .setTitle(`You were kicked from ${message.guild.name}`)
        .addFields(
            { name: 'Reason:', value: `${reason}` }
        );
        await (await client.users.fetch(user.user.id)).send( { embeds: [embed] } );
        user.kick(reason);
        message.channel.send(`Successfully kicked ${user.user.username}`);
        await delay(1000);
        message.channel.bulkDelete(1);
    }
}