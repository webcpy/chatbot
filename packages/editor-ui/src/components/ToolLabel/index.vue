<template>
  <div class="flex">
    {{ label }}
    <el-tooltip :content="tooltip" effect="dark" placement="top-start">
      <div class="flex items-center">
        <icon class="ml-5px" icon="ant-design:info-circle-filled" />
      </div>
    </el-tooltip>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { ElCard, ElTooltip } from 'element-plus'

export default defineComponent({
  components: {
    ElTooltip
  },
  props: {
    label: {
      type: String,
      required: true
    },
    tooltip: {
      type: String,
      default: ''
    }
  }
})
</script>
