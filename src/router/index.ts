import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const HomePage = () => import('@/pages/HomePage.vue')
const Register = () => import('@/pages/Register.vue')
const ConfirmEmail = () => import('@/pages/ConfirmEmail.vue')
const Events = () => import('@/pages/Events.vue')
const EventDetail = () => import('@/pages/EventDetail.vue')
const Profile = () => import('@/pages/Profile.vue')
const AppLayout = () => import('@/components/AppLayout.vue')
const NotFound = () => import('@/pages/NotFound.vue')

// Новые страницы-панели
const AdminPanel = () => import('@/pages/panels/AdminPanel.vue')
const OrganizerPanel = () => import('@/pages/panels/OrganizerPanel.vue')
const JudgePanel = () => import('@/pages/panels/JudgePanel.vue')

const routes: Array<RouteRecordRaw> = [
  { 
    path: '/', 
    redirect: '/app/home' 
  },
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
      { path: 'confirm-email', name: 'ConfirmEmail', component: ConfirmEmail },
      
      // Роуты для панелей управления
      { 
        path: 'admin', 
        name: 'AdminPanel', 
        component: AdminPanel, 
        meta: { requiresAuth: true, roles: ['admin'] } 
      },
      { 
        path: 'organizer', 
        name: 'OrganizerPanel', 
        component: OrganizerPanel, 
        meta: { requiresAuth: true, roles: ['admin', 'organizer'] } 
      },
      { 
        path: 'judge', 
        name: 'JudgePanel', 
        component: JudgePanel, 
        meta: { requiresAuth: true, roles: ['admin', 'judge'] } 
      },
    ],
  },
  { 
    path: '/:pathMatch(.*)*', 
    name: 'NotFound', 
    component: NotFound 
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Если роут требует авторизации
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
     authStore.setRedirectPath(to.fullPath)
     return next({ name: 'Profile' })
  }

  // Если роут требует определенной роли
  if (to.meta.roles && Array.isArray(to.meta.roles) && authStore.user) {
    if (!to.meta.roles.includes(authStore.user.role)) {
      // Если у пользователя нет нужной роли, отправляем на главную
      return next({ name: 'Home' })
    }
  }

  next()
})

export default router