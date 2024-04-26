<template>
  <div class="w-full">
    <div
      v-for="(it, index) in model"
      :key="index"
      class="flex params-box justify-center items-center"
    >
      <ElInput
        v-model="it.keyword"
        style="width: 44%; margin-right: 6%"
        placeholder="通常设置为/开头，例如：/小红书"
      />
      <ElSelectV2
        v-if="!initLoading"
        v-model="it.promotId"
        style="width: 44%"
        filterable
        :props="prop"
        placeholder="预设角色"
        v-bind:="$attrs"
        value-key="id"
        :options="options"
      />
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
import { ref, defineModel } from 'vue'
import { ElSelectV2, ElInput } from 'element-plus'
import { Icon } from '@/components/Icon'
import { getAiBotPromot } from '@/api/aibot/index'
const props = defineProps({
  formModel: {
    type: Object,
    default: () => ({})
  }
})

const prop = {
  label: 'tag'
}
const options = ref<any[]>([])

const initLoading = ref(false)

// eslint-disable-next-line vue/require-prop-types
let model: any = defineModel()

const remove = (index: any) => {
  model.value.splice(model.value.indexOf(index), 1)
}

const add = () => {
  model.value = [
    ...model.value,
    {
      promotId: '',
      keyword: ''
    }
  ]
}

const up = (index: number) => {
  const temp = model.value[index]
  model.value.splice(index, 1)
  model.value.splice(index - 1, 0, temp)
}

const down = (index: number) => {
  const temp = model.value[index]
  model.value.splice(index, 1)
  model.value.splice(index + 1, 0, temp)
}

const querySearchAsync = () => {
  initLoading.value = true
  console.log(1, 2, options.value)
  getAiBotPromot({})
    .then((res: { list: any }) => {
      const data = (res.list || []).map((it: any) => {
        return {
          tag: it.tag,
          value: {
            id: it.id,
            tag: it.tag
          }
        }
      })
      options.value = data
      initLoading.value = false
    })
    .catch((_error: any) => {
      initLoading.value = false
      options.value = []
    })
}
querySearchAsync()
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
