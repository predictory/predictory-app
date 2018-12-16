export const state = () => ({
    users: [],
    count: 0,
    take: 50,
    skip: 0,
    orderBy: 'id',
    order: 'ASC'
});

export const getters = {
    users (state) {
        return state.users;
    },
    count (state) {
        return state.count;
    },
    take (state) {
        return state.take;
    },
    skip (state) {
        return state.skip;
    },
    orderBy(state) {
        return state.orderBy;
    },
    order(state) {
        return state.order;
    }
};

export const mutations = {
    setUsers (state, users) {
        state.users = users;
    },
    setCount (state, count) {
        state.count = count;
    },
    setSkip(state, skip) {
        state.skip = skip;
    },
    setOrderBy(state, orderBy) {
        state.orderBy = orderBy;
    },
    setOrder(state, order) {
        state.order = order;
    }
};

export const actions = {
    async setUsers({ commit, state }) {
        try {
            const url = `/users?take=${state.take}&skip=${state.skip}&orderBy=${state.orderBy}&order=${state.order}`;
            const users = await this.$axios.$get(url);

            if (users && users.length > 0) {
                commit('setUsers', users);
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    async setCount({ commit }) {
        try {
            const usersCount = await this.$axios.$get(`/users/count`);

            if (usersCount) {
                commit('setCount', usersCount.count);
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    setSkip({ commit, dispatch }, skip) {
        commit('setSkip', skip);
        dispatch('setUsers');
    },
    setOrderBy({ commit }, orderBy) {
        commit('setOrderBy', orderBy);
    },
    setOrder({ commit }, order) {
        commit('setOrder', order);
    }
};
