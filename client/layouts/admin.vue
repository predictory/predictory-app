<template>
    <div id="main">
        <top-menu />
        <b-container
            id="content"
            fluid
        >
            <b-row>
                <b-col>
                    <nuxt />
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
    import TopMenu from '~/components/admin/TopMenu.vue';

    export default {
        components: {
            TopMenu
        },
        middleware: ['admin']
    };
</script>

<style lang="sass" scoped>
    #content
        margin-top: 20px
</style>
