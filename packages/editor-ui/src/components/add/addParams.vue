<template>
  <div class="w-full">
    <div
      v-for="(it, index) in model"
      :key="index"
      class="flex params-box justify-center items-center"
    >
      <ElInput v-model="it.key" style="width: 44%; margin-right: 6%" placeholder="参数名" />
      <ElInput v-model="it.value" style="width: 44%" placeholder="参数值" />
      <div class="params-index">{{ index + 1 }}</div>
      <div class="params-edit flex justify-center items-center">
        <Icon
          v-if="index + 1 == model.length"
          :size="20"
          @click="add"
          icon="tdesign:add"
          class="cursor-pointer"
          hover-color="var(--el-color-primary)"
        />
        <Icon
          v-if="index + 1 != model.length"
          :size="20"
          @click="remove(index)"
          icon="tdesign:remove"
          class="cursor-pointer"
          hover-color="var(--el-color-primary)"
        />
        <Icon
          :size="20"
          @click="down(index)"
          icon="tdesign:chevron-down"
          class="cursor-pointer"
          hover-color="var(--el-color-primary)"
        />
        <Icon
          :size="20"
          v-if="index != 0"
          @click="up(index)"
          icon="tdesign:chevron-up"
          class="cursor-pointer"
          hover-color="var(--el-color-primary)"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, unref, defineEmits, nextTick, defineModel, useAttrs } from 'vue'
import { ElSelect, ElOption, ElInput, ListItem } from 'element-plus'
import { Icon } from '@/components/Icon'
const props = defineProps({
  formModel: {
    type: Object,
    default: () => ({})
  }
})

const remove = (index) => {
  model.value.splice(model.value.indexOf(index), 1)
}

const add = () => {
  model.value = [
    ...model.value,
    {
      value: '',
      key: ''
    }
  ]
}

const up = (index) => {
  const temp = model.value[index]
  model.value.splice(index, 1)
  model.value.splice(index - 1, 0, temp)
}

const down = (index) => {
  const temp = model.value[index]
  model.value.splice(index, 1)
  model.value.splice(index + 1, 0, temp)
}

// eslint-disable-next-line vue/require-prop-types
let model: any = defineModel()
</script>
<style lang="less">
.params-box {
  border: 1px dotted #666;
  padding: 40px 0;
  border-radius: 5px;
  position: relative;
  margin-bottom: 26px;
  .params-index {
    position: absolute;
    left: 4%;
    background-color: #eee;
    width: 30px;
    height: 30px;
    text-align: center;
    font-size: 16px;
    bottom: -14px;
    border-radius: 50%;
  }
  .params-edit {
    position: absolute;
    bottom: -14px;
    right: 4%;
    background: #fff;
    border: 1px solid #666;
    padding: 6px 10px;
    border-radius: 15px;
  }
}
</style>
