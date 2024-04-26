<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch, ref, unref, nextTick, defineModel, markRaw } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import Addmaterial from '@/components/add/material.vue'
import { ElTag } from 'element-plus'
const { required } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => null
  }
})

const roomList = [
  {
    label: '消息',
    value: 'Room'
  },
  {
    label: '群公告',
    value: 'RoomNotice'
  }
]

const contact = [
  {
    label: '消息',
    value: 'Contact'
  }
]

const formSchema = ref<FormSchema[]>([
  {
    field: 'name',
    label: '发送目标',
    component: 'Input',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: (data: any) => {
          return (
            <>
              {(data.groups || []).map((it) => {
                return <ElTag type="primary">{it.name}</ElTag>
              })}
            </>
          )
        }
      }
    }
  },
  {
    field: 'target',
    label: '群发类型',
    component: 'RadioGroup',
    colProps: {
      span: 24
    },
    componentProps: {
      options: props.currentRow.type == 'contact' ? contact : roomList
    }
  },
  {
    field: 'groups',
    label: '群发类型',
    hidden: true
  },
  {
    field: 'messages',
    label: '发送素材',
    colProps: {
      span: 24
    },
    value: [],
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <Addmaterial vModel={formData.messages} />
            </div>
          )
        }
      }
    }
  }
])

const rules = reactive({
  messages: [required()]
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
  <div>
    <p></p>
    <p>1、多个消息发送时间会相差1s左右，防止频率过快。 </p>
    <p>2、只有群组类型才支持批量发送群公告(群公告只支持文字，且机器人必须是管理员或者群主) </p>

    <p>3、消息发送成功并不代表实际成功，以微信收到消息为准，失败时，请查看客户端日志 </p>

    <Form
      :rules="rules"
      :auto-set-placeholder="false"
      @register="formRegister"
      :schema="formSchema"
    />
  </div>
</template>
<style lang="less"></style>
