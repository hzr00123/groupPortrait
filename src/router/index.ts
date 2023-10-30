import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Layout from '@/components/Layout/index.vue'
const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "LoginPage",
    meta: {
      title: "登录"
    },
    component: () => import("@/pages/login.vue"),
  },
  {
    path: "/",
    name: "group-layout",
    meta: {
      title: "layout"
    },
    component: Layout,
    redirect: '/student-portrait',
    children: [
      {
        path: "/student-portrait",
        name: "student-portrait",
        meta: {
          title: "学生群像",
          icon: 'portrait-icon'
        },
        component: () => import('@/pages/student-portrait/index.vue')
      },
      {
        path: "/group-attention",
        name: "group-attention",
        meta: {
          title: "群体关注",
          icon: 'attention-icon'
        },
        redirect: '/attention-group',
        children: [
          {
            path: "/attention-group",
            name: "attention-group",
            meta: {
              title: "群体关注"
            },
            component: () => import('@/pages/attention-group/index.vue')
          },
          {
            path: "/emphasis-list",
            name: "emphasis-list",
            meta: {
              title: "重点名单"
            },
            component: () => import('@/pages/emphasis-list/index.vue')
          },
          {
            path: "/custom-crowd",
            name: "custom-crowd",
            meta: {
              title: "新建自定义人群",
              hidden: true,
              pName: 'attention-group'
            },
            component: () => import('@/pages/custom-crowd/index.vue')
          },
          {
            path: "/edit-beforehand-crowd",
            name: "edit-beforehand-crowd",
            meta: {
              title: "编辑预置人群",
              hidden: true,
              pName: 'attention-group'
            },
            component: () => import('@/pages/custom-crowd/index.vue')
          },
          {
            path: "/edit-custom-crowd",
            name: "edit-custom-crowd",
            meta: {
              title: "编辑自定义人群",
              hidden: true,
              pName: 'attention-group'
            },
            component: () => import('@/pages/custom-crowd/index.vue')
          }
        ]
      },
      {
        path: "/behavior-locus",
        name: "behavior-locus",
        meta: {
          title: "行为轨迹",
          icon: 'locus-icon'
        },
        redirect: '/building-usage',
        children: [
          {
            path: "/group-trajectory",
            name: "group-trajectory",
            meta: {
              title: "群体行为轨迹"
            },
            component: () => import('@/pages/group-trajectory/index.vue')

          },
          // {
          //   path: "/building-usage",
          //   name: "building-usage",
          //   meta: {
          //     title: "楼宇使用情况"
          //   },
          //   component: () => import('@/pages/building-usage/index.vue')
          // },
          {
            path: "/building-usage",
            name: "building-usage",
            meta: {
              title: "楼宇使用情况"
            },
            component: () => import('@/pages/building-usage/index.vue')
          },
          {
            path: "/behavior-trajectory-compare",
            name: "behavior-trajectory-compare",
            meta: {
              title: "行为轨迹对比"
            },
            component: () => import('@/pages/behavior-trajectory-compare/index.vue')
          },
          {
            path: "/intelligent-recommendation",
            name: "intelligent-recommendation",
            meta: {
              title: "智能推荐"
            },
            component: () => import('@/pages/intelligent-recommendation/index.vue')
          },
          {
            path: "/departure-destination",
            name: "departure-destination",
            meta: {
              title: "离校去向"
            },
            component: () => import('@/pages/departure-destination/index.vue')
          },
          {
            path: "/not-school",
            name: "not-school",
            meta: {
              title: "不在校情况"
            },
            component: () => import('@/pages/not-school/index.vue')
          },
        ]
      },
      {
        path: "/group-contrast",
        name: "group-contrast",
        meta: {
          title: "群体对比",
          icon: 'contrast-icon'
        },
        component: () => import('@/pages/group-contrast/index')
      },
      {
        path: "/label-management",
        name: "label-management",
        meta: {
          title: "标签管理",
          icon: 'label-icon'
        },
        redirect: '/label-management',
        children: [
          {
            path: "/label-management",
            name: "label-management",
            meta: {
              title: "标签管理"
            },
            component: () => import('@/pages/label-management/index.vue')
          },
          {
            path: '/label-seting',
            name: 'label-seting',
            component: () => import('@/pages/label-seting/index.vue'),
            meta:{
              title: '新建标签',
              hidden: true,
              pName: 'label-management'
            },
          },
          {
            path: '/label-seting-edit',
            name: 'label-seting-edit',
            component: () => import('@/pages/label-seting/index.vue'),
            meta:{
              title: '编辑标签',
              hidden: true,
              pName: 'label-management'
            },
          },
        ],
      },
      {
        path: "/advanced-setting",
        name: "advanced-setting",
        meta: {
          title: "高级设置",
          icon: 'setting-icon'
        },
        // component: () => import('@/pages/advanced-setting/index.vue'),
        redirect: '/alert-rule-settings',
        children: [
          {
            path: "/black-list",
            name: "black-list",
            meta: {
              title: "黑名单设置"
            },
            component: () => import('@/pages/black-list/index.vue')
          },
          {
            path: "/white-list",
            name: "white-list",
            meta: {
              title: "白名单设置"
            },
            component: () => import('@/pages/white-list/index.vue')
          },
          {
            path: "/white-add",
            name: "white-add",
            meta: {
              title: "新增白名单",
              hidden: true,
              pName: 'white-list'
            },
            component: () => import('@/pages/white-or-black-add/index.vue')
          },
          {
            path: "/white-edit",
            name: "white-edit",
            meta: {
              title: "编辑白名单",
              hidden: true,
              pName: 'white-list'
            },
            component: () => import('@/pages/white-or-black-add/index.vue')
          },
          {
            path: "/black-add",
            name: "black-add",
            meta: {
              title: "新增黑名单",
              hidden: true,
              pName: 'black-list'
            },
            component: () => import('@/pages/white-or-black-add/index.vue')
          },
          {
            path: "/black-edit",
            name: "black-edit",
            meta: {
              title: "编辑黑名单",
              hidden: true,
              pName: 'black-list'
            },
            component: () => import('@/pages/white-or-black-add/index.vue')
          },
          {
            path: "/black-white-query",
            name: "black-white-query",
            meta: {
              title: "黑白名单查询"
            },
            component: () => import('@/pages/black-white-query/index.vue')
          },
          {
            path: "/exclusion-settings",
            name: "exclusion-settings",
            meta: {
              title: "时间排除设置"
            },
            component: () => import('@/pages/exclusion-settings/index.vue')
          },
          {
            path: "/alert-rule-settings",
            name: "alert-rule-settings",
            meta: {
              title: "预警规则设置"
            },
            component: () => import('@/pages/alert-rule-settings/index.vue')
          },
          {
            path: "/alert-rule-add",
            name: "alert-rule-add",
            meta: {
              title: "新增预警策略",
              hidden: true,
            },
            component: () => import('@/pages/alert-rule-form/index.vue')
          },
          {
            path: "/alert-rule-edit",
            name: "alert-rule-edit",
            meta: {
              title: "编辑预警策略",
              hidden: true,
            },
            component: () => import('@/pages/alert-rule-form/index.vue')
          },
        ]
      },
      {
        path: "/404",
        name: "notfount",
        component: () => import('@/pages/NotFound.vue')
      },
      {
        path: "/:pathMath(.*)",
        redirect: "/404"
      },
    ]
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
export default router;
