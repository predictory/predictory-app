<template lang="pug">
    b-row
        b-col
            b-row
                b-col
                    h2 New Algorithm - manual entries
            b-row
                b-col
                    b-form
                        label(for="toTake") Number of recommendations
                        b-form-input(v-model="toTake", type="number", id="toTake", name="toTake", min="1")
                        b-form-group(id="userId", label="User", label-for="userId")
                            b-form-select(id="userId", v-model="userId", :options="options", required, placeholder="Select user to analyze")
                        label(for="compare") Compare to these users (IDs, separed with semicolon)
                        b-form-input(v-model="compareTo", type="text", id="compare", class="mb-2")
                        b-button(type="button", :disabled="!userId", @click="getRecommendations", variant="secondary") Get recommended movies
            Loading(v-if="loading")
            b-row(v-if="!loading && movies.length", class="mt-2 mb-2")
                b-col
                    h3 Recommended movies
                    p Relevant: {{ relevantCount }}
                    p Not relevant: {{ notRelevantCount }}
                    p Precision: {{ precision }}
                    p Recall (TOP 10): {{ recall10 }}
                    p F1-Measure (TOP 10): {{ f1Measure10 }}
                    p Recall (TOP 15): {{ recall15 }}
                    p F1-Measure (TOP 15): {{ f1Measure15 }}
                    b-table(striped, hover, :items="movies", :fields="moviesFields")
                        template(v-slot:cell(#)="data") {{ data.index + 1 }}
                        template(v-slot:cell(genres)="data") {{ data.item.genres.map(item => item.name).join(', ') }}

</template>

<script>
    import moment from 'moment';
    import * as _ from 'lodash';
    import Loading from '~/components/default/search/Loading';

    export default {
        components: {
            Loading
        },
        data() {
            return {
                loading: false,
                userId: null,
                options: [
                    { value: null, text: 'User to analyze' },
                ],
                users: [],
                moviesFields: [
                    '#',
                    { key: 'id', label: 'ID' },
                    { key: 'title', label: 'Title' },
                    { key: 'genres', label: 'Genres' },
                    { key: 'predictedRating', label: 'Rating' },
                    { key: 'similarity', label: 'Similarity' },
                    { key: 'relevant', label: 'Relevant' }
                ],
                genres: [],
                movies: [],
                toTake: 25,
                compareTo: '',
                relevantCount: null,
                notRelevantCount: null,
                precision: null,
                recall10: null,
                recall15: null,
                f1Measure10: null,
                f1Measure15: null
            };
        },
        async mounted() {
            await this.getUsers();
        },
        methods: {
            moment: function (date = null) {
                return moment(date);
            },
            async getUsers() {
                let users = [];

                try {
                    const url = `/users?take=-1`;

                    const response = await this.$axios.$get(url);
                    if (response && response.length > 0) {
                        users = response.map((user) => ({ value: user.id, text: `${user.name} ${user.surname} (ID: ${user.id})` }));
                    }
                } catch (error) {
                    console.log(error.message);
                }

                this.options = [{ value: null, text: 'User to analyze' }, ...users];
            },
            async analyzeUser() {
                this.loading = true;
                this.movies = [];

                try {
                    const url = `/users/${this.userId}/analyze`;

                    const response = await this.$axios.$get(url);

                    if (response.genres && response.genres.length) {
                        this.genres = response.genres;
                    }
                    if (response.ratings && response.ratings.length) {
                        this.favouriteItems = response.ratings;
                    }
                } catch (error) {
                    console.log(error.message);
                } finally {
                    this.loading = false;
                }
            },
            async getRecommendations() {
                this.favouriteItems = [];
                this.genres = [];

                try {
                    await this.analyzeUser();
                    this.loading = true;
                    const url = `/playground/users/${this.userId}/new?take=${this.toTake}&compareTo=${this.compareTo}`;

                    const response = await this.$axios.$get(url);

                    if (response && response.length) {
                        this.movies = response;
                        const relevance = this.getRelevance(this.movies, this.mostRatedGenresAll, this.leastRatedGenresAll);
                        this.relevantCount = this.getRelevantCount(relevance);
                        this.notRelevantCount = this.toTake - this.relevantCount;
                        this.precision = this.getFinalScore(this.toTake, this.relevantCount);
                        this.recall10 = this.getRecallScore(relevance, 10);
                        this.recall15 = this.getRecallScore(relevance, 15);
                        this.f1Measure10 = this.getFMeasureScore(relevance, this.toTake, 10);
                        this.f1Measure15 = this.getFMeasureScore(relevance, this.toTake, 15);
                        this.movies = this.movies.map((movie) => {
                            const relevanceForItem = relevance.find(item => item.id === movie.id);

                            return { ...movie, relevant: relevanceForItem ? relevanceForItem.relevant : null };
                        });
                    }
                } catch (error) {
                    console.log(error.message);
                } finally {
                    this.loading = false;
                }
            }
        }
    };
</script>

<style lang="sass">
    h2
        margin: 20px 0
</style>