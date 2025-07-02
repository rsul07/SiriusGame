// Этот файл теперь содержит только общий тип для пользователя в лидерборде.
// Его можно импортировать в другие сторы.

export interface Leader {
  id: number
  name: string
  score: number
  avatarUrl: string
}