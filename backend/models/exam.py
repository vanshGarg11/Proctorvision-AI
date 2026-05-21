from datetime import datetime

from extensions import db


class Exam(db.Model):
    __tablename__ = "exams"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(180), nullable=False)
    description = db.Column(db.Text, default="")
    duration_minutes = db.Column(db.Integer, nullable=False, default=30)
    max_warnings = db.Column(db.Integer, nullable=False, default=5)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    questions = db.relationship("Question", back_populates="exam", cascade="all, delete-orphan")
    results = db.relationship("Result", back_populates="exam", cascade="all, delete-orphan")

    def to_dict(self, include_questions=False, include_answers=False):
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "duration_minutes": self.duration_minutes,
            "max_warnings": self.max_warnings,
            "is_active": self.is_active,
            "question_count": len(self.questions),
            "created_at": self.created_at.isoformat(),
        }
        if include_questions:
            data["questions"] = [q.to_dict(include_answer=include_answers) for q in self.questions]
        return data
