<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch, ref, unref, nextTick, defineModel, markRaw } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import Upload from '@/components/Upload/index.vue'
import ToolLabel from '@/components/ToolLabel/index.vue'

const { required } = useValidator()

const loadingInstance = ref<any>(null)

const props = defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => null
  }
})

const treeRef = ref<typeof ElTree>()

const model = ref({
  name: 123
})
const toolLabel = (lable, tooltip = '') => {
  return () => {
    return (
      <>
        <ToolLabel label={lable} tooltip={tooltip}></ToolLabel>
      </>
    )
  }
}
const formSchema = ref<FormSchema[]>([
  {
    field: 'name',
    label: '素材别名',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'tag',
    label: '素材标签',
    component: 'Input',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        label: toolLabel('素材标签', '方便素材分类')
      }
    }
  },
  {
    field: 'type',
    label: '素材类型',
    component: 'RadioGroup',
    value: 5,
    colProps: {
      span: 24
    },
    componentProps: {
      disabled: true,
      options: [
        {
          label: '文字',
          value: 1
        },
        {
          label: '文件',
          value: 2
        },
        {
          label: 'h5链接',
          value: 4
        },
        {
          label: '小程序',
          value: 5
        }
      ]
    }
  },
  {
    field: 'appid',
    label: 'appid',
    component: 'Input',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        label: toolLabel('appid', '把小程序发给小助手后可以得到解析的数据，appid')
      }
    }
  },
  {
    field: 'username',
    label: 'username',
    component: 'Input',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        label: toolLabel('username', '把小程序发给小助手后可以得到解析的数据，类似gh_cc962a747b3c')
      }
    }
  },
  {
    field: 'title',
    label: '标题',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'description',
    label: '描述',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'pagePath',
    label: '分享路径',
    component: 'Input',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        label: toolLabel('pagePath', '把小程序发给小助手后可以得到解析的数据，pagePath')
      }
    }
  },
  {
    field: 'thumbUrl',
    label: '缩略图',
    asyncComponent: markRaw(Upload),
    colProps: {
      span: 24
    },
    value: '',
    formItemProps: {
      slots: {
        label: toolLabel('缩略图', '推荐在 200K 以内，比例 5：4，宽度不大于 1080px')
      }
    }
  },
  {
    field: 'iconUrl',
    label: '小程序logo',
    component: 'Input',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        label: toolLabel('小程序logo', '把小程序发给小助手后可以得到解析的数据，iconUrl，非必填')
      }
    }
  }
])

const rules = reactive({
  description: [required()],
  name: [required()],
  thumbUrl: [required()],
  title: [required()],
  type: [required()],
  url: [required()],
  appid: [required()],
  username: [required()],
  pagePath: [required()]
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
