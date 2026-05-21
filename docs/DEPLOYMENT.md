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
