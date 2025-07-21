import {defineStore} from 'pinia'
import {ref} from 'vue'
import {fetchEventsApi, fetchEventByIdApi, addJudgeApi, getJudgesApi, getLeaderboardApi} from '@/api/events'
import {
    getParticipationsApi,
    createParticipationApi,
    joinTeamApi,
    deleteParticipationApi,
    leaveOrKickApi,
    transferCaptaincyApi,
    uploadTeamAvatarApi
} from '@/api/participations'
import {addScoreApi} from '@/api/scores'
import type {IEventCard, IEventDetail, Leader, Activity, Media, Participation, LeaderboardEntry} from '@/types'
export type {IEventCard, IEventDetail, Leader, Activity, Media, Participation, LeaderboardEntry};

export const useEventStore = defineStore('events', () => {
    const events = ref<IEventCard[]>([])
    const detailedEvents = ref<Record<number, IEventDetail>>({})
    const isLoadingList = ref(false)
    const isLoadingDetail = ref(false)
    const error = ref<string | null>(null)
    const participationsByEvent = ref<Record<number, Participation[]>>({});
    const judgesByEvent = ref<Record<number, any[]>>({});
    const leaderboardsByEvent = ref<Record<number, LeaderboardEntry[]>>({});

    const getEventById = (id: number) => {
        return detailedEvents.value[id] || events.value.find(event => event.id === id)
    }

    async function fetchEvents(force = false) {
        if (events.value.length > 0 && !force) return
        isLoadingList.value = true
        error.value = null
        try {
            events.value = await fetchEventsApi()
        } catch (err: any) {
            error.value = err.message
        } finally {
            isLoadingList.value = false
        }
    }

    async function fetchEventById(id: number, force = false): Promise<IEventDetail | undefined> {
        if (detailedEvents.value[id] && !force) return detailedEvents.value[id];
        isLoadingDetail.value = true
        error.value = null
        try {
            const data = await fetchEventByIdApi(id);
            detailedEvents.value[id] = data;
            return data;
        } catch (err: any) {
            error.value = err.message
            return undefined
        } finally {
            isLoadingDetail.value = false
        }
    }

    async function fetchParticipations(eventId: number, force = false) {
        if (participationsByEvent.value[eventId] && !force) return;
        try {
            participationsByEvent.value[eventId] = await getParticipationsApi(eventId);
        } catch (err: any) {
            console.error("Failed to fetch participations:", err.message);
            participationsByEvent.value[eventId] = [];
        }
    }

    async function createParticipation(eventId: number, data: {
        participant_type: 'team' | 'individual',
        team_name?: string
    }) {
        await createParticipationApi(eventId, data);
        await fetchParticipations(eventId, true);
    }

    async function joinTeam(participationId: number, eventId: number) {
        await joinTeamApi(participationId);
        await fetchParticipations(eventId, true);
    }

    async function deleteParticipation(participationId: number, eventId: number) {
        await deleteParticipationApi(participationId);
        await fetchParticipations(eventId, true);
    }

    async function leaveOrKick(participationId: number, eventId: number, userId: string) {
        await leaveOrKickApi(participationId, userId);
        await fetchParticipations(eventId, true);
    }

    async function transferCaptaincy(participationId: number, eventId: number, newCaptainId: string) {
        await transferCaptaincyApi(participationId, newCaptainId);
        await fetchParticipations(eventId, true);
    }

    async function addJudge(eventId: number, handle: string) {
        await addJudgeApi(eventId, handle);
        await fetchJudges(eventId, true); // Обновляем список судей
    }

    async function fetchJudges(eventId: number, force = false) {
        if (judgesByEvent.value[eventId] && !force) return;
        judgesByEvent.value[eventId] = await getJudgesApi(eventId);
    }

    async function addScore(
        eventId: number,
        data: { participation_id: number, activity_id: number | null, score: number, reason?: string }
    ) {
        await addScoreApi(data);
        await fetchLeaderboard(eventId, true);
    }

    async function fetchLeaderboard(eventId: number, force = false) {
        if (leaderboardsByEvent.value[eventId] && !force) return;
        try {
            leaderboardsByEvent.value[eventId] = await getLeaderboardApi(eventId);
        } catch (err: any) {
            console.error("Failed to fetch leaderboard:", err.message);
            leaderboardsByEvent.value[eventId] = [];
        }
    }

    async function uploadTeamAvatar(participationId: number, eventId: number, file: File) {
        await uploadTeamAvatarApi(participationId, file);
        await fetchParticipations(eventId, true);
    }


    return {
        events,
        isLoading: isLoadingList,
        isLoadingDetail,
        error,
        getEventById,
        fetchEvents,
        fetchEventById,
        detailedEvents,
        participationsByEvent,
        fetchParticipations,
        createParticipation,
        joinTeam,
        deleteParticipation,
        leaveOrKick,
        transferCaptaincy,
        judgesByEvent,
        addJudge,
        fetchJudges,
        addScore,
        leaderboardsByEvent,
        fetchLeaderboard,
        uploadTeamAvatar,
    }
})