<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { storeToRefs } from 'pinia'
import type { User } from '@/stores/auth'
import AdminEditUserModal from '@/components/admin/AdminEditUserModal.vue'
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal.vue'

const adminStore = useAdminStore()
const { users, isLoading } = storeToRefs(adminStore)

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref<User | null>(null)

const openEditModal = (user: User) => {
  selectedUser.value = JSON.parse(JSON.stringify(user));
  showEditModal.value = true;
}

const handleSaveUser = async (userData: User) => {
  await adminStore.updateUser(userData);
  showEditModal.value = false;
}

const openDeleteConfirm = (user: User) => {
  selectedUser.value = user;
  showDeleteModal.value = true;
}

const confirmDelete = async () => {
  if (selectedUser.value) {
    await adminStore.deleteUser(selectedUser.value.id);
  }
  showDeleteModal.value = false;
  selectedUser.value = null;
}

onMounted(() => {
  adminStore.fetchAdminUsers()
})
</script>

<template>
  <div>
    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="border-b bg-gray-50 text-gray-600 uppercase tracking-wider">
          <tr>
            <th class="p-4 font-semibold">Пользователь</th>
            <th class="p-4 font-semibold">Статус</th>
            <th class="p-4 font-semibold">Роль</th>
            <th class="p-4 font-semibold text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="4" class="p-4 text-center text-gray-500">Загрузка...</td>
          </tr>
          <tr v-for="user in users" :key="user.id" class="border-b hover:bg-gray-50">
            <td class="p-4">
              <div class="flex items-center gap-3">
                <img :src="user.avatarUrl" class="w-10 h-10 rounded-full object-cover">
                <div>
                  <div class="font-medium text-gray-900">{{ user.fullName }}</div>
                  <div class="text-xs text-gray-500">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td class="p-4">
              <div class="flex flex-col gap-1.5 text-xs font-semibold">
                <span v-if="user.is_verified" class="px-2 py-1 bg-green-100 text-green-800 rounded-full w-fit">Подтвержден</span>
                <span v-else class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full w-fit">Не подтвержден</span>
                <span v-if="user.is_2fa_enabled" class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full w-fit">2FA</span>
              </div>
            </td>
            <td class="p-4">
              <span v-if="user.is_superuser" class="font-bold text-primary">Администратор</span>
              <span v-else class="text-gray-600">Пользователь</span>
            </td>
            <td class="p-4 text-right">
              <button @click="openEditModal(user)" class="text-primary hover:underline font-medium text-sm">Редактировать</button>
              <button @click="openDeleteConfirm(user)" class="ml-4 text-red-600 hover:underline font-medium">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminEditUserModal
      :show="showEditModal"
      :user="selectedUser"
      @close="showEditModal = false"
      @save="handleSaveUser"
    />
    <ConfirmDeleteModal
      :show="showDeleteModal"
      title="Удалить пользователя"
      :message="`Вы уверены, что хотите удалить пользователя '${selectedUser?.fullName}'? Это действие необратимо.`"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>