const { snipes } = require('../../Events/messageDelete')
const { Discord } = require('../../main')

module.exports = {
    name: 'snipe',
    execute(message, args) {
        let sniped = snipes.get(message.channel.id);
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
        
        message.channel.send({ embeds: [embed]});
    }
}