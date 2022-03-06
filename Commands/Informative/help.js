const { Discord } = require('../../index');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: 'help',
    maxArgs: 0,
    description: 'A command for finding more information about other available commands',
    execute(message, args) {
        let commands = [];
        const readFiles = (directory) => {
            const files = fs.readdirSync(path.join(__dirname, directory));
            for (const file of files) {
                const stats = fs.lstatSync(path.join(__dirname, directory, file));
                if (stats.isDirectory()) {
                    readFiles(path.join(directory, file));
                }
                else {
                    commands.push(file.substring(0, file.indexOf('.')));
                }
                
            }
        }

        readFiles('../../Commands');
        const select = new Discord.MessageSelectMenu()
            .setPlaceholder('Select a command')
            .setCustomId('Help Menu');
        for (let i = 0; i < commands.length; i++) {
            select.addOptions([
                {
                    label: commands[i],
                    value: commands[i],
                    description: `Click me for information about the ${commands[i]} command`
                }
            ])
        }
        const menu = new Discord.MessageActionRow()
            .addComponents(
                select
            );

        message.channel.send({ content: 'Please select a command for more information', components: [menu] });
    }
}