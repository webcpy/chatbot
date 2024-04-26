<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch, ref, unref, nextTick, defineModel, markRaw } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import AddParams from '@/components/add/addParams.vue'
import dayjs from 'dayjs'
import { ElRow, ElCol } from 'element-plus'

const { required, isUrl } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => null
  }
})

const formSchema = ref<any[]>([
  {
    field: 'label',
    label: '标签',
    component: 'Input',
    value: '',
    colProps: {
      span: 24
    },
    componentProps: {
      clearable: false
    }
  },
  {
    field: 'customUrl',
    label: '回调地址',
    component: 'Input',
    value: '',
    colProps: {
      span: 24
    }
  },
  {
    label: 'Method:',
    field: 'methods',
    colProps: {
      span: 24
    },
    component: 'RadioGroup',
    value: 'GET',
    componentProps: {
      rules: [required()],
      options: [
        {
          value: 'GET',
          label: 'GET'
        },
        {
          value: 'POST',
          label: 'POST'
        }
      ]
    }
  },
  {
    field: 'moreData',
    label: '自定义参数',
    value: [
      {
        key: '',
        value: ''
      }
    ],
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: (formData) => {
          return <AddParams vModel={formData.moreData} />
        }
      }
    },
    componentProps: {
      min: 0
    }
  },
  {
    label: '输入参数:',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-full">
              <ElRow>
                <ElCol span={8}>参数</ElCol>
                <ElCol span={8}>名称</ElCol>
                <ElCol span={8}>例子</ElCol>
              </ElRow>
              <ElRow>
                <ElCol span={8}>uid</ElCol>
                <ElCol span={8}>用户ID</ElCol>
                <ElCol span={8}>用来描述用户身份信息唯一ID</ElCol>
              </ElRow>
              <ElRow>
                <ElCol span={8}>uname</ElCol>
                <ElCol span={8}>用户昵称</ElCol>
                <ElCol span={8}>发消息的用户昵称</ElCol>
              </ElRow>
              <ElRow>
                <ElCol span={8}>roomId</ElCol>
                <ElCol span={8}>群id</ElCol>
                <ElCol span={8}>发消息的群id</ElCol>
              </ElRow>
              <ElRow>
                <ElCol span={8}>roomName</ElCol>
                <ElCol span={8}>群名</ElCol>
                <ElCol span={8}>发消息的群名</ElCol>
              </ElRow>
              <ElRow>
                <ElCol span={8}>word</ElCol>
                <ElCol span={8}>用户的问题</ElCol>
                <ElCol span={8}>用户的提问，比如 在吗？</ElCol>
              </ElRow>
              <ElRow>
                <ElCol span={8}>自定义参数属性</ElCol>
                <ElCol span={8}>上面自定义的参数</ElCol>
                <ElCol span={8}>自定义参数的值</ElCol>
              </ElRow>
            </div>
          )
        }
      }
    }
  },
  {
    label: '输出参数:',
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <p class="m-0">
              请按
              <a
                class="text-red-600"
                href="https://wechat.aibotk.com/docs/callback#%E8%BF%94%E5%9B%9E%E6%95%B0%E6%8D%AE%E8%AF%B4%E6%98%8E"
                target="_blank"
              >
                文档中的数据结构
              </a>
              原样返回,否则将无法正常渲染
            </p>
          )
        }
      }
    },
    colProps: {
      span: 24
    }
  }
])

const friendRule = {
  validator: (_, val, callback) => {
    getFormData().then((_res: any) => {
      const { alias, friendName, type } = _res
      if (!alias && !friendName && type != 'room') {
        callback(new Error('好友名称和好友备注至少选择一个'))
      } else {
        callback()
      }
    })
  }
}
const rules = reactive({
  customUrl: [required(), isUrl()],
  tags: [required()]
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose, setSchema } = formMethods
const submit = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err: any) => {
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
  <Form
    :rules="rules"
    :auto-set-placeholder="false"
    @register="formRegister"
    :schema="formSchema"
  />
</template>
<style lang="less"></style>
