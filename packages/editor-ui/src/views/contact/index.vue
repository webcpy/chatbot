<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage, ElTag } from 'element-plus'
import { Table } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { TableData } from '@/api/table/types'
import { ref, unref, reactive } from 'vue'
import Write from './components/Write.vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import check from '@/components/add/check.vue'
import { sayApi, getFriend, synchronize } from '@/api/dashboard/workplace'
import dayjs from 'dayjs'

const ids = ref<string[]>([])
const writeRef = ref<ComponentRef<typeof Write>>()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getFriend({
      current: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })

    return {
      list: res.list,
      total: res.count
    }
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList } = tableMethods

const searchParams = ref({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

const handleAliasSelect = (val) => {
  searchParams.value = {
    ...searchParams.value,
    alias: val.value
  }
  getList()
}
const { t } = useI18n()
const queryConntentSearchAsync = (_queryString: string, cb: (arg: any) => void) => {
  getFriend({
    alias: _queryString
  })
    .then((res) => {
      const data = (res.list || []).map((it) => {
        return {
          value: it.alias,
          link: it.link
        }
      })
      cb(data)
    })
    .catch((_error) => {
      cb([])
    })
}
const querySearchAsync = (_queryString: string, cb: (arg: any) => void) => {
  getFriend({
    name: _queryString
  })
    .then((res) => {
      const data = (res.list || []).map((it) => {
        return {
          value: it.name,
          link: it.link
        }
      })
      cb(data)
    })
    .catch((_error) => {
      cb([])
    })
}

const handleSelect = (val) => {
  searchParams.value = {
    ...searchParams.value,
    name: val.value
  }
  getList()
}

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
    field: 'wxid',
    label: 'wxid',
    width: 150,
    search: {
      hidden: true
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'name',
    label: '昵称',
    width: 150,
    search: {
      component: 'Autocomplete',
      componentProps: {
        fetchSuggestions: querySearchAsync,
        on: {
          select: handleSelect
        }
      }
    },
    component: 'Input',
    colProps: {
      span: 8
    },
    formatter: (data: any) => {
      return <ElTag type="primary">{data.name}</ElTag>
    }
  },
  {
    field: 'alias',
    label: '备注',
    search: {
      component: 'Autocomplete',
      componentProps: {
        fetchSuggestions: queryConntentSearchAsync,
        on: {
          select: handleAliasSelect
        }
      }
    }
  },
  {
    field: 'gender',
    label: '性别',
    search: {
      hidden: true
    }
  },
  {
    field: 'signature',
    label: '签名',
    search: {
      hidden: true
    }
  },
  {
    field: 'updatedAt',
    label: '更新时间',
    search: {
      hidden: true
    },
    width: 180,
    formatter: (data: any) => {
      return <div>{dayjs(data.updatedAt).format('YYYY-MM-DD HH:ss:DD')}</div>
    }
  },
  {
    field: 'action',
    width: '260px',
    label: t('tableDemo.action'),
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
      slots: {
        default: (data: any) => {
          return (
            <>
              <BaseButton type="primary" onClick={() => action(data.row, 'material')}>
                素材发送
              </BaseButton>
              <BaseButton type="danger" onClick={() => action(data.row, 'write')}>
                发消息
              </BaseButton>
            </>
          )
        }
      }
    }
  }
])

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const dialogVisible = ref(false)
const dialogTitle = ref('')

const currentRow = ref<TableData | null>(null)
const actionType = ref('')

const AddAction = async () => {
  await synchronize({ target: 'system', event: 'reloadFriendOnly' })
  ElMessage.success('同步成功，请2分钟之后查看群列表')
}

const action = async (row: any, type: string) => {
  currentRow.value = row
  dialogVisible.value = true
  actionType.value = type
  dialogTitle.value = '发送消息'

  if (type == 'material') {
    dialogTitle.value = '素材发送'
  }
}

const child = ref()

const saveLoading = ref(false)

const save = async () => {
  if (actionType.value === 'write') {
    const write = unref(writeRef)
    const formData = await write?.submit()
    if (formData) {
      await sayApi({
        target: 'Contact',
        wxid: formData.wxid,
        name: formData.name,
        alias: formData.alias,
        message: {
          type: formData.type,
          content: formData.content || ''
        }
      })
      dialogVisible.value = false
      ElMessage.success('消息发送成功')
    }
  } else {
    const data = await child.value.getSelect()
    if (data.length > 0) {
      const all = data.map((it: any) => {
        return sayApi({
          target: 'Contact',
          wxid: currentRow.value.wxid,
          name: currentRow.value.name,
          alias: currentRow.value.alias,
          message: {
            ...it
          }
        })
      })
      const results = await Promise.all(all)
      dialogVisible.value = false
      ElMessage.success('素材发送成功')
    }
  }
}
</script>

<template>
  <ContentWrap title="好友列表">
    <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams" />

    <div class="mb-10px">
      <BaseButton type="primary" @click="AddAction">同步好友列表</BaseButton>
    </div>

    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :columns="allSchemas.tableColumns"
      :data="dataList"
      :loading="loading"
      :pagination="{
        total: total
      }"
      :image-preview="['thumbUrl']"
      @register="tableRegister"
    />
  </ContentWrap>

  <Dialog
    v-model="dialogVisible"
    :style="actionType == 'material' ? { width: '70% !important' } : {}"
    :title="dialogTitle"
  >
    <check ref="child" v-if="actionType === 'material'" />
    <Write
      v-if="actionType === 'write'"
      ref="writeRef"
      :form-schema="allSchemas.formSchema"
      :current-row="currentRow"
    />

    <template #footer>
      <BaseButton type="primary" :loading="saveLoading" @click="save">
        {{ t('exampleDemo.save') }}
      </BaseButton>
      <BaseButton @click="dialogVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>
</template>
