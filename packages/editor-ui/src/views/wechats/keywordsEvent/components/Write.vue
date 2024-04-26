<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch } from 'vue'
import { TableData } from '@/api/table/types'
import { useValidator } from '@/hooks/web/useValidator'
import AddMessage from '@/components/add/message.vue'
import Addmaterial from '@/components/add/material.vue'

const { required } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<Nullable<TableData>>,
    default: () => null
  }
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose, setSchema } = formMethods

const schema = reactive<FormSchema[]>([
  {
    field: 'keywords',
    label: '关键词',
    component: 'Input',
    value: [],
    formItemProps: {
      rules: [required()],
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <AddMessage vModel={formData.keywords} />
            </div>
          )
        }
      }
    },
    colProps: {
      span: 16,
      push: 4
    }
  },
  {
    field: 'reg',
    label: '匹配方式',
    formItemProps: {
      rules: [required()]
    },
    colProps: {
      span: 16,
      push: 4
    },
    component: 'RadioGroup',
    value: 1,
    componentProps: {
      options: [
        {
          label: '模糊匹配',
          value: 1
        },
        {
          label: '精确匹配',
          value: 2
        }
      ]
    }
  },
  {
    field: 'scope',
    label: '触发范围',
    component: 'RadioGroup',
    value: 'all',
    colProps: {
      span: 16,
      push: 4
    },
    componentProps: {
      options: [
        {
          label: '群与好友',
          value: 'all'
        },
        {
          label: '群',
          value: 'room'
        },
        {
          label: '好友',
          value: 'friend'
        }
      ]
    },
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'event',
    label: '触发事件',
    component: 'Select',
    colProps: {
      span: 16,
      push: 4
    },
    value: '',
    componentProps: {
      options: [
        {
          label: '土味情话',
          value: 'sweetword'
        },
        {
          label: '分类新闻',
          value: 'news'
        },
        {
          label: '网络取名',
          value: 'cname'
        },
        {
          label: '垃圾分类',
          value: 'rubbish'
        },
        {
          label: '名人名言',
          value: 'mingyan'
        },
        {
          label: '星座运势',
          value: 'star'
        },
        {
          label: '姓氏起源',
          value: 'xing'
        },
        {
          label: '老黄历查询',
          value: 'lunar'
        },
        {
          label: '神回复',
          value: 'goldreply'
        },
        {
          label: '绕口令',
          value: 'rkl'
        },
        {
          label: '顺口溜',
          value: 'skl'
        },
        {
          label: '获取表情包',
          value: 'emo'
        },
        {
          label: '获取美女图',
          value: 'meinv'
        },
        {
          label: '重新同步好友及群信息',
          value: 'reloadFriend'
        },
        {
          label: '更新配置文件',
          value: 'updateConfig'
        }
      ]
    }
  },
  {
    field: 'needAt',
    label: '群中@触发',
    colProps: {
      span: 16,
      push: 4
    },
    component: 'RadioGroup',
    value: 1,
    formItemProps: {
      rules: [required()]
    },
    componentProps: {
      options: [
        {
          label: '是',
          value: 1
        },
        {
          label: '否',
          value: 2
        }
      ]
    }
  }
])

const rules = reactive({
  title: [required()],
  author: [required()],
  importance: [required()],
  pageviews: [required()],
  display_time: [required()],
  content: [required()]
})

const submit = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    const formData = await getFormData()
    return formData
  }
}

watch(
  () => props.currentRow,
  (currentRow) => {
    if (!currentRow) return
    setValues(currentRow)
  },
  {
    deep: true,
    immediate: true
  }
)

defineExpose({
  submit
})
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="schema" />
</template>
