<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { reactive, ref, onMounted, watch } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { useForm } from '@/hooks/web/useForm'
import { ElInput, FormRules } from 'element-plus'
import { useValidator } from '@/hooks/web/useValidator'
import { BaseButton } from '@/components/Button'
import { getImageCaptchaApi, userRegister, checkCaptcha } from '@/api/login'
import { FormItemRule } from 'element-plus'
import { usePermissionStore } from '@/store/modules/permission'
import { useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

const emit = defineEmits(['to-login'])
const permissionStore = usePermissionStore()
const { currentRoute, addRoute, push } = useRouter()
const { formRegister, formMethods } = useForm()
const { getElFormExpose, getFormData } = formMethods

const { t } = useI18n()
const userStore = useUserStore()

const { required, lengthRange } = useValidator()
const formModel = reactive({
  username: '',
  password: '',
  code: '',
  check_password: ''
})
const imgCode = reactive({
  id: '',
  imageBase64: ''
})

const schema = reactive<FormSchema[]>([
  {
    field: 'title',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return <h2 class="text-2xl font-bold text-center w-[100%]">{t('login.register')}</h2>
        }
      }
    }
  },
  {
    field: 'username',
    label: t('login.username'),
    value: '',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: t('login.usernamePlaceholder')
    }
  },
  {
    field: 'password',
    label: t('login.password'),
    value: '',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      style: {
        width: '100%'
      },
      strength: true,
      placeholder: t('login.passwordPlaceholder')
    }
  },
  {
    field: 'check_password',
    label: t('login.checkPassword'),
    value: '',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      style: {
        width: '100%'
      },
      strength: true,
      placeholder: t('login.passwordPlaceholder')
    }
  },
  {
    field: 'code',
    label: t('login.code'),
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <ElInput v-model={formData.code} placeholder={t('login.codePlaceholder')} />
              <img class="w-22 ml-2" onClick={init} src={imgCode.imageBase64} />
            </div>
          )
        }
      }
    }
  },
  {
    field: 'register',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return (
            <>
              <div class="w-[100%]">
                <BaseButton
                  type="primary"
                  class="w-[100%]"
                  loading={loading.value}
                  onClick={loginRegister}
                >
                  {t('login.register')}
                </BaseButton>
              </div>
              <div class="w-[100%] mt-15px">
                <BaseButton class="w-[100%]" onClick={toLogin}>
                  {t('login.hasUser')}
                </BaseButton>
              </div>
            </>
          )
        }
      }
    }
  }
])

const init = async () => {
  const { id, imageBase64 } = await getImageCaptchaApi()
  imgCode.id = id
  imgCode.imageBase64 = imageBase64
}
onMounted(() => {
  init()
})

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

const rules: FormRules = {
  username: [
    required(),
    lengthRange({
      min: 6,
      max: 16
    })
  ],
  password: [
    required(),
    lengthRange({
      min: 6,
      max: 16
    })
  ],
  check_password: [
    required(),
    {
      validator: (_, val, callback) => {
        getFormData().then((_res: any) => {
          const { password, check_password } = _res
          if (password != check_password) {
            callback(new Error('密码不一致'))
          } else {
            callback()
          }
        })
      }
    }
  ],
  code: [required()]
}

const toLogin = () => {
  emit('to-login')
}

const loading = ref(false)

const loginRegister = async () => {
  const formRef = await getElFormExpose()
  try {
    const valid = await formRef?.validate()
    if (valid) {
      const { password, code, username } = await getFormData()
      const data = await checkCaptcha({
        id: imgCode.id,
        answer: code
      })
      await userRegister({
        username,
        password
      })
      await permissionStore.generateRoutes('static').catch(() => {})
      permissionStore.getAddRouters.forEach((route) => {
        addRoute(route as RouteRecordRaw) // 动态添加可访问路由表
      })
      userStore.setUserInfo({
        username
      })
      permissionStore.setIsAddRouters(true)
      push({ path: permissionStore.addRouters[0].path })
      loading.value = true
    }
  } catch (ex) {
    loading.value = false
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Form
    :schema="schema"
    :rules="rules"
    label-position="top"
    :model="formModel"
    hide-required-asterisk
    size="large"
    class="dark:(border-1 border-[var(--el-border-color)] border-solid)"
    @register="formRegister"
  />
</template>
