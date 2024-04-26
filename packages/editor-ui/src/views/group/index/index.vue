<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { ElTag, ElMessageBox } from 'element-plus'
import { Table } from '@/components/Table'
import { getRoomJoinKeywords, delRoomJoinKeywords } from '@/api/dashboard/workplace'
import { useEventBus } from '@/hooks/event/useEventBus'
import { useTable } from '@/hooks/web/useTable'
import { TableData } from '@/api/table/types'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { useRouter } from 'vue-router'

const { push } = useRouter()

const ids = ref<string[]>([])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getRoomJoinKeywords({
      current: unref(currentPage),
      pageSize: unref(pageSize)
    })

    return {
      list: res.list,
      total: res.count
    }
  },
  fetchDelApi: async () => {
    const res = await delRoomJoinKeywords(unref(ids))
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
    field: 'roomName',
    label: '群名称',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return (
        <ElTag class="mr-2" type="primary">
          {data.roomName}
        </ElTag>
      )
    }
  },
  {
    field: 'keywords',
    label: '入群暗号',
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
    field: 'replys',
    label: '回复内容',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return (
        <>
          {data.replys.map((it) => {
            return (
              <ElTag class="mr-2" type="primary">
                {it.name} - {it.tag}
              </ElTag>
            )
          })}
        </>
      )
    }
  },
  {
    field: 'welcomes',
    label: '入群欢迎词',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return (
        <>
          {(data.welcomes || []).map((it) => {
            return (
              <ElTag class="mr-2" type="primary">
                {it.name} - {it.tag}
              </ElTag>
            )
          })}
        </>
      )
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
  push('/group/index/add')
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
    await delRoomJoinKeywords(unref(ids).join(',')).finally(() => {
      delLoading.value = false
      getList()
    })
  } catch (ex) {}
}

const action = async (row: any, type: string) => {
  if (type == 'edit') {
    push(`/group/index/edit/${row.id}`)
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
    title="关键词进群"
    message="当好友发送指定入群关键词时，会自动邀请其进入指定群，并触发自动欢迎词
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
