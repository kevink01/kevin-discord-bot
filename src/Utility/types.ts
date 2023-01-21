import { GuildTextBasedChannel, Role } from 'discord.js';

// Enumerations
export enum Direction {
	left = 0,
	right = 1
}

export enum EventType {
	on = 0,
	once = 1
}

export enum Setup {
	welcome = 'Welcome Channel',
	log = 'Log Channel',
	member = 'Member Role',
	muted = 'Muted Role'
}

// Interfaces
export interface Args {
	argument: string;
	required: boolean;
}

export interface Defaults {
	welcomeChannel: GuildTextBasedChannel;
	logChannel: GuildTextBasedChannel;
	memberRole: Role;
	muteRole: Role;
}

export interface Example {
	command: string;
	description: string;
}
