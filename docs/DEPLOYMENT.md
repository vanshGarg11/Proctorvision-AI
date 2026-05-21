# Deployment Guide

## Local Development

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Production Backend

1. Set environment variables:
   - `SECRET_KEY`
   - `DATABASE_URL`
   - `JWT_EXPIRY_HOURS`
2. Use a production WSGI server such as Gunicorn on Linux:

```bash
gunicorn app:app --bind 0.0.0.0:5000
```

3. Put Nginx or Apache in front of Flask.
4. Serve `/static/screenshots` from protected storage if screenshots contain sensitive data.

## Production Frontend

```bash
cd frontend
npm install
npm run build
```

Deploy `frontend/dist` to Netlify, Vercel, Nginx, Apache, or any static host. Set:

```bash
VITE_API_URL=https://your-api-domain.com/api
```

## Render Deployment

This repository includes `render.yaml` for a Render Blueprint deployment.

### Option A: Render Blueprint

1. Push this project to GitHub.
2. Open Render Dashboard.
3. Click **New +**.
4. Select **Blueprint**.
5. Connect your GitHub repository.
6. Render will detect `render.yaml`.
7. Create both services:
   - `proctorvision-ai-backend`
   - `proctorvision-ai-frontend`
8. After the backend URL is created, update frontend `VITE_API_URL` if your backend service URL is different from:

```bash
https://proctorvision-ai-backend.onrender.com/api
```

### Option B: Manual Render Setup

Create backend as **Web Service**:

```text
Root Directory: backend
Runtime: Python
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app --bind 0.0.0.0:$PORT
```

Backend environment variables:

```text
SECRET_KEY=your-long-random-secret
JWT_EXPIRY_HOURS=12
MAX_WARNINGS=5
```

Create frontend as **Static Site**:

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

Frontend environment variable:

```text
VITE_API_URL=https://your-backend-service-name.onrender.com/api
```

Add this rewrite rule for React Router:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

### Render Notes

- Free Render services can sleep after inactivity, so the first login request may take extra time.
- SQLite works for demos, but Render disk storage can be temporary unless you configure persistent disks. For a real deployment, use PostgreSQL/MySQL.
- Screenshots saved in `backend/static/screenshots` are suitable for demos only. Use cloud storage for production.

## Netlify-Only Free Demo

If you want to use Netlify for everything, this repo includes a Netlify Functions API:

```text
frontend/netlify/functions/api.js
```

Netlify settings:

```text
Base directory: frontend
Build command: npm install && npm run build
Publish directory: dist
```

No `VITE_API_URL` is required. The frontend automatically calls:

```text
/api
```

Netlify redirects `/api/*` to the serverless function.

This mode supports:

- Login/signup demo
- Student dashboard
- Exam loading/submission
- Browser warning events
- Admin overview

This mode does not support real Flask/OpenCV processing. Use the Flask backend for full AI detection.

## MySQL Option

Install a MySQL driver such as `pymysql`, then set:

```bash
DATABASE_URL=mysql+pymysql://username:password@localhost/proctorvision
```

## GitHub Submission Checklist

- Keep `.env` files out of Git.
- Include screenshots of login, student dashboard, exam page, admin dashboard, and cheating reports.
- Add a short demo video showing tab switching, no-face detection, and auto-submit.
- Document hardware requirements for webcam-based proctoring.
