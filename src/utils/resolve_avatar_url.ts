export function resolveAvatarUrl(avatarUrl: string | null | undefined): string {
    // Если URL не существует, возвращаем дефолтный аватар
    if (!avatarUrl) {
        return '/img/icons/default-avatar.svg';
    }

    // Если URL уже абсолютный (например, от стороннего провайдера), возвращаем как есть
    if (avatarUrl.startsWith('http')) {
        return avatarUrl;
    }

    // Получаем базовый URL API из переменных окружения
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    // Соединяем базовый URL API с относительным путем аватара
    // Пример: "http://localhost:8000/api" + "/media/avatars/uuid.jpg"
    return `${apiUrl}${avatarUrl}`;
}