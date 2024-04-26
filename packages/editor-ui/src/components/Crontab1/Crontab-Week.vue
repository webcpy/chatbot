<template>
  <el-form size="small">
    <el-form-item>
      <el-radio v-model="radioValue" :label="1"> 周，允许的通配符[, - * / L #] </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="2"> 不指定 </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        周期从星期
        <el-input-number v-model="cycle01" :min="1" :max="7" /> -
        <el-input-number v-model="cycle02" :min="1" :max="7" />
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="4">
        第
        <el-input-number v-model="average01" :min="1" :max="4" /> 周的星期
        <el-input-number v-model="average02" :min="1" :max="7" />
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="5">
        本月最后一个星期
        <el-input-number v-model="weekday" :min="1" :max="7" />
      </el-radio>
    </el-form-item>

    <el-form-item>
      <div class="flex w-full">
        <el-radio v-model="radioValue" :label="6"> 指定 </el-radio>
        <el-select
          clearable
          v-model="checkboxList"
          placeholder="可多选"
          multiple
          style="width: 100%"
        >
          <el-option v-for="(item, index) of weekList" :key="index" :value="index + 1">{{
            item
          }}</el-option>
        </el-select>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue'

export default defineComponent({
  name: 'CrontabWeek',
  // eslint-disable-next-line vue/require-prop-types
  props: ['check', 'cron'],
  setup(props, { emit }) {
    const radioValue = ref(2)
    const weekday = ref(1)
    const cycle01 = ref(1)
    const cycle02 = ref(2)
    const average01 = ref(1)
    const average02 = ref(1)
    const checkboxList = ref([])
    const weekList = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const checkNum = ref(props.check)

    const cycleTotal = computed(() => {
      const start = checkNum.value(cycle01.value, 1, 7)
      const end = checkNum.value(cycle02.value, 1, 7)
      return `${start}-${end}`
    })

    const averageTotal = computed(() => {
      const start = checkNum.value(average01.value, 1, 4)
      const end = checkNum.value(average02.value, 1, 7)
      return `${start}#${end}`
    })

    const weekdayCheck = computed(() => {
      const week = checkNum.value(weekday.value, 1, 7)
      return week
    })

    const checkboxString = computed(() => {
      let str = checkboxList.value.join()
      return str == '' ? '*' : str
    })

    watch(radioValue, radioChange)
    watch(cycleTotal, cycleChange)
    watch(averageTotal, averageChange)
    watch(weekdayCheck, weekdayChange)
    watch(checkboxString, checkboxChange)

    function radioChange() {
      if (radioValue.value === 1) {
        emit('update', 'week', '*')
        emit('update', 'year', '*')
      } else {
        if (props.cron.mouth === '*') {
          emit('update', 'mouth', '0', 'week')
        }
        if (props.cron.day === '*') {
          emit('update', 'day', '0', 'week')
        }
        if (props.cron.hour === '*') {
          emit('update', 'hour', '0', 'week')
        }
        if (props.cron.min === '*') {
          emit('update', 'min', '0', 'week')
        }
        if (props.cron.second === '*') {
          emit('update', 'second', '0', 'week')
        }
      }
      switch (radioValue.value) {
        case 2:
          emit('update', 'week', '?')
          break
        case 3:
          emit('update', 'week', cycleTotal.value)
          break
        case 4:
          emit('update', 'week', averageTotal.value)
          break
        case 5:
          emit('update', 'week', `${weekday.value}L`)
          break
        case 6:
          emit('update', 'week', checkboxString.value)
          break
      }
    }

    function cycleChange() {
      if (radioValue.value === 3) {
        emit('update', 'week', cycleTotal.value)
      }
    }

    function averageChange() {
      if (radioValue.value === 4) {
        emit('update', 'week', averageTotal.value)
      }
    }

    function weekdayChange() {
      if (radioValue.value === 5) {
        emit('update', 'week', `${weekday.value}L`)
      }
    }

    function checkboxChange() {
      if (radioValue.value === 6) {
        emit('update', 'week', checkboxString.value)
      }
    }

    return {
      radioValue,
      weekday,
      cycle01,
      cycle02,
      average01,
      average02,
      checkboxList,
      weekList,
      checkNum,
      cycleTotal,
      averageTotal,
      weekdayCheck,
      checkboxString,
      radioChange,
      cycleChange,
      averageChange,
      weekdayChange,
      checkboxChange
    }
  }
})
</script>
