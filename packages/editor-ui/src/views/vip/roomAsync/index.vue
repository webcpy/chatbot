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
  getRoomAsyncList,
  delRoomAsyncList,
  detailRoomAsyncList,
  updateRoomAsyncList,
  saveRoomAsyncList
} from '@/api/vip/index'
import { useClipboard } from '@/hooks/web/useClipboard'
import { omit } from 'lodash-es'
const { copy } = useClipboard()

const ids = ref<string[]>([])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getRoomAsyncList({
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

const { t } = useI18n()

const modeList = ['', '一对多模式', '多对一模式', '多对多模式']

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
    field: 'model',
    label: '同步模式',
    search: {
      hidden: true
    },
    detail: {
      span: 24
    },
    formatter: (data: any) => {
      return <ElTag type="primary">{modeList[data.model]}</ElTag>
    }
  },
  {
    field: 'ones',
    label: '主群',
    search: {
      hidden: false
    },
    colProps: {
      span: 8
    },
    formatter: (data: any) => {
      return <ElTag type="primary">{data.ones?.name}</ElTag>
    }
  },
  {
    field: 'many',
    label: '子群',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return (
        <>
          {(data.manys || []).map((it) => {
            return (
              <ElTag class="mr-2" type="primary">
                {it?.name}
              </ElTag>
            )
          })}
        </>
      )
    }
  },
  {
    field: 'forward',
    label: '同步内容',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return <ElTag type="primary">{data.forward == 1 ? '只转发文字' : '转发文字和图片'}</ElTag>
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
  await delRoomAsyncList(unref(ids).join(',')).finally(() => {
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
    const data = await detailRoomAsyncList(row.id)
    actionType.value = type
    currentRow.value = row
    if (row.type != 'contact') {
      currentRow.value.roomList = row.groups
    } else {
      currentRow.value.friendList = row.groups
    }
    nextTick(() => {
      const write = unref(writeRef)
      write.change(row.model)
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
      res = await updateRoomAsyncList(
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
      res = await saveRoomAsyncList({
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
  <ContentWrap title="多群消息同步">
    <div class="text-sm leading-2">
      <p
        >多个群消息同步，打破群好友上线，跨群交流不是问题，运营人员必备，摆脱在群与群之间的切换。懂的人自然懂，不懂得说明你就没有这个需求了。三种模式可以组合使用
      </p>
      <p>一对多模式：一个主群发布消息，所有子群都能同步收到主群发的消息 </p>
      <p>多对一模式：所有子群的消息，都将同步到主群中 </p>
      <p>多对多模式：所有子群的消息都将相互同步，打破群与群的壁垒 </p>
      <p>注意 </p>
      <p>1、群名不要带特殊字符或者符号，否则可能同步失败 </p>
      <p>2、如果群名重复可能会导致消息同步错群，所以保证群名不会冲突 </p>
      <p
        >3、如果群名比较长，建议最后加上一个空格分隔开，小助手会自动取简称，例如："微语智能管家交流群
        home 1"，小助手转发的时候只会用简称【home 1】
      </p>
    </div>

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
