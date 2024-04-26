<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { ElTag, ElMessageBox } from 'element-plus'
import { Table } from '@/components/Table'
import { useEventBus } from '@/hooks/event/useEventBus'
import { useTable } from '@/hooks/web/useTable'
import { TableData } from '@/api/table/types'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { useRouter } from 'vue-router'
import { getCallBackEvents, delCallBackEvents, detailCallBackEvents } from '@/api/vip'

const { push } = useRouter()

const ids = ref<string[]>([])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getCallBackEvents({
      current: unref(currentPage),
      pageSize: unref(pageSize)
    })

    return {
      list: res.list,
      total: res.count
    }
  },
  fetchDelApi: async () => {
    const res = await delCallBackEvents(unref(ids))
    return !!res
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList } = tableMethods

const { t } = useI18n()
const scopeStatus: any = {
  all: '群与好友',
  room: '群',
  friend: '好友'
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
    field: 'keywords',
    label: '关键词',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return (
        <>
          {data.keywords.map((it) => {
            return (
              <ElTag class="mr-2" type="primary">
                {it}
              </ElTag>
            )
          })}
        </>
      )
    }
  },
  {
    field: 'reg',
    label: '匹配规则',
    width: 150,
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return <ElTag type="primary">{data.reg == 1 ? '模糊匹配' : '精确匹配'}</ElTag>
    }
  },
  {
    field: 'scope',
    label: '触发范围',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return <ElTag type="primary">{scopeStatus[data.scope]}</ElTag>
    },
    width: 150
  },
  {
    field: 'needAt',
    label: '群中@触发',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return <ElTag type="primary">{data.needAt == 1 ? '是' : '否'}</ElTag>
    },
    width: 150
  },
  {
    field: 'api',
    label: '回调标签',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return <div>{data.api.label}</div>
    }
  },
  {
    field: 'timeout',
    label: '超时时间',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return <ElTag type="primary">{data.timeout}</ElTag>
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

const AddAction = () => {
  push('/vip/callbackEvent/add')
}

const delLoading = ref(false)

const delData = async (row: any) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row ? [row.id] : elTableExpose?.getSelectionRows().map((v: TableData) => v.id) || []
  delLoading.value = true
  try {
    await ElMessageBox.confirm('确定删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await delCallBackEvents(unref(ids).join(',')).finally(() => {
      delLoading.value = false
      getList()
    })
  } catch (ex) {}
}

const action = async (row: any, type: string) => {
  if (type == 'edit') {
    push(`/vip/callbackEvent/edit/${row.id}`)
  }
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
    title="回调事件
"
    message="当好友发送或群好友@机器人预设关键词时，会自动触发设置的回调接口，回调接口返回指定数据格式即可，目前支持本平台开放接口，和自定义接口地址
"
  >
    <div class="mb-10px">
      <BaseButton type="primary" @click="AddAction">新增</BaseButton>
      <BaseButton :loading="delLoading" type="danger" @click="delData(null)"> 删除 </BaseButton>
    </div>
    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :columns="allSchemas.tableColumns"
      :data="dataList"
      :showOverflowTooltip="false"
      :loading="loading"
      :pagination="{
        total: total
      }"
      :image-preview="['thumbUrl']"
      @register="tableRegister"
    />
  </ContentWrap>
</template>
