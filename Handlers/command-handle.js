module.exports = (client, commands) => {
    let {
        name,
        args,
        minArgs = 0,
        maxArgs = null,
        permissions = [],
        channels = [],
        roles = [],
        execute
    } = commands;

    const prefix = '+';
    // Converts alias into an array
    if (typeof name === 'string') {
        name = [name];
    }

    console.log(`Registring command: ${name[0]} ✅`);

    if (permissions.length) {
        if (typeof permissions === 'string') {
            permissions = [permissions];
        }
    }
    if (channels.length) {
        if (typeof channels === 'string') {
            channels = [channels];
        }
    }

    client.on('messageCreate', (message) => {
        if (message.author.bot || !message.content.startsWith(`${prefix}`)) return;
        for (let cmd of name) {
            if (message.content.toLowerCase().startsWith(`${prefix}${cmd.toLowerCase()}`)) {
                // a command has run, check permissions before running

                // Check for valid permissions
                for (let reqPerms of permissions) {
                    if(!message.member.permissions.has(reqPerms)) {
                        message.channel.send(`Missing permission: ${reqPerms}`);
                        return;
                    }
                }


                // Check for valid roles
                for (let role of roles) {
                    const findRole = message.guild.roles.cache.find(r => r.name === role);
                    // Return if role is undefined                    
                    if (!findRole) {
                        message.channel.send('Unknown role when executing this command. Please report error.');
                        return;
                    }

                    // Return if user is missing a role
                    if (!message.member.roles.cache.has(findRole.id)) {
                        message.channel.send(`${message.author} does not have '${findRole}' role.`);
                        return;
                    }
                }

                // Check if the channel ID is valid.
                let canSend = false;
                if (channels.length === 0) {
                    canSend = true;
                }
                else {
                    let validChannels = ['861982966045081620', '867215528018968596'];
                    channels = channels.concat(validChannels);
                    for (let chan of channels) {
                        if (message.channel.id === chan) {
                            canSend = true;
                            break;
                        }
                    }
                }

                if (!canSend) {
                    message.channel.send(`${message.author} cannot send it in this channel.`);
                    return;
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
    })

}