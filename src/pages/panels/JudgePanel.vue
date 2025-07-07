<script setup lang="ts">
import { reactive } from 'vue';

const form = reactive({
  eventId: null,
  teamId: null,
  points: 0,
})

const submitScore = () => {
  if (!form.eventId || !form.teamId || form.points === 0) {
    alert('Пожалуйста, заполните все поля.');
    return;
  }
  alert(`Начислено ${form.points} очков команде #${form.teamId} в мероприятии #${form.eventId}`);
  form.points = 0;
}
</script>

<template>
  <div class="p-4 md:p-6">
    <h1 class="text-3xl font-bold mb-6">Панель Судьи</h1>
    
    <div class="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 class="text-xl font-bold mb-4">Начисление очков</h2>
      
      <form @submit.prevent="submitScore" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Выберите мероприятие</label>
          <select v-model="form.eventId" class="mt-1 w-full p-2 border rounded-md bg-white">
            <option :value="null" disabled>-- Мероприятия --</option>
            <option value="1">Летний марафон кода</option>
            <option value="3">Чемпионат по робототехнике</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Выберите команду/участника</label>
          <select v-model="form.teamId" class="mt-1 w-full p-2 border rounded-md bg-white">
            <option :value="null" disabled>-- Участники --</option>
            <option value="10">CyberDudes</option>
            <option value="11">RoboFriends</option>
            <option value="1">Елена Васильева</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Количество очков</label>
          <input v-model.number="form.points" type="number" class="mt-1 w-full p-2 border rounded-md">
        </div>
        
        <div class="pt-4">
          <button type="submit" class="w-full px-4 py-2 text-white bg-primary rounded-md hover:opacity-90">Начислить</button>
        </div>
      </form>
    </div>
  </div>
</template>