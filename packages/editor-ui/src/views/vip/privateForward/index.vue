<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
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
  getPrivateForwards,
  delPrivateForwards,
  detailPrivateForwards,
  updatePrivateForwards,
  savePrivateForwards
} from '@/api/vip/index'
import { useClipboard } from '@/hooks/web/useClipboard'
import { omit } from 'lodash-es'
const { copy } = useClipboard()

const ids = ref<string[]>([])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getPrivateForwards({
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
    field: 'names',
    label: '指定用户',
    search: {
      hidden: true
    },
    detail: {
      span: 24
    },
    formatter: (data: any) => {
      return <ElTag type="primary">{data.names?.name}</ElTag>
    }
  },
  {
    field: 'rooms',
    label: '转发到的群',
    search: {
      hidden: false
    },
    colProps: {
      span: 8
    },
    formatter: (data: any) => {
      return (
        <>
          {(data.rooms || []).map((it) => {
            return (
              <ElTag class="mr-3" type="primary">
                {it?.name}
              </ElTag>
            )
          })}
        </>
      )
    }
  },
  {
    field: 'contacts',
    label: '转发到的好友',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return (
        <>
          {(data.contacts || []).map((it) => {
            return (
              <ElTag class="mr-3" type="primary">
                {it?.name}
              </ElTag>
            )
          })}
        </>
      )
    }
  },
  {
    field: 'type',
    label: '转发的消息类型',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return <ElTag type="primary">{data.type == 1 ? '只转发文字' : '转发所有消息'}</ElTag>
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
  await delPrivateForwards(unref(ids).join(',')).finally(() => {
    delLoading.value = false
    getList()
  })
}

const action = async (row: any, type: string) => {
  dialogTitle.value = '新增'
  dialogVisible.value = true
  actionType.value = 'edit'
  if (type == 'edit') {
    dialogTitle.value = '编辑'
    const data = await detailPrivateForwards(row.id)
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
    dialogVisible.value = true
  }
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
      res = await updatePrivateForwards(
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
      res = await savePrivateForwards({
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
</script>

<template>
  <ContentWrap
    title="转发助手"
    message="指定好友发送的消息，转发到指定群或者指定好友，快速实现群发消息，随时随地群发。
"
  >
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
      :loading="loading"
      :show-overflow-tooltip="false"
      :pagination="{
        total: total
      }"
      :showOverflowTooltip="false"
      :image-preview="['url']"
      @register="tableRegister"
    />
  </ContentWrap>

  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <Write
      v-if="actionType != 'detail'"
      ref="writeRef"
      :form-schema="allSchemas.formSchema"
      :current-row="currentRow"
    />
    <template #footer>
      <BaseButton v-if="actionType != 'detail'" type="primary" :loading="saveLoading" @click="save">
        {{ t('exampleDemo.save') }}
      </BaseButton>
      <BaseButton @click="dialogVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>
</template>
