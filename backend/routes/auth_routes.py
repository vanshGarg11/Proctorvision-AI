from flask import Blueprint, jsonify, request

from extensions import db
from models import User
from services.auth_service import generate_token
from .decorators import login_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/signup")
def signup():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or len(password) < 6:
        return jsonify({"message": "Name, valid email, and 6+ character password are required."}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists."}), 409

    user = User(name=name, email=email, role="student")
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"token": generate_token(user), "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid email or password."}), 401

    return jsonify({"token": generate_token(user), "user": user.to_dict()})


@auth_bp.get("/me")
@login_required
def me(user):
    return jsonify({"user": user.to_dict()})
