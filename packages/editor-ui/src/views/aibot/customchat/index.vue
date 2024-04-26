<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
import { Table } from '@/components/Table'
import { getAiBotCustomchat, delAiBotCustomchat, reseveAiBotCustomchat } from '@/api/aibot/index'
import { useEventBus } from '@/hooks/event/useEventBus'
import { useTable } from '@/hooks/web/useTable'
import { TableData } from '@/api/table/types'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

const { push } = useRouter()

const ids = ref<string[]>([])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getAiBotCustomchat({
      current: unref(currentPage),
      pageSize: unref(pageSize)
    })

    return {
      list: res.list,
      total: res.count
    }
  },
  fetchDelApi: async () => {
    const res = await delAiBotCustomchat(unref(ids))
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
    field: 'targets',
    label: '群名/用户名',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return (
        <>
          {(data.targets || []).map((it) => {
            return (
              <ElTag class="mr-2" type="primary">
                {it.name}
              </ElTag>
            )
          })}
        </>
      )
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
    width: 100,
    colProps: {
      span: 8
    },
    formatter: (data: any) => {
      return <ElTag type="primary">{data.type == 'contact' ? '好友' : '群组'}</ElTag>
    }
  },
  {
    field: 'robotType',
    label: '机器人类型',
    width: 100,
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      const typeMap: any = {
        '6': 'ChatGpt',
        '9': 'FastGPT',
        '8': 'Dify',
        '11': '国内模型'
      }
      return data.robotType && <ElTag type="primary">{typeMap[data.robotType]}</ElTag>
    }
  },
  {
    field: 'openChat',
    label: '开启聊天',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return <ElTag type="primary">{!!data.openChat ? '开启' : '关闭'}</ElTag>
    },
    width: 100
  },
  {
    field: 'limitNum',
    label: '限制次数/对话次数',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return (
        <ElTag type="primary">
          {data.limitNum == 0 ? '不限制' : data.limitNum}/{data.limitWord}
        </ElTag>
      )
    },
    width: 150
  },

  {
    field: 'updatedAt',
    label: '更新时间',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return (
        <ElTag class="mr-2" type="primary">
          {dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
        </ElTag>
      )
    }
  },
  {
    field: 'action',
    width: '360px',
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
              <BaseButton type="primary" onClick={() => copy(data.row, 'copy')}>
                复制配置
              </BaseButton>
              <BaseButton type="primary" onClick={() => reseve(data.row, 'reseve')}>
                重置次数
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

const reseve = async (row) => {
  await reseveAiBotCustomchat(row.id)
  ElMessage.success('重制成功')
  getList()
}

const copy = async (row) => {
  push('/aibot/customchat/copy/' + row.id)
}

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const AddAction = () => {
  push('/aibot/customchat/add')
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
    await delAiBotCustomchat(unref(ids).join(',')).finally(() => {
      delLoading.value = false
      getList()
    })
  } catch (ex) {}
}

const action = async (row: any, type: string) => {
  if (type == 'edit') {
    push(`/aibot/customchat/edit/${row.id}`)
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
    title="自定义对话配置
"
    message="指定的群/好友开启chatGPT聊天"
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
      :loading="loading"
      :showOverflowTooltip="false"
      :pagination="{
        total: total
      }"
      :image-preview="['thumbUrl']"
      @register="tableRegister"
    />
  </ContentWrap>
</template>
