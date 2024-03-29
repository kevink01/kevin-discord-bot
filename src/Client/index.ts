import { ActivityType, Client, Collection, REST, Routes } from 'discord.js';
import path from 'path';
import { readdirSync, lstatSync } from 'fs';
import { Command, Event, Config, SlashCommand } from '../Interfaces';
import { config } from '../config';
import { Direction, EventType, printLoad } from '../Utility';

class ExtendedClient extends Client {
	public commands: Collection<string, Command> = new Collection();
	public events: Collection<string, Event> = new Collection();
	public slashCommands: Collection<string, SlashCommand> = new Collection();
	public config: Config = config;
	public aliases: Collection<string, Command> = new Collection();

	public async init() {
		const rest = new REST({ version: '10' }).setToken(this.config.token);
		await this.readCommand('..\\Commands');
		await this.readEvent('..\\Events');
		await this.readSlashCommand('..\\Slashcommands');
		const cmd = await this.slashCommands.map((command) => {
			return command.data.toJSON();
		});

		this.login(config.token).then(async () => {
			await rest
				.put(Routes.applicationCommands(this.user.id), { body: cmd })
				.then((result: Object) => {
					console.log(` > Client now supports ${Object.entries(result).length} slash commands`);
				})
				.catch((err) => {
					console.error(err);
					return;
				});
			this.user.setActivity('Green Day', { type: ActivityType.Listening });
		});
	}
	private load: number = 1;
	private async readCommand(dir: string) {
		printLoad(this.load++, Direction.left, `Loading ${dir.substring(dir.lastIndexOf('\\') + 1)}`);
		const files = readdirSync(path.join(__dirname, dir));
		for (const file of files) {
			const stats = lstatSync(path.join(__dirname, dir, file));
			if (stats.isDirectory()) {
				await this.readCommand(path.join(dir, file));
			} else {
				const { command } = await require(`${__dirname}/${dir}/${file}`);
				this.commands.set(command.name, command);
				let aliases: string = '';

				if (command?.aliases) {
					command.aliases.forEach((alias) => {
						this.aliases.set(alias, command);
						aliases += `, ${alias}`;
					});
				}
				if (aliases.length) {
					aliases = '[' + aliases.substring(aliases.indexOf(', ') + 2) + ']';
				}
				printLoad(this.load, Direction.left, `✅ Registring command: ${command.name} ${aliases}`);
			}
		}
		printLoad(--this.load, Direction.right, `❗ Done loading ${dir.substring(dir.lastIndexOf('\\') + 1)}`);
	}

	private async readEvent(dir: string) {
		printLoad(this.load++, Direction.left, `Loading ${dir.substring(dir.lastIndexOf('\\') + 1)}`);
		const files = readdirSync(path.join(__dirname, dir));
		for (const file of files) {
			const stats = lstatSync(path.join(__dirname, dir, file));
			if (stats.isDirectory()) {
				await this.readEvent(path.join(dir, file));
			} else {
				const { event } = await require(`${__dirname}/${dir}/${file}`);
				this.events.set(event.name, event);
				printLoad(this.load, Direction.left, `✅ Registring event: ${event.name}`);
				if (event.type === EventType.once) {
					this.once(event.name, (...args) => event.execute(this, ...args));
				} else {
					this.on(event.name, (...args) => event.execute(this, ...args));
				}
			}
		}
		printLoad(--this.load, Direction.right, `❗ Done loading ${dir.substring(dir.lastIndexOf('\\') + 1)}`);
	}

	private async readSlashCommand(dir: string) {
		printLoad(this.load++, Direction.left, `Loading ${dir.substring(dir.lastIndexOf('\\') + 1)}`);
		const files = readdirSync(path.join(__dirname, dir));
		for (const file of files) {
			const stats = lstatSync(path.join(__dirname, dir, file));
			if (stats.isDirectory()) {
				await this.readSlashCommand(path.join(dir, file));
			} else {
				const { slashcommand } = await require(`${__dirname}/${dir}/${file}`);
				this.slashCommands.set(slashcommand.name, slashcommand);
				printLoad(this.load, Direction.left, `✅ Registring slash command: ${slashcommand.name}`);
			}
		}
		printLoad(--this.load, Direction.right, `❗ Done loading ${dir.substring(dir.lastIndexOf('\\') + 1)}`);
	}
}

export default ExtendedClient;
