<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage, ElTag } from 'element-plus'
import { Table } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive, defineExpose, defineProps, nextTick } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { materialList, materialDetail, materialRemove } from '@/api/material/index'
import { useForm } from '@/hooks/web/useForm'
import { Form, FormSchema } from '@/components/Form'

const props = defineProps({
  model: {
    type: Array,
    default: () => []
  }
})
const { formRegister, formMethods } = useForm()
const { getFormData } = formMethods

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await materialList({
      current: unref(currentPage),
      pageSize: unref(pageSize),
      type: 1,
      ...unref(searchParams)
    })
    await setSelects()

    return {
      list: res.list,
      total: res.count
    }
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, setColumn, delList, getElTableExpose } = tableMethods

const searchParams = ref({})
const setSearchParams = async () => {
  const data = await getFormData()
  searchParams.value = data
  getList()
}

const { t } = useI18n()

const init = (val: number | undefined) => {
  const hidden = (val ? ['url', 'title'] : ['content', 'url', 'title']).map((it) => {
    return {
      field: it,
      path: 'hidden',
      value: true
    }
  })
  setColumn(hidden)
}
init(1)

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'selection',
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    detail: {
      hidden: true
    },
    table: {
      type: 'selection'
    }
  },
  {
    field: 'type',
    form: {
      component: 'Select',
      colProps: {
        span: 5
      },
      value: 1,
      componentProps: {
        placeholder: '',
        clearable: false,
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
        ],
        on: {
          change: (val: number) => {
            init()
            setSearchParams()
            if (val == 1) {
              setColumn([
                {
                  field: 'content',
                  path: 'hidden',
                  value: false
                }
              ])
            } else if (val == 2) {
              setColumn([
                {
                  field: 'url',
                  path: 'hidden',
                  value: false
                }
              ])
            } else {
              setColumn([
                {
                  field: 'title',
                  path: 'hidden',
                  value: false
                }
              ])
            }
          }
        }
      }
    },
    table: {
      hidden: true
    }
  },
  {
    field: 'name',
    label: '素材名称',
    width: 150,
    form: {
      label: '名称',
      component: 'Input',
      componentProps: {
        placeholder: '素材名称'
      },
      colProps: {
        span: 6
      }
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'tag',
    label: '素材标签',
    width: 150,
    form: {
      label: '标签',
      component: 'Input',
      componentProps: {
        placeholder: ''
      },
      colProps: {
        span: 6
      }
    },
    formatter: (data: any) => {
      return <ElTag type="primary">{data.tag}</ElTag>
    }
  },
  {
    field: 'content',
    label: '内容',
    form: {
      hidden: true
    }
  },
  {
    field: 'url',
    label: '预览',
    form: {
      hidden: true
    },
    table: {
      // hidden: true
    }
  },
  {
    field: 'title',
    label: '标题',
    form: {
      hidden: true
    }
  },
  {
    field: 'action',
    width: '260px',
    label: t('tableDemo.action'),
    search: {
      hidden: true
    },
    table: {
      hidden: true
    },
    form: {
      colProps: {
        span: 6
      },
      label: ' ',
      formItemProps: {
        slots: {
          default: (formData) => {
            return (
              <>
                <BaseButton type="primary" onClick={() => setSearchParams()}>
                  查询
                </BaseButton>
                <BaseButton type="danger" onClick={() => delData(data.row)}>
                  新增
                </BaseButton>
              </>
            )
          }
        }
      }
    },
    detail: {
      hidden: true
    }
  }
])

const getSelect = async () => {
  const data = await getElTableExpose()
  return data.getSelectionRows()
}

const setSelects = async () => {
  nextTick(async () => {
    const data = await getElTableExpose()
    props.model.forEach((it: any) => {
      const getSelect = data.data.find((item) => item.materialId == it.materialId)
      getSelect ? data.toggleRowSelection(getSelect, true) : ''
    })
  })
}

defineExpose({ getSelect, setSelects })
// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)
</script>

<template>
  <ContentWrap>
    <!-- <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams" /> -->
    <Form
      :schema="allSchemas.formSchema"
      hide-required-asterisk
      :autoSetPlaceholder="false"
      class="dark:(border-1 border-[var(--el-border-color)] border-solid) mb-5"
      @register="formRegister"
    />
    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :columns="allSchemas.tableColumns"
      :data="dataList"
      :loading="loading"
      :pagination="{
        total: total
      }"
      :image-preview="['url']"
      @register="tableRegister"
    />
  </ContentWrap>
</template>
