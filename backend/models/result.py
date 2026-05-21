from datetime import datetime

from extensions import db


class Result(db.Model):
    __tablename__ = "results"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    exam_id = db.Column(db.Integer, db.ForeignKey("exams.id"), nullable=False, index=True)
    score = db.Column(db.Integer, nullable=False, default=0)
    total_marks = db.Column(db.Integer, nullable=False, default=0)
    percentage = db.Column(db.Float, nullable=False, default=0)
    answers_json = db.Column(db.Text, default="{}")
    auto_submitted = db.Column(db.Boolean, default=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="results")
    exam = db.relationship("Exam", back_populates="results")

    def to_dict(self):
        return {
            "id": self.id,
            "user": self.user.to_dict() if self.user else None,
            "exam": self.exam.to_dict() if self.exam else None,
            "score": self.score,
            "total_marks": self.total_marks,
            "percentage": round(self.percentage, 2),
            "auto_submitted": self.auto_submitted,
            "submitted_at": self.submitted_at.isoformat(),
        }
