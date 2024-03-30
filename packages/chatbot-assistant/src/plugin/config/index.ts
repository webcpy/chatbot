import convict from 'convict';
import dotenv from 'dotenv';

dotenv.config();

import { schema } from './schema';
const config = convict(schema, { args: [] });

// @ts-ignore
config.getEnv = config.get;

config.validate({
	allowed: 'strict',
});


export default config