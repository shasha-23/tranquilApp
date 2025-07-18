import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ArrowLeft, Play, Square, Shield, Eye, EyeOff } from 'lucide-react';

const MoodMap = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResults, setDetectionResults] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelLoadingProgress, setModelLoadingProgress] = useState('');

  useEffect(() => {
    loadFaceAPI();
    return () => {
      cleanup();
    };
  }, []);

  const loadFaceAPI = async () => {
    try {
      setModelLoadingProgress('Loading face-api.js library...');
      
      // Load face-api.js if not already loaded
      if (!window.faceapi) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
        script.async = true;
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        // Wait for face-api to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!window.faceapi) {
        throw new Error('face-api.js failed to load');
      }

      setModelLoadingProgress('Loading AI models...');
      
      // Load all required models
      await Promise.all([
        window.faceapi.nets.tinyFaceDetector.loadFromUri('/Assets/models'),
        window.faceapi.nets.faceLandmark68Net.loadFromUri('/Assets/models'),
        window.faceapi.nets.faceRecognitionNet.loadFromUri('/Assets/models'),
        window.faceapi.nets.faceExpressionNet.loadFromUri('/Assets/models'),
        window.faceapi.nets.ageGenderNet.loadFromUri('/Assets/models')
      ]);
      
      setModelsLoaded(true);
      setModelLoadingProgress('');
      setError('');
      
    } catch (err) {
      console.error('Error loading face-api:', err);
      setError('Failed to load AI models. Please refresh the page.');
      setModelLoadingProgress('');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsVideoStarted(true);
          setError('');
          startRealTimeDetection();
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied. Please allow camera permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setIsVideoStarted(false);
    setIsAnalyzing(false);
    setDetectionResults(null);
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const startRealTimeDetection = () => {
    if (!modelsLoaded || !videoRef.current) return;
    
    setIsAnalyzing(true);
    
    // Set up canvas overlay
    if (canvasRef.current && videoRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth || 640;
      canvasRef.current.height = videoRef.current.videoHeight || 480;
    }
    
    // Start detection loop
    detectionIntervalRef.current = setInterval(async () => {
      await performDetection();
    }, 100); // Run detection every 100ms for smooth real-time experience
  };

  const performDetection = async () => {
    if (!videoRef.current || !canvasRef.current || !window.faceapi) return;

    try {
      const detections = await window.faceapi
        .detectAllFaces(videoRef.current, new window.faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5
        }))
        .withFaceExpressions()
        .withAgeAndGender()
        .withFaceLandmarks();

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Clear previous drawings
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (detections && detections.length > 0) {
        const detection = detections[0]; // Use first detected face
        
        // Update detection results
        const age = Math.round(detection.age);
        const gender = detection.gender;
        const expressions = detection.expressions;
        
        // Find dominant emotion
        const dominantEmotion = Object.keys(expressions).reduce((a, b) => 
          expressions[a] > expressions[b] ? a : b
        );
        
        // Calculate head pose angles (simplified estimation)
        const landmarks = detection.landmarks;
        const headPose = calculateHeadPose(landmarks);
        
        const results = {
          age: `${age} years old ${gender}`,
          emotion: `${dominantEmotion} (${(expressions[dominantEmotion]).toFixed(2)})`,
          headPose: headPose,
          expressions: expressions,
          confidence: expressions[dominantEmotion]
        };
        
        setDetectionResults(results);
        
        // Draw bounding box and labels
        drawDetectionOverlay(ctx, detection, results);
      } else {
        setDetectionResults(null);
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  };

  const calculateHeadPose = (landmarks: any) => {
    if (!landmarks || !landmarks.positions) {
      return { pitch: 0, yaw: 0, roll: 0 };
    }

    try {
      const positions = landmarks.positions;
      
      // Get key facial points
      const noseTip = positions[30]; // Nose tip
      const leftEye = positions[36]; // Left eye corner
      const rightEye = positions[45]; // Right eye corner
      const leftMouth = positions[48]; // Left mouth corner
      const rightMouth = positions[54]; // Right mouth corner
      
      // Calculate approximate angles
      const eyeCenter = {
        x: (leftEye.x + rightEye.x) / 2,
        y: (leftEye.y + rightEye.y) / 2
      };
      
      const mouthCenter = {
        x: (leftMouth.x + rightMouth.x) / 2,
        y: (leftMouth.y + rightMouth.y) / 2
      };
      
      // Simplified angle calculations
      const yaw = Math.atan2(rightEye.x - leftEye.x, rightEye.y - leftEye.y) * 180 / Math.PI;
      const pitch = Math.atan2(mouthCenter.y - eyeCenter.y, Math.abs(mouthCenter.x - eyeCenter.x)) * 180 / Math.PI;
      const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * 180 / Math.PI;
      
      return {
        pitch: Math.round(pitch),
        yaw: Math.round(yaw),
        roll: Math.round(roll)
      };
    } catch (err) {
      return { pitch: 0, yaw: 0, roll: 0 };
    }
  };

  const drawDetectionOverlay = (ctx: CanvasRenderingContext2D, detection: any, results: any) => {
    const box = detection.detection.box;
    
    // Draw bounding box
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    
    // Draw labels
    ctx.fillStyle = '#10B981';
    ctx.font = '14px Arial';
    
    const labels = [
      results.age,
      results.emotion,
      `Angles: P:${results.headPose.pitch}° Y:${results.headPose.yaw}° R:${results.headPose.roll}°`
    ];
    
    labels.forEach((label, index) => {
      const y = box.y - 10 - (labels.length - 1 - index) * 20;
      
      // Draw background for text
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
      ctx.fillRect(box.x, y - 16, textWidth + 8, 20);
      
      // Draw text
      ctx.fillStyle = 'white';
      ctx.fillText(label, box.x + 4, y - 2);
    });
  };

  const cleanup = () => {
    stopCamera();
    
    // Remove scripts
    const scripts = document.querySelectorAll('script[src*="face-api"]');
    scripts.forEach(script => script.remove());
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4 relative">
            <Link
              to="/"
              className="absolute left-0 flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <Camera className="h-12 w-12 text-green-600 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mood Map</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time facial emotion detection with privacy protection
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Shield className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Privacy Protection</h3>
              <p className="text-green-700 text-sm">
                All processing happens locally in your browser. No video data is stored or transmitted to any server.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Model Loading Progress */}
        {modelLoadingProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-blue-700">{modelLoadingProgress}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Camera Status */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center">
              {isVideoStarted ? (
                <Eye className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <EyeOff className="h-5 w-5 text-gray-400 mr-2" />
              )}
              <span className={`text-sm font-medium ${isVideoStarted ? 'text-green-600' : 'text-gray-400'}`}>
                {isVideoStarted ? 'Camera Active - Real-time Analysis' : 'Camera is off for privacy'}
              </span>
            </div>
          </div>
          
          {/* Video Feed Container */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden mx-auto" style={{ maxWidth: '640px', aspectRatio: '4/3' }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            />
            
            {/* Canvas Overlay for Detection */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 10 }}
            />
            
            {!isVideoStarted && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="text-center">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Camera is off for privacy</p>
                  <p className="text-sm text-gray-500">Click "Start Analysis" to begin real-time detection</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 mt-6">
            {!isVideoStarted ? (
              <button
                onClick={startCamera}
                disabled={!modelsLoaded}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                {modelsLoaded ? 'Start Analysis' : 'Loading Models...'}
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center font-semibold text-lg"
              >
                <Square className="h-5 w-5 mr-2" />
                Stop Analysis
              </button>
            )}
          </div>

          {/* Detection Results */}
          {isAnalyzing && (
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Live Detection Results</h3>
              
              {detectionResults ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Demographics</h4>
                      <p className="text-blue-700">{detectionResults.age}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Dominant Emotion</h4>
                      <p className="text-green-700 capitalize">{detectionResults.emotion}</p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Head Pose</h4>
                    <p className="text-purple-700">
                      Pitch: {detectionResults.headPose.pitch}° | 
                      Yaw: {detectionResults.headPose.yaw}° | 
                      Roll: {detectionResults.headPose.roll}°
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">All Emotions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(detectionResults.expressions).map(([emotion, confidence]: [string, any]) => (
                        <div key={emotion} className="flex justify-between items-center">
                          <span className="capitalize text-sm">{emotion}</span>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 w-12">{(confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-pulse">
                    <div className="h-16 w-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Looking for faces...</p>
                    <p className="text-sm text-gray-500 mt-2">Make sure your face is clearly visible and well-lit</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Use Real-Time Mood Detection</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Start Analysis</h4>
              <p className="text-gray-600 text-sm">Click "Start Analysis" to activate your camera</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Position Yourself</h4>
              <p className="text-gray-600 text-sm">Look directly at the camera in good lighting</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Real-Time Results</h4>
              <p className="text-gray-600 text-sm">See live emotion analysis and facial data</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Stop Anytime</h4>
              <p className="text-gray-600 text-sm">Click "Stop Analysis" to turn off the camera</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    faceapi: any;
  }
}

export default MoodMap;