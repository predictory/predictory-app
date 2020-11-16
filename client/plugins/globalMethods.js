import Vue from 'vue';
import Download from 'downloadjs';
import PapaParse from 'papaparse';
import * as _ from "lodash";

Vue.mixin({
    computed: {
        isLogged() {
            return !!this.$auth.user;
        },
        isAdmin() {
            return this.isLogged ? this.$auth.user.admin : false;
        },
        userFullName() {
            const user = this.$auth.user;
            return user ? `${user.name} ${user.surname}` : '';
        },
        mostRatedGenres() {
            return this.getMostRatedGenres();
        },
        mostValuedGenres() {
            return this.getMostValuedGenres();
        },
        leastRatedGenres() {
            return this.getLeastRatedGenres();
        },
        leastValuedGenres() {
            return this.getLeastValuedGenres();
        },
        mostRatedGenresAll() {
            return this.getMostRatedGenres(12);
        },
        mostValuedGenresAll() {
            return this.getMostValuedGenres(12);
        },
        leastRatedGenresAll() {
            return this.getLeastRatedGenres(12);
        },
        leastValuedGenresAll() {
            return this.getLeastValuedGenres(12);
        }
    },
    methods: {
        downloadCSV(data, name) {
            const parsedData = PapaParse.unparse(data, {
                delimiter: ';',
                encoding: 'utf8'
            });
            Download(parsedData, name, 'application/csv');
        },
        getMostRatedGenres(num = 3) {
            const ratedGenres = this.genres.filter((genre) => genre.count);

            if (ratedGenres && ratedGenres.length > 0) {
                return _.orderBy(this.genres, ['count'], ['desc']).slice(0, num);
            }

            return [];
        },
        getMostValuedGenres(num = 3) {
            const ratedGenres = this.genres.filter((genre) => genre.count);

            if (ratedGenres && ratedGenres.length > 0) {
                return _.orderBy(this.genres, ['value'], ['desc']).slice(0, num);
            }

            return [];
        },
        getLeastRatedGenres(num = 3) {
            const notRatedGenres = this.genres.filter((genre) => genre.count === 0);

            if (notRatedGenres && notRatedGenres.length < num) {
                let genres = this.genres.filter((genre) => genre.count);
                genres = [
                    ..._.orderBy(genres, ['count'], ['desc']).slice(Math.max(genres.length - (num - notRatedGenres.length), 0)),
                    ...notRatedGenres,
                ];

                return genres;
            }

            return notRatedGenres;
        },
        getLeastValuedGenres(num = 3) {
            const notRatedGenres = this.genres.filter((genre) => genre.count === 0);

            if (notRatedGenres && notRatedGenres.length < num) {
                let genres = this.genres.filter((genre) => genre.count);
                genres = [
                    ..._.orderBy(genres, ['value'], ['desc']).slice(Math.max(genres.length - (num - notRatedGenres.length), 0)),
                    ...notRatedGenres,
                ];

                return genres;
            }

            return notRatedGenres;
        },
        getRelevance(movies, mostRatedGenresAll, leastRatedGenresAll) {
            const relevantGenres = mostRatedGenresAll.map(genre => genre.id);
            const notRelevantGenres = leastRatedGenresAll.map(genre => genre.id);

            return movies.map((movie) => {
                const genres = movie.genres.map(genre => genre.id);

                const movieRelevantGenres = genres.filter(genre => relevantGenres.includes(genre));
                const movieNotRelevantGenres = genres.filter(genre => notRelevantGenres.includes(genre));

                let relevant;
                if (movieRelevantGenres.length > 0 && movieNotRelevantGenres.length === 0) {
                    relevant = true;
                    // } else if (movieRelevantGenres.length === 0 && movieNotRelevantGenres.length > 0) {
                    //     relevant = false;
                    // } else if (movieRelevantGenres.length > 0 && movieNotRelevantGenres.length > 0) {
                    //     relevant = movieRelevantGenres.length > movieNotRelevantGenres.length;
                    // }
                } else {
                    relevant = false;
                }

                return { id: movie.id, relevant };
            });
        },
        getRelevantCount(items) {
            return items.reduce((count, item) => {
                return item.relevant ? count + 1 : count;
            }, 0);
        },
        getFinalScore(toTake, relevant) {
            return Math.round((relevant / toTake) * 100);
        },
        getRecallScore(results, n) {
            const topN = results.slice(0, n);
            const relevantCount = topN.reduce((count, item) => {
                return item.relevant ? count + 1 : count;
            }, 0);

            return Math.round((relevantCount / n) * 100);
        },
        getFMeasureScore(results, toTake, n) {
            const relevantItems = results.filter(item => item.relevant).length;
            const precision = this.getFinalScore(toTake, relevantItems);
            const recall = this.getRecallScore(results, n);
            return Math.round((2 * precision * recall) / (precision + recall));
        }
    }
});
