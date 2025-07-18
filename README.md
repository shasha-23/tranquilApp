# Facial Emotion Detection API

A powerful Flask REST API that performs real-time facial emotion detection, age estimation, gender classification, and head pose analysis from uploaded images.

## Features

- **Emotion Detection**: Detects 7 emotions (happy, sad, angry, surprise, fear, disgust, neutral) with confidence scores
- **Age Estimation**: Approximate age detection
- **Gender Classification**: Male/female classification
- **Head Pose Analysis**: Pitch, yaw, and roll angles
- **Multiple Input Formats**: Supports both file uploads and base64 encoded images
- **Batch Processing**: Analyze multiple images in a single request
- **Comprehensive Error Handling**: Robust error handling with detailed responses

## Technology Stack

- **Flask**: Web framework
- **DeepFace**: Pre-trained models for emotion, age, and gender detection
- **MediaPipe**: Head pose estimation
- **OpenCV**: Image processing
- **TensorFlow**: Deep learning backend

## Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the API:**
   ```bash
   python app.py
   ```

The API will start on `http://localhost:5000`

## API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "Facial Emotion Detection API is running",
  "version": "1.0.0"
}
```

### Single Image Analysis
```http
POST /analyze
```

**Input Options:**

1. **File Upload:**
   ```bash
   curl -X POST -F 'image=@photo.jpg' http://localhost:5000/analyze
   ```

2. **Base64 Encoded:**
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"image_data": "base64_encoded_image_string"}' \
     http://localhost:5000/analyze
   ```

**Response:**
```json
{
  "age": "25 years",
  "gender": "female",
  "emotion": "happy (0.87)",
  "angle": {
    "pitch": -2.1,
    "yaw": 4.3,
    "roll": 1.2
  },
  "detailed_emotions": {
    "angry": 0.001,
    "disgust": 0.000,
    "fear": 0.002,
    "happy": 0.870,
    "sad": 0.005,
    "surprise": 0.010,
    "neutral": 0.112
  }
}
```

### Batch Analysis
```http
POST /batch_analyze
```

**Usage:**
```bash
curl -X POST \
  -F 'images=@photo1.jpg' \
  -F 'images=@photo2.jpg' \
  http://localhost:5000/batch_analyze
```

**Response:**
```json
{
  "total_images": 2,
  "processed_images": 2,
  "results": [
    {
      "image_index": 0,
      "filename": "photo1.jpg",
      "age": "25 years",
      "gender": "female",
      "emotion": "happy (0.87)",
      "angle": {
        "pitch": -2.1,
        "yaw": 4.3,
        "roll": 1.2
      }
    }
  ]
}
```

## Response Format

### Successful Analysis
- **age**: Estimated age in years
- **gender**: "male" or "female"
- **emotion**: Dominant emotion with confidence score
- **angle**: Head pose angles in degrees
  - **pitch**: Up/down rotation (-90 to +90)
  - **yaw**: Left/right rotation (-90 to +90)
  - **roll**: Tilt rotation (-180 to +180)
- **detailed_emotions**: Confidence scores for all emotions

### Error Responses
```json
{
  "error": "No face detected in the image",
  "age": "unknown",
  "gender": "unknown",
  "emotion": "unknown",
  "angle": {"pitch": 0, "yaw": 0, "roll": 0}
}
```

## Testing

Run the test script to verify API functionality:

```bash
python test_api.py
```

**Note:** Add a test image named `test_image.jpg` in the project directory for testing.

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- BMP (.bmp)
- TIFF (.tiff)
- WebP (.webp)

## Limitations

- Maximum file size: 16MB
- Processes one face per image (uses the most prominent face)
- Requires clear, front-facing images for best results
- Head pose estimation accuracy depends on facial landmark detection

## Error Handling

The API includes comprehensive error handling for:
- Invalid image formats
- No face detection
- Corrupted image data
- Server errors
- File size limits

## Performance Considerations

- First request may take longer due to model loading
- Processing time varies with image size and quality
- Consider implementing caching for production use
- GPU acceleration recommended for high-volume usage

## Security Notes

- Validate all input images
- Implement rate limiting for production
- Consider adding authentication for sensitive deployments
- Monitor resource usage to prevent abuse

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is open source and available under the MIT License.