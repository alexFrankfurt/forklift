# Django Loader Directory - Справочник погрузчиков

Веб-приложение для учёта погрузчиков и их простоев.

## Демо-доступ

```
Username: admin
Password: admin
```

## Возможности

- ✅ Справочник погрузчиков (марка, номер, грузоподъёмность)
- ✅ Учёт простоев (начало, окончание, причина)
- ✅ Поиск по номеру погрузчика
- ✅ Фильтрация по статусу "Активен"
- ✅ Тёмная/светлая тема (авто-определение системной)
- ✅ Адаптивный дизайн
- ✅ REST API

## Деплой на Render

### Вариант 1: Автоматически (рекомендуется)

1. Создайте новый репозиторий на GitHub и запушьте код
2. Зарегистрируйтесь на [render.com](https://render.com)
3. Нажмите "New +" → "Blueprint"
4. Подключите репозиторий GitHub
5. Render автоматически развернёт приложение из `render.yaml`

### Вариант 2: Вручную

1. Создайте **Web Service** на Render
2. Подключите репозиторий
3. Настройки:
   - **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command:** `gunicorn config.wsgi:application`
4. Добавьте переменные окружения:
   ```
   SECRET_KEY=<ваш-секретный-ключ>
   DEBUG=False
   ALLOWED_HOSTS=*
   ```
5. Создайте **PostgreSQL** базу данных (Render → Databases)
6. Добавьте переменные окружения из базы данных:
   ```
   DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
   ```
7. Примените миграции:
   ```bash
   render exec python manage.py migrate
   ```

## Локальная разработка

```bash
# Установка зависимостей
pip install -r requirements.txt

# Создание .env файла
cp .env.example .env

# Запуск PostgreSQL (локально)
# Создайте базу данных: bright_solutions

# Миграции
python manage.py migrate

# Запуск сервера
python manage.py runserver
```

## API Endpoints

- `GET/POST /api/loaders/` - список/создание погрузчиков
- `GET/PUT/PATCH/DELETE /api/loaders/<id>/` - операции с погрузчиком
- `GET/POST /api/downtimes/` - список/создание простоев
- `GET/PUT/PATCH/DELETE /api/downtimes/<id>/` - операции с простоем

## Технологии

- **Backend:** Django 4.2, Django REST Framework
- **Database:** PostgreSQL
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Deployment:** Render (Gunicorn + WhiteNoise)

## Структура проекта

```
Project/
├── config/              # Настройки Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── loader/              # Приложение погрузчиков
│   ├── models.py        # Модели Loader, Downtime
│   ├── views.py         # Views и API
│   ├── serializers.py   # DRF serializers
│   ├── urls.py          # URL маршруты
│   ├── api_urls.py      # API routes
│   ├── admin.py         # Django admin
│   ├── migrations/      # Миграции БД
│   ├── static/          # Статические файлы
│   │   └── loader/
│   │       ├── styles.css
│   │       └── app.js
│   └── templates/       # HTML шаблоны
│       └── loader/
│           ├── loader_list.html
│           └── login.html
├── manage.py
├── requirements.txt
├── render.yaml          # Конфигурация Render
└── .env                 # Переменные окружения
```

## Лицензия

MIT
