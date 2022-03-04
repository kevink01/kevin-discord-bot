const { Discord } = require('../../index.js');
const schema = require('../../Mongoose/schema.js');
const questions = require('../../Utility/setup.json');

async function delay(ms) {
    return new Promise (res => setTimeout(res, ms));
}

function updateDescription(status, data, x, max) {
    let string = '';
    for (let i = 0; i < max; i++) {
        if (i === x) {
            status[i] = `-> ${questions[i]}`;
        }
        else {
            status[i] = questions[i];
        }
        if (i < x) {
            status[i] += ": " + data[i];
        }
        string += status[i] + "\n";
    }
    return string;
}
async function askSetup(setup, setupMessage) {
    const filter = async m => await !m.author.bot;
    const maxCount = questions.length;
    let count = 0;
    let data = [];
    let status = [];
    let channel = setupMessage.channel;
    for (let i = 0; i < maxCount; i++) {
        setup.setTitle("Entering fields...")
        await setup.setDescription(updateDescription(status, data, i, maxCount));
        setup.setFooter('Fields with (*) at the end are required. If you want to skip, type \'N/A\'');
        setup.setColor('ORANGE');
        setupMessage.edit( { embeds: [setup] } );
        await setupMessage.channel.awaitMessages({ filter, max: 1})
        .then(async (collected) => {
            let response = collected.first();
            if (response.content.toLowerCase() === 'exit') {
                response.delete();
                setupMessage.delete();
                await channel.send('Successfully exited out of the setup.');
                await delay(3000);
                channel.bulkDelete(2);
                i = maxCount + 1;
                return;
            }
            else {
                switch (i) {
                    case 0:
                        if (response.content.length > 1) {
                            const alert = await channel.send('Prefix must be length of 1. Please try again.');
                            await delay(2000);
                            alert.delete();
                            i--;
                        }
                        else {
                            data[count] = response.content;
                            await delay(3000);
                            count++;
                        }
                        response.delete();
                        break;
                    case 1:
                    case 2:
                    case 3: 
                        if (i === 2 && response.content.toLowerCase() === 'n/a') {
                            data[count] = undefined;
                            await delay(3000);
                            count++;
                        }
                        else if (!response.content.startsWith('<')) {
                            const alert = await channel.send('Invalid channel. Try again.');
                            await delay(2000);
                            alert.delete();
                            i--;
                        }
                        else {
                            let mod = response.content.substring(2, response.content.length - 1);
                            let check;
                            await setupMessage.guild.channels.fetch(mod).then(channel => check = channel.name)
                            if (!check) {
                                const alert = await channel.send('Invalid channel. Try again.');
                                await delay(2000);
                                alert.delete();
                                i--;
                            }
                            else {
                                data[count] = response.content;
                                await delay(3000);
                                count++;
                            }
                        }
                        response.delete();
                        break;
                    case 4:
                    case 5:
                        if (i === 5 && response.content.toLowerCase() === 'n/a') {
                            data[count] = undefined;
                            await delay(3000);
                            count++;
                        }
                        else if (!response.content.startsWith('<')) {
                            const alert = await channel.send('Invalid channel. Try again.');
                            await delay(2000);
                            alert.delete();
                            i--;
                        }
                        else {
                            const modRole = response.content.substring(3, response.content.length - 1);
                            await setupMessage.guild.roles.fetch(modRole).then(role => check = role.name);
                            if (!check) {
                                const alert = await channel.send('Invalid role. Try again');
                                await delay(2000);
                                alert.delete();
                                i--;
                            }
                            else {
                                data[count] = response.content;
                                await delay(3000);
                                count++;
                            }
                        }   
                        response.delete();
                        break;
                }
            }
        });
    }
    if (count === maxCount) {
        setup.setTitle('Finished with setup! Please wait to save these changed.');
        setup.setColor('YELLOW');
        await setup.setDescription(updateDescription(status, data, count, maxCount));
        setupMessage.edit( { embeds: [setup] } );
        let insert = [];
        for (let i = 0; i < maxCount; i++) {
            if (data[i] === undefined) {
                insert[i] = data[i];
            }
            else if (i === 4 || i === 5) {
                insert[i] = data[i].substring(3, data[i].length - 1);
            }
            else if (i !== 0) {
                insert[i] = data[i].substring(2, data[i].length - 1);
            }
            else {
                insert[i] = data[i];
            }
        }
        const newData = await schema.server.create({
            guild: setupMessage.guild.id,
            prefix: insert[0],
            welcome: insert[1],
            verification: insert[2],
            logging: insert[3],
            muted: insert[4],
            member: insert[5]
        });
        newData.save();
        await delay(3000);
        setup.setTitle('Saved the data! Setup complete!');
        setup.setColor('GREEN')
        setupMessage.edit( { embeds: [setup] } );
        await delay(2000);
        channel.bulkDelete(2);
    }
}

module.exports = {
    name: 'setup',
    maxArgs: 1,
    permissions: ['ADMINISTRATOR'],
    description: 'Sets up the bot for the server to use',
    async execute(message, args) {
        const filter = async m => await !m.author.bot;
        let setup = new Discord.MessageEmbed()
        .setAuthor(message.author.tag)
        .setTitle("Welcome to the setup!")
        .setDescription("Please wait to check if this bot has been set up in this server.")
        .setTimestamp(message.createdTimestamp)
        .setColor("BLUE");
        let setupMessage = await message.channel.send( { embeds: [setup] });
        await delay(2000);
        const found = await schema.server.findOne({
            guild: message.guild.id
        });
        if (found) {
            setup.setTitle("This bot has already been setup for this server");
            setup.setDescription(`Do you want to overwrite the setup?
            Type 'yes' to overwrite this data. (YOU CANNOT UNDO THIS)
            Type 'no' or anything else to cancel`);
            setup.setColor("YELLOW");
            setupMessage.edit( { embeds: [setup] });
            await message.channel.awaitMessages({ filter, max: 1 })
            .then(async (collected) => {
                let response_msg = collected.first();
                let response = response_msg.content;
                response_msg.delete();
                if (response !== 'yes'){
                    setup.setDescription("Cancelling setup! Please wait a few seconds");
                    setup.setColor("RED");
                    setupMessage.edit( { embeds: [setup] });
                    await delay(2000);
                    setupMessage.delete();
                    message.delete();
                    return;
                }
                else {
                    found.delete();
                    setup.setTitle("Deleting the setup!");
                    setup.setDescription('Please wait a few seconds to proceed setup...');
                    setup.setColor("GREEN");
                    setupMessage.edit( { embeds: [setup] });
                    await delay(2000);
                    askSetup(setup, setupMessage);
                }
            });
        }
        else {
            setup.setTitle("This bot hasn't been setup");
            setup.setDescription('Please wait a few seconds to proceed setup...');
            setup.setColor("NOT_QUITE_BLACK");
            setupMessage.edit( { embeds: [setup] });
            await delay(2000);
            askSetup(setup, setupMessage);
        }
    }
}