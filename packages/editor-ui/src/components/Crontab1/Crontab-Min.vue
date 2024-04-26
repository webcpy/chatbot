<template>
  <el-form size="small">
    <el-form-item>
      <el-radio v-model="radioValue" :label="1"> 分钟，允许的通配符[, - * /] </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="2">
        周期从
        <el-input-number v-model="cycle01" :min="0" :max="60" /> -
        <el-input-number v-model="cycle02" :min="0" :max="60" /> 分钟
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        从
        <el-input-number v-model="average01" :min="0" :max="60" /> 分钟开始，每
        <el-input-number v-model="average02" :min="0" :max="60" /> 分钟执行一次
      </el-radio>
    </el-form-item>

    <el-form-item>
      <div class="flex w-full">
        <el-radio v-model="radioValue" :label="4"> 指定 </el-radio>
        <el-select
          clearable
          v-model="checkboxList"
          placeholder="可多选"
          multiple
          style="width: 100%"
        >
          <el-option v-for="item in 60" :key="item" :value="item - 1">{{ item - 1 }}</el-option>
        </el-select>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue'

export default defineComponent({
  name: 'CrontabMin',
  // eslint-disable-next-line vue/require-prop-types
  props: ['check', 'cron'],
  setup(props, { emit }) {
    const radioValue = ref(1)
    const cycle01 = ref(1)
    const cycle02 = ref(2)
    const average01 = ref(0)
    const average02 = ref(1)
    const checkboxList = ref([])

    const checkNum = ref(props.check)

    const cycleTotal = computed(() => {
      const start = checkNum.value(cycle01.value, 0, 59)
      const end = checkNum.value(cycle02.value, 0, 59)
      return `${start}-${end}`
    })

    const averageTotal = computed(() => {
      const start = checkNum.value(average01.value, 0, 59)
      const end = checkNum.value(average02.value, 1, 59)
      return `${start}/${end}`
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
      if (radioValue.value !== 1 && props.cron.second === '*') {
        emit('update', 'second', '0', 'min')
      }
      switch (radioValue.value) {
        case 1:
          emit('update', 'min', '*', 'min')
          emit('update', 'hour', '*', 'min')
          break
        case 2:
          emit('update', 'min', cycleTotal.value, 'min')
          break
        case 3:
          emit('update', 'min', averageTotal.value, 'min')
          break
        case 4:
          emit('update', 'min', checkboxString.value, 'min')
          break
      }
    }

    // 监听周期两个值变化
    watch(cycleTotal, () => {
      if (radioValue.value == '2') {
        emit('update', 'min', cycleTotal.value, 'min')
      }
    })

    // 监听平均两个值变化
    watch(averageTotal, () => {
      if (radioValue.value == '3') {
        emit('update', 'min', averageTotal.value, 'min')
      }
    })

    // 监听checkbox值变化
    watch(checkboxString, () => {
      if (radioValue.value == '4') {
        emit('update', 'min', checkboxString.value, 'min')
      }
    })

    return {
      radioValue,
      cycle01,
      cycle02,
      average01,
      average02,
      checkboxList,
      cycleTotal,
      averageTotal,
      checkboxString,
      radioChange
    }
  }
})
</script>
