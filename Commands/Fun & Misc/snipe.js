const { Discord } = require('../../index');
const schema = require('../../Mongoose/schema.js');

module.exports = {
    name: 'snipe',
    description: 'Gets the last message that was deleted in the channel',
    async execute(message, args) {
        const guild = message.guild.id;
        const channel = message.channel.id;
        const lastDeleted = await schema.snipes.findOne({
            guild: guild,
            channel: channel
        });
        if (!lastDeleted) {
            message.channel.send('There isn\'t anything to snipe.');
            return;
        }
        else {
            let embed = new Discord.MessageEmbed()
            .setTitle(`Sniping \`${lastDeleted.author}\``)
            .setColor('RED')
            .setTimestamp(message.createdTimestamp);
            const content = lastDeleted.msg;
            if (content.indexOf('https') === -1) {
                embed.setDescription(content);
            }
            else {
                embed.setImage(content);
            }
            message.channel.send({ embeds: [embed]});
        }
    }
}