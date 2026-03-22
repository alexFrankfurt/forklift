# Django Loader API

A Django REST Framework application for managing loaders/forklifts with PostgreSQL storage.

## Features

- Store loader information (brand, number, capacity)
- List all loaders
- Retrieve, update, and delete loaders
- Capacity with 3 decimal places precision
- Django Admin integration

## Setup

### Prerequisites

- Python 3.8+
- PostgreSQL 12+

### Installation

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure PostgreSQL:**
   
   Create a PostgreSQL database:
   ```bash
   psql -U postgres
   CREATE DATABASE bright_solutions;
   \q
   ```

4. **Update environment variables:**
   
   Edit `.env` file with your database credentials:
   ```
   DB_NAME=bright_solutions
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```

5. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the development server:**
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Create a Loader
```
POST /api/loaders/
Content-Type: application/json

{
  "brand": "Toyota",
  "number": "LT-001",
  "capacity": 2.500
}
```

### List All Loaders
```
GET /api/loaders/
```

### Get Loader Details
```
GET /api/loaders/<id>/
```

### Update Loader
```
PUT /api/loaders/<id>/
PATCH /api/loaders/<id>/
```

### Delete Loader
```
DELETE /api/loaders/<id>/
```

## Example Usage

### Using cURL to create a loader:
```bash
curl -X POST http://localhost:8000/api/loaders/ \
  -H "Content-Type: application/json" \
  -d '{"brand": "Toyota", "number": "LT-001", "capacity": 2.500}'
```

### Using Python requests:
```python
import requests

url = 'http://localhost:8000/api/loaders/'
data = {'brand': 'Toyota', 'number': 'LT-001', 'capacity': 2.500}

response = requests.post(url, json=data)
print(response.json())
```

## Admin Panel

Access the Django admin at `http://localhost:8000/admin/` to manage loaders through the UI.

## Project Structure

```
Project/
├── config/              # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── loader/              # Loader app
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   └── admin.py
├── .env                 # Environment variables
├── manage.py
└── requirements.txt
```

## Model Fields

| Field | Type | Description |
|-------|------|-------------|
| brand | CharField(255) | Марка погрузчика (Loader brand) |
| number | CharField(100) | Номер погрузчика (Loader number) |
| capacity | DecimalField(10, 3) | Грузоподъемность (Load capacity, max 3 decimal places) |
