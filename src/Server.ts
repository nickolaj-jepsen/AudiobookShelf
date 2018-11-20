import express from 'express';
import morgan from 'morgan';
import {config} from './Config';
import {logger} from './Log';
import {BrowseRouter} from './routes/BrowseRouter';
import {FeedRouter} from './routes/FeedRouter';
import {FileRouter} from './routes/FileRouter';
import {ImageRouter} from './routes/ImageRouter';
import {RSSRouter} from './routes/RSSRouter';

const app: express.Application = express();

app.use(morgan('tiny', {
    stream: {
        write(text: string) {
            logger.http(text);
        },
    },
}));

app.use('/feed', FeedRouter);
app.use('/files', FileRouter);
app.use('/rss', RSSRouter);
app.use('/image', ImageRouter);
app.use('/browse', BrowseRouter);

const port: number = Number(process.env.PORT) || config.PORT;
app.listen(port, async () => {
    logger.info(`Listening at http://localhost:${port}/`);
});
