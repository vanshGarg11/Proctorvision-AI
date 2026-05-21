import os
import sys


PROJECT_DIR = "/home/YOUR_PYTHONANYWHERE_USERNAME/Proctorvision-AI/backend"

if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

os.environ.setdefault("SECRET_KEY", "change-this-secret-in-pythonanywhere")
os.environ.setdefault("JWT_EXPIRY_HOURS", "12")
os.environ.setdefault("MAX_WARNINGS", "5")

from app import app as application  # noqa: E402
