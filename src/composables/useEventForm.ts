import { ref, reactive, computed } from 'vue';
import type { IEventDetail } from '@/stores/events';

export function useEventForm() {
  const form = reactive<{ data: Partial<IEventDetail> | null }>({ data: null });
  const isCreatingNew = ref(false);

  const isTeam = computed({
    get: () => !!form.data?.is_team,
    set: (val: boolean) => {
      if (form.data) {
        form.data.is_team = val;
        if (!val) {
          form.data.max_teams = undefined;
        }
      }
    }
  });

  function validateEventForm(): string | null {
    if (!form.data) return "Нет данных для сохранения.";
    if (!form.data.title || form.data.title.trim() === '') return 'Название мероприятия не может быть пустым!';
    if (!form.data.date || !/^\d{2}\.\d{2}\.\d{4}$/.test(form.data.date)) return 'Укажите корректную дату в формате ДД.ММ.ГГГГ!';
    if (!form.data.start_time || !/^\d{2}:\d{2}(:\d{2})?$/.test(form.data.start_time)) return 'Укажите корректное время начала в формате ЧЧ:ММ!';
    if (!form.data.end_time || !/^\d{2}:\d{2}(:\d{2})?$/.test(form.data.end_time)) return 'Укажите корректное время окончания в формате ЧЧ:ММ!';
    if (form.data.start_time >= form.data.end_time) return 'Время начала должно быть раньше времени окончания!';
    if (form.data.is_team && (!form.data.max_teams || form.data.max_teams <= 0)) return 'Для командного мероприятия укажите максимальное число команд!';
    return null;
  }

  function createNewEventForm() {
    form.data = {
      title: 'Новое мероприятие',
      description: 'Описание мероприятия (сюда можно добавить правила, дополнительные условия, и т.д.)',
      date: new Date().toLocaleDateString('ru-RU'),
      start_time: '09:00',
      end_time: '23:00',
      is_team: false,
      max_members: 1,
    };
    isCreatingNew.value = true;
  }

  function setFormData(eventData: IEventDetail, isNew: boolean = false) {
    form.data = JSON.parse(JSON.stringify(eventData));
    isCreatingNew.value = isNew;
  }

  function resetForm() {
    form.data = null;
    isCreatingNew.value = false;
  }

  return {
    form,
    isCreatingNew,
    isTeam,
    validateEventForm,
    createNewEventForm,
    setFormData,
    resetForm
  };
}
