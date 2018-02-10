<template>
  <div class="tasks">
    <div class="task rounded bg-gray my-2 p-2">
      <form @submit.prevent="addTask(addTaskSlug)">
        <div class="input-group">
          <span class="input-group-addon">task-manager/tasks/</span>
          <input type="text" class="form-input" v-model="addTaskSlug" placeholder="Module name">
          <button type="submit" class="btn btn-primary input-group-btn">Add task</button>
        </div>
      </form>
    </div>
    <div class="task rounded bg-gray my-2 p-2" :style="task.style" v-for="task in aggregatedTasks" :key="task.slug">
      <h5>
        <span class="label float-right" :class="task.statusLabelClass">{{ task.status }}</span>
        <span class="mr-2">{{ task.moduleName }}</span>
        <button class="btn btn-sm btn-primary" v-if="task.status === 'pause' || task.status === 'canceled'" @click.prevent="resumeTask(task.slug)">Resume</button>
        <button class="btn btn-sm btn-secondary" v-if="task.status === 'running'" @click.prevent="pauseTask(task.slug)">Pause</button>
        <button class="btn btn-sm btn-error" @click.prevent="deleteTask(task.slug)">{{ task.status === 'canceled' ? 'Delete' : 'Cancel' }}</button>
      </h5>
      <pre class="code" :data-lang="`RESULT (${task.jobsDone}/${task.jobsTotal})`"><code>{{ task.result || 'N/A' }}</code></pre>
      <div class="bar">
        <div class="bar-item tooltip tooltip-right" :data-tooltip="`Done: ${task.jobsDone} (${task.donePercent}%)`" :style="{ width: task.donePercent + '%', background: '#32B63E' }"></div>
        <div class="bar-item tooltip tooltip-right" :data-tooltip="`To retry: ${task.jobsToRetry} (${task.retryPercent}%)`" :style="{ width: task.retryPercentDisplay + '%', background: '#e85600' }"></div>
        <div class="bar-item tooltip tooltip-right" :data-tooltip="`Running: ${task.jobsRunning} (${task.runningPercent}%)`" :style="{ width: task.runningPercentDisplay + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'home-component',

  data () {
    return {
      addTaskSlug: ''
    }
  },

  computed: {
    ...mapGetters(['tasks']),
    aggregatedTasks () {
      return this.tasks.map(task => {
        let status = 'pause'
        let statusLabelClass = 'label-warning'
        let position = 2
        let style = {
          background: 'rgba(255, 183, 0, 0.2)'
        }
        if (task.isRunning) {
          status = 'running'
          statusLabelClass = 'label-primary'
          position = 1
          delete style.background
        } else if (task.isDeleted) {
          status = 'canceled'
          statusLabelClass = 'label-error'
          position = 4
          style.background = 'rgba(232, 86, 0, 0.4)'
        } else if (task.isOver) {
          status = 'finished'
          statusLabelClass = 'label-success'
          position = 3
          style.background = 'rgba(50, 182, 67, 0.3)'
        }
        const retryPercent = Math.round(task.jobsToRetry * 100 * 100 / task.jobsTotal) / 100
        const runningPercent = Math.round(task.jobsRunning * 100 * 100 / task.jobsTotal) / 100
        return {
          ...task,
          status,
          statusLabelClass,
          donePercent: Math.round(task.jobsDone * 100 * 100 / task.jobsTotal) / 100,
          retryPercent,
          retryPercentDisplay: task.jobsToRetry ? Math.max(1, retryPercent) : 0,
          runningPercent,
          runningPercentDisplay: task.jobsRunning ? Math.max(1, runningPercent) : 0,
          position
        }
      }).sort((a, b) => a.position - b.position)
    }
  },

  methods: mapActions(['addTask', 'resumeTask', 'pauseTask', 'deleteTask'])
}
</script>

<style lang="css">
.tasks .task {
  box-shadow: 0 0.05rem 0.2rem rgba(69,77,93,.3);
}
</style>
