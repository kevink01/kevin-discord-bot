const { rules } = require('../../Utility/rules');
const { Discord } = require('../../index');

module.exports = {
    name: 'rule',
    args: '<num>',
    minArgs: 1,
    maxArgs: 1,
    roles: ['Staff'],
    description: 'Replies with an embed containing the rule number provided as an argument',
    examples: ['+rule 7: Replies with an embed containing what rule #7 is', '+rule 13: Replies with an embed containing what rule #13 is'],
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