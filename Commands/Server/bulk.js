const { Discord } = require('../../index.js');

module.exports = {
    name: 'bulk',
    args: '<num>',
    minArgs: 1,
    maxArgs: 2, 
    description: 'Deletes x number of messages: LIMIT 100',
    examples: 
    `
    +bulk 5: Deletes 5 messages
    `,
    async execute(message, args) {
        if (isNaN(args[0])) {
            message.channel.send("Not a number!");
            return;
        }
        if (args[0] <= 0 || args[0] >= 100) {
            message.channel.send("Must be between 0 and 100");
            return;
        }
        let num = parseInt(args[0]);
        await message.channel.bulkDelete(num)
        .catch(console.error);
        let alert = await message.channel.send(`Deleted ${num} messages!`);
        setTimeout(() => {
            alert.delete();
        }, 2000);
        
    }
}