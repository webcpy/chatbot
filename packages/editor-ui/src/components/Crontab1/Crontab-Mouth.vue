<template>
  <el-form size="small">
    <el-form-item>
      <el-radio v-model="radioValue" :label="1"> 月，允许的通配符[, - * /] </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="2">
        周期从
        <el-input-number v-model="cycle01" :min="1" :max="12" /> -
        <el-input-number v-model="cycle02" :min="1" :max="12" /> 月
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        从
        <el-input-number v-model="average01" :min="1" :max="12" /> 月开始，每
        <el-input-number v-model="average02" :min="1" :max="12" /> 月月执行一次
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
          <el-option v-for="item in 12" :key="item" :value="item">{{ item }}</el-option>
        </el-select>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
import { defineComponent, ref, watch, computed } from 'vue'

export default defineComponent({
  name: 'CrontabMouth',
  // eslint-disable-next-line vue/require-prop-types
  props: ['check', 'cron'],
  setup(props, { emit }) {
    const radioValue = ref(1)
    const cycle01 = ref(1)
    const cycle02 = ref(2)
    const average01 = ref(1)
    const average02 = ref(1)
    const checkboxList = ref([])
    const checkNum = ref(props.check)

    const cycleTotal = computed(() => {
      const start = checkNum.value(cycle01.value, 1, 12)
      const end = checkNum.value(cycle02.value, 1, 12)
      return `${start}-${end}`
    })

    const averageTotal = computed(() => {
      const start = checkNum.value(average01.value, 1, 12)
      const end = checkNum.value(average02.value, 1, 12)
      return `${start}/${end}`
    })

    // 计算勾选的checkbox值合集
    const checkboxString = computed(() => {
      let str = checkboxList.value.join()
      return str == '' ? '*' : str
    })

    watch(radioValue, radioChange)
    watch([cycle01, cycle02], cycleChange)
    watch([average01, average02], averageChange)
    watch(checkboxList, checkboxChange)

    function radioChange() {
      if (radioValue.value === 1) {
        emit('update', 'mouth', '*')
        emit('update', 'year', '*')
      } else {
        if (props.cron.day === '*') {
          emit('update', 'day', '0', 'mouth')
        }
        if (props.cron.hour === '*') {
          emit('update', 'hour', '0', 'mouth')
        }
        if (props.cron.min === '*') {
          emit('update', 'min', '0', 'mouth')
        }
        if (props.cron.second === '*') {
          emit('update', 'second', '0', 'mouth')
        }
      }
      switch (radioValue.value) {
        case 2:
          emit('update', 'mouth', `${cycle01.value}-${cycle02.value}`)
          break
        case 3:
          emit('update', 'mouth', `${average01.value}/${average02.value}`)
          break
        case 4:
          emit('update', 'mouth', checkboxString.value)
          break
      }
    }

    function cycleChange() {
      if (radioValue.value == '2') {
        emit('update', 'mouth', `${cycle01.value}-${cycle02.value}`)
      }
    }

    function averageChange() {
      if (radioValue.value == '3') {
        emit('update', 'mouth', `${average01.value}/${average02.value}`)
      }
    }

    function checkboxChange() {
      if (radioValue.value == '4') {
        emit('update', 'mouth', checkboxString.value)
      }
    }

    function checkNumber(value, minLimit, maxLimit) {
      value = Math.floor(value)
      if (value < minLimit) {
        value = minLimit
      } else if (value > maxLimit) {
        value = maxLimit
      }
      return value
    }

    return {
      radioValue,
      cycle01,
      cycle02,
      average01,
      average02,
      checkboxList,
      checkNum,
      checkNumber
    }
  }
})
</script>
