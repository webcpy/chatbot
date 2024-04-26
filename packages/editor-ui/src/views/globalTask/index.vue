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
import { getGlobalTask, delGlobalTask, updateGlobalTask, saveGlobalTask } from '@/api/vip'
import { omit, get } from 'lodash-es'
import { batchsend } from '@/api/vip/index'
import { useRouter } from 'vue-router'
import { useEventBus } from '@/hooks/event/useEventBus'

const { push } = useRouter()
const ids = ref<string[]>([])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getGlobalTask({
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
    field: 'label',
    label: '标签',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return data.label && <ElTag type="primary">{data.label}</ElTag>
    }
  },
  {
    field: 'customUrl',
    label: 'api地址',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return <div>{data.customUrl}</div>
    }
  },
  {
    field: 'methods',
    label: '请求方法',
    search: {
      hidden: true
    },
    formatter: (data: any) => {
      return data.methods && <ElTag type="primary">{data.methods}</ElTag>
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

const currentRow = ref<anyl>(null)

const AddAction = () => {
  push('/globalTask/add')
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
  await delGlobalTask(unref(ids).join(',')).finally(() => {
    delLoading.value = false
    getList()
  })
}

const action = async (row: any, type: string) => {
  if (type == 'edit') {
    push('/globalTask/edit/' + row.id)
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
    title="回调配置"
    message="全局回调配置
"
  >
    <!-- <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams" /> -->

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
