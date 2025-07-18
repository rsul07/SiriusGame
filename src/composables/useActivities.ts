import { ref } from 'vue';
import type { IEventDetail } from '@/stores/events';
import { addActivityApi, updateActivityApi, deleteActivityApi } from '@/api/events';

export function useActivities() {
  const selectedEventForActivities = ref<IEventDetail | null>(null);

  function addActivityToSelected() {
    if (!selectedEventForActivities.value) return;
    if (!selectedEventForActivities.value.activities) {
      selectedEventForActivities.value.activities = [];
    }
    
    selectedEventForActivities.value.activities.push({
      id: Date.now(), // временный ID для новых активностей
      name: 'Новая активность',
      icon: '🎯',
      latitude: 0,
      longitude: 0,
      is_scoreable: false,
      is_versus: false,
      max_score: 1,
      start_dt: null,
      end_dt: null
    });
  }

  function removeActivityFromSelected(index: number) {
    if (!selectedEventForActivities.value?.activities) return;
    selectedEventForActivities.value.activities.splice(index, 1);
  }

  function isTemporaryId(id: any): boolean {
    return id && id >= Date.now() - 1000000;
  }

  async function deleteActivityById(activityId: number) {
    return await deleteActivityApi(activityId);
  }

  async function saveActivities() {
    if (!selectedEventForActivities.value?.activities) return;

    const eventId = selectedEventForActivities.value.id;
    
    for (const activity of selectedEventForActivities.value.activities) {
      const { id: activityId, ...activityData } = activity;
      
      const cleanActivityData = {
        name: activityData.name,
        icon: activityData.icon,
        latitude: activityData.latitude || 0,
        longitude: activityData.longitude || 0,
        is_scoreable: activityData.is_scoreable || false,
        is_versus: activityData.is_versus || false,
        max_score: activityData.max_score || 1,
        start_dt: activityData.start_dt,
        end_dt: activityData.end_dt
      };
      
      if (activityId && !isTemporaryId(activityId)) {
        await updateActivityApi(activityId, cleanActivityData);
      } else {
        await addActivityApi(eventId, cleanActivityData);
      }
    }
  }

  function setSelectedEventForActivities(event: IEventDetail | null) {
    selectedEventForActivities.value = event;
  }

  return {
    selectedEventForActivities,
    addActivityToSelected,
    removeActivityFromSelected,
    isTemporaryId,
    deleteActivityById,
    saveActivities,
    setSelectedEventForActivities
  };
}
