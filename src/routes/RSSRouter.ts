import {Request, Response, Router} from 'express';
import {join} from 'path';
import {Book} from '../Book';

const router: Router = Router();

router.get('/*', async (req: Request, res: Response) => {
    const book = await Book.fromDirectory(join(...decodeURI(req.path).split('/')));
    res.contentType('application/xml');
    return res.send(await book.asFeed());
});

export const RSSRouter: Router = router;
