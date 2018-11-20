import {Request, Response, Router} from 'express';
import {join} from 'path';
import {Book, findBooks} from '../Book';
import {config} from '../Config';

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
    const books = await findBooks(config.AUDIOBOOK_PATH);
    return res.json(books);
});

router.get('/*', async (req: Request, res: Response) => {
    const book = await Book.fromDirectory(join(...decodeURI(req.path).split('/')));
    return res.json(book);
});

export const FeedRouter: Router = router;
