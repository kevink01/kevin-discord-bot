import Client from '../Client';
import { Message, PermissionsString } from 'discord.js';

interface Run {
    (message: Message, client?: Client, args?: string[]);
}

interface Example {
    command: string;
    description: string;
}

interface Args {
    argument: string;
    required: boolean;
}

export interface Command {
    name: string;
    description: string;
    minArgs?: number;
    maxArgs?: number;
    args?: Args[];
    permissions?: PermissionsString[];
    aliases?: string[];
    examples?: Example[];
    execute: Run;
}