import { Activity, AlertCircle, ArrowLeft, Camera, CheckCircle, Eye, RefreshCw, Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface FaceAnalysisResult {
  observations: {
    facialExpression: string;
    eyeContact: string;
    skinTone: string;
    facialSymmetry: string;
    noseAndMouth: string;
    eyebrowsAndEyelashes: string;
  };
  overallAssessment: string;
  potentialIndicators: string[];
  recommendedQuestions: string[];
  disclaimer: string;
}

interface FaceAnalysisProps {
  onAnalysisComplete: (result: FaceAnalysisResult) => void;
  onNext?: () => void;
  onBack?: () => void;
}

const FaceAnalysis: React.FC<FaceAnalysisProps> = ({ onAnalysisComplete, onNext, onBack }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FaceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Debug state changes
  useEffect(() => {
    console.log('Camera state changed:', { isCameraActive, cameraError, capturedImage: !!capturedImage });
  }, [isCameraActive, cameraError, capturedImage]);

  // Monitor video ref availability
  useEffect(() => {
    console.log('Video ref availability check:', { 
      videoRef: !!videoRef.current, 
      videoElement: videoRef.current ? 'exists' : 'null' 
    });
  }, [videoRef.current]);

  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

  // Initialize camera
  const initializeCamera = async () => {
    try {
      console.log('Starting camera initialization...');
      setCameraError(null);
      
      // Check if browser supports mediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by this browser');
      }
      
      // Video element should now be available since it's always rendered
      if (!videoRef.current) {
        console.error('Video ref is not available');
        throw new Error('Video element not found. Please refresh the page and try again.');
      }
      
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      console.log('Camera access granted, stream obtained:', stream);
      
      console.log('Setting video source...');
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      
      // Add event listeners for video state changes
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        console.log('Video dimensions:', videoRef.current?.videoWidth, videoRef.current?.videoHeight);
      };
      
      videoRef.current.onplaying = () => {
        console.log('Video started playing');
      };
      
      videoRef.current.onerror = (e) => {
        console.error('Video element error:', e);
      };
      
      // Play the video explicitly
      console.log('Attempting to play video...');
      await videoRef.current.play().catch((err) => {
        console.warn('Video play() failed:', err);
        throw new Error('Failed to start video playback');
      });
      
      console.log('Video playing successfully, setting camera as active');
      setIsCameraActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unable to access camera. Please ensure you have granted camera permissions.';
      setCameraError(errorMessage);
    }
  };

  // Stop camera
  const stopCamera = () => {
    console.log('Stopping camera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    console.log('Camera stopped');
  };

  // Capture image from camera
  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    console.log('Capturing image...');
    console.log('Video dimensions:', video.videoWidth, video.videoHeight);
    console.log('Video readyState:', video.readyState);

    // Ensure video has dimensions
    if (!video.videoWidth || !video.videoHeight) {
      console.error('Video dimensions not available');
      setError('Camera not ready. Please wait a moment and try again.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // If the video element is mirrored via CSS (scaleX(-1)), and you want the
    // captured image to be mirrored the same way, mirror the canvas drawing.
    // Here we detect a horizontal flip via the element's transform style.
    const transform = (video.style && video.style.transform) || window.getComputedStyle(video).transform;
    const isFlipped = typeof transform === 'string' && transform.includes('matrix(-1');

    if (isFlipped) {
      context?.save();
      context?.scale(-1, 1);
      context?.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      context?.restore();
    } else {
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image captured successfully, data URL length:', imageDataUrl.length);
    setCapturedImage(imageDataUrl);
    stopCamera();
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Extract JSON from markdown-wrapped response
  const extractJsonFromMarkdown = (content: string): string => {
    // Check if content is wrapped in markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return jsonMatch[1].trim();
    }
    // If no markdown wrapper, return content as-is
    return content.trim();
  };

  // Convert image to base64
  const imageToBase64 = (imageSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize image to reduce size
        const maxSize = 1024;
        let { width, height } = img;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = imageSrc;
    });
  };

  // Analyze facial image using Groq Vision API
  const analyzeFacialImage = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Check if API key is available
      if (!GROQ_API_KEY) {
        throw new Error('Groq API key is not configured. Please check your environment variables.');
      }

      console.log('Starting face analysis...');
      console.log('Using model:', GROQ_VISION_MODEL);
      
      // Convert image to base64
      const base64Image = await imageToBase64(capturedImage);
      
      // Remove data URL prefix to get pure base64
      const base64Data = base64Image.split(',')[1];
      console.log('Image converted to base64, length:', base64Data.length);

      // Medical-focused prompt for facial analysis
      const medicalPrompt = `As a medical doctor with expertise in facial diagnosis and clinical observation, analyze this facial image thoroughly. Provide a comprehensive medical assessment focusing on:

1. **Facial Expression Analysis**: 
   - Overall emotional state (happy, sad, anxious, tired, in pain, etc.)
   - Specific muscle tension or relaxation patterns
   - Any signs of discomfort or distress

2. **Clinical Observations**:
   - Eye appearance (redness, puffiness, dark circles, clarity, symmetry)
   - Skin condition (pallor, flushing, rash, lesions, texture changes)
   - Facial symmetry and any asymmetries that might indicate neurological issues
   - Lip and mouth condition (dryness, color, swelling, symmetry)
   - Forehead and brow patterns (tension lines, sweating, swelling)

3. **Potential Medical Indicators**:
   - Signs of fatigue or sleep deprivation
   - Indicators of stress or anxiety
   - Possible signs of pain or discomfort
   - Skin changes that might indicate systemic conditions
   - Any facial features that might suggest underlying health issues

4. **Recommended Clinical Questions**:
   - Based on your observations, what specific questions should a doctor ask this patient?
   - What symptoms should be explored further?

5. **Overall Assessment**:
   - General impression of the patient's current health state
   - Level of concern or urgency for medical attention

Please provide your analysis in a structured JSON format with the following structure:
{
  "observations": {
    "facialExpression": "detailed description",
    "eyeContact": "description of eye appearance and contact",
    "skinTone": "description of skin condition and color",
    "facialSymmetry": "assessment of facial symmetry",
    "noseAndMouth": "observations of nasal and oral areas",
    "eyebrowsAndEyelashes": "description of brow and lash appearance"
  },
  "overallAssessment": "comprehensive medical assessment",
  "potentialIndicators": ["indicator1", "indicator2", "indicator3"],
  "recommendedQuestions": ["question1", "question2", "question3"],
  "disclaimer": "medical disclaimer about limitations of facial analysis"
}

Be thorough, professional, and medically accurate in your assessment. If the image quality is poor or the face is not clearly visible, note this in your analysis.`;

      console.log('Sending request to Groq API...');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_VISION_MODEL,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: medicalPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Data}`
                  }
                }
              ]
            }
          ],
          max_tokens: 2048,
          temperature: 0.1
        })
      });

      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('API response received:', data);
      
      if (data.choices && data.choices[0]) {
        const content = data.choices[0].message.content;
        console.log('Analysis content:', content);
        
        try {
          // Extract JSON from markdown if present
          const jsonContent = extractJsonFromMarkdown(content);
          console.log('Extracted JSON content:', jsonContent);
          
          // Parse the JSON response
          const result = JSON.parse(jsonContent);
          console.log('Parsed analysis result:', result);
          setAnalysisResult(result);
          
          // Call the completion callback
          setTimeout(() => {
            onAnalysisComplete(result);
          }, 1000);
          
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          console.error('Raw content:', content);
          setError('Unable to parse analysis results. Please try again.');
        }
      } else {
        console.error('No choices in API response:', data);
        throw new Error('No analysis results received');
      }

    } catch (err) {
      console.error('Error analyzing image:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis';
      setError(errorMessage);
      
      // Show fallback analysis result when API fails
      console.log('Using fallback analysis result due to API error');
      const fallbackResult: FaceAnalysisResult = {
        observations: {
          facialExpression: "Unable to perform detailed facial analysis due to technical issues",
          eyeContact: "Analysis incomplete - please proceed with symptom assessment",
          skinTone: "Analysis incomplete - please proceed with symptom assessment",
          facialSymmetry: "Analysis incomplete - please proceed with symptom assessment",
          noseAndMouth: "Analysis incomplete - please proceed with symptom assessment",
          eyebrowsAndEyelashes: "Analysis incomplete - please proceed with symptom assessment"
        },
        overallAssessment: "Due to technical difficulties with the facial analysis service, we recommend proceeding with the comprehensive symptom assessment for a complete health evaluation.",
        potentialIndicators: ["Facial analysis unavailable - please use symptom assessment"],
        recommendedQuestions: ["Please describe your current symptoms in detail", "How long have you been experiencing these symptoms?"],
        disclaimer: "Facial analysis service is currently unavailable. This assessment is based on symptom information provided by the patient. Please consult with a healthcare professional for proper medical diagnosis."
      };
      setAnalysisResult(fallbackResult);
      setTimeout(() => {
        onAnalysisComplete(fallbackResult);
      }, 1000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset and start over
  const resetAnalysis = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setError(null);
    setCameraError(null);
    stopCamera();
  };

  // Cleanup on unmount
  useEffect(() => {
    console.log('FaceAnalysis component mounted');
    return () => {
      console.log('FaceAnalysis component unmounting, cleaning up camera');
      stopCamera();
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <div className="flex-1"></div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Eye className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Facial Analysis</h2>
          </div>
          <p className="text-gray-600">
            As part of your comprehensive health assessment, we'll analyze your facial features 
            to gain additional insights into your current health state.
          </p>
        </div>
      </div>

      {!analysisResult ? (
        <div className="space-y-6">
          {/* Camera Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              Capture Your Image
            </h3>
            
            {cameraError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{cameraError}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center space-y-4">
              {!capturedImage ? (
                <>
                  {/* Video element is always rendered but conditionally displayed */}
                  <div className={`relative ${isCameraActive ? 'block' : 'hidden'}`}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full max-w-md rounded-lg border-2 border-blue-300"
                      style={{ transform: 'scaleX(-1)' }}
                      onError={(e) => {
                        console.error('Video error:', e);
                        setCameraError('Failed to load camera feed. Please try again.');
                      }}
                    />
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none opacity-50"></div>
                    <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-sm">
                      Live Camera
                    </div>
                  </div>
                  
                  {/* Placeholder when camera is not active */}
                  {!isCameraActive && (
                    <div className="w-full max-w-md h-64 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Camera not active</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {!isCameraActive ? (
                      <>
                        <button
                          onClick={initializeCamera}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          Start Camera
                        </button>
                        <button
                          onClick={() => {
                            console.log('Debug - Current state:', {
                              isCameraActive,
                              cameraError,
                              videoRef: !!videoRef.current,
                              streamRef: !!streamRef.current,
                              videoReadyState: videoRef.current?.readyState,
                              videoSrcObject: !!videoRef.current?.srcObject
                            });
                          }}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          Debug
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={captureImage}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          Capture Photo
                        </button>
                        <button
                          onClick={stopCamera}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Stop Camera
                        </button>
                      </>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Or upload an existing photo</p>
                    <label className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="w-full max-w-md">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full rounded-lg border-2 border-green-300"
                  />
                  <div className="flex gap-3 mt-4 justify-center">
                    <button
                      onClick={analyzeFacialImage}
                      disabled={isAnalyzing}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Activity className="w-4 h-4" />
                          Analyze Image
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetAnalysis}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retake
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Analysis Results */
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-green-800">Analysis Complete</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Captured Image */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Analyzed Image</h4>
                <img
                  src={capturedImage || ''}
                  alt="Analyzed"
                  className="w-full rounded-lg border border-gray-300"
                />
              </div>

              {/* Overall Assessment */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Overall Assessment</h4>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700">{analysisResult.overallAssessment}</p>
                </div>
              </div>
            </div>

            {/* Detailed Observations */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-800 mb-3">Detailed Observations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h5 className="font-medium text-blue-700 mb-2">Facial Expression</h5>
                  <p className="text-sm text-gray-700">{analysisResult.observations.facialExpression}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h5 className="font-medium text-blue-700 mb-2">Eye Appearance</h5>
                  <p className="text-sm text-gray-700">{analysisResult.observations.eyeContact}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h5 className="font-medium text-blue-700 mb-2">Skin Condition</h5>
                  <p className="text-sm text-gray-700">{analysisResult.observations.skinTone}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h5 className="font-medium text-blue-700 mb-2">Facial Symmetry</h5>
                  <p className="text-sm text-gray-700">{analysisResult.observations.facialSymmetry}</p>
                </div>
              </div>
            </div>

            {/* Potential Indicators */}
            {analysisResult.potentialIndicators.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-3">Potential Medical Indicators</h4>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <ul className="space-y-2">
                    {analysisResult.potentialIndicators.map((indicator, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{indicator}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Recommended Questions */}
            {analysisResult.recommendedQuestions.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-3">Recommended Clinical Questions</h4>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <ul className="space-y-2">
                    {analysisResult.recommendedQuestions.map((question, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-6 bg-gray-100 p-4 rounded-lg border border-gray-300">
              <h4 className="font-medium text-gray-800 mb-2">Medical Disclaimer</h4>
              <p className="text-sm text-gray-600">{analysisResult.disclaimer}</p>
            </div>

            {/* Next Button */}
            <div className="text-center mt-6">
              <button
                onClick={onNext}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={!analysisResult}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default FaceAnalysis;
