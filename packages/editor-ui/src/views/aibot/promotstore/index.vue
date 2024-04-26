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
  getAiBotPromot,
  saveAiBotPromot,
  delAiBotPromot,
  detailAiBotPromot,
  updateAiBotPromot,
  copyAiBotPromot
} from '@/api/aibot/index'

const ids = ref<string[]>([])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    console.log(1234)
    const { currentPage, pageSize } = tableState
    const res = await getAiBotPromot({
      current: unref(currentPage),
      pageSize: unref(pageSize)
    })

    return {
      list: res.list,
      total: res.count
    }
  },
  fetchDelApi: async () => {}
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose } = tableMethods

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
    label: '预设角色',
    search: {
      hidden: true
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'tag',
    label: '标签',
    search: {
      hidden: true
    },
    colProps: {
      span: 8
    },
    formatter: (data: any) => {
      return data.tag && <ElTag type="primary">{data.tag}</ElTag>
    }
  },
  {
    field: 'promot',
    label: '提示词',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return data.promot && <ElTag type="primary">{data.promot}</ElTag>
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
              {/* <BaseButton type="primary" onClick={() => action(data.row, 'copy')}>
                复制
              </BaseButton> */}
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
  await delAiBotPromot(unref(ids).join(',')).finally(() => {
    delLoading.value = false
    getList()
  })
}

const action = async (row: any, type: string) => {
  if (type == 'copy') {
    copy(row)
    return
  }
  if (type == 'edit') {
    dialogTitle.value = '编辑'
    const data = await detailAiBotPromot(row.id)
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
  }
  actionType.value = type
  dialogVisible.value = true
}

const copy = async (row) => {
  await copyAiBotPromot(row)
  getList()
}

const writeRef = ref<ComponentRef<typeof Write>>()

const saveLoading = ref(false)

const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true
    let res = null
    if (actionType.value == 'edit') {
      res = await updateAiBotPromot(formData)
        .catch(() => {})
        .finally(() => {
          saveLoading.value = false
        })
    } else {
      res = await saveAiBotPromot({
        ...formData
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
  <ContentWrap title="预设角色" message="添加自定义角色(promot)">
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
      v-if="actionType != 'copy'"
      ref="writeRef"
      :form-schema="allSchemas.formSchema"
      :current-row="currentRow"
    />
    <template #footer>
      <BaseButton v-if="actionType != 'copy'" type="primary" :loading="saveLoading" @click="save">
        保存
      </BaseButton>
      <BaseButton @click="dialogVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>
</template>
