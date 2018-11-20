import {createLogger, format, Logger, transports} from 'winston';
import {config} from './Config';

function buildLogger() {
    const logBuilder: Logger = createLogger({
        level: 'info',
        format: format.json(),
    });

    if (config.NODE_ENV === 'development') {
        logBuilder.add(new transports.Console({
            level: 'debug',
            format: format.combine(
                format.colorize(),
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                format.align(),
                format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`)),
        }));
    } else {
        logBuilder.add(new transports.Console({
            level: 'warn',
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                format.align(),
                format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`)),
        }));
    }

    return logBuilder;
}

export const logger: Logger = buildLogger();
