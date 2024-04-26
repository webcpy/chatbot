<template>
  <el-form size="small">
    <el-form-item>
      <el-radio v-model="radioValue" :label="1"> 秒，允许的通配符[, - * /] </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="2">
        周期从
        <el-input-number v-model="cycle01" :min="0" :max="60" /> -
        <el-input-number v-model="cycle02" :min="0" :max="60" /> 秒
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        从
        <el-input-number v-model="average01" :min="0" :max="60" /> 秒开始，每
        <el-input-number v-model="average02" :min="0" :max="60" /> 秒执行一次
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
import { defineComponent, computed, ref, watch } from 'vue'

export default defineComponent({
  name: 'CrontabSecond',
  // props: ['check', 'radioParent'],
  props: {
    check: {
      type: Function,
      default: () => {}
    },
    radioParent: {
      type: Function,
      default: () => {}
    }
  },
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

    const checkboxString = computed(() => {
      let str = checkboxList.value.join()
      return str == '' ? '*' : str
    })

    watch(radioValue, radioChange)
    watch(cycleTotal, cycleChange)
    watch(averageTotal, averageChange)
    watch(checkboxString, checkboxChange)
    watch(
      () => props.radioParent,
      () => {
        radioValue.value = props.radioParent
      }
    )

    function radioChange() {
      switch (radioValue.value) {
        case 1:
          emit('update', 'second', '*', 'second')
          emit('update', 'min', '*', 'second')
          break
        case 2:
          emit('update', 'second', cycleTotal.value)
          break
        case 3:
          emit('update', 'second', averageTotal.value)
          break
        case 4:
          emit('update', 'second', checkboxString.value)
          break
      }
    }

    function cycleChange() {
      if (radioValue.value == '2') {
        emit('update', 'second', cycleTotal.value)
      }
    }

    function averageChange() {
      if (radioValue.value == '3') {
        emit('update', 'second', averageTotal.value)
      }
    }

    function checkboxChange() {
      if (radioValue.value == '4') {
        emit('update', 'second', checkboxString.value)
      }
    }

    function othChange() {
      // 反解析...
      let ins = this.cron.second('反解析 second', ins)
      if (ins === '*') {
        radioValue.value = 1
      } else if (ins.indexOf('-') > -1) {
        radioValue.value = 2
      } else if (ins.indexOf('/') > -1) {
        radioValue.value = 3
      } else {
        radioValue.value = 4
        checkboxList.value = ins.split(',')
      }
    }

    return {
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
      checkboxChange,
      othChange
    }
  }
})
</script>
