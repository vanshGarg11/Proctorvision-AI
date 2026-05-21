import os
from datetime import timedelta


BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret-in-production")
    JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "12"))
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///" + os.path.join(BASE_DIR, "database", "proctorvision.db"),
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_WARNINGS = int(os.getenv("MAX_WARNINGS", "5"))
    SCREENSHOT_DIR = os.path.join(BASE_DIR, "static", "screenshots")
    JWT_EXPIRY = timedelta(hours=JWT_EXPIRY_HOURS)
