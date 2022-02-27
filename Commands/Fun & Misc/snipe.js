const { Discord } = require('../../index');
const schema = require('../../Mongoose/testSchema.js');

module.exports = {
    name: 'snipe',
    //roles: ['Member'],
    description: 'Gets the last message that was deleted in the channel',
    async execute(message, args) {
        /*let sniped = snipes.get(message.channel.id);
        if (!sniped) {
            message.channel.send('No message to snipe.');
            return;
        }
        let hasAttachments = sniped.attachments;
        let attach;
        hasAttachments.forEach(element => {
            if (!attach) {
                attach = element;
            }
            
        });
        let embed = new Discord.MessageEmbed()
        .setTitle(`Sniping \`${sniped.author.tag}\``)
        .setColor('RED')
        .setDescription(sniped.content)
        .setTimestamp(sniped.createdTimestamp);

        if (attach) {
            embed.setImage(attach.url)
        }
        
        message.channel.send({ embeds: [embed]});*/

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