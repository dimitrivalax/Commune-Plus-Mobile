import { createRouter, createWebHistory } from '@ionic/vue-router'
import TabsPage from '../views/tabs-page.vue'

const routes = [
  {
    path: '/',
    redirect: '/tabs/home'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/home'
      },
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home-page.vue')
      },
      {
        path: 'signalements',
        name: 'signalements',
        component: () => import('@/views/signalements-page.vue')
      },
      {
        path: 'reservations',
        name: 'reservations',
        component: () => import('@/views/reservations-page.vue')
      },
      {
        path: 'info',
        name: 'info',
        component: () => import('@/views/info-page.vue')
      },
      {
        path: 'propositions',
        name: 'propositions',
        component: () => import('@/views/propositions-page.vue')
      }
    ]
  },
  {
    path: '/proposition/new',
    component: () => import('@/views/new-proposition-page.vue')
  },
  {
    path: '/proposition/:id',
    name: 'proposition-detail',
    component: () => import('@/views/proposition-detail-page.vue')
  },
  {
    path: '/signalement/new',
    component: () => import('@/views/new-signalement-page.vue')
  },
  {
    path: '/signalement/:id',
    name: 'signalement-detail',
    component: () => import('@/views/signalement-detail-page.vue')
  },
  {
    path: '/reservation/new',
    component: () => import('@/views/new-reservation-page.vue')
  },
  {
    path: '/reservation/:id',
    name: 'reservation-detail',
    component: () => import('@/views/reservation-detail-page.vue')
  },
  {
    path: '/info/:id',
    component: () => import('@/views/info-detail-page.vue')
  },
  {
    path: '/settings',
    component: () => import('@/views/settings-page.vue')
  }
]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router

