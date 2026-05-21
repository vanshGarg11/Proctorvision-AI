from datetime import datetime

from extensions import db


class CheatingLog(db.Model):
    __tablename__ = "cheating_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    exam_id = db.Column(db.Integer, db.ForeignKey("exams.id"), nullable=False, index=True)
    event_type = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text, nullable=False)
    screenshot_path = db.Column(db.String(255))
    confidence = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "exam_id": self.exam_id,
            "event_type": self.event_type,
            "description": self.description,
            "screenshot_path": self.screenshot_path,
            "screenshot_url": f"/static/screenshots/{self.screenshot_path}" if self.screenshot_path else None,
            "confidence": round(self.confidence or 0, 2),
            "created_at": self.created_at.isoformat(),
        }
