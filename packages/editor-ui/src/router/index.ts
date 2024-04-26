import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { Layout, getParentLayout } from '@/utils/routerHelper'
import { useI18n } from '@/hooks/web/useI18n'
import { NO_RESET_WHITE_LIST } from '@/constants'

const { t } = useI18n()

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard/workplace',
    name: 'Root',
    meta: {
      hidden: true
    }
  },
  {
    path: '/redirect',
    component: Layout,
    name: 'Redirect',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: t('router.login'),
      noTagsView: true
    }
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFind',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  }
]

export const asyncRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/dashboard',
    component: Layout,
    redirect: '/dashboard/workplace',
    name: 'Dashboard',
    meta: {
      title: t('router.dashboard'),
      icon: 'ant-design:dashboard-filled',
      alwaysShow: true
    },
    children: [
      {
        path: 'workplace',
        component: () => import('@/views/Dashboard/Workplace.vue'),
        name: 'Workplace',
        meta: {
          title: t('router.workplace'),
          noCache: true,
          affix: true
        }
      }
    ]
  },
  {
    path: '/wechat',
    component: Layout,
    redirect: '/wechat/index',
    name: 'wechats',
    meta: {
      title: '智能配置',
      icon: 'ant-design:database-filled',
      alwaysShow: true
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/wechats/basic/index.vue'),
        name: 'basic',
        meta: {
          title: '基础配置'
        }
      },
      {
        path: 'keywords',
        component: () => import('@/views/wechats/keywords/index.vue'),
        name: 'wechatKeywords',
        // meta: {
        //   title: '简单回答'
        // },
        meta: {
          title: '简单回答'
        }
      },
      {
        path: 'keywords/:type(add|edit|detail)/:id(\\d+)?',
        component: () => import('@/views/wechats/keywords/components/operate.vue'),
        props: true,
        name: 'keywords-operate',
        title: '简单回答-编辑',
        meta: {
          title: '简单回答-编辑',
          noTagsView: true,
          noCache: true,
          hidden: true,
          showMainRoute: true,
          activeMenu: '/wechat/keywords'
        }
      },
      {
        path: 'keywordsEvent',
        component: () => import('@/views/wechats/keywordsEvent/index.vue'),
        name: 'keywordsEvent',
        meta: {
          title: '技能中心'
        }
      },
      {
        path: 'keywordsEvent/:type(add|edit|detail)/:id(\\d+)?',
        component: () => import('@/views/wechats/keywordsEvent/components/operate.vue'),
        props: true,
        name: 'keywordsEvent-operate',
        title: '简单回答-编辑',
        meta: {
          title: '简单回答-编辑',
          noTagsView: true,
          noCache: true,
          hidden: true,
          showMainRoute: true,
          activeMenu: '/wechat/keywordsEvent'
        }
      }
    ]
  },
  {
    path: '/vip',
    component: Layout,
    redirect: '/vip/userGroup',
    name: 'vip',
    meta: {
      title: '高级功能',
      icon: 'tdesign:user-vip',
      alwaysShow: true
    },
    children: [
      {
        path: 'userGroup',
        component: () => import('@/views/vip/userGroup/index.vue'),
        name: 'userGroup',
        meta: {
          title: '群发助手'
        }
      },
      {
        path: 'privateForward',
        component: () => import('@/views/vip/privateForward/index.vue'),
        name: 'privateForward',
        meta: {
          title: '转发助手'
        }
      },
      {
        path: 'roomAsync',
        component: () => import('@/views/vip/roomAsync/index.vue'),
        name: 'roomAsync',
        meta: {
          title: '多消息同步'
        }
      },
      {
        path: 'callbackEvent',
        component: () => import('@/views/vip/callbackEvent/index.vue'),
        name: 'callbackEvent',
        meta: {
          title: '回调事件'
        }
      },
      {
        path: 'callbackEvent/:type(add|edit|detail)/:id(\\d+)?',
        component: () => import('@/views/vip/callbackEvent/components/operate.vue'),
        props: true,
        name: 'callbackEvent-operate',
        title: '简单回答-编辑',
        meta: {
          title: '简单回答-编辑',
          noTagsView: true,
          noCache: true,
          hidden: true,
          showMainRoute: true,
          activeMenu: '/vip/callbackEvent'
        }
      }
      // {
      //   path: 'rssNews',
      //   component: () => import('@/views/vip/rssNews/index.vue'),
      //   name: 'rssNews',
      //   meta: {
      //     title: 'rss订阅推送'
      //   }
      // }
    ]
  },
  {
    path: '/aibot',
    component: Layout,
    redirect: '/aibot/customchat',
    name: 'aibot',
    meta: {
      title: 'GPT对话配置',
      icon: 'ant-design:dingtalk-circle-filled',
      alwaysShow: true
    },
    children: [
      {
        path: 'customchat',
        component: () => import('@/views/aibot/customchat/index.vue'),
        name: 'customchat',
        meta: {
          title: '自定义对话'
        }
      },
      {
        path: 'customchat/:type(add|edit|copy|detail)/:id(\\d+)?',
        component: () => import('@/views/aibot/customchat/components/operate.vue'),
        props: true,
        name: 'customchat-operate',
        title: '自定义对话-编辑',
        meta: {
          title: '自定义对话-编辑',
          noTagsView: true,
          noCache: true,
          hidden: true,
          showMainRoute: true,
          activeMenu: '/aibot/customchat'
        }
      },
      {
        path: 'promotstore',
        component: () => import('@/views/aibot/promotstore/index.vue'),
        name: 'promotstore',
        meta: {
          title: '预设角色'
        }
      }
    ]
  },
  {
    path: '/schedule',
    component: Layout,
    redirect: '/schedule/day',
    name: 'schedule',
    meta: {
      title: '定时任务',
      icon: 'ep:timer',
      alwaysShow: true
    },
    children: [
      {
        path: 'day',
        component: () => import('@/views/schedule/day/index.vue'),
        name: 'day',
        meta: {
          title: '每日说'
        }
      },
      {
        path: 'customContent',
        component: () => import('@/views/schedule/customContent/index.vue'),
        name: 'customContent',
        meta: {
          title: '定制内容'
        }
      },
      {
        path: 'customContent/:type(add|edit|detail)/:id(\\d+)?',
        component: () => import('@/views/schedule/customContent/components/operate.vue'),
        props: true,
        name: 'customContent-operate',
        title: '定制内容-编辑',
        meta: {
          title: '定制内容-编辑',
          noTagsView: true,
          noCache: true,
          hidden: true,
          showMainRoute: true,
          activeMenu: '/schedule/customContent'
        }
      },
      {
        path: 'countdown',
        component: () => import('@/views/schedule/countdown/index.vue'),
        name: 'countdown',
        meta: {
          title: '倒计时'
        }
      },
      {
        path: 'custom',
        component: () => import('@/views/schedule/custom/index.vue'),
        name: 'custom',
        meta: {
          title: '素材发送'
        }
      },
      {
        path: 'news',
        component: () => import('@/views/schedule/news/index.vue'),
        name: 'news',
        meta: {
          title: '新闻资讯'
        }
      }
      // {
      //   path: 'tasks',
      //   component: () => import('@/views/schedule/tasks/index.vue'),
      //   name: 'tasks',
      //   meta: {
      //     title: '提醒任务'
      //   }
      // }
    ]
  },
  {
    path: '/contact',
    component: Layout,
    name: 'contact',
    meta: {},
    children: [
      {
        path: 'list',
        component: () => import('@/views/contact/index.vue'),
        name: 'contactList',
        meta: {
          title: '好友列表',
          icon: 'tdesign:bad-laugh'
        }
      }
    ]
  },
  {
    path: '/globalTask',
    component: Layout,
    name: 'globalTask',
    meta: {},
    children: [
      {
        path: 'list',
        component: () => import('@/views/globalTask/index.vue'),
        name: 'globalTaskList',
        meta: {
          title: '回调配置',
          icon: 'ant-design:link-outlined'
        }
      },
      {
        path: ':type(add|edit|detail)/:id(\\d+)?',
        component: () => import('@/views/globalTask/components/operate.vue'),
        props: true,
        name: 'globalTask-operate',
        title: '回调配置-编辑',
        meta: {
          title: '回调配置-编辑',
          noTagsView: true,
          noCache: true,
          hidden: true,
          showMainRoute: true,
          activeMenu: '/globalTask/list'
        }
      }
    ]
  },
  {
    path: '/group',
    component: Layout,
    redirect: '/group/room',
    name: 'group',
    meta: {
      title: '群管理',
      icon: 'ant-design:usergroup-add-outlined',
      alwaysShow: true
    },
    children: [
      {
        path: 'room',
        component: () => import('@/views/group/room/index.vue'),
        name: 'room',
        meta: {
          title: '群列表'
        }
      },
      {
        path: 'index',
        component: () => import('@/views/group/index/index.vue'),
        name: 'groupIndex',
        meta: {
          title: '关键词进群'
        }
      },
      {
        path: 'index/:type(add|edit|detail)/:id(\\d+)?',
        component: () => import('@/views/group/index/components/operate.vue'),
        props: true,
        name: 'index-operate',
        title: '关键词进群-编辑',
        meta: {
          title: '关键词进群-编辑',
          noTagsView: true,
          noCache: true,
          hidden: true,
          showMainRoute: true,
          activeMenu: '/group/index'
        }
      }
    ]
  },
  {
    path: '/material',
    component: Layout,
    redirect: '/material/word',
    name: 'material',
    meta: {
      title: '素材中心',
      icon: 'ep:files',
      alwaysShow: true
    },
    children: [
      {
        path: 'word',
        component: () => import('@/views/material/word/index.vue'),
        name: 'word',
        meta: {
          title: '文字'
        }
      },
      {
        path: 'file',
        component: () => import('@/views/material/file/index.vue'),
        name: 'file',
        meta: {
          title: '文件'
        }
      },
      {
        path: 'h5',
        component: () => import('@/views/material/h5/index.vue'),
        name: 'h5',
        meta: {
          title: 'h5链接'
        }
      },
      {
        path: 'mini',
        component: () => import('@/views/material/mini/index.vue'),
        name: 'mini',
        meta: {
          title: '小程序'
        }
      }
    ]
  },
  {
    path: '/external-link',
    component: Layout,
    meta: {},
    name: 'ExternalLink',
    children: [
      {
        path: 'https://webcpy.notion.site/2ab3d969ec0141a88aa347846facc87a?pvs=4',
        name: 'DocumentLink',
        meta: {
          title: '项目文档',
          icon: 'clarity:document-solid'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes: constantRouterMap as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export const resetRouter = (): void => {
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !NO_RESET_WHITE_LIST.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
