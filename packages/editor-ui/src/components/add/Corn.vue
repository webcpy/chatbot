<template>
  <div class="flex">
    <el-select v-model="model.type" placeholder="周期" style="width: 100px">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>

    <el-select
      v-if="model.type == 'week'"
      v-model="model.week"
      placeholder="星期"
      style="width: 100px"
    >
      <el-option v-for="(item, index) in 7" :key="index" :label="'星期' + item" :value="item" />
    </el-select>

    <el-select
      v-if="model.type == 'month'"
      v-model="model.month"
      placeholder="日期"
      style="width: 100px"
    >
      <el-option v-for="(item, index) in 31" :key="index" :label="item + '号'" :value="item" />
    </el-select>

    <el-time-picker
      value-format="HH:mm:ss"
      v-if="model.type != 'cron'"
      v-model="model.date"
      placeholder="时间"
    />
    <el-input
      v-if="model.type == 'cron'"
      v-model="model.cron"
      style="width: 240px"
      placeholder="例如每天凌晨1点执行：0 0 1 * * *"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref, unref, defineEmits, nextTick, defineModel, useAttrs } from 'vue'
import { ElSelect, ElOption, ListItem } from 'element-plus'
import { getFriend } from '@/api/dashboard/workplace'

const props = defineProps({
  formModel: {
    type: Object,
    default: () => ({})
  }
})

const options = ref([
  {
    value: 'day',
    label: '每天'
  },
  {
    value: 'week',
    label: '每周'
  },
  {
    value: 'month',
    label: '每月'
  },
  {
    value: 'cron',
    label: 'Cron风格'
  }
])
const value = ref<string[]>([])
const loading = ref(false)

// eslint-disable-next-line vue/require-prop-types
let model: any = defineModel()
</script>
