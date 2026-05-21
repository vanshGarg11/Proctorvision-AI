# API Routes

Base URL: `http://localhost:5000/api`

## Auth

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/signup` | Public | Register student |
| POST | `/auth/login` | Public | Login student/admin |
| GET | `/auth/me` | Authenticated | Current user profile |

## Student Exams

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/exams` | Authenticated | List active exams |
| GET | `/exams/:id` | Authenticated | Exam with questions |
| POST | `/exams/:id/submit` | Authenticated | Submit answers |
| GET | `/exams/results/me` | Student | Current student results |
| GET | `/exams/warnings/me` | Student | Current student warning history |

## Proctoring

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/proctor/analyze-frame` | Authenticated | Analyze webcam frame with OpenCV |
| POST | `/proctor/event` | Authenticated | Record tab switch, fullscreen exit, blur, shortcut attempts |

## Admin

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/admin/overview` | Admin | Dashboard counts and recent activity |
| POST | `/admin/exams` | Admin | Create exam |
| PUT | `/admin/exams/:id` | Admin | Update exam |
| DELETE | `/admin/exams/:id` | Admin | Delete exam |
| POST | `/admin/exams/:id/questions` | Admin | Add question |
| GET | `/admin/results` | Admin | All results |
| GET | `/admin/warnings` | Admin | All warnings |
| GET | `/admin/cheating-logs` | Admin | All cheating logs and screenshots |

## Authentication

Send JWT in every protected request:

```http
Authorization: Bearer <token>
```
