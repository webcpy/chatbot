<template>
  <el-form size="small">
    <el-form-item>
      <el-radio v-model="radioValue" :label="1"> 日，允许的通配符[, - * / L M] </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="2"> 不指定 </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        周期从
        <el-input-number v-model="cycle01" :min="0" :max="31" /> -
        <el-input-number v-model="cycle02" :min="0" :max="31" /> 日
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="4">
        从
        <el-input-number v-model="average01" :min="0" :max="31" /> 号开始，每
        <el-input-number v-model="average02" :min="0" :max="31" /> 日执行一次
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="5">
        每月
        <el-input-number v-model="workday" :min="0" :max="31" /> 号最近的那个工作日
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="6"> 本月最后一天 </el-radio>
    </el-form-item>

    <el-form-item>
      <div class="w-full flex">
        <el-radio v-model="radioValue" :label="7"> 指定 </el-radio>
        <el-select
          clearable
          v-model="checkboxList"
          placeholder="可多选"
          multiple
          style="width: 100%"
        >
          <el-option v-for="item in 31" :key="item" :value="item">{{ item }}</el-option>
        </el-select>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue'

export default defineComponent({
  name: 'CrontabDay',
  // eslint-disable-next-line vue/require-prop-types
  props: ['check', 'cron'],
  setup(props, { emit }) {
    const radioValue = ref(1)
    const workday = ref(1)
    const cycle01 = ref(1)
    const cycle02 = ref(2)
    const average01 = ref(1)
    const average02 = ref(1)
    const checkboxList = ref([])
    const checkNum = ref(props.check)

    const cycleTotal = computed(() => {
      const start = checkNum.value(cycle01.value, 1, 31)
      const end = checkNum.value(cycle02.value, 1, 31)
      return `${start}-${end}`
    })

    const averageTotal = computed(() => {
      const start = checkNum.value(average01.value, 1, 31)
      const end = checkNum.value(average02.value, 1, 31)
      return `${start}/${end}`
    })

    // 计算工作日格式
    const workdayCheck = computed(() => {
      const time = checkNum.value(workday.value, 1, 31)
      return time
    })

    // 计算勾选的checkbox值合集
    const checkboxString = computed(() => {
      let str = checkboxList.value.join()
      return str == '' ? '*' : str
    })

    // 监听radioValue变化
    watch(radioValue, (newValue) => {
      radioChange(newValue)
    })

    // 单选按钮值变化时
    function radioChange() {
      if (radioValue.value === 1) {
        emit('update', 'day', '*', 'day')
        emit('update', 'week', '?', 'day')
        emit('update', 'mouth', '*', 'day')
      } else {
        if (props.cron.hour === '*') {
          emit('update', 'hour', '0', 'day')
        }
        if (props.cron.min === '*') {
          emit('update', 'min', '0', 'day')
        }
        if (props.cron.second === '*') {
          emit('update', 'second', '0', 'day')
        }
      }

      switch (radioValue.value) {
        case 2:
          emit('update', 'day', '?')
          break
        case 3:
          emit('update', 'day', cycleTotal.value)
          break
        case 4:
          emit('update', 'day', averageTotal.value)
          break
        case 5:
          emit('update', 'day', `${workday.value}W`)
          break
        case 6:
          emit('update', 'day', 'L')
          break
        case 7:
          emit('update', 'day', checkboxString.value)
          break
      }
    }

    // 监听周期两个值变化
    watch(cycleTotal, () => {
      if (radioValue.value == '3') {
        emit('update', 'day', cycleTotal.value)
      }
    })

    // 监听平均两个值变化
    watch(averageTotal, () => {
      if (radioValue.value == '4') {
        emit('update', 'day', averageTotal.value)
      }
    })

    // 监听最近工作日值变化
    watch(workdayCheck, () => {
      if (radioValue.value == '5') {
        emit('update', 'day', `${workday.value}W`)
      }
    })

    // 监听checkbox值变化
    watch(checkboxString, () => {
      if (radioValue.value == '7') {
        emit('update', 'day', checkboxString.value)
      }
    })

    // 监听父组件传递的week变化
    watch(
      () => props.cron.week,
      () => {
        if (props.cron.week == '?' && radioValue.value == '2') {
          radioValue.value = '1'
        } else if (props.cron.week !== '?' && radioValue.value != '2') {
          radioValue.value = '2'
        }
      }
    )

    return {
      radioValue,
      workday,
      cycle01,
      cycle02,
      average01,
      average02,
      checkboxList,
      cycleTotal,
      averageTotal,
      workdayCheck,
      checkboxString,
      radioChange
    }
  }
})
</script>
