const fs = require('fs');
const path = require('path');
const { Discord } = require('../index');

module.exports = {
    name: 'interactionCreate',
    on: true,
    execute(interaction) {
        if (interaction.isSelectMenu()) {
            switch (interaction.customId) {
                case 'Help Menu':
                    const target = interaction.values[0];
                    let file = undefined;
                    const read = (dir) => {
                        const files = fs.readdirSync(path.join(__dirname, dir));
                        for (const f of files) {
                            const stats = fs.lstatSync(path.join(__dirname, dir, f));
                            if (stats.isDirectory()) {
                                read(path.join(dir, f));
                            }
                            else if (f.endsWith(`${target}.js`)) {
                                file = path.join(dir, f);
                                break;
                            }
                        }
                    }
                    read('../Commands');
                    if (!file) {
                        interaction.reply('Unknown error. Please try again');
                        return;
                    }
                    let {
                        name,
                        roles,
                        description,
                        permissions,
                        args,
                        examples
                    } = require(file);
                    const helpEmbed = new Discord.MessageEmbed()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
                        .setDescription(`More information about the ${target} command`);
                    if (name) {
                        helpEmbed.addField('Command name', name, true)
                    }

                    if (roles) {
                        if (typeof roles === 'object') {
                            let roleStr = '';
                            for (let i = 0; i < roles.length; i++) {
                                roleStr += roles[i] + ', '
                            }
                            if (roleStr !== '') {
                                roleStr = roleStr.substring(0, roleStr.length - 2);
                                helpEmbed.addField('Required Roles', roleStr);
                            }
                        }
                        else if (typeof roles === 'string') {
                            helpEmbed.addField('Required Roles', roles);
                        }
                    }
                    if (permissions) {
                        if (typeof permissions === 'object') {
                            let permStr = '';
                            for (let i = 0; i < permissions.length; i++) {
                                permStr += permissions[i] + ', '
                            }
                            if (permStr !== '') {
                                permStr = permStr.substring(0, permStr.length - 2);
                                helpEmbed.addField('Required Permissions', permStr);
                            }
                        }
                        else if (typeof permissions === 'string') {
                            helpEmbed.addField('Required Roles', permissions);
                        }
                    }
                    if (description) {
                        helpEmbed.addField('Description', description);
                    }

                    if (args) {
                        helpEmbed.addField('Argument format', `+${target} ${args}`);
                    }
                    else {
                        helpEmbed.addField('Argument format', `+${name}`);
                    }

                    if (examples) {
                        if (typeof examples === 'object') {
                            let examplesStr = '';
                            for (let i = 0; i < examples.length; i++) {
                                examplesStr += examples[i] + '\n';
                            }
                            if (examplesStr !== '') {
                                helpEmbed.addField('Examples', examplesStr);
                            }
                        }
                        else if (typeof examples === 'string') {
                            helpEmbed.addField('Examples', examples)
                        }
                    }
                    interaction.reply({ embeds: [helpEmbed] });
                    break;
                default:
                    return;
            }
        }

    }
}