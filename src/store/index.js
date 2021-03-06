import Vue from 'vue'
import Vuex from 'vuex'
import Localbase from 'localbase'

const db = new Localbase('db')
db.config.debug = false

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    appTitle: process.env.VUE_APP_TITLE,
    search: null,
    tasks: [
      // {
      //   id: 1,
      //   title: 'Wake up',
      //   done: false,
      //   dueDate: '2021-03-08'
      // },
      // {
      //   id: 2,
      //   title: 'Get bananas',
      //   done: false,
      //   dueDate: '2021-03-10'
      // },
      // {
      //   id: 3,
      //   title: 'Eat bananas',
      //   done: false,
      //   dueDate: '2021-03-21'
      // }
    ],
    snackbar: {
      show: false,
      text: ''
    },
    sorting: false
  },
  mutations: {
    setSearchValue (state, value) {
      state.search = value
    },

    addTask (state, newTaskTitle) {
      state.tasks.push(newTaskTitle)
    },
    doneTask (state, id) {
      const task = state.tasks.filter(task => task.id === id)[0]
      task.done = !task.done
      task.status = (task.done) ? 'completed' : 'ongoing'
    },
    showSnackbar (state, text) {
      let timeout = 0

      if (state.snackbar.show) {
        state.snackbar.show = false
        timeout = 300
      }
      setTimeout(() => {
        state.snackbar.show = true
        state.snackbar.text = text
      }, timeout)
    },

    deleteTask (state, id) {
      state.tasks = state.tasks.filter(task => task.id !== id)
    },

    hideSnackbar (state) {
      state.snackbar.show = false
    },
    updateTaskTitle (state, payload) {
      const task = state.tasks.filter(task => task.id === payload.id)[0]
      task.title = payload.title
    },
    updateTaskDueDate (state, payload) {
      const task = state.tasks.filter(task => task.id === payload.id)[0]
      task.dueDate = payload.dueDate
      task.status = payload.status
    },

    setTasks (state, tasks) {
      state.tasks = tasks
    },

    toggleSorting (state) {
      state.sorting = !state.sorting
    }
  },

  actions: {
    addTask ({ commit }, newTask) {
      db.collection('tasks').add(newTask).then(() => {
        commit('addTask', newTask)
        commit('showSnackbar', 'Task added!')
      })
    },

    hideSnackbar ({ commit }) {
      commit('hideSnackbar')
    },

    doneTask ({ state, commit }, id) {
      const task = state.tasks.filter(task => task.id === id)[0]
      db.collection('tasks').doc({ id: id }).update({
        done: !task.done,
        status: (!task.done) ? 'completed' : 'ongoing'
      }).then(() => {
        commit('doneTask', id)
      })
    },

    deleteTask ({ commit }, id) {
      db.collection('tasks').doc({ id: id }).delete().then(() => {
        commit('deleteTask', id)
        commit('showSnackbar', 'Task deleted!')
      })
    },

    updateTaskTitle ({ commit }, payload) {
      db.collection('tasks').doc({ id: payload.id }).update({
        title: payload.title
      }).then(() => {
        commit('updateTaskTitle', payload)
        commit('showSnackbar', 'Task updated!')
      })
    },

    updateTaskDueDate ({ commit }, payload) {
      db.collection('tasks').doc({ id: payload.id }).update({
        dueDate: payload.dueDate,
        status: payload.status
      }).then(() => {
        commit('updateTaskDueDate', payload)
        commit('showSnackbar', 'Due Date Updated!')
      })
    },

    updateTaskStatus ({ commit }, payload) {
      db.collection('tasks').doc({ id: payload.id }).update({
        status: payload.status
      })
    },

    setTasks ({ commit }, tasks) {
      // console.log(tasks)
      db.collection('tasks').set(tasks)
      commit('setTasks', tasks)
    },

    // setSearchValue ({ commit }, payload) {
    //   commit('setSearchValue', payload)
    // },

    getTasks ({ commit }) {
      db.collection('tasks').get().then(tasks => {
        commit('setTasks', tasks)
      })
    }
  },

  getters: {
    snackbar: state => state.snackbar,
    appTitle: state => state.appTitle,
    searchValue: state => state.search,
    tasksFiltered (state) {
      if (!state.search) {
        return state.tasks
      }
      return state.tasks.filter(task =>
        task.title.toLowerCase().includes(state.search.toLowerCase())
      )
    },
    sorting: state => state.sorting,
    progress: state => state.progress
  }
})
