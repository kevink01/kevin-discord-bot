import Client from '../Client';
import { ClientEvents } from 'discord.js';
import { EventType } from '../Utility';

interface Run {
    (client: Client, ...args: any[]);
}

export interface Event {
    name: keyof ClientEvents;
    type: EventType;
    execute: Run;
}