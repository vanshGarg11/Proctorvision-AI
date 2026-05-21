import os

from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from extensions import db
from models import User, Exam, Question
from routes.admin_routes import admin_bp
from routes.auth_routes import auth_bp
from routes.exam_routes import exam_bp
from routes.proctor_routes import proctor_bp


def create_app():
    app = Flask(__name__, static_folder="static", template_folder="templates")
    app.config.from_object(Config)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    os.makedirs(app.config["SCREENSHOT_DIR"], exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(__file__), "database"), exist_ok=True)

    db.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(exam_bp, url_prefix="/api/exams")
    app.register_blueprint(proctor_bp, url_prefix="/api/proctor")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "project": "ProctorVision AI"})

    with app.app_context():
        db.create_all()
        seed_database()

    return app


def seed_database():
    if not User.query.filter_by(email="admin@proctorvision.local").first():
        admin = User(name="System Admin", email="admin@proctorvision.local", role="admin")
        admin.set_password("Admin@123")
        db.session.add(admin)

    if not User.query.filter_by(email="student@proctorvision.local").first():
        student = User(name="Demo Student", email="student@proctorvision.local", role="student")
        student.set_password("Student@123")
        db.session.add(student)

    if not Exam.query.filter_by(title="AI Fundamentals Mock Test").first():
        exam = Exam(
            title="AI Fundamentals Mock Test",
            description="MCQ test covering AI, ML, and responsible proctoring basics.",
            duration_minutes=20,
            max_warnings=5,
            is_active=True,
        )
        db.session.add(exam)
        db.session.flush()
        questions = [
            Question(
                exam_id=exam.id,
                text="Which technique is used here for face detection?",
                option_a="OpenCV Haar Cascade",
                option_b="Blockchain mining",
                option_c="SQL indexing",
                option_d="CSS animation",
                correct_option="A",
            ),
            Question(
                exam_id=exam.id,
                text="What should happen when the exam timer ends?",
                option_a="Pause indefinitely",
                option_b="Auto-submit the exam",
                option_c="Clear all answers",
                option_d="Disable the database",
                correct_option="B",
            ),
            Question(
                exam_id=exam.id,
                text="Which browser event helps detect tab switching?",
                option_a="visibilitychange",
                option_b="mouseenter",
                option_c="dragstart",
                option_d="scroll",
                correct_option="A",
            ),
        ]
        db.session.add_all(questions)

    db.session.commit()


app = create_app()


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
