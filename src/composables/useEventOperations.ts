import { useEventStore } from '@/stores/events';
import { 
  createEventApi, 
  updateEventApi, 
  addEventMediaApi, 
  deleteEventMediaApi, 
  deleteEventApi 
} from '@/api/events';
import type { IEventDetail } from '@/stores/events';

export function useEventOperations() {
  const eventStore = useEventStore();

  async function createEvent(eventData: Partial<IEventDetail>): Promise<number> {
    const processedData = processEventData(eventData);
    return await createEventApi(processedData);
  }

  async function updateEvent(eventId: number, eventData: Partial<IEventDetail>): Promise<void> {
    const processedData = processEventData(eventData);
    await updateEventApi(eventId, processedData);
  }

  async function deleteEvent(eventId: number): Promise<void> {
    await deleteEventApi(eventId);
  }

  async function handleEventMedia(eventId: number, existingMedia: any[] = []): Promise<void> {
    // Удаляем старые медиа
    for (const mediaItem of existingMedia) {
      try {
        await deleteEventMediaApi(eventId, mediaItem.id);
      } catch (error) {
        console.warn('Не удалось удалить старое медиа:', mediaItem.id);
      }
    }

    // Добавляем новые медиа
    const mediaTypes: Array<'image' | 'document'> = ['image', 'document'];
    for (const mediaType of mediaTypes) {
      const urls = (document.querySelector(`textarea[data-media-type="${mediaType}"]`) as HTMLTextAreaElement)?.value
        .split('\n')
        .filter(url => url.trim());

      for (let i = 0; i < urls.length; i++) {
        try {
          const url = urls[i].trim();
          const fileName = url.split('/').pop() || `${mediaType}_${i + 1}`;
          await addEventMediaApi(eventId, {
            url: url,
            media_type: mediaType,
            name: fileName,
            order: i
          });
        } catch (error) {
          console.warn(`Не удалось добавить ${mediaType}:`, urls[i]);
        }
      }
    }
  }

  function processEventData(eventData: Partial<IEventDetail>) {
    const { media, leaderboard, activities, id, state, preview_url, ...processedData } = eventData;

    if (processedData.date) {
      processedData.date = processedData.date.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1');
    }
    
    if (processedData.max_teams == undefined) {
      delete processedData.max_teams;
    }

    return processedData;
  }

  async function refreshEventData(eventId?: number): Promise<void> {
    await eventStore.fetchEvents(true);
    if (eventId) {
      await eventStore.fetchEventById(eventId, true);
    }
  }

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    handleEventMedia,
    processEventData,
    refreshEventData
  };
}
