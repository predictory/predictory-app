<template>
    <b-row>
        <b-col>
            <b-form>
                <b-form-group
                    id="hybridType"
                    label="Hybrid type (required)"
                    label-for="hybridType"
                >
                    <b-form-select
                        id="hybridType"
                        :value="settings.hybridType"
                        :options="settings.hybridTypes"
                        @change="changeHybridType"
                    ></b-form-select>
                </b-form-group>
                <b-form-group
                    id="algorithm"
                    label="Algorithm (required)"
                    label-for="algorithm"
                >
                    <b-form-select
                        id="algorithm"
                        :value="settings.recType"
                        :options="settings.recTypes"
                        @change="changeRecType"
                    ></b-form-select>
                </b-form-group>
                <b-form-group
                    id="similarityType"
                    label="Similarity function (optional)"
                    label-for="similarityType"
                >
                    <b-form-select
                        id="similarityType"
                        :value="settings.similarityType"
                        :options="settings.similarityTypes"
                        :disabled="settings.recType === 'svd'"
                        @change="changeSimilarityType"
                    ></b-form-select>
                </b-form-group>
                <b-form-group
                    id="similaritySource"
                    label="Algorithm used for similarity with already rated movies (required)"
                    label-for="similaritySource"
                >
                    <b-form-select
                        id="similaritySource"
                        :value="settings.similaritySource"
                        :options="settings.similaritySources"
                        @change="changeSimilaritySource"
                    ></b-form-select>
                </b-form-group>
                <b-form-group
                    id="genre"
                    label="Specific genres (optional)"
                    label-for="genre"
                >
                    <b-form-select
                        id="genre"
                        :value="settings.genre"
                        :options="genres"
                        :select-size="4"
                        multiple
                        @change="changeGenre"
                    ></b-form-select>
                </b-form-group>
                <b-form-group
                    id="movieType"
                    label="Specific movie type (optional)"
                    label-for="movieType"
                >
                    <b-form-select
                        id="movieType"
                        :value="settings.movieType"
                        :options="settings.movieTypes"
                        @change="changeMovieType"
                    ></b-form-select>
                </b-form-group>
                <b-form-group
                    id="orderBy"
                    label="Order by (required)"
                    label-for="orderBy"
                >
                    <b-form-select
                        id="orderBy"
                        :value="settings.orderBy"
                        :options="settings.orderByOptions"
                        @change="changeOrderBy"
                    ></b-form-select>
                </b-form-group>
            </b-form>
        </b-col>
    </b-row>
</template>

<script>
    export default {
        props: {
            settings: {
                type: Object,
                required: true
            },
            changeSettingsHandler: {
                type: Function,
                required: true
            },
            genres: {
                type: Array,
                required: true
            }
        },
        methods: {
            changeHybridType(value) {
                this.changeSettingsHandler('hybrid', 'hybridType', value);
            },
            changeRecType(value) {
                this.changeSettingsHandler('hybrid', 'recType', value);
                if (this.settings.recType === 'svd') {
                    this.changeSettingsHandler('hybrid', 'similarityType', null);
                }
            },
            changeSimilarityType(value) {
                this.changeSettingsHandler('hybrid', 'similarityType', value);
            },
            changeSimilaritySource(value) {
                this.changeSettingsHandler('hybrid', 'similaritySource', value);
            },
            changeGenre(value) {
                this.changeSettingsHandler('hybrid', 'genre', value);
            },
            changeMovieType(value) {
                this.changeSettingsHandler('hybrid', 'movieType', value);
            },
            changeOrderBy(value) {
                this.changeSettingsHandler('hybrid', 'orderBy', value);
            }
        }
    };
</script>
