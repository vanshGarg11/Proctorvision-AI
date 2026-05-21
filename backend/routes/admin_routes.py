from flask import Blueprint, jsonify, request

from extensions import db
from models import CheatingLog, Exam, Question, Result, User, Warning
from .decorators import admin_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.get("/overview")
@admin_required
def overview(user):
    return jsonify(
        {
            "counts": {
                "students": User.query.filter_by(role="student").count(),
                "exams": Exam.query.count(),
                "results": Result.query.count(),
                "warnings": Warning.query.count(),
                "cheating_logs": CheatingLog.query.count(),
            },
            "recent_warnings": [w.to_dict() for w in Warning.query.order_by(Warning.created_at.desc()).limit(10)],
            "recent_results": [r.to_dict() for r in Result.query.order_by(Result.submitted_at.desc()).limit(10)],
        }
    )


@admin_bp.post("/exams")
@admin_required
def create_exam(user):
    data = request.get_json() or {}
    exam = Exam(
        title=data.get("title", "").strip(),
        description=data.get("description", ""),
        duration_minutes=int(data.get("duration_minutes", 30)),
        max_warnings=int(data.get("max_warnings", 5)),
        is_active=bool(data.get("is_active", True)),
    )
    if not exam.title:
        return jsonify({"message": "Exam title is required."}), 400
    db.session.add(exam)
    db.session.commit()
    return jsonify({"exam": exam.to_dict()}), 201


@admin_bp.put("/exams/<int:exam_id>")
@admin_required
def update_exam(user, exam_id):
    exam = Exam.query.get_or_404(exam_id)
    data = request.get_json() or {}
    for field in ["title", "description", "duration_minutes", "max_warnings", "is_active"]:
        if field in data:
            setattr(exam, field, data[field])
    db.session.commit()
    return jsonify({"exam": exam.to_dict()})


@admin_bp.delete("/exams/<int:exam_id>")
@admin_required
def delete_exam(user, exam_id):
    exam = Exam.query.get_or_404(exam_id)
    db.session.delete(exam)
    db.session.commit()
    return jsonify({"message": "Exam deleted."})


@admin_bp.post("/exams/<int:exam_id>/questions")
@admin_required
def add_question(user, exam_id):
    Exam.query.get_or_404(exam_id)
    data = request.get_json() or {}
    question = Question(
        exam_id=exam_id,
        text=data.get("text", ""),
        option_a=data.get("option_a", ""),
        option_b=data.get("option_b", ""),
        option_c=data.get("option_c", ""),
        option_d=data.get("option_d", ""),
        correct_option=data.get("correct_option", "A").upper(),
        marks=int(data.get("marks", 1)),
    )
    if not question.text or question.correct_option not in ["A", "B", "C", "D"]:
        return jsonify({"message": "Valid question text and answer option are required."}), 400
    db.session.add(question)
    db.session.commit()
    return jsonify({"question": question.to_dict(include_answer=True)}), 201


@admin_bp.get("/results")
@admin_required
def all_results(user):
    return jsonify({"results": [r.to_dict() for r in Result.query.order_by(Result.submitted_at.desc()).all()]})


@admin_bp.get("/warnings")
@admin_required
def all_warnings(user):
    return jsonify({"warnings": [w.to_dict() for w in Warning.query.order_by(Warning.created_at.desc()).all()]})


@admin_bp.get("/cheating-logs")
@admin_required
def cheating_logs(user):
    logs = CheatingLog.query.order_by(CheatingLog.created_at.desc()).all()
    return jsonify({"logs": [log.to_dict() for log in logs]})
