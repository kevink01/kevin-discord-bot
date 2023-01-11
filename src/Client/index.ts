import { Client, Collection } from "discord.js";
import path from 'path';
import { readdirSync, lstatSync } from 'fs';
import { Command, Event, Config } from '../Interfaces';
import { config } from '../config';

class ExtendedClient extends Client {
    public commands: Collection<string, Command> = new Collection();
    public events: Collection<string, Event> = new Collection();
    public config: Config = config;
    public aliases: Collection<string, Command> = new Collection();

    public async init() {
        this.readCommand("../Commands");
        this.readEvent("../Events");
        this.login(config.token).then(() => {
            this.user.setActivity(`Running for ${this.uptime}`)
        });
    }

    private async readCommand(dir: string) {
        const files = readdirSync(path.join(__dirname, dir));
        for (const file of files) {
            const stats = lstatSync(path.join(__dirname, dir, file));
            if (stats.isDirectory()) {
                this.readCommand(path.join(dir, file));
            }
            else {
                const {command} = await require(`${__dirname}/${dir}/${file}`);
                
                this.commands.set(command.name, command);

                if (command?.aliases) {
                    command.aliases.forEach((alias) => {
                        this.aliases.set(alias, command);
                    })
                }
            }
        }
        console.log(this.commands);
        console.log(this.aliases);
    }

    private async readEvent(dir: string) {
        const files = readdirSync(path.join(__dirname, dir));
        for (const file of files) {
            const stats = lstatSync(path.join(__dirname, dir, file));
            if (stats.isDirectory()) {
                this.readCommand(path.join(dir, file));
            }
            else {
                const {event} = await require(`${__dirname}/${dir}/${file}`);                
                this.events.set(event.name, event);
                if (event.once) {
                    this.once(event.name, (...args) => event.execute(this, ...args));
                } else {
                    this.on(event.name, (...args) => event.execute(this, ...args));
                }
            }
        }
        console.log(this.events);
    }
}


export default ExtendedClient;