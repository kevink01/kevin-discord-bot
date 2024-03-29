import dotenv from 'dotenv';
import { Config } from './Interfaces';

dotenv.config();

export const config: Config = {
	token: process.env.TOKEN,
	prefix: '+',
	defaults: {
		welcomeChannel: undefined,
		logChannel: undefined,
		memberRole: undefined,
		muteRole: undefined
	}
};
