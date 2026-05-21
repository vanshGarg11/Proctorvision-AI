import base64
import os
import uuid

import cv2
import numpy as np
from flask import current_app


class FaceDetector:
    def __init__(self):
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.detector = cv2.CascadeClassifier(cascade_path)

    def analyze_base64_frame(self, frame_data):
        image = self._decode_frame(frame_data)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.detector.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
        face_count = len(faces)

        if face_count == 0:
            status = "NO_FACE"
            message = "No face detected in webcam frame."
            confidence = 0.88
        elif face_count > 1:
            status = "MULTIPLE_FACES"
            message = "Multiple faces detected in webcam frame."
            confidence = min(0.99, 0.78 + (face_count * 0.05))
        else:
            status = "NORMAL"
            message = "Single face detected."
            confidence = self._estimate_confidence(faces[0], image.shape)

        return {
            "status": status,
            "message": message,
            "face_count": face_count,
            "confidence": round(confidence, 2),
            "frame": image,
        }

    def save_frame(self, frame, user_id, exam_id):
        filename = f"user{user_id}_exam{exam_id}_{uuid.uuid4().hex}.jpg"
        path = os.path.join(current_app.config["SCREENSHOT_DIR"], filename)
        cv2.imwrite(path, frame)
        return filename

    def _decode_frame(self, frame_data):
        if "," in frame_data:
            frame_data = frame_data.split(",", 1)[1]
        buffer = base64.b64decode(frame_data)
        np_buffer = np.frombuffer(buffer, dtype=np.uint8)
        image = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Invalid image frame.")
        return image

    def _estimate_confidence(self, face, shape):
        _, _, width, height = face
        image_area = shape[0] * shape[1]
        face_area_ratio = (width * height) / image_area
        return min(0.98, max(0.65, 0.7 + face_area_ratio))


face_detector = FaceDetector()
