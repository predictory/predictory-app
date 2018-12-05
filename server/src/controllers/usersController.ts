import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import * as config from 'config';
import axios from 'axios';
import { Request, Router } from 'express';
import { getRepository } from 'typeorm';
import winston from '../utils/winston';
import { User } from '../entities/User';
import { validateRegister } from '../utils/validations/user';
import { authenticate } from '../middleware/auth';
import { Movie } from '../entities/Movie';

const router = Router();

router.get('/', authenticate, async (req: Request, res: any) => {
    const repository = getRepository(User);

    try {
        const users = await repository.find();

        if (users && users.length > 0) {
            return users.map(user => _.pick(user, ['id', 'name', 'surname', 'email', 'admin']));
        }

        return res.boom.badRequest('No users found');
    } catch (error) {
        winston.error(error.message);
        return res.boom.internal();
    }
});

router.post('/', async (req: Request, res: any) => {
    const { error, value: validated } = validateRegister(req.body);
    const userRepository = getRepository(User);

    if (error) {
        return res.boom.badRequest('Name, surname, email and password must be supplied');
    }

    try {
        const existing = await userRepository.findOne({ email: validated.email });
        if (existing) {
            return res.boom.badRequest('User with given email already exists.');
        }

        const user = new User();
        user.name = validated.name;
        user.surname = validated.surname;
        user.email = validated.email;
        user.admin = (validated.admin !== undefined) ? validated.admin : true;
        user.password = await bcrypt.hash(validated.password, 10);

        const createdUser = await userRepository.save(user);
        return res.send(_.pick(createdUser, ['id', 'name', 'surname', 'email', 'admin']));
    } catch (error) {
        winston.error(error.message);
        return res.boom.internal();
    }
});

router.get('/me', authenticate, async (req: Request, res: any) => {
    const userRepository = getRepository(User);

    try {
        const user = await userRepository.findOne({ id: req.user.id });

        if (user) {
            return res.send({ user: _.pick(user, ['id', 'name', 'surname', 'email', 'admin']) });
        }

        return res.boom.badRequest('Authentication failed');
    } catch (error) {
        winston.error(error.message);
        return res.boom.internal();
    }
});

router.get('/:id/recommendations', authenticate, async (req: Request, res: any) => {
    const id = parseInt(req.params.id, 10);
    const userId = parseInt(req.user.id, 10);
    const recommender = config.get('recommenderUrl');
    const repository = getRepository(Movie);

    if ((id !== userId) && !req.user.admin) {
        return res.boom.badRequest('You have no permissions to perform this action.');
    }

    try {
        const recommendations = await axios.get(`${recommender}/users/${id}/recommendations`);

        if (recommendations && recommendations.data.recommendations && recommendations.data.recommendations.length > 0) {
            const moviesIds = recommendations.data.recommendations.map(item => item.id);
            const movies = await repository
                .createQueryBuilder('movies')
                .where('movies.id IN (:ids)', { ids: moviesIds })
                .select(['movies.id', 'movies.title', 'movies.poster', 'movies.type'])
                .getMany();

            if (movies && movies.length > 0) {
                return res.send(movies);
            }

            return res.send(recommendations.data);
        }

        return res.boom.badRequest(`No recommendations for user ${id}.`);
    } catch (error) {
        winston.error(error.message);
        return res.boom.internal();
    }
});

export default router;
