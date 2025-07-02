import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const HomePage = () => import('@/pages/HomePage.vue')
const Register = () => import('@/pages/Register.vue')
const ConfirmEmail = () => import('@/pages/ConfirmEmail.vue') // Новый импорт
const Events = () => import('@/pages/Events.vue')
const EventDetail = () => import('@/pages/EventDetail.vue')
const Profile = () => import('@/pages/Profile.vue')
const AppLayout = () => import('@/components/AppLayout.vue')
const NotFound = () => import('@/pages/NotFound.vue')

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/app/home' },
  {
    path: '/app',
    component: AppLayout,
    children: [
      { path: '', redirect: '/app/home' },
      { path: 'home', name: 'Home', component: HomePage },
      { path: 'events', name: 'Events', component: Events },
      { path: 'event/:id', name: 'EventDetail', component: EventDetail },
      { path: 'profile', name: 'Profile', component: Profile },
      { path: 'register', name: 'Register', component: Register },
      { path: 'confirm-email', name: 'ConfirmEmail', component: ConfirmEmail }, // Новый роут
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router