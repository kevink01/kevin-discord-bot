const { rules } = require('../../Utility/rules');
const { Discord } = require('../../index');

module.exports = {
    name: 'rule',
    minArgs: 1,
    maxArgs: 1,
    execute(message, args) {
        if(isNaN(args[0])) {
            message.channel.send(`Please provide an integer from 1-15`);
            return;
        }
        const ruleNum = parseInt(args[0]);
        if (!rules[ruleNum]) {
            message.channel.send(`Please provide an integer from 1-15`);
            return;
        }
        const ruleEmbed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag)
        .setColor('GREEN')
        .setTimestamp();
        ruleEmbed.addField(`Rule #${args[0]}`, `${rules[ruleNum]}`);
        message.channel.send({embeds: [ruleEmbed]});
    }
}