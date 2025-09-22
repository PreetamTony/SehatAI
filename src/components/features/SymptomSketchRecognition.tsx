import axios from 'axios';
import { AlertCircle, ArrowLeft, ArrowRight, Brush, Loader2, Zap, Eraser, Brain } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface BodyPart {
  name: string;
  x: number;
  y: number;
  radius: number;
  description: string;
}


interface AnalysisResult {
  possibleConditions: Array<{
    condition: string;
    confidence: number;
    description: string;
    recommendedActions: string[];
  }>;
  bodyPart: string;
  severity: 'low' | 'moderate' | 'high';
  recommendations: string[];
}

interface SymptomSketchRecognitionProps {
  onAnalysisComplete: (result: any) => void;
  onNext: () => void;
  onBack: () => void;
}


const SymptomSketchRecognition: React.FC<SymptomSketchRecognitionProps> = ({ onAnalysisComplete, onNext, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [sketchPoints, setSketchPoints] = useState<{ x: number; y: number }[]>([]);
  const [sketchImage, setSketchImage] = useState<string>('');
  
  // User symptom information
  const [markingType, setMarkingType] = useState<string>('');
  const [coloredIn, setColoredIn] = useState<string>('');
  const [exactLocation, setExactLocation] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');


  // Define body parts with their positions and descriptions
  const bodyParts: BodyPart[] = [
    { name: 'Head', x: 200, y: 50, radius: 30, description: 'Head, including face, eyes, ears, nose, mouth, and brain' },
    { name: 'Neck', x: 200, y: 85, radius: 20, description: 'Neck, including throat, cervical spine, and lymph nodes' },
    { name: 'Chest', x: 200, y: 140, radius: 50, description: 'Chest, including heart, lungs, and ribcage' },
    { name: 'Abdomen', x: 200, y: 220, radius: 60, description: 'Abdomen, including stomach, liver, and intestines' },
    { name: 'Pelvis', x: 200, y: 300, radius: 45, description: 'Pelvic area, including reproductive organs and bladder' },
    { name: 'Left Arm', x: 150, y: 150, radius: 60, description: 'Left arm, including shoulder, elbow, and hand' },
    { name: 'Right Arm', x: 250, y: 150, radius: 60, description: 'Right arm, including shoulder, elbow, and hand' },
    { name: 'Left Leg', x: 170, y: 325, radius: 25, description: 'Left leg, including thigh, knee, and foot' },
    { name: 'Right Leg', x: 230, y: 325, radius: 25, description: 'Right leg, including thigh, knee, and foot' },
    { name: 'Lower Back', x: 200, y: 250, radius: 40, description: 'Lower back, including lumbar spine and muscles' },
  ];


  // Initialize canvas with human body outline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;


    const ctx = canvas.getContext('2d');
    if (!ctx) return;


    // Set canvas size
    canvas.width = 400;
    canvas.height = 600;
    
    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // Draw body parts
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    
    // Draw body outline
    ctx.beginPath();
    // Head
    ctx.arc(200, 50, 30, 0, Math.PI * 2);
    // Neck
    ctx.moveTo(185, 80);
    ctx.lineTo(215, 80);
    // Torso
    ctx.moveTo(215, 80);
    ctx.lineTo(240, 120);
    ctx.lineTo(240, 200);
    ctx.lineTo(200, 250);
    ctx.lineTo(160, 200);
    ctx.lineTo(160, 120);
    ctx.lineTo(185, 80);
    // Arms
    ctx.moveTo(160, 120);
    ctx.lineTo(120, 180);
    ctx.moveTo(240, 120);
    ctx.lineTo(280, 180);
    // Legs
    ctx.moveTo(200, 250);
    ctx.lineTo(180, 400);
    ctx.moveTo(200, 250);
    ctx.lineTo(220, 400);
    ctx.stroke();
  }, []);


  // Start drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;


    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;


    setIsDrawing(true);
    setSketchPoints([{ x, y }]);


    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 5;
    }
  };


  // Draw on canvas
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;


    const canvas = canvasRef.current;
    if (!canvas) return;


    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;


    setSketchPoints(prev => [...prev, { x, y }]);


    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };


  // Stop drawing
  const stopDrawing = () => {
    setIsDrawing(false);
  };


  // Analyze sketch with Groq API using VLM
  const analyzeSketch = async () => {
    if (sketchPoints.length === 0) {
      toast.error('Please draw a symptom location first.');
      return;
    }


    setIsAnalyzing(true);
    setAiResponse('Analyzing...');


    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    const url = 'https://api.groq.com/openai/v1/chat/completions';


    // Calculate the center of the drawn area
    const avgX = sketchPoints.reduce((sum, p) => sum + p.x, 0) / sketchPoints.length;
    const avgY = sketchPoints.reduce((sum, p) => sum + p.y, 0) / sketchPoints.length;


    // Find the closest body part to the drawn area
    const closestPart = bodyParts.reduce((closest, part) => {
      const distance = Math.sqrt(Math.pow(part.x - avgX, 2) + Math.pow(part.y - avgY, 2));
      return distance < closest.distance ? { part, distance } : closest;
    }, { part: bodyParts[0], distance: Infinity });


    // Get the canvas data URL
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Ensure the canvas has the latest drawing
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Redraw everything to ensure it's captured
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Redraw body outline
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Head
      ctx.arc(200, 50, 30, 0, Math.PI * 2);
      // Neck
      ctx.moveTo(185, 80);
      ctx.lineTo(215, 80);
      // Torso
      ctx.moveTo(215, 80);
      ctx.lineTo(240, 120);
      ctx.lineTo(240, 200);
      ctx.lineTo(200, 250);
      ctx.lineTo(160, 200);
      ctx.lineTo(160, 120);
      ctx.lineTo(185, 80);
      // Arms
      ctx.moveTo(160, 120);
      ctx.lineTo(120, 180);
      ctx.moveTo(240, 120);
      ctx.lineTo(280, 180);
      // Legs
      ctx.moveTo(200, 250);
      ctx.lineTo(180, 400);
      ctx.moveTo(200, 250);
      ctx.lineTo(220, 400);
      ctx.stroke();
      
      // Redraw user's sketch
      if (sketchPoints.length > 0) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(sketchPoints[0].x, sketchPoints[0].y);
        for (let i = 1; i < sketchPoints.length; i++) {
          ctx.lineTo(sketchPoints[i].x, sketchPoints[i].y);
        }
        ctx.stroke();
      }
    }
    
    const sketchData = canvas.toDataURL('image/png');
    setSketchImage(sketchData);
    console.log('Sketch image captured:', sketchData.substring(0, 100) + '...');


    try {
      const response = await axios.post(url, {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a medical AI specialized in analyzing symptom locations on the human body. 
            The user has drawn on a human body outline. Analyze the location and provide:
            1. The most likely body part affected
            2. Common conditions that could cause symptoms in this area
            3. Recommended next steps or actions
            
            Be concise but thorough in your analysis.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `The user has drawn on a human body outline. The center of the drawing is near the ${closestPart.part.name.toLowerCase()} area. 
                The drawing spans approximately ${sketchPoints.length} points. 
                
                Additional details provided by the user:
                - Marking type: ${markingType || 'not specified'}
                - Colored in: ${coloredIn || 'not specified'}
                - Exact location: ${exactLocation || 'not specified'}
                - Symptoms experienced: ${symptoms || 'not specified'}
                
                Please analyze possible medical conditions that could be indicated by symptoms in this area based on both the drawing and the detailed information provided.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: sketchData
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }, {
        headers: { 
          'Authorization': `Bearer ${apiKey}`, 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });


      const result = response.data.choices[0].message.content;
      setAiResponse(result);
      
      // Call the onAnalysisComplete prop with the analysis result
      const analysisData = {
        sketchImage: sketchImage,
        aiResponse: result,
        userSymptoms: {
          markingType,
          coloredIn,
          exactLocation,
          symptoms
        },
        bodyPart: closestPart?.part?.name || 'unknown'
      };
      console.log('Sending analysis data to parent:', {
        hasSketchImage: !!sketchImage,
        sketchImageLength: sketchImage?.length || 0,
        bodyPart: analysisData.bodyPart,
        userSymptoms: analysisData.userSymptoms
      });
      onAnalysisComplete(analysisData);
      
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Groq API Error:', error);
      
      // Fallback to text-only analysis if image processing fails
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
        } else {
          console.error('Error message:', error.message);
        }
      } else {
        console.error('Unexpected error:', error);
      }
      try {
        const fallbackResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a medical AI. Analyze the drawn symptoms on the human body and suggest possible conditions.'
            },
            {
              role: 'user',
              content: `The user has drawn on a human body outline near the ${closestPart.part.name.toLowerCase()} area. This area includes: ${closestPart.part.description}.
                
                Additional details provided by the user:
                - Marking type: ${markingType || 'not specified'}
                - Colored in: ${coloredIn || 'not specified'}
                - Exact location: ${exactLocation || 'not specified'}
                - Symptoms experienced: ${symptoms || 'not specified'}
                
                Please analyze possible medical conditions that could be indicated by symptoms in this area based on the detailed information provided.`
            }
          ],
          temperature: 0.3,
          max_tokens: 1024,
        }, {
          headers: { 
            'Authorization': `Bearer ${apiKey}`, 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        });
        
        setAiResponse(fallbackResponse.data.choices[0].message.content);
        
        // Call the onAnalysisComplete prop with the fallback analysis result
        const analysisData = {
          sketchImage: sketchImage,
          aiResponse: fallbackResponse.data.choices[0].message.content,
          userSymptoms: {
            markingType,
            coloredIn,
            exactLocation,
            symptoms
          },
          bodyPart: closestPart?.part?.name || 'unknown'
        };
        onAnalysisComplete(analysisData);
        
        toast.success('Basic analysis complete (image processing not available)');
      } catch (fallbackError) {
        console.error('Fallback analysis failed:', fallbackError);
        let errorMessage = 'Error: Unable to analyze the sketch. Please try again later.';
        if (axios.isAxiosError(fallbackError) && fallbackError.response) {
          errorMessage += `\n\nError details: ${JSON.stringify(fallbackError.response.data, null, 2)}`;
        } else if (fallbackError instanceof Error) {
          errorMessage += `\n\nError: ${fallbackError.message}`;
        }
        setAiResponse(errorMessage);
        toast.error('Analysis failed');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };


  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;


    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Redraw the human outline
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 2;
      
      // Draw body outline
      ctx.beginPath();
      // Head
      ctx.arc(200, 50, 30, 0, Math.PI * 2);
      // Neck
      ctx.moveTo(185, 80);
      ctx.lineTo(215, 80);
      // Torso
      ctx.moveTo(215, 80);
      ctx.lineTo(240, 120);
      ctx.lineTo(240, 200);
      ctx.lineTo(200, 250);
      ctx.lineTo(160, 200);
      ctx.lineTo(160, 120);
      ctx.lineTo(185, 80);
      // Arms
      ctx.moveTo(160, 120);
      ctx.lineTo(120, 180);
      ctx.moveTo(240, 120);
      ctx.lineTo(280, 180);
      // Legs
      ctx.moveTo(200, 250);
      ctx.lineTo(180, 400);
      ctx.moveTo(200, 250);
      ctx.lineTo(220, 400);
      ctx.stroke();
    }
    setSketchPoints([]);
    setAiResponse('');
    setSketchImage('');
  };


  // Export analysis data for integration with parent component
  const getAnalysisData = () => {
    return {
      sketchImage,
      aiResponse,
      markingType,
      coloredIn,
      exactLocation,
      symptoms,
      sketchPoints: sketchPoints.length
    };
  };


  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl border border-blue-100 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-2">
          Symptom Sketch Recognition
        </h2>
        <p className="text-gray-600">Draw on the body outline to indicate where you're experiencing symptoms</p>
      </div>


      {/* Canvas for Drawing */}
      <div className="relative w-full max-w-md bg-white p-4 rounded-xl shadow-sm border border-blue-100">
        <div className="relative">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            className="w-full h-auto border border-gray-200 rounded-lg bg-white cursor-crosshair"
            style={{ touchAction: 'none' }}
          />
          <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
            <Brush className="w-3 h-3 mr-1" />
            Draw here
          </div>
        </div>


      {/* Controls */}
      {/* Symptom Details Form */}
      <div className="mt-6 w-full max-w-2xl bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Please provide more details about your symptoms
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What kind of markings did you use? (circles, lines, or something else?)
            </label>
            <input
              type="text"
              value={markingType}
              onChange={(e) => setMarkingType(e.target.value)}
              placeholder="e.g., circles, lines, crosses, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Did you color them in?
            </label>
            <input
              type="text"
              value={coloredIn}
              onChange={(e) => setColoredIn(e.target.value)}
              placeholder="e.g., yes, no, partially"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Where exactly on the body part did you draw? (thigh, knee, calf, ankle, foot, etc.)
            </label>
            <input
              type="text"
              value={exactLocation}
              onChange={(e) => setExactLocation(e.target.value)}
              placeholder="e.g., thigh, knee, calf, ankle, foot, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What sensations or symptoms are you experiencing? (pain, swelling, numbness, weakness, redness, other?)
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., sharp pain, mild swelling, numbness, weakness, redness, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>


      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <button
          onClick={analyzeSketch}
          disabled={isAnalyzing || sketchPoints.length === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
            isAnalyzing
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : sketchPoints.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:from-blue-700 hover:to-teal-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          {isAnalyzing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Zap className="w-5 h-5" />
          )}
          {isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
        </button>
        
        <button
          onClick={clearCanvas}
          disabled={sketchPoints.length === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
            sketchPoints.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
          }`}
        >
          <Eraser className="w-5 h-5" />
          Clear Drawing
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4 mt-6 w-full max-w-2xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Face Analysis
        </button>
        
        <button
          onClick={onNext}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
        >
          Continue to Symptoms
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>


      {/* AI Response */}
      {aiResponse && (
        <div className="mt-8 w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Analysis Results</h3>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
            {aiResponse === 'Analyzing...' ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mr-3" />
                <span className="text-gray-600">Analyzing your symptoms...</span>
              </div>
            ) : (
              <div className="prose prose-blue max-w-none">
                {aiResponse.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-700 mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>This is not a medical diagnosis. Please consult a healthcare professional for medical advice.</p>
          </div>
        </div>
      )}


      {/* Instructions */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2 w-full">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Draw on the body to mark where you feel pain or symptoms. Click "Analyze Symptoms" to get AI insights. Clear to start over.
        </p>
      </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};


export default SymptomSketchRecognition;
