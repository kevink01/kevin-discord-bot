const { client } = require('../index')
const schema = require('../Mongoose/schema.js')

module.exports = {
    name: 'messageCreate',
    on: true,
    async execute(message, args) {
        let prefix = process.env.DEFAULT_PREFIX;
        let member;
        let cmd;

        if (message.author.bot) return;
        
        await schema.server.findOne( { guild: message.guild.id }).then(result => {
            prefix = result.prefix;
            member = result.member;
        });
        
        if (!message.content.startsWith(prefix)) return;
        
        const index = message.content.indexOf(' ');
        if (index === -1) {
            cmd = message.content.substring(1);
        }
        else {
            cmd = message.content.substring(1, index);
        }

        requirements = client.commands.get(cmd);

        if (requirements) {
            let {
                minArgs = 0,
                maxArgs = null,
                permissions = [],
                execute
            } = requirements;
            
            // Check for valid permissions
            for (let reqPerms of permissions) {
                if(!message.member.permissions.has(reqPerms)) {
                    message.channel.send(`Missing permission: ${reqPerms}`);
                    return;
                }
            }

            if (member) {
                let memberRole = message.guild.roles.cache.find(a => a.id === member);
                // Return if user does not have member role
                if (!message.member.roles.cache.has(member)) {
                    message.channel.send(`${message.author} does not have '${memberRole}' role.`);
                    return;
                }
            }
            
            const arguments = message.content.split(' ');
            arguments.shift();

            if (arguments.length < minArgs || (maxArgs !== null && arguments.length > maxArgs)) {
                message.reply(`Please use this usage: ${prefix}${cmd} ${args}`);
                return;
            }

            execute(message, arguments);
            return;
        }
        
    }
}