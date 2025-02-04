# B3Notifier
<p align="center">
  <img src="/frontend/public/b3notifier.svg" alt="B3Notifier Logo" width="150">
</p>
A system built to help investors on the Brazilian stock exchange (B3), monitoring stock quotes, sending custom alerts, and notifying by email whenever good buy or sell opportunities arise!

## Table of Contents
1. [Introduction](#introduction) 
2. [Requirements](#requirements)
   1.  [Backend](#backend)
   2.  [Frontend](#frontend)
3. [Installation](#installation)
   1.  [Backend (Django + Celery + Redis)](#backend-django--celery--redis)
   2.  [Frontend (React Vite)](#frontend-react-vite)
4. [How to Use](#how-to-use)  
   1.  [Running in the Backend Folder](#running-in-the-backend-folder)
   2.  [Running Celery](#running-celery)
   3. [Running in the Frontend Folder](#running-in-the-frontend-folder)
5. [Environment Variables](#environment-variables)  

## Introduction

**B3Notifier** is a platform designed for investors on the B3 (Brazilian Stock Exchange), providing timely alerts, monitoring market quotes, and sending emails for promising buy or sell opportunities. With a **Django** backend (including **Celery** and **Redis** for asynchronous tasks and scheduling) and a **React Vite** frontend.

## Requirements

### Backend
- [**Python+**](https://www.python.org/downloads/)  
- [**Redis** (running locally or in the cloud)](https://redis.io/)  
- [**Celery**](https://docs.celeryproject.org/en/stable/)  
- [**pip**](https://pip.pypa.io/en/stable/installing/) 
- [**Resend** (email sending api)](https://resend.com/)
### Frontend
- [**Node.js 18+**](https://nodejs.org/)  
- [**pnpm** (recommended)](https://pnpm.io/installation)  


## Installation

### Backend (Django + Celery + Redis)

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/lfelipediniz/B3Notifier.git
   cd B3Notifier
   ```

2. **Create and activate a virtual environment** (recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate     
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Make sure you have a **Redis server** running locally or in the cloud. Update the broker information in your `.env` file (see [Environment Variables](#environment-variables)) if needed.

### Frontend (React Vite)

1. From the root folder, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. **Install dependencies using pnpm**:
   ```bash
   pnpm install
   ```

## How to Use

### Running in the Backend Folder

1. **Apply migrations**:
   ```bash
   python manage.py migrate
   ```

2. **Start the Django server**:
   ```bash
   python manage.py runserver
   ```
   by default, the server will be available at `http://127.0.0.1:8000`

### Running Celery

To handle asynchronous tasks (such as sending emails and scheduled alerts), you need to run a Celery worker and a Celery beat scheduler:

1. **Start the Celery worker**:
   ```bash
   celery -A backend worker -l INFO
   ```
2. **Start the Celery beat scheduler** (for periodic tasks):
   ```bash
   celery -A backend beat -l INFO
   ```

### Running in the Frontend Folder

1. **Start the development server**:
   ```bash
   pnpm dev
   ```
   by default, the React Vite app will run at `http://127.0.0.1:5173`.

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables (adjust values as needed):

```plaintext
    # Django Config
    SECRET_KEY="create_your_secret_key" # jwt
    DEBUG=True

    DJANGO_SECRET_KEY="create_your_secret_key" # django
    CELERY_BROKER_URL="redis://localhost:6379/0" # or your cloud redis url
    CELERY_RESULT_BACKEND="redis://localhost:6379/0" # or your cloud redis url

    DB_ENGINE="django.db.backends.sqlite3"
    DB_NAME="db.sqlite3"

    # JWT config - user token
    ACCESS_TOKEN_LIFETIME=60  # minutos
    REFRESH_TOKEN_LIFETIME=1440  # minutos

    # CORS config # IMPORTANT!
    CORS_ALLOW_ALL_ORIGINS=True
    CORS_ALLOW_CREDENTIALS=True

    RESEND_API_KEY=your_resend_key
```

Create `.env` in the `frontend` directory with the following variables (adjust values as needed):
```plaintext
VITE_API_BASE_URL=http://127.0.0.1:8000/api # or your cloud api key
```

--- 
**Happy Trading!** 🚀  
Made with ❤️ by [@lfelipediniz](https://www.linkedin.com/in/lfelipediniz/)
