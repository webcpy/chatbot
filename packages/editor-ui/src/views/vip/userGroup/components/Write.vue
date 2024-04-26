<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch, ref, unref, nextTick, defineModel, markRaw } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import Friend from '@/components/add/selectFriend.vue'
import Room from '@/components/add/selectRoom.vue'

const { required } = useValidator()

const loadingInstance = ref<any>(null)

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
    field: 'name',
    label: '分组名',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'tags',
    label: '标签',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'type',
    label: '分类',
    component: 'Select',
    value: 'contact',
    colProps: {
      span: 24
    },
    componentProps: {
      clearable: false,
      on: {
        change: (val: any) => {
          change(val)
        }
      },
      options: [
        {
          value: 'contact',
          label: '好友'
        },
        {
          value: 'room',
          label: '群组'
        }
      ]
    }
  },
  {
    field: 'roomList',
    label: '群名',
    colProps: {
      span: 24
    },
    value: [],
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%]">
              <Room multiple={true} vModel={formData.roomList} />
            </div>
          )
        }
      }
    },
    hidden: true
  },
  {
    field: 'friendList',
    label: '好友名称',
    colProps: {
      span: 24
    },
    value: [],
    hidden: false,
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <Friend multiple={true} vModel={formData.friendList} />
            </div>
          )
        }
      }
    }
  },
  {
    field: 'desc',
    label: '备注',
    component: 'Input',
    colProps: {
      span: 24
    }
  }
])

const rules = reactive({
  description: [required()],
  name: [required()],
  thumbUrl: [required()],
  title: [required()],
  type: [required()],
  url: [required()]
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
