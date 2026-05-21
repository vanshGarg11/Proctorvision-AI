import json

from flask import Blueprint, jsonify, request

from extensions import db
from models import Exam, Question, Result, Warning
from .decorators import login_required

exam_bp = Blueprint("exams", __name__)


@exam_bp.get("")
@login_required
def list_exams(user):
    exams = Exam.query.filter_by(is_active=True).order_by(Exam.created_at.desc()).all()
    return jsonify({"exams": [exam.to_dict() for exam in exams]})


@exam_bp.get("/<int:exam_id>")
@login_required
def exam_detail(user, exam_id):
    exam = Exam.query.get_or_404(exam_id)
    return jsonify({"exam": exam.to_dict(include_questions=True, include_answers=user.role == "admin")})


@exam_bp.post("/<int:exam_id>/submit")
@login_required
def submit_exam(user, exam_id):
    exam = Exam.query.get_or_404(exam_id)
    data = request.get_json() or {}
    answers = data.get("answers", {})
    auto_submitted = bool(data.get("auto_submitted", False))

    total_marks = sum(question.marks for question in exam.questions)
    score = 0
    for question in exam.questions:
        if answers.get(str(question.id)) == question.correct_option:
            score += question.marks

    percentage = (score / total_marks * 100) if total_marks else 0
    result = Result(
        user_id=user.id,
        exam_id=exam.id,
        score=score,
        total_marks=total_marks,
        percentage=percentage,
        answers_json=json.dumps(answers),
        auto_submitted=auto_submitted,
    )
    db.session.add(result)
    db.session.commit()
    return jsonify({"message": "Exam submitted.", "result": result.to_dict()})


@exam_bp.get("/results/me")
@login_required
def my_results(user):
    results = Result.query.filter_by(user_id=user.id).order_by(Result.submitted_at.desc()).all()
    return jsonify({"results": [result.to_dict() for result in results]})


@exam_bp.get("/warnings/me")
@login_required
def my_warnings(user):
    warnings = Warning.query.filter_by(user_id=user.id).order_by(Warning.created_at.desc()).all()
    return jsonify({"warnings": [warning.to_dict() for warning in warnings]})
