# Permanent Backend Deployment On PythonAnywhere

Use this when Render asks for payment and you want a permanent backend URL for the Netlify frontend.

## 1. Create PythonAnywhere Account

Create a free account at:

```text
https://www.pythonanywhere.com/
```

Your backend URL will look like:

```text
https://YOUR_USERNAME.pythonanywhere.com
```

## 2. Open Bash Console

In PythonAnywhere, open **Consoles > Bash**.

Clone your GitHub repository:

```bash
git clone https://github.com/vanshGarg11/Proctorvision-AI.git
cd Proctorvision-AI/backend
```

Create virtual environment:

```bash
python3.10 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## 3. Create Web App

Go to:

```text
Web > Add a new web app
```

Choose:

```text
Manual configuration
Python 3.10
```

## 4. Configure Virtualenv

In the **Web** tab, set virtualenv path:

```text
/home/YOUR_USERNAME/Proctorvision-AI/backend/.venv
```

## 5. Configure WSGI File

Open the WSGI file from the **Web** tab and replace everything with:

```python
import os
import sys

PROJECT_DIR = "/home/YOUR_USERNAME/Proctorvision-AI/backend"

if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

os.environ["SECRET_KEY"] = "your-long-random-secret"
os.environ["JWT_EXPIRY_HOURS"] = "12"
os.environ["MAX_WARNINGS"] = "5"

from app import app as application
```

Replace `YOUR_USERNAME` with your PythonAnywhere username.

## 6. Static Files

In the **Web** tab, add static files mapping:

```text
URL: /static/
Directory: /home/YOUR_USERNAME/Proctorvision-AI/backend/static/
```

## 7. Reload App

Click:

```text
Reload
```

Test:

```text
https://YOUR_USERNAME.pythonanywhere.com/api/health
```

Expected response:

```json
{
  "project": "ProctorVision AI",
  "status": "ok"
}
```

## 8. Connect Netlify Frontend

In Netlify:

```text
Site settings > Environment variables
```

Set:

```text
Key: VITE_API_URL
Value: https://YOUR_USERNAME.pythonanywhere.com/api
```

Then trigger a new deploy:

```text
Deploys > Trigger deploy > Deploy site
```

## 9. Test Login

Use:

```text
student@proctorvision.local
Student@123
```

Admin:

```text
admin@proctorvision.local
Admin@123
```

## Important Notes

- PythonAnywhere free plan is good for demos and final-year presentations.
- SQLite database will be stored in the backend `database` folder.
- If you edit code later, pull latest code in PythonAnywhere Bash:

```bash
cd ~/Proctorvision-AI
git pull
cd backend
source .venv/bin/activate
pip install -r requirements.txt
```

Then reload the web app.
