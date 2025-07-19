const DEFAULT_USER_AVATAR = '/img/icons/default-avatar.svg';
const DEFAULT_TEAM_AVATAR = '/img/icons/default-team-avatar.png';

/**
 * Преобразует относительный URL аватара в полный, абсолютный URL.
 * @param avatarUrl - Относительный URL с бэкенда (например, /media/avatars/uuid.jpg).
 * @param is_team
 * @returns Полный, готовый к использованию URL для тега <img>.
 */
export function resolveAvatarUrl(
    avatarUrl: string | null | undefined,
    is_team: boolean = false // Используем аватар юзера по умолчанию
): string {
    // 1. Если URL с бэкенда отсутствует, используем указанный defaultPath.
    if (!avatarUrl || avatarUrl == '/img/icons/default-avatar.svg' || avatarUrl == '/img/icons/default-team-avatar.png') {
        return is_team ? DEFAULT_TEAM_AVATAR : DEFAULT_USER_AVATAR
    }

    // 2. Если URL уже абсолютный (например, от стороннего сервиса), возвращаем его как есть.
    if (avatarUrl.startsWith('http')) {
        return avatarUrl;
    }

    // 3. Собираем полный URL, добавляя префикс API.
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    return `${apiUrl}${avatarUrl}`;
}