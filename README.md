# Full-Stack Monorepo: Vue 3 + FastAPI

Это полноценный стартовый шаблон (boilerplate) для full-stack приложения, построенного на современном стеке: **Vue 3** для фронтенда и **FastAPI** для бэкенда. Проект обернут в Docker для легкого развертывания и разработки.

## 🚀 Основные технологии

### Frontend (`/frontend`)
- **Framework**: [Vue 3](https://vuejs.org/) с Composition API и `<script setup>`
- **Сборщик**: [Vite](https://vitejs.dev/) — сверхбыстрая сборка и Hot Module Replacement (HMR)
- **Язык**: [TypeScript](https://www.typescriptlang.org/)
- **Роутинг**: [Vue Router 4](https://router.vuejs.org/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Стилизация**: [TailwindCSS](https://tailwindcss.com/) с JIT-компилятором и кастомной темой
- **UI/UX**: Mobile-first, адаптивный дизайн
- **Тестирование**: [Vitest](https://vitest.dev/) + [Vue Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)
- **Качество кода**: ESLint, Prettier, Husky (для pre-commit хуков)
- **Мобильная сборка**: [Capacitor](https://capacitorjs.com/) для создания нативных Android/iOS приложений

### Backend (`/backend`)
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Язык**: Python 3.11+
- **База данных**: PostgreSQL
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (асинхронный подход с `asyncpg`)
- **Миграции**: [Alembic](https://alembic.sqlalchemy.org/)
- **Аутентификация**: Собственная реализация на основе JWT (JSON Web Tokens)
- **Валидация**: Pydantic

### Инфраструктура (`/`)
- **Контейнеризация**: Docker и Docker Compose
- **Веб-сервер (Frontend)**: Nginx (внутри Docker-контейнера)
- **WSGI-сервер (Backend)**: Uvicorn

## ✨ Ключевые фичи

- **Monorepo**: Фронтенд и бэкенд находятся в одном репозитории, но изолированы в своих папках.
- **Docker-first**: Весь проект запускается одной командой `docker-compose up`.
- **Готовая аутентификация**: Регистрация, логин (с 2FA), JWT-токены.
- **Адаптивный UI**: Отлично выглядит как на мобильных устройствах, так и на десктопе.
- **Продуманная структура**: Четкое разделение на компоненты, страницы, сторы и сервисы.
- **Готовые рабочие процессы**: Настроенные линтеры, форматтеры и pre-commit хуки для поддержания высокого качества кода.

## 🏁 Быстрый старт

Для запуска проекта вам понадобится установленный **Docker** и **Docker Compose**.

1.  **Клонируйте репозиторий:**
    ```bash
    git clone https://your-repository-url.git
    cd your-project-name
    ```

2.  **Создайте файл окружения:**
    Скопируйте пример файла `.env.sample` в новый файл `.env`.
    ```bash
    cp .env.sample .env
    ```
    *Для разработки стандартные значения подходят. Для продакшена обязательно смените `SECRET_KEY`.*

3.  **Соберите и запустите контейнеры:**
    Эта команда скачает образы, установит все зависимости, запустит базу данных, применит миграции и поднимет серверы для фронтенда и бэкенда.
    ```bash
    docker-compose up --build
    ```

    *Флаг `--build` нужен при первом запуске и после внесения изменений в `Dockerfile` или `requirements.txt`/`package.json`.*

4.  **Готово! Приложение доступно:**
    -   **Фронтенд**: [http://localhost:5173](http://localhost:5173) (для разработки с HMR)
    -   **Бэкенд API**: [http://localhost:8000](http://localhost:8000)
    -   **Документация API (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
    -   **База данных PostgreSQL**: `localhost:5432` (доступна для подключения извне, если нужно)

Чтобы остановить все сервисы, нажмите `Ctrl+C` в терминале и выполните:
```bash
docker-compose down