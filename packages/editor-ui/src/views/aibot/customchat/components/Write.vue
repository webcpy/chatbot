<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch, ref, nextTick } from 'vue'
import { TableData } from '@/api/table/types'
import { useValidator } from '@/hooks/web/useValidator'
import AddMessage from '@/components/add/message.vue'
import Friend from '@/components/add/selectFriend.vue'
import Room from '@/components/add/selectRoom.vue'
import { gptModal, botType } from './data'
import ToolLabel from '@/components/ToolLabel/index.vue'
import SelectPromat from './selectPromat.vue'
import AddPromat from './addPromat.vue'

const { required } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<Nullable<TableData>>,
    default: () => null
  }
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose, setSchema } = formMethods
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

const bot = ref(0)
const setBot = async (val) => {
  bot.value = val
  const files = botType[0]
  const hiddenMap = files.map((it) => {
    return {
      field: it,
      path: 'hidden',
      value: true
    }
  })
  setSchema(hiddenMap)

  if (val == 0) {
    return
  }
  if (val == 6 || val == 8 || val == 9) {
    const { chatFilter } = await getFormData()
    // setfilter(!chatFilter)
  }
  const showFiles = botType[val]
  const showMap = showFiles.map((it) => {
    return {
      field: it,
      path: 'hidden',
      value: false
    }
  })
  setSchema(showMap)
}
const setfilter = (val) => {
  const hiddenMap = ['filterSecretKey', 'filterType', 'filterApiKey', 'filterAppid'].map((it) => {
    return {
      field: it,
      path: 'hidden',
      value: val
    }
  })
  setSchema(hiddenMap)
}
const init = ({ filter, robotType, type }: any) => {
  nextTick(() => {
    setBot(robotType)
    change(type)
    setfilter(!filter)
  })
}
const toolLabel = (lable, tooltip = '') => {
  return () => {
    return (
      <>
        <ToolLabel label={lable} tooltip={tooltip}></ToolLabel>
      </>
    )
  }
}
const schema = reactive<FormSchema[]>([
  {
    field: 'openChat',
    label: '开启机器人对话',
    component: 'Switch',
    value: true,
    colProps: {
      span: 4
    }
  },
  {
    field: 'type',
    label: '开启对象',
    component: 'Select',
    value: 'contact',
    colProps: {
      span: 6
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
    value: [],
    colProps: {
      span: 7
    },
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
    value: [],
    colProps: {
      span: 7
    },
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
    field: 'needAt',
    label: '群中@触发',
    component: 'RadioGroup',
    value: 1,
    formItemProps: {
      rules: [required()]
    },
    colProps: {
      span: 6
    },
    componentProps: {
      options: [
        {
          label: '是',
          value: 1
        },
        {
          label: '否',
          value: 0
        }
      ]
    }
  },

  {
    field: 'limitNum',
    label: '限制对话次数',
    component: 'InputNumber',
    value: 1,
    colProps: {
      span: 6
    },
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'keywords',
    label: '触发关键词',
    component: 'Input',
    value: [],
    formItemProps: {
      slots: {
        label: toolLabel('触发关键词', '不填全局开启'),
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
      span: 24
    }
  },
  {
    field: 'defaultReply',
    label: '默认回复',
    component: 'Input',
    value: '',
    colProps: {
      span: 24
    },
    componentProps: {
      type: 'textarea',
      placeholder:
        '关闭机器人对话时触发，通常是为了提示付费开通聊天。例：本群暂未开启chatGPT聊天，请联系群主开通'
    }
  },
  {
    field: 'rechargeTip',
    label: '次数耗尽回复',
    component: 'Input',
    value: '',
    colProps: {
      span: 24
    },
    componentProps: {
      type: 'textarea',
      placeholder: '默认是：聊天次数已用完，请联系管理员充值。可以自行修改'
    }
  },
  {
    field: 'robotType',
    label: '机器人类型',
    component: 'RadioGroup',
    colProps: {
      span: 24
    },
    value: '6',
    componentProps: {
      options: [
        {
          label: 'ChatGpt',
          value: '6'
        },
        {
          label: '国内模型',
          value: '11'
        },
        {
          label: 'Dify',
          value: '8'
        },
        {
          label: 'FastGPT',
          value: '9'
        }
      ],
      on: {
        change(val) {
          setBot(val)
        }
      }
    }
  },
  {
    field: 'filter',
    label: '敏感词过滤',
    component: 'Switch',
    colProps: {
      span: 18
    },
    value: true,
    componentProps: {
      on: {
        change(val) {
          setfilter(!val)
        }
      }
    }
  },
  {
    field: 'filterType',
    label: '百度文本审核',
    component: 'Select',
    hidden: false,
    value: 1,
    componentProps: {
      clearable: false,
      options: [
        {
          label: '百度文本审核',
          value: 1
        }
      ]
    }
  },
  {
    field: 'filterAppid',
    label: '百度文本审核appid',
    component: 'Input',
    hidden: false,
    componentProps: {
      slots: {
        append: () => {
          return <a href="https://cloud.baidu.com/product/textcensoring.html">获取方法</a>
        }
      }
    }
  },
  {
    field: 'filterApiKey',
    label: '百度文本审核apiKey',
    hidden: false,
    component: 'Input'
  },
  {
    field: 'filterSecretKey',
    label: '百度文本审核secretKey',
    hidden: false,
    component: 'Input'
  },
  {
    field: 'timeoutMs',
    label: '超时时间(秒)',
    component: 'InputNumber',
    value: 60
  },
  {
    field: 'promotId',
    label: '默认角色',
    component: 'Input',
    value: null,
    formItemProps: {
      rules: [required()],
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <SelectPromat vModel={formData.promotId} />
            </div>
          )
        }
      }
    }
  },
  {
    field: 'showQuestion',
    label: '显示问题',
    component: 'Switch',
    value: 60,
    colProps: {
      span: 4
    }
  },
  {
    field: 'open4v',
    label: '开启图像识别',
    component: 'Switch',
    value: 60,
    colProps: {
      span: 4
    },
    formItemProps: {
      slots: {
        label: toolLabel('开启图像识别', '请确保你的token有gpt4v权限，否则无法识别')
      }
    }
  },
  {
    field: 'debug',
    label: '调试模式',
    component: 'Switch',
    value: 60,
    colProps: {
      span: 4
    }
  },
  {
    field: 'isAiAgent',
    label: '智能助手',
    component: 'Switch',
    value: 60,
    colProps: {
      span: 4
    },
    hidden: true,
    formItemProps: {
      slots: {
        label: toolLabel(
          '智能助手',
          '确保Dify平台你创建的应用是智能助手，支持Agent工具，否则建议关闭'
        )
      }
    }
  },
  {
    field: 'showDownloadUrl',
    label: '显示图片链接',
    hidden: true,
    component: 'Switch',
    value: 60,
    colProps: {
      span: 4
    },
    formItemProps: {
      slots: {
        label: toolLabel(
          '显示图片链接',
          '如果返回的是图片，文字中携带图片链接地址，同时也会发送图片，根据个人喜好关闭或开启'
        )
      }
    }
  },
  {
    field: 'tts',
    label: '开启语音回复',
    component: 'Switch',
    value: 12,
    colProps: {
      span: 4
    },
    formItemProps: {
      slots: {
        label: toolLabel('开启语音回复', '海螺AI')
      }
    }
  },
  {
    field: 'voice',
    label: '开启语音回复',
    component: 'Input',
    value: '',
    colProps: {
      span: 12
    },
    formItemProps: {
      slots: {
        label: toolLabel('发音人', '海螺AI')
      }
    }
  },
  {
    field: 'model',
    component: 'Select',
    formItemProps: {
      slots: {
        label: toolLabel(
          '选择模型',
          '模型选择与你账号权限有关，设置为gpt-4时，请确保你有gpt-4权限，否则可能无法正常回复。建议默认模型即可'
        )
      }
    },
    value: 'gpt-3.5-turbo',
    componentProps: {
      clearable: false,
      options: gptModal
    }
  },
  {
    field: 'token',
    label: 'api秘钥',
    component: 'Input',
    componentProps: {}
  },
  // {
  //   field: 'proxyPass',
  //   label: '反响代理',
  //   component: 'Input',
  //   formItemProps: {
  //     slots: {
  //       label: toolLabel('反响代理', '代理服务')
  //     }
  //   }
  // },
  {
    field: 'proxyUrl',
    label: '服务地址',
    component: 'Input',
    formItemProps: {
      slots: {
        label: toolLabel('服务地址', '服务器地址')
      }
    }
  },
  {
    field: 'keywordSystemMessages',
    label: '触发关键词',
    component: 'Input',
    value: [
      {
        keyword: '',
        promotId: null
      }
    ],
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <AddPromat vModel={formData.keywordSystemMessages} />
            </div>
          )
        }
      }
    },
    colProps: {
      span: 24
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
  submit,
  init
})
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="schema" />
</template>
