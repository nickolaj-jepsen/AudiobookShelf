import { Request, Response, Router } from 'express';
import {lookup} from 'mime-types';
import {join} from 'path';
import {config} from '../Config';

const router: Router = Router();

router.get('/*', async (req: Request, res: Response) => {
    const fileLocation = join(config.AUDIOBOOK_PATH, ...decodeURI(req.path).split('/'));
    res.setHeader('Content-Type', lookup(fileLocation) || 'audio/mpeg');
    res.sendFile(fileLocation);
});

export const FileRouter: Router = router;
