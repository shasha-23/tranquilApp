from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import io
from PIL import Image
import mediapipe as mp
from deepface import DeepFace
import os
import tempfile
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5
)

class FacialAnalyzer:
    def __init__(self):
        self.face_mesh = face_mesh
        
    def decode_image(self, image_data):
        """Decode base64 image or process uploaded file"""
        try:
            if isinstance(image_data, str):
                # Handle base64 encoded image
                if image_data.startswith('data:image'):
                    image_data = image_data.split(',')[1]
                
                image_bytes = base64.b64decode(image_data)
                image = Image.open(io.BytesIO(image_bytes))
            else:
                # Handle uploaded file
                image = Image.open(image_data)
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
                
            # Convert PIL to OpenCV format
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            return cv_image
            
        except Exception as e:
            logger.error(f"Error decoding image: {str(e)}")
            return None
    
    def get_head_pose(self, image):
        """Calculate head pose angles using MediaPipe"""
        try:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_image)
            
            if not results.multi_face_landmarks:
                return {"pitch": 0, "yaw": 0, "roll": 0}
            
            face_landmarks = results.multi_face_landmarks[0]
            
            # Get image dimensions
            h, w = image.shape[:2]
            
            # Key facial landmarks for pose estimation
            # Nose tip, chin, left eye corner, right eye corner, left mouth corner, right mouth corner
            landmark_points = []
            key_indices = [1, 152, 33, 263, 61, 291]  # MediaPipe face landmark indices
            
            for idx in key_indices:
                landmark = face_landmarks.landmark[idx]
                x = int(landmark.x * w)
                y = int(landmark.y * h)
                landmark_points.append([x, y])
            
            # 3D model points (approximate)
            model_points = np.array([
                [0.0, 0.0, 0.0],          # Nose tip
                [0.0, -330.0, -65.0],     # Chin
                [-225.0, 170.0, -135.0],  # Left eye corner
                [225.0, 170.0, -135.0],   # Right eye corner
                [-150.0, -150.0, -125.0], # Left mouth corner
                [150.0, -150.0, -125.0]   # Right mouth corner
            ], dtype=np.float64)
            
            # Camera matrix (approximate)
            focal_length = w
            center = (w // 2, h // 2)
            camera_matrix = np.array([
                [focal_length, 0, center[0]],
                [0, focal_length, center[1]],
                [0, 0, 1]
            ], dtype=np.float64)
            
            # Distortion coefficients
            dist_coeffs = np.zeros((4, 1))
            
            # Solve PnP
            image_points = np.array(landmark_points, dtype=np.float64)
            success, rotation_vector, translation_vector = cv2.solvePnP(
                model_points, image_points, camera_matrix, dist_coeffs
            )
            
            if success:
                # Convert rotation vector to rotation matrix
                rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
                
                # Calculate Euler angles
                sy = np.sqrt(rotation_matrix[0, 0] ** 2 + rotation_matrix[1, 0] ** 2)
                singular = sy < 1e-6
                
                if not singular:
                    pitch = np.arctan2(-rotation_matrix[2, 1], rotation_matrix[2, 2])
                    yaw = np.arctan2(-rotation_matrix[2, 0], sy)
                    roll = np.arctan2(rotation_matrix[1, 0], rotation_matrix[0, 0])
                else:
                    pitch = np.arctan2(-rotation_matrix[2, 1], rotation_matrix[2, 2])
                    yaw = np.arctan2(-rotation_matrix[2, 0], sy)
                    roll = 0
                
                # Convert to degrees
                pitch = np.degrees(pitch)
                yaw = np.degrees(yaw)
                roll = np.degrees(roll)
                
                return {
                    "pitch": round(float(pitch), 1),
                    "yaw": round(float(yaw), 1),
                    "roll": round(float(roll), 1)
                }
            
        except Exception as e:
            logger.error(f"Error calculating head pose: {str(e)}")
        
        return {"pitch": 0, "yaw": 0, "roll": 0}
    
    def analyze_face(self, image):
        """Perform comprehensive facial analysis"""
        try:
            # Save image temporarily for DeepFace
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
                cv2.imwrite(tmp_file.name, image)
                temp_path = tmp_file.name
            
            try:
                # Analyze with DeepFace
                analysis = DeepFace.analyze(
                    img_path=temp_path,
                    actions=['age', 'gender', 'emotion'],
                    enforce_detection=False
                )
                
                # Handle both single face and multiple faces results
                if isinstance(analysis, list):
                    analysis = analysis[0]
                
                # Extract emotion with confidence
                emotions = analysis['emotion']
                dominant_emotion = analysis['dominant_emotion']
                emotion_confidence = emotions[dominant_emotion] / 100.0
                
                # Format emotion string
                emotion_str = f"{dominant_emotion} ({emotion_confidence:.2f})"
                
                # Extract age and gender
                age = analysis['age']
                gender = analysis['dominant_gender']
                
                # Get head pose
                head_pose = self.get_head_pose(image)
                
                result = {
                    "age": f"{age} years",
                    "gender": gender.lower(),
                    "emotion": emotion_str,
                    "angle": head_pose,
                    "detailed_emotions": {k: round(v/100, 3) for k, v in emotions.items()}
                }
                
                return result
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                    
        except Exception as e:
            logger.error(f"Error in facial analysis: {str(e)}")
            return {
                "error": f"Analysis failed: {str(e)}",
                "age": "unknown",
                "gender": "unknown",
                "emotion": "unknown",
                "angle": {"pitch": 0, "yaw": 0, "roll": 0}
            }

# Initialize analyzer
analyzer = FacialAnalyzer()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "Facial Emotion Detection API is running",
        "version": "1.0.0"
    })

@app.route('/analyze', methods=['POST'])
def analyze_emotion():
    """Main endpoint for facial emotion detection"""
    try:
        # Check if request has file or base64 data
        if 'image' in request.files:
            # Handle file upload
            file = request.files['image']
            if file.filename == '':
                return jsonify({"error": "No file selected"}), 400
            
            image = analyzer.decode_image(file)
            
        elif 'image_data' in request.json:
            # Handle base64 encoded image
            image_data = request.json['image_data']
            image = analyzer.decode_image(image_data)
            
        else:
            return jsonify({
                "error": "No image provided. Send either 'image' file or 'image_data' base64 string"
            }), 400
        
        if image is None:
            return jsonify({"error": "Failed to decode image"}), 400
        
        # Check if image has faces
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            return jsonify({
                "error": "No face detected in the image",
                "age": "unknown",
                "gender": "unknown",
                "emotion": "unknown",
                "angle": {"pitch": 0, "yaw": 0, "roll": 0}
            }), 200
        
        # Analyze the face
        result = analyzer.analyze_face(image)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in analyze_emotion: {str(e)}")
        return jsonify({
            "error": f"Internal server error: {str(e)}",
            "age": "unknown",
            "gender": "unknown", 
            "emotion": "unknown",
            "angle": {"pitch": 0, "yaw": 0, "roll": 0}
        }), 500

@app.route('/batch_analyze', methods=['POST'])
def batch_analyze():
    """Analyze multiple images at once"""
    try:
        if 'images' not in request.files:
            return jsonify({"error": "No images provided"}), 400
        
        files = request.files.getlist('images')
        results = []
        
        for i, file in enumerate(files):
            if file.filename == '':
                continue
                
            image = analyzer.decode_image(file)
            if image is not None:
                result = analyzer.analyze_face(image)
                result['image_index'] = i
                result['filename'] = file.filename
                results.append(result)
        
        return jsonify({
            "total_images": len(files),
            "processed_images": len(results),
            "results": results
        })
        
    except Exception as e:
        logger.error(f"Error in batch_analyze: {str(e)}")
        return jsonify({"error": f"Batch analysis failed: {str(e)}"}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large. Maximum size is 16MB"}), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Set maximum file size to 16MB
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
    
    print("🚀 Starting Facial Emotion Detection API...")
    print("📊 Available endpoints:")
    print("  GET  /health - Health check")
    print("  POST /analyze - Single image analysis")
    print("  POST /batch_analyze - Multiple image analysis")
    print("\n💡 Usage examples:")
    print("  curl -X POST -F 'image=@photo.jpg' http://localhost:5000/analyze")
    print("  curl -X POST -H 'Content-Type: application/json' -d '{\"image_data\":\"base64_string\"}' http://localhost:5000/analyze")
    
    app.run(debug=True, host='0.0.0.0', port=5000)