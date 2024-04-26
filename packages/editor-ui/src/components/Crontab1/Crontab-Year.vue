<template>
  <el-form size="small">
    <el-form-item>
      <el-radio :label="1" v-model="radioValue"> 不填，允许的通配符[, - * /] </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio :label="2" v-model="radioValue"> 每年 </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio :label="3" v-model="radioValue">
        周期从
        <el-input-number v-model="cycle01" :min="fullYear" /> -
        <el-input-number v-model="cycle02" :min="fullYear" />
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio :label="4" v-model="radioValue">
        从
        <el-input-number v-model="average01" :min="fullYear" /> 年开始，每
        <el-input-number v-model="average02" :min="fullYear" /> 年执行一次
      </el-radio>
    </el-form-item>

    <el-form-item>
      <div class="flex w-full">
        <el-radio :label="5" v-model="radioValue"> 指定 </el-radio>
        <el-select clearable v-model="checkboxList" placeholder="可多选" multiple>
          <el-option
            v-for="item in 9"
            :key="item"
            :value="item - 1 + fullYear"
            :label="item - 1 + fullYear"
          />
        </el-select>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
import { split } from 'lodash-es'
import { start } from 'nprogress'
import { defineComponent, ref, computed, watch, onMounted } from 'vue'

export default defineComponent({
  name: 'CrontabYear',
  // eslint-disable-next-line vue/require-prop-types
  props: ['check', 'mouth', 'cron'],
  setup(props, { emit }) {
    const fullYear = ref(0)
    const radioValue = ref(1)
    const cycle01 = ref(0)
    const cycle02 = ref(0)
    const average01 = ref(0)
    const average02 = ref(1)
    const checkboxList = ref([])
    const checkNum = ref(props.check)

    const cycleTotal = computed(() => {
      const start = checkNum.value(cycle01.value, fullYear.value, fullYear.value + 100)
      const end = checkNum.value(cycle02.value, fullYear.value + 1, fullYear.value + 101)
      return `${start}-${end}`
    })

    const averageTotal = computed(() => {
      const start = checkNum.value(average01.value, fullYear.value, fullYear.value + 100)
      const end = checkNum.value(average02.value, 1, 10)
      return `${start}/${end}`
    })

    const checkboxString = computed(() => {
      return checkboxList.value.join()
    })

    watch(radioValue, radioChange)
    watch(cycleTotal, cycleChange)
    watch(averageTotal, averageChange)
    watch(checkboxString, checkboxChange)

    onMounted(() => {
      // 仅获取当前年份
      fullYear.value = new Date().getFullYear()
    })

    function radioChange() {
      if (props.cron.mouth === '*') {
        emit('update', 'mouth', '0', 'year')
      }
      if (props.cron.day === '*') {
        emit('update', 'day', '0', 'year')
      }
      if (props.cron.hour === '*') {
        emit('update', 'hour', '0', 'year')
      }
      if (props.cron.min === '*') {
        emit('update', 'min', '0', 'year')
      }
      if (props.cron.second === '*') {
        emit('update', 'second', '0', 'year')
      }
      switch (radioValue.value) {
        case 1:
          emit('update', 'year', '')
          break
        case 2:
          emit('update', 'year', '*')
          break
        case 3:
          emit('update', 'year', cycleTotal.value)
          break
        case 4:
          emit('update', 'year', averageTotal.value)
          break
        case 5:
          emit('update', 'year', checkboxString.value)
          break
      }
    }

    function cycleChange(val) {
      if (val) {
        const [start, end] = val.split('-')
        cycle01.value = start
        cycle02.value = end
      }
      if (radioValue.value === 3) {
        emit('update', 'year', cycleTotal.value)
      }
    }

    function averageChange(val) {
      if (val) {
        const [start, end] = val.split('/')
        average01.value = start
        average02.value = end
      }
      if (radioValue.value === 4) {
        emit('update', 'year', averageTotal.value)
      }
    }

    function checkboxChange() {
      if (radioValue.value === 5) {
        emit('update', 'year', checkboxString.value)
      }
    }

    return {
      fullYear,
      radioValue,
      cycle01,
      cycle02,
      average01,
      average02,
      checkboxList,
      checkNum,
      cycleTotal,
      averageTotal,
      checkboxString,
      radioChange,
      cycleChange,
      averageChange,
      checkboxChange
    }
  }
})
</script>
