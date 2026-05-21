from datetime import datetime

from extensions import db


class Warning(db.Model):
    __tablename__ = "warnings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    exam_id = db.Column(db.Integer, db.ForeignKey("exams.id"), nullable=False, index=True)
    warning_type = db.Column(db.String(60), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    confidence = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="warnings")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "exam_id": self.exam_id,
            "warning_type": self.warning_type,
            "message": self.message,
            "confidence": round(self.confidence or 0, 2),
            "created_at": self.created_at.isoformat(),
        }
