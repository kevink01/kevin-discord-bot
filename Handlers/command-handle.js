module.exports = (client, requirements) => {
    let {
        name,
        permissions = [],
        channels = [],
    } = requirements;

    // Converts alias into an array
    if (typeof name === 'string') {
        name = [name];
    }

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

    client.commands.set(name[0], requirements);
    console.log(`         >>> ✅ Registring command: ${name[0]}`);
}