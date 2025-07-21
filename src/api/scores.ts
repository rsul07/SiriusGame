import api from './index';

interface ScoreData {
    participation_id: number;
    activity_id: number | null;
    score: number;
    reason?: string;
}

export async function addScoreApi(data: ScoreData): Promise<void> {
    await api.post('/scores', data);
}