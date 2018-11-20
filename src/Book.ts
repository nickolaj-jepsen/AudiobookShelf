import {readdir as _readdir, stat as _stat} from 'fs';
import {Moment} from 'moment';
import moment from 'moment';
import {parseFile} from 'music-metadata';
import {dirname, extname, join, sep} from 'path';
import Podcast from 'podcast';
import {promisify} from 'util';
import {config} from './Config';
import {lookup} from 'mime-types';

const readdir = promisify(_readdir);
const stat = promisify(_stat);

const START_DATE = moment([2010, 0, 1]);

const FILE_TYPE: {[key: string]: any} = {
    flac: 'audio/flac',
    m4a: 'audio/mp4',
    m4b: 'audio/mp4',
    mp3: 'audio/mp3',
    mp4: 'audio/mp4',
    oga: 'audio/ogg',
    ogg: 'audio/ogg',
};

interface IEpisode {
    title: string;
    mimetype: string;
    date: Moment;
    guid: string;
    size: number;
    duration: number;
}

export class Book {
    public static async fromDirectory(relativePath: string): Promise<Book> {
        const path = join(config.AUDIOBOOK_PATH, relativePath);
        const name = path.split(sep).pop();
        const episodes: IEpisode[] = [];
        const currentDate = moment(START_DATE);
        const url = relativePath.split(sep).map((p) => encodeURIComponent(p)).join('/');

        const dir = await readdir(path);
        for (const fileName of dir.sort()) {
            const filePath = join(path, fileName);
            const file = await stat(filePath);
            if (file.isFile() && Object.keys(FILE_TYPE).includes(extname(filePath).substring(1))) {
                const metadata = await parseFile(filePath, {duration: true});

                episodes.push({
                    title: fileName,
                    mimetype: FILE_TYPE[extname(filePath).substring(1)],
                    guid: encodeURI(fileName),
                    date: moment(currentDate),
                    size: file.size,
                    duration: Math.round(metadata.format.duration!),
                });
                currentDate.add(1, 'day');
            }
        }

        return new Book(name!, path, url, episodes);
    }

    constructor(
        public name: string,
        public path: string,
        public url: string,
        public episodes: IEpisode[],
    ) {}

    public async asFeed() {
        const podcast = new Podcast({
            title: this.name,
            pubDate: START_DATE.toDate(),
            feed_url: `${config.HOST}/rss/${this.url}`,
            image_url: `${config.HOST}/image/${this.url}.jpg`,
            itunesImage: `${config.HOST}/image/${this.url}.jpg`,
            site_url: config.HOST,
            itunesAuthor: (await this.getAuthor()) || 'unknown',
        });

        for (const episode of this.episodes) {
            podcast.addItem({
                title: episode.title,
                description: 'An audiobook episode',
                url: `${config.HOST}/files/${this.url}/${episode.guid}`,
                guid: episode.guid,
                date: episode.date.toDate(),
                itunesDuration: episode.duration,
                enclosure: {
                    url: `${config.HOST}/files/${this.url}/${episode.guid}`,
                    size: episode.size,
                    type: episode.mimetype,
                },
            });
        }

        return podcast.buildXml('\t');
    }

    public async getThumbnail() {
        const firstEpisode = this.episodes[0];
        if (firstEpisode !== undefined) {
            const metadata = await parseFile(join(this.path, firstEpisode.title));
            const cover = metadata.common.picture;
            if (cover && cover[0]) {
                return cover[0];
            }
        }
        return undefined;
    }

    public async getAuthor() {
        const firstEpisode = this.episodes[0];
        if (firstEpisode !== undefined) {
            const metadata = await parseFile(join(this.path, firstEpisode.title));
            const artist = metadata.common.artist;
            if (artist) {
                return artist;
            }
        }
        return undefined;
    }
}

export async function findBooks(path: string): Promise<Book[]> {
    const result: Book[] = [];
    let bookFound = false;
    const dir = await readdir(path);

    for (const fileName of dir) {
        const filePath = join(path, fileName);
        const file = await stat(filePath);

        if (file.isDirectory()) {
            result.push(...(await findBooks(filePath)));
        }

        if (!bookFound && file.isFile() && Object.keys(FILE_TYPE).includes(extname(filePath).substring(1))) {
            result.push(await Book.fromDirectory(dirname(filePath.replace(config.AUDIOBOOK_PATH, ''))));
            bookFound = true;
        }
    }

    return result;
}
