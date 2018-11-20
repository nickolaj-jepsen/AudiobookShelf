import {stat as _stat} from 'fs';
import moment = require('moment');
import {parseFile} from 'music-metadata';
import {extname, join} from 'path';
import {promisify} from 'util';
import {config} from '../Config';
import {FILE_TYPE, START_DATE} from './Book';

const stat = promisify(_stat);

export class Episode {
    constructor(
        public fileName: string,
        public bookPath: string,
        public fileNumber: number,
    ) {}

    public get mimetype() {
        return FILE_TYPE[extname(this.fileName).substring(1)];
    }

    public get filePath() {
        return join(this.bookPath, this.fileName);
    }

    public get title() {
        return this.fileName.replace(/\.[^/.]+$/, '');
    }

    public get guid() {
        return encodeURI(this.fileName);
    }

    public async getFileSize() {
        return (await stat(this.filePath)).size;
    }

    public async getMetadata() {
        return await parseFile(this.filePath);
    }
    
    public async getDuration() {
        const metadata = await parseFile(this.filePath);
        return Math.round(metadata.format.duration!);
    }

    public async asPodcastItem(url: string): Promise<IItemOptions> {
        return {
            title: this.title,
            description: 'An audiobook episode',
            url: `${config.HOST}/files/${url}/${this.guid}`,
            guid: this.guid,
            date: moment(START_DATE).add(this.fileNumber, 'day').toDate(),
            itunesDuration: await this.getDuration(),
            enclosure: {
                url: `${config.HOST}/files/${url}/${this.guid}`,
                size: await this.getFileSize(),
                type: this.mimetype,
            },
        }
    }
}
