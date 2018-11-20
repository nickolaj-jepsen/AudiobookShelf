import * as path from 'path';

interface IConfig {
    [index: string]: any;
    NODE_ENV: string;
    PORT: number;
    AUDIOBOOK_PATH: string;
    HOST: string;
}

const DEFAULT_CONF: IConfig = {
    NODE_ENV : 'development', // should be either development or production
    PORT: 8888,
    AUDIOBOOK_PATH: path.join(__dirname, '..', 'audiobooks'),
    HOST: 'http://insisto.serveo.net',
};

function readConf(): IConfig {
    const resultConf: any = {};
    Object.keys(DEFAULT_CONF).forEach((key) => {
        resultConf[key] = readEnv(key, DEFAULT_CONF[key]);
    });
    return resultConf;
}

function readEnv(key: string, defaultValue: any): any {
    if (process.env[key] !== undefined) {
        return process.env[key]!.trim();
    }
    if (defaultValue !== null) {
        return defaultValue;
    }
    throw new Error(`expected ENV not set: ${key}`);
}

export const config: IConfig = readConf();
