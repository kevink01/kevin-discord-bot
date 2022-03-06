module.exports = (client, commands) => {
    const { name } = commands;
    console.log(`      >>> ✅ Registring event: ${name}`);
    
    const event = require(`../Events/${name}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
    }
    else {
       client.on(event.name, (...args) => event.execute(...args));
    }
}
