import { Request, Router } from 'express';
import { getRepository } from 'typeorm';
import winston from '../utils/winston';
import { Genre } from '../entities/Genre';
const router = Router();

router.get('/', async (req: Request, res: any) => {
    const repository = getRepository(Genre);

    try {
        const query = repository
            .createQueryBuilder('genres');

        const genres = await query.getMany();

        if (genres && genres.length > 0) {
            return res.send(genres);
        }

        return res.boom.badRequest('No genres found.');
    } catch (error) {
        winston.error(error.message);
        return res.boom.internal();
    }
});

export default router;
