from flask import Blueprint, jsonify, request

from extensions import db
from models import CheatingLog, Exam, Warning
from services.proctoring_service import face_detector
from .decorators import login_required

proctor_bp = Blueprint("proctor", __name__)


@proctor_bp.post("/analyze-frame")
@login_required
def analyze_frame(user):
    data = request.get_json() or {}
    exam_id = data.get("exam_id")
    frame_data = data.get("frame")
    if not exam_id or not frame_data:
        return jsonify({"message": "exam_id and frame are required."}), 400

    exam = Exam.query.get_or_404(exam_id)
    analysis = face_detector.analyze_base64_frame(frame_data)
    warning = None
    log = None

    if analysis["status"] != "NORMAL":
        screenshot = face_detector.save_frame(analysis["frame"], user.id, exam.id)
        warning = Warning(
            user_id=user.id,
            exam_id=exam.id,
            warning_type=analysis["status"],
            message=analysis["message"],
            confidence=analysis["confidence"],
        )
        log = CheatingLog(
            user_id=user.id,
            exam_id=exam.id,
            event_type=analysis["status"],
            description=analysis["message"],
            screenshot_path=screenshot,
            confidence=analysis["confidence"],
        )
        db.session.add_all([warning, log])
        db.session.commit()

    warning_count = Warning.query.filter_by(user_id=user.id, exam_id=exam.id).count()
    return jsonify(
        {
            "status": analysis["status"],
            "message": analysis["message"],
            "face_count": analysis["face_count"],
            "confidence": analysis["confidence"],
            "warning": warning.to_dict() if warning else None,
            "log": log.to_dict() if log else None,
            "warning_count": warning_count,
            "max_warnings": exam.max_warnings,
            "should_auto_submit": warning_count >= exam.max_warnings,
        }
    )


@proctor_bp.post("/event")
@login_required
def record_event(user):
    data = request.get_json() or {}
    exam_id = data.get("exam_id")
    event_type = data.get("event_type", "UNKNOWN")
    message = data.get("message", "Suspicious browser activity detected.")
    confidence = float(data.get("confidence", 0.9))
    if not exam_id:
        return jsonify({"message": "exam_id is required."}), 400

    exam = Exam.query.get_or_404(exam_id)
    warning = Warning(
        user_id=user.id,
        exam_id=exam.id,
        warning_type=event_type,
        message=message,
        confidence=confidence,
    )
    log = CheatingLog(
        user_id=user.id,
        exam_id=exam.id,
        event_type=event_type,
        description=message,
        confidence=confidence,
    )
    db.session.add_all([warning, log])
    db.session.commit()

    warning_count = Warning.query.filter_by(user_id=user.id, exam_id=exam.id).count()
    return jsonify(
        {
            "warning": warning.to_dict(),
            "warning_count": warning_count,
            "max_warnings": exam.max_warnings,
            "should_auto_submit": warning_count >= exam.max_warnings,
        }
    )
