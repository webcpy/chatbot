<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage, ElTag, ElMessageBox } from 'element-plus'
import { Table } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive, nextTick } from 'vue'
import Write from './components/Write.vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import {
  getRoomTaskSchedule,
  delRoomTaskSchedule,
  updateRoomTaskSchedule,
  saveRoomTaskSchedule
} from '@/api/schedule/index'
import { useClipboard } from '@/hooks/web/useClipboard'
import { omit, get } from 'lodash-es'
const { copy } = useClipboard()
import { eventSend } from '@/api/vip/index'
const ids = ref<string[]>([])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getRoomTaskSchedule({
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
    label: '发送对象',
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
        data.names && (
          <ElTag type="primary">
            {data.type == 'contact' ? data.names?.aliasName : data.names.name}
          </ElTag>
        )
      )
    }
  },
  {
    field: 'contents',
    label: '内容',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return (
        <>
          {(data.contents || []).map((it) => {
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
    field: 'endWord',
    label: '结尾备注',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return data.endWord && <ElTag type="primary">{data.endWord}</ElTag>
    }
  },
  {
    field: 'cronDate',
    label: '循环日期',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return <ElTag type="primary">{foramtDate(data.cronDate)}</ElTag>
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
                立即发送
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

const foramtDate = (val) => {
  if (val.type == 'day') {
    return `每天-${val.date}`
  } else if (val.type == 'week') {
    return `每周${val.week}-${val.date}`
  } else if (val.type == 'month') {
    return `每月${val.month}号-${val.date}`
  } else {
    return `Cron风格-${val.cron}`
  }
}

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const dialogVisible = ref(false)
const dialogTitle = ref('')

const currentRow = ref<anyl>(null)
const actionType = ref('')

const AddAction = () => {
  dialogTitle.value = t('exampleDemo.add')
  currentRow.value = null
  dialogVisible.value = true
  actionType.value = ''
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
  await delRoomTaskSchedule(unref(ids).join(',')).finally(() => {
    delLoading.value = false
    getList()
  })
}

const action = async (row: any, type: string) => {
  if (type == 'edit') {
    dialogTitle.value = '编辑'
    // const data = await detailDayTaskSchedule(row.id)
    actionType.value = type
    currentRow.value = row
    if (row.type != 'contact') {
      currentRow.value.roomNames = row.names
    } else {
      currentRow.value.friendNames = row.names
    }
    nextTick(() => {
      const write = unref(writeRef)
      write.change(row.type)
    })
  } else {
    actionType.value = 'send'
    currentRow.value = row
    if (row.type == 'contact') {
      currentRow.value.target = 'Contact'
      dialogTitle.value = '好友群发'
    } else {
      currentRow.value.target = 'Room'
      dialogTitle.value = '群组群发'
    }
  }
  actionType.value = type
  dialogVisible.value = true
}

const writeRef = ref<ComponentRef<typeof Write>>()

const saveLoading = ref(false)

const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true
    let names = formData.roomNames
    if (formData.type == 'contact') {
      names = formData.friendNames
    }
    let type = get(formData, 'cronDate.type', 'day')
    let cron = get(formData, 'cronDate.cron', '')
    let week = get(formData, 'cronDate.week', '*')
    let month = get(formData, 'cronDate.month', '*')
    let getDate = get(formData, 'cronDate.date', '')
    let date = ''
    if (type == 'cron') {
      if (!cron) {
        ElMessage.error('Cron 不呢为空')
        saveLoading.value = false
        return
      }
      date = cron
    } else {
      if (!getDate) {
        ElMessage.error('时间不能为空')
        saveLoading.value = false
        return
      }
      const dayDate = getDate.split(':').reverse().join(' ')
      if (type == 'day') {
        date = dayDate + ' * * *'
      } else if (type == 'week') {
        date = dayDate + ` * * ${week}`
      } else {
        date = dayDate + ` ${month} * *`
      }
    }
    let res = null
    if (actionType.value == 'edit') {
      res = await updateRoomTaskSchedule(
        omit(
          {
            ...formData,
            names,
            date
          },
          ['friendNames', 'roomNames']
        )
      )
        .catch(() => {})
        .finally(() => {
          saveLoading.value = false
        })
    } else {
      res = await saveRoomTaskSchedule({
        ...formData,
        names,
        date
      })
        .catch(() => {})
        .finally(() => {
          saveLoading.value = false
        })
    }

    if (res) {
      dialogVisible.value = false
      currentPage.value = 1
      getList()
    }
  }
}
const send = async (row: any) => {
  const res = await eventSend({
    target: 'Room',
    messages: row,
    event: 'roomTask'
  })
  ElMessage.success('发送成功，5s内请勿再次发送')
}
</script>

<template>
  <ContentWrap
    title="素材内容定时任务"
    message="可以对群或者好友定时发送任意消息类型，适合各种群通知或纪念日提醒等，支持素材
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

  <Dialog max-height="640" v-model="dialogVisible" :title="dialogTitle">
    <Write
      v-if="actionType != 'send'"
      ref="writeRef"
      :form-schema="allSchemas.formSchema"
      :current-row="currentRow"
    />
    <!-- <Send
      v-if="actionType == 'send'"
      ref="sendRef"
      :form-schema="allSchemas.formSchema"
      :current-row="currentRow"
    /> -->
    <template #footer>
      <BaseButton v-if="actionType != 'send'" type="primary" :loading="saveLoading" @click="save">
        {{ t('exampleDemo.save') }}
      </BaseButton>
      <BaseButton @click="dialogVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>
</template>
