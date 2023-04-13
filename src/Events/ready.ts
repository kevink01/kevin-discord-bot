import { Event } from '../Interfaces';
import { EventType } from '../Utility';

export const event: Event = {
	name: 'ready',
	type: EventType.on,
	execute: (client) => {
		console.log(`Client logged in as ${client.user.username}`);
	}
};
