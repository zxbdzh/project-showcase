import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Layout from '@/components/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/Home.vue'),
        },
        {
          path: 'projects',
          name: 'projects',
          component: () => import('../views/Projects.vue'),
        },
        {
          path: 'project/:id',
          name: 'project-detail',
          component: () => import('../views/ProjectDetail.vue'),
          meta: { requiresAuth: false },
        },
        {
          path: 'admin',
          name: 'admin',
          component: () => import('@/views/Admin.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: 'admin/projects',
          name: 'admin-projects',
          component: () => import('@/views/admin/Projects.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: 'admin/categories',
          name: 'admin-categories',
          component: () => import('@/views/admin/Categories.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: 'admin/tags',
          name: 'admin-tags',
          component: () => import('@/views/admin/Tags.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: 'admin/skills',
          name: 'admin-skills',
          component: () => import('@/views/admin/Skills.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: 'admin/social-links',
          name: 'admin-social-links',
          component: () => import('@/views/admin/SocialLinks.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        // 其他路由将在对应页面创建后启用
        // {
        //   path: 'profile',
        //   name: 'profile',
        //   component: () => import('../views/Profile.vue'),
        //   meta: { requiresAuth: true },
        // },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/',
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    const auth = useAuth()

    if (!auth.isAuthenticated.value) {
      // 未登录，重定向到首页并显示登录模态框
      next({ name: 'home' })
      return
    }

    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin) {
      if (!auth.isAdmin.value) {
        // 权限不足，重定向到首页
        next({ name: 'home' })
        return
      }
    }
  }

  next()
})

export default router
