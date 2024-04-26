import { Icon } from '@/components/Icon'
import ElTooltip from 'element-plus' // 导入 ElTooltip 组件

import { ref, h } from 'vue'

const useToolLabel = () => {
  const renderToolLabel = (label, tooltip = '') => {
    return h('div', [
      h(
        ElTooltip,
        {
          content: tooltip,
          effect: 'dark',
          placement: 'right'
        },
        {
          default: () => [
            h('div', { class: 'flex items-center' }, [
              label,
              h(Icon, { class: 'ml-5px', icon: 'ant-design:zoom-in-outlined' })
            ])
          ]
        }
      )
    ])
  }

  return renderToolLabel
}

export default useToolLabel
