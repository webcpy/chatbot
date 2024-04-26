<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch, ref, unref, nextTick, defineModel, markRaw } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import SelectFriend from '@/components/add/selectFriend.vue'
import SelectRoom from '@/components/add/selectRoom.vue'

const { required } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => null
  }
})

const change = (val: string) => {
  if (val != 'contact') {
    setSchema([
      {
        field: 'roomList',
        path: 'hidden',
        value: false
      },
      {
        field: 'friendList',
        path: 'hidden',
        value: true
      }
    ])
  } else {
    setSchema([
      {
        field: 'roomList',
        path: 'hidden',
        value: true
      },
      {
        field: 'friendList',
        path: 'hidden',
        value: false
      }
    ])
  }
}
const formSchema = ref<FormSchema[]>([
  {
    field: 'names',
    label: '指定用户',
    component: 'Input',
    colProps: {
      span: 24
    },
    value: null,
    formItemProps: {
      slots: {
        default: (data) => {
          return <SelectFriend vModel={data.names} />
        }
      }
    }
  },
  {
    field: 'type',
    label: '转发消息类型',
    component: 'RadioGroup',
    value: 1,
    colProps: {
      span: 24
    },
    componentProps: {
      options: [
        {
          value: 1,
          label: '只转发文字'
        },
        {
          value: 2,
          label: '转发所有消息'
        }
      ]
    }
  },
  {
    field: 'rooms',
    label: '转发到的群',
    value: 'contact',
    colProps: {
      span: 24
    },
    value: [],
    formItemProps: {
      slots: {
        default: (data) => {
          return <SelectRoom multiple={true} vModel={data.rooms} />
        }
      }
    }
  },
  {
    field: 'contacts',
    label: '转发到的好友',
    colProps: {
      span: 24
    },
    value: [],
    formItemProps: {
      slots: {
        default: (data) => {
          return <SelectFriend multiple={true} vModel={data.contacts} />
        }
      }
    }
  }
])

const rules = reactive({
  name: [required()]
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose, setSchema } = formMethods
const submit = async () => {
  console.log(999999)
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
  submit,
  change
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
