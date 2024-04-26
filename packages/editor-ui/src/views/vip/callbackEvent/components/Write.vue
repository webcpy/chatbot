<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch } from 'vue'
import { TableData } from '@/api/table/types'
import { useValidator } from '@/hooks/web/useValidator'
import AddMessage from '@/components/add/message.vue'
import CustomUrlApi from '@/components/add/customUrlApi.vue'

const { required, isUrl } = useValidator()

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
    field: 'type',
    value: 100,
    hidden: true
  },
  {
    field: 'keywords',
    label: '触发关键词',
    component: 'Input',
    value: [],
    colProps: {
      span: 16,
      push: 4
    },
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <AddMessage vModel={formData.keywords} />
            </div>
          )
        }
      }
    }
  },
  {
    field: 'reg',
    label: '匹配方式',
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
  },
  {
    field: 'timeout',
    label: '请求超时时间(秒)',
    component: 'InputNumber',
    value: 10,
    componentProps: {
      min: 0
    },
    colProps: {
      span: 16,
      push: 4
    }
  },
  {
    field: 'api',
    label: '回调地址',
    component: 'Input',
    value: '',
    colProps: {
      span: 16,
      push: 4
    },
    formItemProps: {
      slots: {
        default: (data) => {
          return <CustomUrlApi vModel={data.api}></CustomUrlApi>
        }
      }
    }
  }
  // {
  //   field: 'customUrl',
  //   label: '回调地址',
  //   component: 'Input',
  //   value: '',
  //   componentProps: {
  //     min: 0
  //   },
  //   colProps: {
  //     span: 16,
  //     push: 4
  //   }
  // },
  // {
  //   field: 'moreData',
  //   label: '自定义参数',
  //   value: [
  //     {
  //       key: '',
  //       value: ''
  //     }
  //   ],
  //   formItemProps: {
  //     slots: {
  //       default: (formData) => {
  //         return <AddParams vModel={formData.moreData} />
  //       }
  //     }
  //   },
  //   componentProps: {
  //     min: 0
  //   },
  //   colProps: {
  //     span: 16,
  //     push: 4
  //   }
  // },
  // {
  //   label: 'Method:',
  //   formItemProps: {
  //     rules: [required()],
  //     slots: {
  //       default: (formData) => {
  //         return <div>POST</div>
  //       }
  //     }
  //   },
  //   colProps: {
  //     span: 16,
  //     push: 4
  //   }
  // },
  // {
  //   label: 'Method:',
  //   formItemProps: {
  //     rules: [required()],
  //     slots: {
  //       default: (formData) => {
  //         return <Crontab></Crontab>
  //       }
  //     }
  //   },
  //   colProps: {
  //     span: 16,
  //     push: 4
  //   }
  // },
  // {
  //   label: '输入参数:',
  //   formItemProps: {
  //     slots: {
  //       default: (formData) => {
  //         return (
  //           <div class="w-full">
  //             <ElRow>
  //               <ElCol span={8}>参数</ElCol>
  //               <ElCol span={8}>名称</ElCol>
  //               <ElCol span={8}>例子</ElCol>
  //             </ElRow>
  //             <ElRow>
  //               <ElCol span={8}>uid</ElCol>
  //               <ElCol span={8}>用户ID</ElCol>
  //               <ElCol span={8}>用来描述用户身份信息唯一ID</ElCol>
  //             </ElRow>
  //             <ElRow>
  //               <ElCol span={8}>uname</ElCol>
  //               <ElCol span={8}>用户昵称</ElCol>
  //               <ElCol span={8}>发消息的用户昵称</ElCol>
  //             </ElRow>
  //             <ElRow>
  //               <ElCol span={8}>roomId</ElCol>
  //               <ElCol span={8}>群id</ElCol>
  //               <ElCol span={8}>发消息的群id</ElCol>
  //             </ElRow>
  //             <ElRow>
  //               <ElCol span={8}>roomName</ElCol>
  //               <ElCol span={8}>群名</ElCol>
  //               <ElCol span={8}>发消息的群名</ElCol>
  //             </ElRow>
  //             <ElRow>
  //               <ElCol span={8}>word</ElCol>
  //               <ElCol span={8}>用户的问题</ElCol>
  //               <ElCol span={8}>用户的提问，比如 在吗？</ElCol>
  //             </ElRow>
  //             <ElRow>
  //               <ElCol span={8}>自定义参数属性</ElCol>
  //               <ElCol span={8}>上面自定义的参数</ElCol>
  //               <ElCol span={8}>自定义参数的值</ElCol>
  //             </ElRow>
  //           </div>
  //         )
  //       }
  //     }
  //   },
  //   colProps: {
  //     span: 16,
  //     push: 4
  //   }
  // },
  // {
  //   label: '输出参数:',
  //   formItemProps: {
  //     slots: {
  //       default: (formData) => {
  //         return (
  //           <p class="m-0">
  //             请按
  //             <a
  //               class="text-red-600"
  //               href="https://wechat.aibotk.com/docs/callback#%E8%BF%94%E5%9B%9E%E6%95%B0%E6%8D%AE%E8%AF%B4%E6%98%8E"
  //               target="_blank"
  //             >
  //               文档中的数据结构
  //             </a>
  //             原样返回,否则将无法正常渲染
  //           </p>
  //         )
  //       }
  //     }
  //   },
  //   colProps: {
  //     span: 16,
  //     push: 4
  //   }
  // }

  //   {
  //     field: 'header',
  //     label: 'Header',
  //     component: 'Input',
  //     value: `{

  // }`,
  //     componentProps: {
  //       min: 0
  //     },
  //     formItemProps: {
  //       rules: [required()],
  //       slots: {
  //         default: (formData) => {
  //           return (
  //             <div class="w-[100%] flex">
  //               <JsonEditor class="w-full" vModel={formData.header} />
  //             </div>
  //           )
  //         }
  //       }
  //     },
  //     colProps: {
  //       span: 16,
  //       push: 4
  //     }
  //   },
  //   {
  //     field: 'header',
  //     label: '自定义参数',
  //     component: 'Input',
  //     value: `{

  // }`,
  //     componentProps: {
  //       min: 0
  //     },
  //     formItemProps: {
  //       rules: [required()],
  //       slots: {
  //         default: (formData) => {
  //           return (
  //             <div class="w-[100%] flex">
  //               <JsonEditor class="w-full" vModel={formData.header} />
  //             </div>
  //           )
  //         }
  //       }
  //     },
  //     colProps: {
  //       span: 16,
  //       push: 4
  //     }
  //   }
])

const rules = reactive({
  customUrl: [required(), isUrl()],
  keywords: [required()]
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
