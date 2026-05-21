from functools import wraps

from flask import jsonify

from services.auth_service import current_user_from_request


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = current_user_from_request()
        if not user:
            return jsonify({"message": "Authentication required."}), 401
        return fn(user, *args, **kwargs)

    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = current_user_from_request()
        if not user:
            return jsonify({"message": "Authentication required."}), 401
        if user.role != "admin":
            return jsonify({"message": "Admin access required."}), 403
        return fn(user, *args, **kwargs)

    return wrapper
