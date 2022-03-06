const { Discord } = require('../index');
const schema = require('../Mongoose/schema.js');

module.exports = {
    name: 'messageDelete',
    on: true,
    async execute(message) {
        if (message.author.bot) return;
        const guild = message.guild.id;
        const channel = message.channel.id;
        const deleted = await schema.snipes.findOne({
            guild: guild,
            channel: channel
        });
        let content = await message.attachments.first();
        if (content) {
            content = content.attachment;
        }
        else {
            content = message.content;
        }
        if (!deleted) {
            const newSnipe = await schema.snipes.create({
                guild: guild,
                channel: channel,
                msg: content,
                author: message.author.tag
            });
            newSnipe.save();
        }
        else {
            deleted.msg = content;
            deleted.author = message.author.tag;
            deleted.save();
        }
    }
}