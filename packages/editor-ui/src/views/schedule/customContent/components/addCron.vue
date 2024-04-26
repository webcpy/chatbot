<script setup lang="tsx">
import { Dialog } from '@/components/Dialog'
import { ref, unref, reactive, nextTick, defineModel } from 'vue'
import Crontab from '@/components/Crontab1/index.vue'
import { ElInput } from 'element-plus'

const dialogVisible = ref(false)
const from = reactive({
  expression: ''
})
const show = () => {
  from.expression = model
  dialogVisible.value = true
}

const crontabFill = (val) => {
  dialogVisible.value = false
  model.value = val
}

const save = () => {}

// eslint-disable-next-line vue/require-prop-types
const model: any = defineModel()
</script>

<template>
  <div class="flex w-full" @click="show">
    <ElInput v-model="model" />
  </div>
  <Dialog max-height="600" v-model="dialogVisible" title="Cron">
    <Crontab @fill="crontabFill" @hide="dialogVisible = false" :expression="from.expression" />
  </Dialog>
</template>
