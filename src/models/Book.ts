import {readdir as _readdir, stat as _stat} from 'fs';
import moment from 'moment';
import {dirname, extname, join, sep} from 'path';
import Podcast from 'podcast';
import {promisify} from 'util';
import {config} from '../Config';
import {Episode} from './Episode';

const readdir = promisify(_readdir);
const stat = promisify(_stat);

export const START_DATE = moment([2010, 0, 1]);

export const FILE_TYPE: {[key: string]: any} = {
    flac: 'audio/flac',
    m4a: 'audio/mp4',
    m4b: 'audio/mp4',
    mp3: 'audio/mp3',
    mp4: 'audio/mp4',
    oga: 'audio/ogg',
    ogg: 'audio/ogg',
};

export class Book {
    public static async fromDirectory(relativePath: string): Promise<Book> {
        const path = join(config.AUDIOBOOK_PATH, relativePath);
        const name = path.split(sep).pop();
        let fileNumber = 0;
        const episodes: Episode[] = [];
        const url = relativePath.split(sep).map((p) => encodeURIComponent(p)).join('/');

        const dir = await readdir(path);
        for (const fileName of dir.sort()) {
            const filePath = join(path, fileName);
            const file = await stat(filePath);
            if (file.isFile() && Object.keys(FILE_TYPE).includes(extname(filePath).substring(1))) {
                episodes.push(new Episode(
                    fileName,
                    path,
                    fileNumber,
                ));
                fileNumber++;
            }
        }

        return new Book(name!, path, url, episodes);
    }

    constructor(
        public name: string,
        public path: string,
        public url: string,
        public episodes: Episode[],
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
            podcast.addItem(await episode.asPodcastItem(this.url));
        }

        return podcast.buildXml('\t');
    }

    public async getThumbnail() {
        const firstEpisode = this.episodes[0];
        if (firstEpisode !== undefined) {
            const metadata = await firstEpisode.getMetadata();
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
            const metadata = await firstEpisode.getMetadata();
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
