<script setup lang="tsx">
import { reactive, ref, watch, onMounted, unref, computed } from 'vue'
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router'
import { useValidator } from '@/hooks/web/useValidator'
import { BaseButton } from '@/components/Button'
import { ContentWrap } from '@/components/ContentWrap'
import ToolLabel from '@/components/ToolLabel/index.vue'
import { gptModal, botType } from './data'
import AddMessage from '@/components/add/message.vue'
import Addmaterial from '@/components/add/material.vue'
import SelectRoom from '@/components/add/selectRoom.vue'
import { updateBaseConfig, saveBaseConfig, detailBaseConfig } from '@/api/wechat/index'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
const { formRegister, formMethods } = useForm()
const { getFormData, getElFormExpose, setValues, setSchema } = formMethods

const { required } = useValidator()

const { currentRoute } = useRouter()

const rules = {
  username: [required()]
}

const mode = ref({})

const toolLabel = (lable, tooltip = '') => {
  return () => {
    return (
      <>
        <ToolLabel label={lable} tooltip={tooltip}></ToolLabel>
      </>
    )
  }
}

const bot = ref(0)
const setAutoReply = async (val) => {
  const { defaultBot } = await getFormData()
  const files = botType[1]
  const hiddenMap = files.map((it) => {
    return {
      field: it,
      path: 'hidden',
      value: !val
    }
  })
  setSchema(hiddenMap)

  if (val) {
    setBot(defaultBot)
  } else {
    setBot(0)
  }
}
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
    setfilter(!chatFilter)
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
  const hiddenMap = ['filterSecretKey', 'filterApiKey', 'filterAppid'].map((it) => {
    return {
      field: it,
      path: 'hidden',
      value: val
    }
  })
  setSchema(hiddenMap)
}
const schema = reactive<FormSchema[]>([
  {
    field: 'autoAcceptFriend',
    label: '自动通过好友',
    component: 'Switch',
    colProps: {
      span: 18,
      offset: 2
    },
    componentProps: {
      on: {
        change(val) {
          setSchema([
            {
              field: 'acceptFriendKeyWords',
              path: 'hidden',
              value: val
            }
          ])
        }
      }
    }
  },
  {
    field: 'acceptFriendKeyWords',
    label: '验证规则',
    value: [],
    formItemProps: {
      slots: {
        label: toolLabel(
          '验证规则',
          '不设置，同意任意好友请求；设置，好友验证信息只需包含关键词即可'
        ),
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <AddMessage vModel={formData.acceptFriendKeyWords} />
            </div>
          )
        }
      }
    },
    colProps: {
      span: 18,
      offset: 2
    }
  },
  {
    field: 'newFriendReplys',
    label: '新加好友自动回复',
    colProps: {
      span: 18,
      offset: 2
    },
    value: [],
    formItemProps: {
      slots: {
        label: toolLabel('新加好友自动回复'),
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <Addmaterial vModel={formData.newFriendReplys} />
            </div>
          )
        }
      }
    }
  },
  {
    field: 'txApiKey',
    component: 'Input',
    colProps: {
      span: 18,
      offset: 2
    },
    value: '',
    formItemProps: {
      slots: {
        label: toolLabel(
          '天行APIKEY',
          '天行apikey必填,需要使用到天行数据的天气接口，机器人接口，以及新闻接口等'
        )
      }
    },
    componentProps: {
      slots: {
        append: (val, formData) => {
          return <a href="https://www.tianapi.com/signup.html?source=ch4553544">申请地址</a>
        }
      }
    }
  },
  {
    field: 'preventLength',
    label: '无效消息长度',
    component: 'InputNumber',
    colProps: {
      span: 18,
      offset: 2
    },
    formItemProps: {
      slots: {
        label: toolLabel('无效消息长度', '当收到过多文字时可以选择不触发消息回复，此处设置字数')
      }
    },
    value: 1000,
    componentProps: {
      'controls-position': 'right',
      min: 10
    }
  },
  {
    field: 'parseMini',
    component: 'Switch',
    colProps: {
      span: 18,
      offset: 2
    },
    formItemProps: {
      slots: {
        label: toolLabel('私聊解析小程序和链接', '开启后，当私聊收到小程序或链接会发送解析后的参数')
      }
    }
  },
  {
    field: 'parseMiniRooms',
    component: 'Switch',
    colProps: {
      span: 18,
      offset: 2
    },
    formItemProps: {
      slots: {
        label: toolLabel(
          '群解析小程序和链接',
          '添加的群，当收到小程序或链接会在群中发送解析后的参数'
        ),
        default: (form) => {
          return <SelectRoom multiple={true} vModel={form.parseMiniRooms}></SelectRoom>
        }
      }
    }
  },
  {
    field: 'defaultReply',
    component: 'Input',
    formItemProps: {
      slots: {
        label: toolLabel('群默认@回复', '机器人群里被@时，默认的回复内容，系统预设“我在呢”')
      }
    },
    colProps: {
      span: 18,
      offset: 2
    }
  },
  {
    field: 'autoReply',
    label: '智能机器人回复',
    component: 'Switch',
    colProps: {
      span: 18,
      offset: 2
    },
    value: true,
    componentProps: {
      on: {
        change(val) {
          setAutoReply(val)
        }
      }
    }
  },
  {
    field: 'preventWords',
    label: '禁止词',
    component: 'Input',
    colProps: {
      span: 18,
      offset: 2
    },
    componentProps: {
      rows: 3,
      type: 'textarea',
      placeholder:
        '禁止词是为了防止问题中包含敏感词所设置的，每个词用，“或，分隔开，末尾不要加，。全部是模糊匹配，遇到匹配到的词机器人就不会回复，防上触发不同协议下的风控'
    }
  },
  {
    field: 'botScope',
    label: '机器人触发范围',
    component: 'RadioGroup',
    colProps: {
      span: 18,
      offset: 2
    },
    value: 'all',
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
    field: 'defaultBot',
    label: '默认智能机器人',
    component: 'RadioGroup',
    colProps: {
      span: 18,
      offset: 2
    },
    value: '0',
    componentProps: {
      options: [
        {
          label: '天行智能机器人',
          value: '0'
        },
        {
          label: '微信开放对话平台',
          value: '5'
        },
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
    field: 'field56',
    component: 'Divider',
    colProps: {
      span: 18,
      offset: 2
    }
  },
  {
    field: 'tencentAESKey',
    label: '平台AESKey',
    component: 'Input',
    hidden: true,
    colProps: {
      span: 18,
      offset: 2
    },
    componentProps: {
      slots: {
        append: () => {
          return <a href="https://chatbot.weixin.qq.com/login">encodingAESKey获取</a>
        }
      }
    }
  },
  {
    field: 'tencentToken',
    label: '平台TOKEN',
    hidden: true,
    component: 'Input',
    colProps: {
      span: 18,
      offset: 2
    },
    componentProps: {
      slots: {
        append: () => {
          return <a href="https://chatbot.weixin.qq.com/login">tencentToken获取</a>
        }
      }
    }
  },
  {
    field: 'openaiSystemMessage',
    label: '角色预设（prompt）',
    component: 'Input',
    hidden: true,
    colProps: {
      span: 18,
      offset: 2
    },
    componentProps: {
      rows: 3,
      type: 'textarea',
      placeholder:
        '例：你是一个智能微信机器人，你需要在不违反微信规定的情况下回答我的问题，问题答案尽量简洁明了，不需要太多解析。我的问题是：'
    }
  },
  {
    field: 'showQuestion',
    label: '引用原文',
    component: 'Switch',
    hidden: true,
    colProps: {
      span: 18,
      offset: 2
    }
  },
  {
    field: 'chatFilter',
    label: '敏感词过滤',
    component: 'Switch',
    hidden: true,
    colProps: {
      span: 18,
      offset: 2
    },
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
    colProps: {
      span: 18,
      offset: 2
    },
    hidden: true,
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
    hidden: true,
    colProps: {
      span: 18,
      offset: 2
    },
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
    hidden: true,
    component: 'Input',
    colProps: {
      span: 18,
      offset: 2
    }
  },
  {
    field: 'filterSecretKey',
    label: '百度文本审核secretKey',
    hidden: true,
    component: 'Input',
    colProps: {
      span: 18,
      offset: 2
    }
  },
  {
    field: 'openaiDebug',
    label: '开启Debug模式',
    hidden: true,
    component: 'Switch',
    colProps: {
      span: 18,
      offset: 2
    }
  },
  {
    field: 'difyAgent',
    label: '智能助手模式(会员专享)',
    hidden: true,
    component: 'Switch',
    colProps: {
      span: 18,
      offset: 2
    }
  },
  {
    field: 'openaiTimeout',
    label: '请求超时时间(秒)',
    hidden: true,
    component: 'InputNumber',
    value: 5,
    componentProps: {
      'controls-position': 'right',
      min: 0
    },
    colProps: {
      span: 10,
      offset: 2
    }
  },
  {
    field: 'openaiModel',
    hidden: true,
    component: 'Select',
    colProps: {
      span: 18,
      offset: 2
    },
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
    field: 'gpttoken',
    label: 'apikey',
    hidden: true,
    component: 'Input',
    colProps: {
      span: 18,
      offset: 2
    },
    componentProps: {
      slots: {
        append: (val, formData) => {
          return formData.defaultBot == 6 ? (
            <a href="https://help.aibotk.com/?plugin=czw_emDoc&post=12" target="_blank">
              注册攻略
            </a>
          ) : (
            <a href="https://doc.fastgpt.run/docs/course/websync/" target="_blank">
              获取方式
            </a>
          )
        }
      }
    }
  },
  {
    field: 'proxyPassUrl',
    label: '反向代理地址',
    hidden: true,
    component: 'Input',
    colProps: {
      span: 18,
      offset: 2
    },
    componentProps: {
      slots: {
        append: () => {
          return (
            <a target="_blank" href="https://help.aibotk.com/?plugin=czw_emDoc&post=12">
              配置说明，后缀带/v1
            </a>
          )
        }
      }
    }
  },
  {
    field: 'proxyUrl',
    label: 'http代理',
    hidden: true,
    component: 'Input',
    colProps: {
      span: 18,
      offset: 2
    }
  },
  {
    field: 'dify_token',
    label: 'api秘钥',
    hidden: true,
    component: 'Input',
    colProps: {
      span: 18,
      offset: 2
    },
    componentProps: {
      slots: {
        append: () => {
          return (
            <a href="https://docs.dify.ai/v/zh-hans/application/developing-with-apis#ru-he-shi-yong">
              查看方法
            </a>
          )
        }
      }
    }
  },
  {
    field: 'dify_baseUrl',
    label: 'api服务地址',
    hidden: true,
    component: 'Input',
    colProps: {
      span: 18,
      offset: 2
    },
    componentProps: {
      slots: {
        append: () => {
          return (
            <a href="https://docs.dify.ai/v/zh-hans/guides/application-publishing/developing-with-apis#dui-hua-xing-ying-yong">
              查看方法
            </a>
          )
        }
      }
    }
  },
  // {
  //   field: 'proxyPassUrl',
  //   hidden: true,
  //   label: '服务器地址',
  //   component: 'Input',
  //   colProps: {
  //     span: 18,
  //     offset: 2
  //   }
  // },
  {
    field: 'login',
    colProps: {
      span: 18,
      offset: 2
    },
    formItemProps: {
      slots: {
        default: () => {
          return (
            <div class=" w-full">
              <div class="float-right">
                <BaseButton loading={loading.value} type="primary" onClick={save}>
                  保存
                </BaseButton>
                <BaseButton onClick={init}>取消</BaseButton>
              </div>
            </div>
          )
        }
      }
    }
  }
])

const init = async () => {
  const data = await detailBaseConfig()
  if (data) {
    setValues(data)
    setAutoReply(data.autoReply)
  }
}

onMounted(() => {
  init()
})

const loading = ref(false)

const redirect = ref<string>('')

watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  {
    immediate: true
  }
)

const save = async () => {
  const formRef = await getElFormExpose()
  try {
    const valid = await formRef?.validate()
    if (valid) {
      const form = await getFormData(false)
      if (form.id) {
        await updateBaseConfig({
          ...form
        })
      } else {
        await saveBaseConfig(form)
      }
      ElMessage.success('保存成功')
      init()
      loading.value = true
    }
  } catch (ex) {
    console.log(ex)
    loading.value = false
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <ContentWrap :title="$route.meta.title">
    <Form
      :schema="schema"
      :rules="rules"
      :model="mode"
      hide-required-asterisk
      :autoSetPlaceholder="false"
      class="dark:(border-1 border-[var(--el-border-color)] border-solid)"
      @register="formRegister"
    />
  </ContentWrap>
</template>
<style lang="less" scoped>
:deep(.el-divider--horizontal) {
  margin-top: 0px;
}
</style>
