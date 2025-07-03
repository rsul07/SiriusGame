import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// --- Основные страницы сайта ---
const HomePage = () => import('@/pages/HomePage.vue')
const Register = () => import('@/pages/Register.vue')
const ConfirmEmail = () => import('@/pages/ConfirmEmail.vue')
const Events = () => import('@/pages/Events.vue')
const EventDetail = () => import('@/pages/EventDetail.vue')
const Profile = () => import('@/pages/Profile.vue')
const AppLayout = () => import('@/components/AppLayout.vue')
const NotFound = () => import('@/pages/NotFound.vue')

// --- Страницы Админ-панели ---
const AdminLayout = () => import('@/components/admin/AdminLayout.vue')
const AdminDashboard = () => import('@/pages/admin/AdminDashboard.vue')
const AdminEvents = () => import('@/pages/admin/AdminEvents.vue')
const AdminUsers = () => import('@/pages/admin/AdminUsers.vue')


const routes: Array<RouteRecordRaw> = [
  // --- Роуты публичного сайта ---
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
      { path: 'confirm-email', name: 'ConfirmEmail', component: ConfirmEmail },
    ],
  },

  // --- Роуты Админ-панели ---
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true }, // Защищаем всю админку
    children: [
      { path: '', name: 'AdminDashboard', component: AdminDashboard, meta: { title: 'Дашборд' } },
      { path: 'events', name: 'AdminEvents', component: AdminEvents, meta: { title: 'Мероприятия' } },
      { path: 'users', name: 'AdminUsers', component: AdminUsers, meta: { title: 'Пользователи' } },
    ]
  },
  
  // --- Страница 404 ---
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Глобальный навигационный гард
router.beforeEach((to, _, next) => {
  const authStore = useAuthStore();

  // Проверка прав администратора
  if (to.meta.requiresAdmin && !authStore.user?.is_superuser) {
    console.warn('Access denied: admin rights required.');
    return next({ name: 'Home' });
  }

  // Проверка обычной авторизации
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    authStore.setRedirectPath(to.fullPath);
    return next({ name: 'Profile' });
  }

  next();
})

export default router