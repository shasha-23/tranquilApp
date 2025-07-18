import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Download, ArrowLeft, Play, Square, Shield, Eye, EyeOff } from 'lucide-react';

const MoodMap = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snapshotRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    // Load required scripts and models
    const loadScripts = async () => {
      try {
        // Load face-api.js
        const faceApiScript = document.createElement('script');
        faceApiScript.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
        faceApiScript.async = true;
        document.head.appendChild(faceApiScript);

        // Load html2canvas
        const html2canvasScript = document.createElement('script');
        html2canvasScript.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
        html2canvasScript.async = true;
        document.head.appendChild(html2canvasScript);

        // Wait for scripts to load
        await new Promise((resolve) => {
          let scriptsLoaded = 0;
          const checkLoaded = () => {
            scriptsLoaded++;
            if (scriptsLoaded === 2) resolve(true);
          };
          faceApiScript.onload = checkLoaded;
          html2canvasScript.onload = checkLoaded;
        });

        // Load face-api models
        if (window.faceapi) {
          await Promise.all([
            window.faceapi.nets.tinyFaceDetector.loadFromUri('/Assets/models'),
            window.faceapi.nets.faceLandmark68Net.loadFromUri('/Assets/models'),
            window.faceapi.nets.faceRecognitionNet.loadFromUri('/Assets/models'),
            window.faceapi.nets.faceExpressionNet.loadFromUri('/Assets/models'),
            window.faceapi.nets.ageGenderNet.loadFromUri('/Assets/models')
          ]);
          setModelsLoaded(true);
        }
      } catch (err) {
        console.error('Error loading face-api models:', err);
        setError('Failed to load face detection models');
      }
    };

    loadScripts();

    return () => {
      // Cleanup on unmount
      stopCamera();
      const scripts = document.querySelectorAll('script[src*="face-api"], script[src*="html2canvas"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

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
    
    setIsVideoStarted(false);
    setIsAnalyzing(false);
  };

  const analyzeEmotion = async () => {
    if (!window.faceapi || !videoRef.current || !modelsLoaded) {
      setError('Face detection models not loaded yet. Please wait and try again.');
      return;
    }

    // Start camera for analysis
    if (!isVideoStarted) {
      await startCamera();
      // Wait a moment for camera to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setAnalysisResults(null);
    setError('');

    try {
      // Clear previous canvas
      const existingCanvas = snapshotRef.current?.querySelector('canvas');
      if (existingCanvas) {
        existingCanvas.remove();
      }

      // Create canvas for face detection overlay
      const canvas = window.faceapi.createCanvasFromMedia(videoRef.current);
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.zIndex = '2';
      
      if (snapshotRef.current) {
        snapshotRef.current.appendChild(canvas);
      }
      
      const displaySize = { 
        width: videoRef.current.videoWidth, 
        height: videoRef.current.videoHeight 
      };
      window.faceapi.matchDimensions(canvas, displaySize);

      // Perform face detection and analysis
      const detections = await window.faceapi
        .detectAllFaces(videoRef.current, new window.faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions()
        .withAgeAndGender();

      if (detections.length === 0) {
        setError('No face detected. Please ensure your face is clearly visible and try again.');
        stopCamera();
        return;
      }

      const resizedDetections = window.faceapi.resizeResults(detections, displaySize);
      
      // Clear and draw results
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      
      window.faceapi.draw.drawDetections(canvas, resizedDetections);
      window.faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      
      // Process results
      const detection = resizedDetections[0];
      const age = Math.round(detection.age);
      const gender = detection.gender;
      const expressions = detection.expressions;
      
      // Find dominant emotion
      const dominantEmotion = Object.keys(expressions).reduce((a, b) => 
        expressions[a] > expressions[b] ? a : b
      );
      
      const results = {
        age: `${age} years`,
        gender: gender,
        emotion: `${dominantEmotion} (${(expressions[dominantEmotion] * 100).toFixed(1)}%)`,
        expressions: expressions,
        timestamp: new Date().toLocaleString()
      };

      // Draw age and gender label
      const box = detection.detection.box;
      const label = `${age} years old ${gender}`;
      const drawBox = new window.faceapi.draw.DrawBox(box, { label });
      drawBox.draw(canvas);

      // Take snapshot
      takeSnapshot();

      setAnalysisResults(results);
      setAnalysisComplete(true);

      // Automatically stop camera after analysis
      setTimeout(() => {
        stopCamera();
      }, 2000); // Give user 2 seconds to see the results

    } catch (err) {
      console.error('Analysis error:', err);
      setError('Analysis failed. Please try again.');
      stopCamera();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const takeSnapshot = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size to match video
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Draw video frame
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Add timestamp
    const canvasText = `Mood Map By Calmify. All rights reserved © ${new Date().getFullYear()}    Date: ${new Date().toLocaleDateString()}`;
    context.font = '15px Roboto, sans-serif';
    context.textAlign = 'center';
    context.fillStyle = 'yellow';
    context.fillText(canvasText, canvas.width / 2, canvas.height * 0.95);

    canvas.style.display = 'block';
  };

  const downloadSnapshot = () => {
    if (!window.html2canvas || !snapshotRef.current) return;

    window.html2canvas(snapshotRef.current).then((canvas: HTMLCanvasElement) => {
      const link = document.createElement('a');
      link.download = `mood-map-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const resetAnalysis = () => {
    setAnalysisComplete(false);
    setAnalysisResults(null);
    setError('');
    
    // Clear canvas
    const existingCanvas = snapshotRef.current?.querySelector('canvas');
    if (existingCanvas) {
      existingCanvas.remove();
    }
    
    if (canvasRef.current) {
      canvasRef.current.style.display = 'none';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link
              to="/"
              className="absolute left-4 top-8 flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <Camera className="h-12 w-12 text-green-600 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mood Map</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Privacy-focused facial emotion detection. Camera activates only during analysis and automatically turns off when complete.
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Shield className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Privacy Protection</h3>
              <p className="text-green-700 text-sm">
                Your camera will only activate when you start an analysis and will automatically turn off when complete. 
                No video data is stored or transmitted - all processing happens locally in your browser.
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

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Camera Feed Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Camera Feed</h2>
              <div className="flex items-center">
                {isVideoStarted ? (
                  <Eye className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <EyeOff className="h-5 w-5 text-gray-400 mr-2" />
                )}
                <span className={`text-sm ${isVideoStarted ? 'text-green-600' : 'text-gray-400'}`}>
                  {isVideoStarted ? 'Camera Active' : 'Camera Off'}
                </span>
              </div>
            </div>
            
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                id="myVidPlayer"
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              
              {!isVideoStarted && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <div className="text-center">
                    <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Camera is off for privacy</p>
                    <p className="text-sm text-gray-500">Camera will activate only during analysis</p>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Analyzing facial expressions...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={analyzeEmotion}
                disabled={isAnalyzing || !modelsLoaded}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4 mr-2" />
                {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
              </button>
              
              {isVideoStarted && (
                <button
                  onClick={stopCamera}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Camera
                </button>
              )}

              {analysisComplete && (
                <button
                  onClick={resetAnalysis}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  New Analysis
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">Analysis Results</h2>
            
            <div 
              ref={snapshotRef}
              id="snapshot"
              className="relative bg-gray-100 rounded-lg overflow-hidden mb-4"
              style={{ aspectRatio: '4/3' }}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover hidden"
              />
              
              {!analysisComplete && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-16 w-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-500" />
                    </div>
                    <p className="text-gray-600">
                      {!modelsLoaded 
                        ? 'Loading AI models...'
                        : 'Click "Start Analysis" to begin'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Results Display */}
            {analysisResults && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Age</h4>
                    <p className="text-blue-700">{analysisResults.age}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-purple-900">Gender</h4>
                    <p className="text-purple-700 capitalize">{analysisResults.gender}</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-900">Dominant Emotion</h4>
                  <p className="text-green-700 capitalize">{analysisResults.emotion}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">All Emotions</h4>
                  <div className="space-y-1">
                    {Object.entries(analysisResults.expressions).map(([emotion, confidence]: [string, any]) => (
                      <div key={emotion} className="flex justify-between items-center">
                        <span className="capitalize text-sm">{emotion}</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">{(confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Analysis completed: {analysisResults.timestamp}
                </div>
              </div>
            )}

            {/* Download Button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={downloadSnapshot}
                disabled={!analysisComplete}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Results
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Use Privacy-Focused Mood Map</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Click Start Analysis</h4>
              <p className="text-gray-600 text-sm">Camera will automatically activate for analysis only</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Position Your Face</h4>
              <p className="text-gray-600 text-sm">Look directly at the camera for best results</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">View Results</h4>
              <p className="text-gray-600 text-sm">See your emotion analysis and facial data</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Camera Auto-Off</h4>
              <p className="text-gray-600 text-sm">Camera automatically turns off after analysis</p>
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
    html2canvas: any;
  }
}

export default MoodMap;