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
    // Load face-api.js and models
    const loadFaceAPI = async () => {
      try {
        // Check if face-api is already loaded
        if (window.faceapi) {
          console.log('face-api.js already loaded');
          await loadModels();
          return;
        }

        console.log('Loading face-api.js...');
        
        // Create script element for face-api.js
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
        script.async = true;
        
        // Wait for script to load
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        console.log('face-api.js loaded successfully');
        
        // Wait a bit for face-api to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await loadModels();
        
      } catch (err) {
        console.error('Error loading face-api.js:', err);
        setError('Failed to load face detection library. Please refresh the page.');
      }
    };

    const loadModels = async () => {
      try {
        console.log('Loading face-api models...');
        
        if (!window.faceapi) {
          throw new Error('face-api.js not available');
        }

        // Load all required models
        await Promise.all([
          window.faceapi.nets.tinyFaceDetector.loadFromUri('/Assets/models'),
          window.faceapi.nets.faceLandmark68Net.loadFromUri('/Assets/models'),
          window.faceapi.nets.faceRecognitionNet.loadFromUri('/Assets/models'),
          window.faceapi.nets.faceExpressionNet.loadFromUri('/Assets/models'),
          window.faceapi.nets.ageGenderNet.loadFromUri('/Assets/models')
        ]);
        
        console.log('All models loaded successfully');
        setModelsLoaded(true);
        setError('');
        
      } catch (err) {
        console.error('Error loading models:', err);
        setError('Failed to load AI models. Some features may not work.');
      }
    };

    loadFaceAPI();
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
    if (!modelsLoaded) {
      setError('AI models are still loading. Please wait and try again.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setAnalysisResults(null);
    setError('');

    try {
      // Start camera if not already started
      if (!isVideoStarted) {
        await startCamera();
        // Wait for camera to initialize
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (!videoRef.current) {
        throw new Error('Video element not available');
      }

      // Wait for video to be ready
      if (videoRef.current.readyState < 2) {
        await new Promise((resolve) => {
          const checkReady = () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              resolve(true);
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        });
      }

      console.log('Starting face detection...');
      
      // Perform face detection with retry logic
      let detections = null;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (!detections && attempts < maxAttempts) {
        attempts++;
        console.log(`Detection attempt ${attempts}/${maxAttempts}`);
        
        try {
          detections = await window.faceapi
            .detectAllFaces(videoRef.current, new window.faceapi.TinyFaceDetectorOptions({
              inputSize: 416,
              scoreThreshold: 0.5
            }))
            .withFaceExpressions()
            .withAgeAndGender();
            
          if (detections && detections.length > 0) {
            console.log(`Found ${detections.length} face(s)`);
            break;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (detectionError) {
          console.error(`Detection attempt ${attempts} failed:`, detectionError);
          if (attempts === maxAttempts) {
            throw detectionError;
          }
        }
      }

      if (!detections || detections.length === 0) {
        setError('No face detected. Please ensure your face is clearly visible and well-lit, then try again.');
        return;
      }

      // Process the first detected face
      const detection = detections[0];
      console.log('Processing detection results...');
      
      // Extract results
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

      console.log('Analysis results:', results);
      
      // Draw detection overlay
      await drawDetectionOverlay(detection);
      
      // Take snapshot
      takeSnapshot();

      setAnalysisResults(results);
      setAnalysisComplete(true);

      // Automatically stop camera after 3 seconds
      setTimeout(() => {
        if (isVideoStarted) {
          stopCamera();
        }
      }, 3000);

    } catch (err) {
      console.error('Analysis error:', err);
      setError(`Analysis failed: ${err.message}. Please try again.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const drawDetectionOverlay = async (detection) => {
    if (!videoRef.current || !snapshotRef.current) return;

    try {
      // Remove existing overlay canvas
      const existingCanvas = snapshotRef.current.querySelector('.face-overlay');
      if (existingCanvas) {
        existingCanvas.remove();
      }

      // Create new overlay canvas
      const canvas = window.faceapi.createCanvasFromMedia(videoRef.current);
      canvas.classList.add('face-overlay');
      canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        pointer-events: none;
      `;
      
      snapshotRef.current.appendChild(canvas);
      
      const displaySize = { 
        width: videoRef.current.videoWidth, 
        height: videoRef.current.videoHeight 
      };
      
      window.faceapi.matchDimensions(canvas, displaySize);

      // Resize detection to match display
      const resizedDetection = window.faceapi.resizeResults([detection], displaySize)[0];
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw face detection box
      window.faceapi.draw.drawDetections(canvas, [resizedDetection]);
      
      // Draw face expressions
      window.faceapi.draw.drawFaceExpressions(canvas, [resizedDetection]);
      
      // Draw age and gender label
      const box = resizedDetection.detection.box;
      const age = Math.round(resizedDetection.age);
      const gender = resizedDetection.gender;
      const label = `${age} years old, ${gender}`;
      const drawBox = new window.faceapi.draw.DrawBox(box, { label });
      drawBox.draw(canvas);
      
    } catch (err) {
      console.error('Error drawing overlay:', err);
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
    if (!snapshotRef.current) return;

    // Load html2canvas dynamically
    const loadHtml2Canvas = async () => {
      if (window.html2canvas) {
        return window.html2canvas;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      
      return window.html2canvas;
    };
    
    loadHtml2Canvas().then((html2canvas) => {
      html2canvas(snapshotRef.current).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = `mood-map-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }).catch((err) => {
      console.error('Error downloading snapshot:', err);
      setError('Failed to download snapshot. Please try again.');
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
    
    // Clear any overlays
    const overlay = snapshotRef.current?.querySelector('.face-overlay');
    if (overlay) {
      overlay.remove();
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
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                <Play className="h-4 w-4 mr-2" />
                {isAnalyzing ? 'Analyzing...' : modelsLoaded ? 'Start Analysis' : 'Loading Models...'}
              </button>
              
              {isVideoStarted && (
                <button
                  onClick={stopCamera}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center font-semibold"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Camera
                </button>
              )}

              {analysisComplete && (
                <button
                  onClick={resetAnalysis}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
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
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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