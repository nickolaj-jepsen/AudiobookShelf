import { Request, Response, Router } from 'express';
import {join} from 'path';
import sharp from 'sharp';
import {Book} from '../Book';

const router: Router = Router();

router.get('/*', async (req: Request, res: Response) => {
    const pathWithoutExt = req.path.replace('.jpg', '');
    const book = await Book.fromDirectory(join(...decodeURI(pathWithoutExt).split('/')));
    const thumbnail = await book.getThumbnail();

    if (thumbnail === undefined) {
        return res.send('');
    }

    res.header('Content-Type', 'image/jpeg');
    const file = await sharp(thumbnail.data)
        .resize(1400, 1400)
        .toFormat('jpeg')
        .toBuffer();
    return res.send(file);
});

export const ImageRouter: Router = router;
