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
import Send from './components/send.vue'

import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import {
  getBatchSend,
  delBatchSend,
  detailBatchSend,
  batchsend,
  updateBatchSend
} from '@/api/vip/index'
import { useClipboard } from '@/hooks/web/useClipboard'
import { saveBatchSend } from '@/api/vip'
import { omit } from 'lodash-es'
const { copy } = useClipboard()

const ids = ref<string[]>([])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getBatchSend({
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
    field: 'name',
    label: '分组名',
    width: 150,
    search: {
      hidden: true
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'type',
    label: '类型',
    width: 150,
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
    field: 'tags',
    label: '标签',
    width: 150,
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return data.tags && <ElTag type="primary">{data.tags}</ElTag>
    }
  },
  {
    field: 'groups',
    label: '分组列表',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return (
        <>
          {(data.groups || []).map((it) => {
            return (
              <ElTag class="mr-3" type="primary">
                {it.name}
              </ElTag>
            )
          })}
        </>
      )
    }
  },
  {
    field: 'desc',
    label: '备注',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return data.desc && <ElTag type="primary">{data.desc}</ElTag>
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
              <BaseButton type="primary" onClick={() => action(data.row, 'send')}>
                批量发送
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
  await delBatchSend(unref(ids).join(',')).finally(() => {
    delLoading.value = false
    getList()
  })
}

const action = async (row: any, type: string) => {
  if (type == 'edit') {
    dialogTitle.value = '编辑'
    const data = await detailBatchSend(row.id)
    actionType.value = type
    currentRow.value = row
    if (row.type != 'contact') {
      currentRow.value.roomList = row.groups
    } else {
      currentRow.value.friendList = row.groups
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
    let groups = formData.roomList
    if (formData.type == 'contact') {
      groups = formData.friendList
    }
    let res = null
    if (actionType.value == 'edit') {
      res = await updateBatchSend(
        omit(
          {
            ...formData,
            groups
          },
          ['friendList', 'roomList']
        )
      )
        .catch(() => {})
        .finally(() => {
          saveLoading.value = false
        })
    } else {
      res = await saveBatchSend({
        ...formData,
        groups
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
const sendRef: any = ref(null)
const send = async () => {
  const send = unref(sendRef)
  const formData = await send?.submit()
  if (formData) {
    saveLoading.value = true
    let groups = formData.roomList
    // if (formData.type == 'contact') {
    //   groups = formData.friendList
    // }
    const res = await batchsend({
      target: formData.target,
      messages: formData.messages,
      groups: currentRow.value.groups
    })
      .catch(() => {})
      .finally(() => {
        saveLoading.value = false
      })
    if (res) {
      dialogVisible.value = false
      currentPage.value = 1
      getList()
    }
  }
}
</script>

<template>
  <ContentWrap>
    <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams" />

    <div class="mb-10px">
      <BaseButton type="primary" @click="AddAction">{{ t('exampleDemo.add') }}</BaseButton>
      <BaseButton :loading="delLoading" type="danger" @click="delData(null)">
        {{ t('exampleDemo.del') }}
      </BaseButton>
    </div>

    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :columns="allSchemas.tableColumns"
      :data="dataList"
      :show-overflow-tooltip="false"
      :loading="loading"
      :pagination="{
        total: total
      }"
      :image-preview="['url']"
      @register="tableRegister"
    />
  </ContentWrap>

  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <Write
      v-if="actionType != 'send'"
      ref="writeRef"
      :form-schema="allSchemas.formSchema"
      :current-row="currentRow"
    />
    <Send
      v-if="actionType == 'send'"
      ref="sendRef"
      :form-schema="allSchemas.formSchema"
      :current-row="currentRow"
    />
    <template #footer>
      <BaseButton v-if="actionType != 'send'" type="primary" :loading="saveLoading" @click="save">
        保存
      </BaseButton>
      <BaseButton v-if="actionType == 'send'" type="primary" :loading="saveLoading" @click="send">
        发送
      </BaseButton>
      <BaseButton @click="dialogVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>
</template>
