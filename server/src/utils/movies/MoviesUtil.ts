import axios from 'axios';
import * as _ from 'lodash';
import { Movie } from '../../entities/Movie';
import { getRepository } from 'typeorm';
import UsersUtil from '../users/UsersUtil';

export default class MoviesUtil {
    public static getMoviesInfo(movies, recommendations = [], key = null) {
        return movies.map((item) => {
            const rec = MoviesUtil.getItemFromRecs(item.id, recommendations);
            let movie = {
                ...item
            };
            if (key && key !== 'both') {
                movie[key] = (rec && key) ? rec[key] : null;
            }
            if (key && key === 'rating' && rec && 'similarity' in rec && 'rating' in rec) {
                movie['ratedSimilarity'] = rec.similarity;
            }
            if (rec && key && key === 'both') {
                if ('rating' in rec && 'similarity' in rec) {
                    movie['rating'] = rec.rating;
                    movie['ratedSimilarity'] = rec.similarity;
                    movie['recType'] = 1;
                } else if (!('rating' in rec) && 'similarity' in rec) {
                    movie['similarity'] = rec.similarity;
                    movie['recType'] = 2;
                }
            }
            if (rec && rec['augmented_rating']) {
                movie['augmentedRating'] = rec['augmented_rating'];
            }
            const stats = MoviesUtil.getStatsFromRec(rec);

            if (stats) {
                movie = {
                    ...movie,
                    ...stats
                };
            }

            return movie;
        });
    }

    public static async getQueriedMoviesRatings(movies, user, recommenderUrl, orderBy = 'rating,es_score', includeGenres = false) {
        try {
            let url = `${recommenderUrl}/search/${user.id}?order_by=${orderBy}`;
            if (includeGenres) {
                const { favGenres, notFavGenres } = await UsersUtil.getUserGenres(user.id);
                if (favGenres.length > 0) {
                    url = `${url}&fav_genres=${favGenres.join(',')}`;
                }
                if (notFavGenres.length > 0) {
                    url = `${url}&not_fav_genres=${notFavGenres.join(',')}`;
                }
            }
            const ratingsResponse = await axios.post(url, { movies: movies.map(item => item.id) });
            const { ratings } = ratingsResponse.data;
            if (ratings && ratings.length > 0) {
                const moviesWithRatings = movies.map((movie) => {
                    const rating = ratings.find(item => item.id === movie.id);
                    const stats = MoviesUtil.getStatsFromRec(rating);
                    return {
                        ...movie,
                        ...stats,
                        rating: rating.rating,
                        ratedSimilarity: rating.similarity,
                        esScore: rating.es_score,
                        augmentedRating: rating.augmented_rating
                    };
                });

                const orderByColumns = orderBy.split(',');
                const index = orderByColumns.indexOf('augmented_rating');
                if (index !== -1) orderByColumns[index] = 'augmentedRating';
                return _.orderBy(moviesWithRatings, ['isPenalized', ...orderByColumns], ['asc', ...Array(orderByColumns.length).fill('desc')]);
            }

            return movies;
        } catch (error) {
            console.log(error.message);
        }
    }

    public static isPenalizedByUser(movie, user) {
        let isPenalized = false;
        for (const rating of movie.usersRatings) {
            if (rating.userId === user.id && rating.rating === 0) {
                isPenalized = true;
                break;
            }
        }

        return {
            ..._.omit(movie, ['usersRatings']),
            isPenalized
        };
    }

    public static getItemFromRecs(movieId, recommendations) {
        return recommendations.find(movie => parseInt(movie.id, 10) === parseInt(movieId, 10));
    }

    public static async getStats(movies) {
        const ids = movies.map(item => item.id);
        const repository = getRepository(Movie);
        const result = [];

        const stats = await repository
            .createQueryBuilder('movies')
            .leftJoinAndSelect('movies.usersRatings', 'usersRatings')
            .select([
                'movies.id',
                'AVG(usersRatings.rating) AS avgRating',
                'COUNT(usersRatings.id) AS ratingsCount',
                'SUM(CASE WHEN usersRatings.rating = 0 THEN 1 ELSE 0 END) AS penalized'
            ])
            .groupBy('movies.id')
            .where('movies.id IN (:ids)', { ids })
            .getRawMany();

        if (stats && stats.length > 0) {
            for (const movie of movies) {
                const movieStats = stats.find(item => item.movies_id === parseInt(movie.id, 10));
                movie['avgRating'] = movieStats.avgRating;
                movie['ratingsCount'] = parseInt(movieStats.ratingsCount, 10);
                movie['penalized'] = parseInt(movieStats.penalized, 10);

                result.push(movie);
            }

            return result;
        }

        return movies;
    }

    public static getStatsFromRec(item) {
        const avgRating = item['average_rating'] || null;
        const ratingsCount = item['ratings_count'] || 0;
        const penalized = item['penalized'] || 0;
        const esScore = item['es_score'] || 0;

        return {
            avgRating,
            ratingsCount,
            penalized,
            esScore
        };
    }
}
