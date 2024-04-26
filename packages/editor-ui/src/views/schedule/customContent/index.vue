<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage, ElTag, ElMessageBox } from 'element-plus'
import { Table } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive, nextTick } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { getCustomContent, delCustomContent } from '@/api/schedule/index'
import { useEventBus } from '@/hooks/event/useEventBus'
import dayjs from 'dayjs'

import { useRouter } from 'vue-router'

const { push } = useRouter()

import { eventSend } from '@/api/vip/index'
const ids = ref<string[]>([])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getCustomContent({
      current: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })

    return {
      list: res.list,
      total: res.count
    }
  },
  fetchDelApi: async () => {}
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList } = tableMethods

const searchParams = ref({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

const { t } = useI18n()

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
    label: '类型',
    search: {
      component: 'Select',
      componentProps: {
        placeholder: '',
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
    colProps: {
      span: 8
    },
    formatter: (data: any) => {
      return <ElTag type="primary">{data.type == 'contact' ? '好友' : '群组'}</ElTag>
    }
  },
  {
    field: 'names',
    label: '群名/好友昵称',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return (
        <>
          {(data.names || []).map((it) => {
            return (
              <ElTag class="mr-2" type="primary">
                {it.aliasName || it.name}
              </ElTag>
            )
          })}
        </>
      )
    }
  },
  {
    field: 'cron',
    label: '定制规则',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return data.cron && <ElTag type="primary">{data.cron}</ElTag>
    }
  },
  {
    field: 'api',
    label: '定制内容',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return data.api && <ElTag type="primary">{data.api.label}</ElTag>
    }
  },
  {
    field: 'updatedAt',
    label: '更新时间',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return <ElTag type="primary">{dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</ElTag>
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
    fixed: 'right',
    table: {
      slots: {
        default: (data: any) => {
          return (
            <>
              <BaseButton type="primary" onClick={() => send(data.row, 'send')}>
                直接发送
              </BaseButton>
              <BaseButton type="primary" onClick={() => action(data.row, 'edit')}>
                {t('exampleDemo.edit')}
              </BaseButton>
              <BaseButton type="danger" onClick={() => delData(data.row)}>
                {t('exampleDemo.del')}
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

const currentRow = ref<anyl>(null)
const actionType = ref('')

const AddAction = () => {
  push('/schedule/customContent/add')
}

const delLoading = ref(false)

const delData = async (row: any) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row ? [row.id] : elTableExpose?.getSelectionRows().map((v: TableData) => v.id) || []
  delLoading.value = true
  await ElMessageBox.confirm('确定删除?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await delCustomContent(unref(ids).join(',')).finally(() => {
    delLoading.value = false
    getList()
  })
}

const action = async (row: any, type: string) => {
  if (type == 'edit') {
    push(`/schedule/customContent/edit/${row.id}`)
  }
}

const send = async (row: any) => {
  console.log(row)
  const res = await eventSend({
    target: 'Tasks',
    task: row
  })
  ElMessage.success('发送成功，5s内请勿再次发送')
}

useEventBus({
  name: 'getList',
  callback: (type: string) => {
    if (type === 'add') {
      currentPage.value = 1
    }
    getList()
  }
})
</script>

<template>
  <ContentWrap
    tittle="每日说定时任务
"
    message="适用于个人和群组，主要发送每日天气，一句随机情话和提示等信息，暂时不可定制，内容为本项目特色

"
  >
    <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams" />

    <div class="mb-10px">
      <BaseButton type="primary" @click="AddAction">{{ t('exampleDemo.add') }}</BaseButton>
      <BaseButton :loading="delLoading" type="danger" @click="delData(null)">
        {{ t('exampleDemo.del') }}
      </BaseButton>
    </div>

    <Table
      :showOverflowTooltip="false"
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
