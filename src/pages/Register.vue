<script setup lang="ts">
import {reactive, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  birthday: '',
  gender: '' as 'male' | 'female',
})

const error = ref<string | null>(null)
const isLoading = ref(false)

const handleRegister = async () => {
  error.value = null;

  if (form.password !== form.passwordConfirm) {
    error.value = 'Пароли не совпадают.'
    return
  }
  if (form.password.length < 6) {
    error.value = 'Пароль должен содержать не менее 6 символов.'
    return
  }

  if (!form.gender) {
    error.value = 'Пожалуйста, выберите ваш пол.'
    return
  }

  isLoading.value = true

  try {
    await authStore.register(form)
    await router.push({name: 'ConfirmEmail'});
  } catch (err: any) {
    if (err.response && err.response.status === 409) {
      error.value = 'Пользователь с таким email или телефоном уже существует.'
    } else {
      error.value = 'Произошла ошибка при регистрации.'
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="p-4 max-w-md mx-auto">
    <div class="bg-white p-6 md:p-8 rounded-lg shadow-md my-4">
      <h1 class="text-2xl font-bold text-center mb-6">Создание аккаунта</h1>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="fullName" class="block text-sm font-medium text-gray-700">ФИО</label>
          <input v-model="form.fullName" type="text" id="fullName" required autocomplete="name"
                 class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="form.email" type="email" id="email" required autocomplete="email"
                 class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700">Номер телефона</label>
          <input v-model="form.phone" type="tel" id="phone" required autocomplete="tel" placeholder="+7 (999) 999-99-99"
                 class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Пароль</label>
          <input v-model="form.password" type="password" id="password" required minlength="6"
                 autocomplete="new-password"
                 class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
        </div>
        <div>
          <label for="passwordConfirm" class="block text-sm font-medium text-gray-700">Подтвердите пароль</label>
          <input v-model="form.passwordConfirm" type="password" id="passwordConfirm" required
                 autocomplete="new-password"
                 class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="birthday" class="block text-sm font-medium text-gray-700">Дата рождения</label>
            <input v-model="form.birthday" type="date" id="birthday" required
                   class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md">
          </div>
          <div>
            <label for="gender" class="block text-sm font-medium text-gray-700">Пол</label>
            <select v-model="form.gender" id="gender" required
                    class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
              <option disabled value="">Выберите...</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>
        </div>

        <p v-if="error" class="text-sm text-red-600 pt-2">{{ error }}</p>

        <button type="submit" :disabled="isLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed">
          {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>
    </div>
  </div>
</template>