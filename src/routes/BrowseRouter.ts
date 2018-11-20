import {Request, Response, Router} from 'express';
import {join} from 'path';
import {Book, findBooks} from '../Book';
import {config} from '../Config';

const router: Router = Router();

router.get('', async (req: Request, res: Response) => {
    const books = await findBooks(config.AUDIOBOOK_PATH);

    let response = '';

    for (const book of books) {
        response += `<a href="/rss${book.url}">${book.path}</a></br>`;
    }

    return res.send(response);
});

export const BrowseRouter: Router = router;
