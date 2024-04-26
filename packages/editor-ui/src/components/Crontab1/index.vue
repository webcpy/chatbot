<template>
  <div class="w-full">
    <el-tabs type="border-card">
      <el-tab-pane label="秒" v-if="shouldHide('second')">
        <CrontabSecond @update="updateContabValue" :check="checkNumber" ref="cronsecond" />
      </el-tab-pane>

      <el-tab-pane label="分钟" v-if="shouldHide('min')">
        <CrontabMin
          @update="updateContabValue"
          :check="checkNumber"
          :cron="contabValueObj"
          ref="cronmin"
        />
      </el-tab-pane>

      <el-tab-pane label="小时" v-if="shouldHide('hour')">
        <CrontabHour
          @update="updateContabValue"
          :check="checkNumber"
          :cron="contabValueObj"
          ref="cronhour"
        />
      </el-tab-pane>

      <el-tab-pane label="日" v-if="shouldHide('day')">
        <CrontabDay
          @update="updateContabValue"
          :check="checkNumber"
          :cron="contabValueObj"
          ref="cronday"
        />
      </el-tab-pane>

      <el-tab-pane label="月" v-if="shouldHide('mouth')">
        <CrontabMouth
          @update="updateContabValue"
          :check="checkNumber"
          :cron="contabValueObj"
          ref="cronmouth"
        />
      </el-tab-pane>

      <el-tab-pane label="周" v-if="shouldHide('week')">
        <CrontabWeek
          @update="updateContabValue"
          :check="checkNumber"
          :cron="contabValueObj"
          ref="cronweek"
        />
      </el-tab-pane>

      <el-tab-pane label="年" v-if="shouldHide('year')">
        <CrontabYear
          @update="updateContabValue"
          :check="checkNumber"
          :cron="contabValueObj"
          ref="cronyear"
        />
      </el-tab-pane>
    </el-tabs>

    <div class="popup-main">
      <div class="popup-result">
        <p class="title">时间表达式</p>
        <table>
          <thead>
            <th v-for="item of tabTitles" width="40" :key="item">{{ item }}</th>
            <th>crontab完整表达式</th>
          </thead>
          <tbody>
            <td>
              <span>{{ contabValueObj.second }}</span>
            </td>
            <td>
              <span>{{ contabValueObj.min }}</span>
            </td>
            <td>
              <span>{{ contabValueObj.hour }}</span>
            </td>
            <td>
              <span>{{ contabValueObj.day }}</span>
            </td>
            <td>
              <span>{{ contabValueObj.mouth }}</span>
            </td>
            <td>
              <span>{{ contabValueObj.week }}</span>
            </td>
            <td>
              <span>{{ contabValueObj.year }}</span>
            </td>
            <td>
              <span>{{ contabValueString }}</span>
            </td>
          </tbody>
        </table>
      </div>
      <CrontabResult v-if="contabValueString" :ex="contabValueString" />

      <div class="pop_btn">
        <el-button type="primary" @click="submitFill">确定</el-button>
        <el-button type="warning" @click="clearCron">重置</el-button>
        <el-button @click="hidePopup">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch, computed, onMounted } from 'vue'
import CrontabSecond from './Crontab-Second.vue'
import CrontabMin from './Crontab-Min.vue'
import CrontabHour from './Crontab-Hour.vue'
import CrontabDay from './Crontab-Day.vue'
import CrontabMouth from './Crontab-Mouth.vue'
import CrontabWeek from './Crontab-Week.vue'
import CrontabYear from './Crontab-Year.vue'
import CrontabResult from './Crontab-Result.vue'

export default defineComponent({
  name: 'Vcrontab',
  components: {
    CrontabSecond,
    CrontabMin,
    CrontabHour,
    CrontabDay,
    CrontabMouth,
    CrontabWeek,
    CrontabYear,
    CrontabResult
  },
  props: {
    expression: {
      type: String,
      default: ''
    },
    hideComponent: {
      type: Array,
      default: () => ['second', 'min', 'hour', 'day', 'mouth', 'week', 'year']
    }
  },
  setup(props, { emit }) {
    const tabTitles = ref(['秒', '分钟', '小时', '日', '月', '周', '年'])
    const tabActive = ref(0)
    const myindex = ref(0)
    const contabValueObj = ref({
      second: '*',
      min: '*',
      hour: '*',
      day: '*',
      mouth: '*',
      week: '?',
      year: ''
    })

    const cronsecond = ref(null)
    const cronmin = ref(null)
    const cronhour = ref(null)
    const cronday = ref(null)
    const cronmouth = ref(null)
    const cronweek = ref(null)
    const cronyear = ref(null)

    const contabValueString = computed(() => {
      const obj = contabValueObj.value
      return `${obj.second} ${obj.min} ${obj.hour} ${obj.day} ${obj.mouth} ${obj.week}${obj.year ? ' ' + obj.year : ''}`
    })

    watch(props.expression, resolveExp)
    watch(props.hideComponent, (value) => {
      // 隐藏部分组件
    })

    onMounted(resolveExp)

    function shouldHide(key) {
      return props.hideComponent && props.hideComponent.includes(key)
    }

    function resolveExp() {
      if (props.expression) {
        const arr = props.expression.split(' ')
        if (arr.length >= 6) {
          const obj = {
            second: arr[0],
            min: arr[1],
            hour: arr[2],
            day: arr[3],
            mouth: arr[4],
            week: arr[5],
            year: arr[6] || ''
          }
          contabValueObj.value = { ...obj }
          for (const i in obj) {
            if (obj[i]) changeRadio(i, obj[i])
          }
        }
      } else {
        clearCron()
      }
    }

    function tabCheck(index) {
      tabActive.value = index
    }

    function updateContabValue(name, value, from) {
      contabValueObj.value[name] = value
      if (from && from !== name) {
        changeRadio(name, value)
      }
    }

    function getRef(val) {
      // cronsecond,
      // cronmin,
      // cronhour,
      // cronday,
      // cronmouth,
      // cronweek,
      // cronyear,
      if (val == 'cronsecond') {
        return cronsecond
      } else if (val == 'cronmin') {
        return cronmin
      } else if (val == 'cronhour') {
        return cronhour
      } else if (val == 'cronday') {
        return cronday
      } else if (val == 'cronmouth') {
        return cronmouth
      } else if (val == 'cronweek') {
        return cronweek
      } else {
        return cronyear
      }
    }

    function changeRadio(name, value) {
      console.log(name, value)
      // implementation...
      let arr = ['second', 'min', 'hour', 'mouth'],
        refName = 'cron' + name,
        insVlaue
      console.log(refName)

      const getRefValue = getRef(refName).value
      console.log(getRefValue)
      if (!refName) return
      if (arr.includes(name)) {
        if (value === '*') {
          insVlaue = 1
        } else if (value.indexOf('-') > -1) {
          let indexArr = value.split('-')
          isNaN(indexArr[0]) ? (getRefValue.cycle01 = 0) : (getRefValue.cycle01 = indexArr[0])
          getRefValue.cycle02 = indexArr[1]
          insVlaue = 2
        } else if (value.indexOf('/') > -1) {
          let indexArr = value.split('/')
          isNaN(indexArr[0]) ? (getRefValue.average01 = 0) : (getRefValue.average01 = indexArr[0])
          getRefValue.average02 = indexArr[1]
          insVlaue = 3
        } else {
          insVlaue = 4
          getRefValue.checkboxList = value.split(',')
        }
      } else if (name == 'day') {
        if (value === '*') {
          insVlaue = 1
        } else if (value == '?') {
          insVlaue = 2
        } else if (value.indexOf('-') > -1) {
          let indexArr = value.split('-')
          isNaN(indexArr[0]) ? (getRefValue.cycle01 = 0) : (getRefValue.cycle01 = indexArr[0])
          getRefValue.cycle02 = indexArr[1]
          insVlaue = 3
        } else if (value.indexOf('/') > -1) {
          let indexArr = value.split('/')
          isNaN(indexArr[0]) ? (getRefValue.average01 = 0) : (getRefValue.average01 = indexArr[0])
          getRefValue.average02 = indexArr[1]
          insVlaue = 4
        } else if (value.indexOf('W') > -1) {
          let indexArr = value.split('W')
          isNaN(indexArr[0]) ? (getRefValue.workday = 0) : (getRefValue.workday = indexArr[0])
          insVlaue = 5
        } else if (value === 'L') {
          insVlaue = 6
        } else {
          getRefValue.checkboxList = value.split(',')
          insVlaue = 7
        }
      } else if (name == 'week') {
        if (value === '*') {
          insVlaue = 1
        } else if (value == '?') {
          insVlaue = 2
        } else if (value.indexOf('-') > -1) {
          let indexArr = value.split('-')
          isNaN(indexArr[0]) ? (getRefValue.cycle01 = 0) : (getRefValue.cycle01 = indexArr[0])
          getRefValue.cycle02 = indexArr[1]
          insVlaue = 3
        } else if (value.indexOf('#') > -1) {
          let indexArr = value.split('#')
          isNaN(indexArr[0]) ? (getRefValue.average01 = 1) : (getRefValue.average01 = indexArr[0])
          getRefValue.average02 = indexArr[1]
          insVlaue = 4
        } else if (value.indexOf('L') > -1) {
          let indexArr = value.split('L')
          isNaN(indexArr[0]) ? (getRefValue.weekday = 1) : (getRefValue.weekday = indexArr[0])
          insVlaue = 5
        } else {
          getRefValue.checkboxList = value.split(',')
          insVlaue = 7
        }
      } else if (name == 'year') {
        if (value == '') {
          insVlaue = 1
        } else if (value == '*') {
          insVlaue = 2
        } else if (value.indexOf('-') > -1) {
          insVlaue = 3
        } else if (value.indexOf('/') > -1) {
          insVlaue = 4
        } else {
          getRefValue.checkboxList = value.split(',')
          insVlaue = 5
        }
      }
      getRefValue.radioValue = insVlaue
    }

    function checkNumber(value, minLimit, maxLimit) {
      // implementation...
      value = Math.floor(value)
      if (value < minLimit) {
        value = minLimit
      } else if (value > maxLimit) {
        value = maxLimit
      }
      return value
    }

    function hidePopup() {
      emit('hide')
    }

    function submitFill() {
      emit('fill', contabValueString.value)
      hidePopup()
    }

    function clearCron() {
      contabValueObj.value = {
        second: '*',
        min: '*',
        hour: '*',
        day: '*',
        mouth: '*',
        week: '?',
        year: ''
      }
      for (const j in contabValueObj.value) {
        changeRadio(j, contabValueObj.value[j])
      }
    }

    return {
      cronsecond,
      cronmin,
      cronhour,
      cronday,
      cronmouth,
      cronweek,
      cronyear,
      tabTitles,
      tabActive,
      myindex,
      contabValueObj,
      contabValueString,
      shouldHide,
      resolveExp,
      tabCheck,
      updateContabValue,
      checkNumber,
      hidePopup,
      submitFill,
      clearCron
    }
  }
})
</script>
<style lang="less" scoped>
:deep(.el-form-item--default) {
  margin-bottom: 16px !important;
}
.pop_btn {
  text-align: center;
  margin-top: 20px;
}
.popup-main {
  position: relative;
  margin: 10px auto;
  background: #fff;
  border-radius: 5px;
  font-size: 12px;
  overflow: hidden;
}
.popup-title {
  overflow: hidden;
  line-height: 34px;
  padding-top: 6px;
  background: #f2f2f2;
}
.popup-result {
  box-sizing: border-box;
  line-height: 24px;
  margin: 25px auto;
  padding: 15px 10px 10px;
  border: 1px solid #ccc;
  position: relative;
}
.popup-result .title {
  position: absolute;
  top: -28px;
  left: 50%;
  width: 140px;
  font-size: 14px;
  margin-left: -70px;
  text-align: center;
  line-height: 30px;
  background: #fff;
}
.popup-result table {
  text-align: center;
  width: 100%;
  margin: 0 auto;
}
.popup-result table span {
  display: block;
  width: 100%;
  font-family: arial;
  line-height: 30px;
  height: 30px;
  white-space: nowrap;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}
.popup-result-scroll {
  font-size: 12px;
  line-height: 24px;
  height: 10em;
  overflow-y: auto;
}
</style>
