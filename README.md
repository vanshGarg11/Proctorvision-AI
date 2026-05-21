# ProctorVision AI - Smart Online Exam Proctoring System

Full-stack final year project for secure online exams with AI-assisted webcam monitoring, browser activity tracking, warning automation, admin reporting, analytics, and exam result export.

## Tech Stack

- Frontend: React.js, Tailwind CSS, Axios, React Router, Recharts, jsPDF
- Backend: Flask, Flask-CORS, Flask-SQLAlchemy, PyJWT, OpenCV
- Database: SQLite by default, MySQL-ready through `DATABASE_URL`
- AI: OpenCV Haar Cascade face detection

## Project Structure

```text
ProctorVision-AI/
  backend/
    app.py
    config.py
    requirements.txt
    database/schema.sql
    models/
    routes/
    services/
    static/screenshots/
    templates/
  frontend/
    package.json
    index.html
    src/
      components/
      context/
      pages/
      services/
      utils/
  docs/
    API_ROUTES.md
    ARCHITECTURE.md
    DEPLOYMENT.md
```

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The API runs on `http://localhost:5000`.

Seed users are created automatically:

- Admin: `admin@proctorvision.local` / `Admin@123`
- Student: `student@proctorvision.local` / `Student@123`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## Core Workflow

1. Student signs up or logs in.
2. Student views available exams from the dashboard.
3. Student starts an exam and grants webcam permissions.
4. The exam page enforces fullscreen, blocks context menu/copy/paste shortcuts, watches tab visibility, and sends webcam frames to the backend.
5. Backend analyzes frames using OpenCV face detection.
6. Suspicious events create warnings and cheating logs with optional screenshots.
7. Exam auto-submits on timer completion or when maximum warnings are reached.
8. Admin reviews exams, questions, results, warning history, screenshots, and analytics.

## AI Detection Logic

The backend decodes base64 webcam frames, converts them to grayscale, and runs Haar Cascade face detection.

- 0 faces: `NO_FACE`
- 1 face: `NORMAL`
- 2+ faces: `MULTIPLE_FACES`

Confidence is estimated from detection count and bounding box size. Suspicious events are persisted as warnings and cheating logs.

## Browser Monitoring Logic

- Tab switching: React listens to `visibilitychange` and records a warning when the document becomes hidden.
- Fullscreen: The exam must enter fullscreen before starting. Leaving fullscreen triggers warnings.
- Minimize detection: Browser minimize usually fires `visibilitychange` and/or blur events.
- Right click and copy-paste shortcuts: The exam page blocks context menu and common copy/cut/paste/devtools key combinations.

## Deliverables Included

- Full source code
- Requirements and package manifests
- SQL schema
- REST API route documentation
- Architecture documentation
- Deployment steps
- GitHub-ready folder structure

## Notes

This project is production-structured for academic demonstration. For real deployments, add HTTPS, camera consent policy, stronger identity verification, rate limiting, secure JWT secret management, background task processing, object storage for screenshots, and human review policies.

## Deploy On Render

This repo includes `render.yaml`.

1. Push the project to GitHub.
2. In Render, create a new Blueprint from the GitHub repo.
3. Deploy both services.
4. Set frontend `VITE_API_URL` to your backend URL plus `/api`.

Example:

```text
VITE_API_URL=https://proctorvision-ai-backend.onrender.com/api
```

## Permanent Free Backend Option

If Render asks for payment, deploy the Flask backend on PythonAnywhere and keep the React frontend on Netlify.

Guide:

```text
docs/PYTHONANYWHERE_DEPLOYMENT.md
```
