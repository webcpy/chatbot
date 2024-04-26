<script setup lang="ts">
import { useAppStore } from '@/store/modules/app'
import { computed } from 'vue'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('footer')

const appStore = useAppStore()

const title = computed(() => appStore.getTitle)
const toDocument = () => {
  window.open('https://webcpy.notion.site/2ab3d969ec0141a88aa347846facc87a?pvs=4')
}
</script>

<template>
  <div
    :class="prefixCls"
    class="shrink-0 text-center text-[var(--el-text-color-placeholder)] bg-[var(--app-content-bg-color)] h-[var(--app-footer-height)] leading-[var(--app-footer-height)] dark:bg-[var(--el-bg-color)]"
  >
    <span class="mr-4 cursor-pointer" @click="toDocument" target="_blank">说明文档</span>Copyright
    ©2024-present {{ title }}
  </div>
</template>
