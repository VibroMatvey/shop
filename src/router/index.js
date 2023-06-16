import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
      {
        path: '/products',
        name: 'products',
        component: () => import('../pages/Products.vue')
      },
      { 
        path: '/:pathMatch(.*)*',
        redirect: {'name': 'products', 'query': {'shop_id': 1}},
      },
  ],
  scrollBehavior(to, from, savedPosition) {
    return { top: 0, behavior: 'smooth' }
  },
})

export default router