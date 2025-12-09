import { createRouter, createWebHistory } from '@ionic/vue-router'
import TabsPage from '../views/TabsPage.vue'

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
        component: () => import('@/views/HomePage.vue')
      },
      {
        path: 'signalements',
        name: 'signalements',
        component: () => import('@/views/SignalementsPage.vue')
      },
      {
        path: 'reservations',
        name: 'reservations',
        component: () => import('@/views/ReservationsPage.vue')
      },
      {
        path: 'info',
        name: 'info',
        component: () => import('@/views/InfoPage.vue')
      }
    ]
  },
  {
    path: '/signalement/new',
    component: () => import('@/views/NewSignalementPage.vue')
  },
  {
    path: '/signalement/:id',
    name: 'signalement-detail',
    component: () => import('@/views/SignalementDetailPage.vue')
  },
  {
    path: '/reservation/new',
    component: () => import('@/views/NewReservationPage.vue')
  },
  {
    path: '/reservation/:id',
    name: 'reservation-detail',
    component: () => import('@/views/ReservationDetailPage.vue')
  },
  {
    path: '/info/:id',
    component: () => import('@/views/InfoDetailPage.vue')
  },
  {
    path: '/settings',
    component: () => import('@/views/SettingsPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router

