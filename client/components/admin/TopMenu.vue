<template>
    <b-navbar
        sticky
        toggleable="md"
        type="dark"
        variant="info"
    >
        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
        <b-navbar-brand to="/admin">
            Predictory
        </b-navbar-brand>
        <b-collapse
            id="nav_collapse"
            is-nav
        >
            <b-navbar-nav>
                <b-nav-item
                    to="/admin/users"
                    exact
                >
                    Users
                </b-nav-item>
                <b-nav-item
                    to="/admin/movies"
                    exact
                >
                    Movies
                </b-nav-item>
                <b-nav-item
                    to="/admin/analytics"
                    exact
                >
                    Analytics
                </b-nav-item>
                <b-nav-item
                    to="/admin/playground"
                    exact
                >
                    Playground
                </b-nav-item>
                <b-nav-item
                    to="/admin/groups"
                    exact
                >
                    Groups
                </b-nav-item>
                <b-nav-item
                    to="/admin/settings"
                    exact
                >
                    Settings
                </b-nav-item>
                <b-nav-item
                    to="/admin/results"
                    exact
                >
                    Questionnaire results
                </b-nav-item>
            </b-navbar-nav>
            <menu-user
                :user-full-name="userFullName"
                :is-logged="isLogged"
                :is-admin="isAdmin"
                :handle-logout="handleLogout"
            />
        </b-collapse>
    </b-navbar>
</template>

<script>
    import TopMenu from '~/components/shared/TopMenu';
    import MenuUser from '~/components/shared/MenuUser';

    export default {
        components: {
            MenuUser
        },
        extends: TopMenu,
    };
</script>

<style lang="sass" scoped>
</style>
