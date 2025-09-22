import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Activity, 
  BarChart3, 
  Brush,
  CheckCircle, 
  Eye,
  Heart, 
  Pill, 
  Plus, 
  Stethoscope, 
  Target, 
  Thermometer, 
  AlertTriangle, 
  Clock,
  Info,
  Send,
  X,
  Loader2
} from 'lucide-react';
import MedicalReport from './MedicalReport';
import FaceAnalysis from './FaceAnalysis';
import SymptomSketchRecognition from './SymptomSketchRecognition';
import { AudioPlayer } from '../ui/AudioPlayer';
import { LanguageSelector } from '../ui/LanguageSelector';
import { TranslationService } from '../../services/translation';

type WorkflowStep = 'faceAnalysis' | 'symptomSketch' | 'symptoms' | 'assessment' | 'interview' | 'evaluation' | 'recommendations' | 'followup';

interface PatientAnswer {
  question: string;
  answer: string;
  category: string;
}

interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
}

interface Recommendations {
  immediate: string[];
  lifestyle: string[];
  monitoring: string[];
}

interface FollowUp {
  timeframe: string;
  actions: string[];
}

interface GeneralAdvice {
  precautions: string[];
  lifestyle: string[];
  warningSignsToWatch: string[];
}

interface Prescription {
  recommendations: string[];
  notes?: string;
  disclaimer?: string;
}

interface Condition {
  condition: string;
  probability: number;
  description: string;
  recommendations: Recommendations;
  urgencyLevel: 'emergency' | 'immediate' | 'urgent' | 'routine';
  followUp: FollowUp;
}

interface PredictionResult {
  possibleConditions: Condition[];
  generalAdvice: GeneralAdvice;
  prescription?: Prescription;
  disclaimer: string;
}

interface PatientProfile {
  name: string;
  age: string;
  gender: string;
  diabetes: string;
  hypertension: string;
  alcohol: string;
  smoking: string;
  medications: string;
  allergies: string;
  pastMedicalHistory: string;
  familyHistory: string;
}

const DoctorSevaAI = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('faceAnalysis');
  const [patientProfile, setPatientProfile] = useState<PatientProfile>({
    name: '',
    age: '',
    gender: '',
    diabetes: '',
    hypertension: '',
    alcohol: '',
    smoking: '',
    medications: '',
    allergies: '',
    pastMedicalHistory: '',
    familyHistory: ''
  });
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [newSymptom, setNewSymptom] = useState('');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [faceAnalysisResult, setFaceAnalysisResult] = useState<any>(null);
  const [symptomSketchResult, setSymptomSketchResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicQuestions, setDynamicQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [patientAnswers, setPatientAnswers] = useState<PatientAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedQuestions, setTranslatedQuestions] = useState<{[key: number]: string}>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedQuestion, setTranslatedQuestion] = useState('');
  
  const translationService = TranslationService.getInstance();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Translation function for questions
  const translateQuestion = async (questionText: string, questionIndex: number): Promise<string> => {
    if (selectedLanguage === 'en') {
      return questionText; // No translation needed for English
    }

    // Check if we already have this question translated
    if (translatedQuestions[questionIndex]) {
      return translatedQuestions[questionIndex];
    }

    try {
      setIsTranslating(true);
      const translatedText = await translationService.translateText(questionText, selectedLanguage);
      
      // Cache the translation
      setTranslatedQuestions(prev => ({
        ...prev,
        [questionIndex]: translatedText
      }));
      
      return translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      return questionText; // Fallback to original text
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle language change
  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    // Clear cached translations when language changes
    setTranslatedQuestions({});
  };

  // Effect to translate current question when language or question changes
  useEffect(() => {
    const translateCurrentQuestion = async () => {
      if (currentStep === 'interview' && dynamicQuestions.length > 0) {
        const currentQuestion = dynamicQuestions[currentQuestionIndex];
        if (currentQuestion && currentQuestion.question) {
          try {
            const translated = await translateQuestion(currentQuestion.question, currentQuestionIndex);
            setTranslatedQuestion(translated);
          } catch (error) {
            console.error('Failed to translate question:', error);
            setTranslatedQuestion(currentQuestion.question);
          }
        }
      }
    };

    translateCurrentQuestion();
  }, [currentQuestionIndex, selectedLanguage, dynamicQuestions, currentStep]);

  // All questions will be generated dynamically by AI based on patient symptoms and profile
  const medicalQuestions: any[] = [];

  const steps = [
    { id: 'faceAnalysis', title: 'Face Analysis', icon: Eye },
    { id: 'symptomSketch', title: 'Symptom Sketch', icon: Brush },
    { id: 'symptoms', title: 'Symptoms', icon: Thermometer },
    { id: 'assessment', title: 'Assessment', icon: Activity },
    { id: 'interview', title: 'Interview', icon: 'avatar' },
    { id: 'evaluation', title: 'Evaluation', icon: BarChart3 },
    { id: 'recommendations', title: 'Recommendations', icon: Target },
    { id: 'followup', title: 'Follow-up', icon: Heart }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // All questions are now generated dynamically by AI - no static question mapping needed

  const handleAddSymptom = () => {
    if (newSymptom.trim()) {
      const newSymptomObj: Symptom = {
        id: crypto.randomUUID(),
        name: newSymptom.trim(),
        severity: 'mild',
        duration: ''
      };
      setSymptoms(prev => [...prev, newSymptomObj]);
      setNewSymptom('');
    }
  };

  const handleRemoveSymptom = (id: string) => {
    setSymptoms(prev => prev.filter(s => s.id !== id));
  };

  const updateSymptom = (id: string, field: keyof Symptom, value: string) => {
    setSymptoms(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const generateDynamicQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are an expert medical AI assistant specializing in diagnostic questioning. Based on the patient's symptoms and profile, generate 5-7 specific, clinically relevant follow-up questions that will help narrow down the differential diagnosis.

              Your questions should:
              1. Be specific and targeted to the reported symptoms
              2. Cover different aspects: onset, duration, severity, aggravating/relieving factors, associated symptoms
              3. Consider the patient's age, gender, and medical history
              4. Help differentiate between possible conditions
              5. Be clear and easy for patients to understand
              
              Return the questions in this exact JSON format:
              [
                {
                  "category": "Symptoms",
                  "question": "Specific question about symptoms"
                },
                {
                  "category": "Medical History",
                  "question": "Specific question about medical history"
                }
              ]`
            },
            {
              role: 'user',
              content: `PATIENT PROFILE:
Name: ${patientProfile.name}
Age: ${patientProfile.age}
Gender: ${patientProfile.gender}
Diabetes: ${patientProfile.diabetes}
Hypertension: ${patientProfile.hypertension}
Alcohol: ${patientProfile.alcohol}
Smoking: ${patientProfile.smoking}
Medications: ${patientProfile.medications}
Allergies: ${patientProfile.allergies}
Past Medical History: ${patientProfile.pastMedicalHistory}
Family History: ${patientProfile.familyHistory}

REPORTED SYMPTOMS:
${symptoms.map(s => `- ${s.name} (Severity: ${s.severity}/10, Duration: ${s.duration})`).join('\n')}

Generate specific medical questions to help diagnose this patient's condition effectively.`
            }
          ],
          temperature: 0.3,
          max_tokens: 1500
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
      }
      
      if (data.choices && data.choices[0]) {
        const content = data.choices[0].message.content;
        console.log('Raw API Response:', content);
        
        try {
          // Clean the response content
          const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const questions = JSON.parse(cleanContent);
          
          if (Array.isArray(questions) && questions.length > 0) {
            setDynamicQuestions(questions);
          } else {
            throw new Error('Invalid questions format');
          }
        } catch (parseError) {
          console.error('Error parsing questions:', parseError);
          console.error('Raw content:', content);
          throw new Error('Failed to parse AI-generated questions. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate medical questions. Please check your internet connection and try again.');
      setCurrentStep('assessment');
    } finally {
      setIsLoading(false);
    }
  };

  // No fallback questions - rely entirely on AI model for question generation

  const performMedicalAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are an expert medical AI assistant providing comprehensive medical analysis. Analyze the patient's complete profile, symptoms, and interview responses to provide:
              
              1. Differential diagnosis with probability assessments
              2. Detailed condition descriptions
              3. Specific, actionable recommendations
              4. Urgency level assessment
              5. Follow-up care plan
              6. Prescription recommendations (with appropriate disclaimers)
              
              Return the analysis in this exact JSON format:
              {
                "possibleConditions": [
                  {
                    "condition": "Condition Name",
                    "probability": 0.0-1.0,
                    "description": "Detailed description of the condition",
                    "recommendations": {
                      "immediate": ["action1", "action2"],
                      "lifestyle": ["action1", "action2"],
                      "monitoring": ["action1", "action2"]
                    },
                    "urgencyLevel": "emergency|urgent|routine",
                    "followUp": {
                      "timeframe": "e.g., 1 week, 1 month",
                      "actions": ["action1", "action2"]
                    }
                  }
                ],
                "generalAdvice": {
                  "precautions": ["precaution1", "precaution2"],
                  "lifestyle": ["lifestyle1", "lifestyle2"],
                  "warningSignsToWatch": ["warning1", "warning2"]
                },
                "prescription": {
                  "recommendations": ["medication1 with dosage", "medication2 with dosage"],
                  "notes": "Important notes about medications",
                  "disclaimer": "Prescription disclaimer text"
                },
                "disclaimer": "Medical analysis disclaimer"
              }`
            },
            {
              role: 'user',
              content: `COMPREHENSIVE PATIENT ASSESSMENT:

PATIENT DEMOGRAPHICS:
Name: ${patientProfile.name}
Age: ${patientProfile.age}
Gender: ${patientProfile.gender}

MEDICAL HISTORY:
Diabetes: ${patientProfile.diabetes}
Hypertension: ${patientProfile.hypertension}
Alcohol Use: ${patientProfile.alcohol}
Smoking Status: ${patientProfile.smoking}
Current Medications: ${patientProfile.medications}
Allergies: ${patientProfile.allergies}
Past Medical History: ${patientProfile.pastMedicalHistory}
Family History: ${patientProfile.familyHistory}

REPORTED SYMPTOMS:
${symptoms.map(s => `- ${s.name} (Severity: ${s.severity}/10, Duration: ${s.duration})`).join('\n')}

INTERVIEW RESPONSES:
${patientAnswers.map(a => `Q: ${a.question}\nA: ${a.answer}\nCategory: ${a.category}`).join('\n\n')}

${faceAnalysisResult ? `FACIAL ANALYSIS RESULTS:
${JSON.stringify(faceAnalysisResult, null, 2)}

` : ''}${symptomSketchResult ? `SYMPTOM SKETCH ANALYSIS:
${JSON.stringify(symptomSketchResult, null, 2)}

` : ''}Please provide a comprehensive medical analysis including differential diagnosis, specific recommendations, and appropriate prescription suggestions with proper medical disclaimers. Consider the facial analysis and symptom sketch results if available for additional insights into the patient's condition."`
            }
          ],
          temperature: 0.2,
          max_tokens: 3000
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
      }
      
      if (data.choices && data.choices[0]) {
        const content = data.choices[0].message.content;
        console.log('Raw Analysis Response:', content);
        
        try {
          // Clean the response content to extract JSON
          let cleanContent = content;
          
          // Remove markdown title and introductory text
          cleanContent = cleanContent.replace(/^\*\*Comprehensive Medical Analysis\*\*.*?```json\n?/gs, '');
          
          // Alternative: Remove any text before the JSON opening brace
          if (!cleanContent.trim().startsWith('{')) {
            const jsonStart = cleanContent.indexOf('{');
            if (jsonStart !== -1) {
              cleanContent = cleanContent.substring(jsonStart);
            }
          }
          
          // Remove markdown code block markers
          cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          
          // Find the end of JSON (closing brace + optional whitespace)
          const jsonEnd = cleanContent.lastIndexOf('}');
          if (jsonEnd !== -1) {
            cleanContent = cleanContent.substring(0, jsonEnd + 1);
          }
          
          // Remove any trailing markdown or notes
          cleanContent = cleanContent.replace(/\n?\*\*Important Notes:\*\*[\s\S]*$/gm, '');
          cleanContent = cleanContent.replace(/\n?Please note that[\s\S]*$/gm, '');
          
          // Trim whitespace
          cleanContent = cleanContent.trim();
          
          console.log('Cleaned content for parsing:', cleanContent);
          const analysis = JSON.parse(cleanContent);
          
          // Validate the analysis structure
          if (analysis.possibleConditions && Array.isArray(analysis.possibleConditions)) {
            setPrediction(analysis);
            setCurrentStep('recommendations');
          } else {
            throw new Error('Invalid analysis format');
          }
        } catch (parseError) {
          console.error('Error parsing analysis:', parseError);
          console.error('Raw content:', content);
          throw new Error('Failed to parse AI medical analysis. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error performing analysis:', error);
      alert('Failed to perform medical analysis. Please check your internet connection and try again.');
      setCurrentStep('evaluation');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // No fallback analysis - rely entirely on AI model for medical analysis

  const handleSymptomSubmit = () => {
    if (symptoms.length > 0) {
      setCurrentStep('assessment');
    }
  };

  const startInterview = async () => {
    setCurrentStep('interview');
    setCurrentQuestionIndex(0);
    setPatientAnswers([]);
    await generateDynamicQuestions();
  };

  const handleAnswerSubmit = (answer: string) => {
    const currentQuestions = dynamicQuestions;
    const newAnswer: PatientAnswer = {
      question: currentQuestions[currentQuestionIndex].question,
      answer: answer,
      category: currentQuestions[currentQuestionIndex].category
    };

    setPatientAnswers(prev => [...prev, newAnswer]);

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCurrentStep('evaluation');
      performMedicalAnalysis();
    }
  };

  if (currentStep === 'faceAnalysis') {
    return (
      <FaceAnalysis
        onAnalysisComplete={(result) => {
          setFaceAnalysisResult(result);
        }}
        onNext={() => {
          setCurrentStep('symptomSketch');
        }}
        onBack={() => {
          setCurrentStep('symptoms');
        }}
      />
    );
  }

  if (currentStep === 'symptomSketch') {
    return (
      <SymptomSketchRecognition
        onAnalysisComplete={(result) => {
          console.log('Received symptom sketch result in DoctorSevaAI:', {
            hasSketchImage: !!result.sketchImage,
            sketchImageLength: result.sketchImage?.length || 0,
            bodyPart: result.bodyPart,
            userSymptoms: result.userSymptoms
          });
          setSymptomSketchResult(result);
        }}
        onNext={() => {
          setCurrentStep('symptoms');
        }}
        onBack={() => {
          setCurrentStep('faceAnalysis');
        }}
      />
    );
  }

  if (currentStep === 'interview') {
    const currentQuestions = dynamicQuestions;
    const currentQuestion = currentQuestions[currentQuestionIndex];
    
    if (isLoading) {
      return (
        <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setCurrentStep('assessment')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Assessment
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Generating Personalized Questions</h3>
            <p className="text-gray-600">Our AI is analyzing your symptoms to create specific questions for you...</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setCurrentStep('assessment')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Assessment
            </button>
            <LanguageSelector 
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
            />
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Question {currentQuestionIndex + 1} of {currentQuestions.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Stethoscope className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {currentQuestion.category}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 leading-relaxed">
            {isTranslating ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Translating question...</span>
              </div>
            ) : (
              translatedQuestion || currentQuestion.question
            )}
          </h3>
          
          {/* Audio Player for Text-to-Speech */}
          <div className="mb-4">
            <AudioPlayer 
              text={translatedQuestion || currentQuestion.question}
              className="justify-center"
              onPlayStart={() => console.log('Audio playback started')}
              onPlayEnd={() => console.log('Audio playback ended')}
            />
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Take your time to answer thoughtfully</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 text-gray-700 placeholder-gray-400"
              rows={5}
              placeholder="Share your detailed response here..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  if (currentAnswer.trim()) {
                    handleAnswerSubmit(currentAnswer);
                    setCurrentAnswer('');
                  }
                }
              }}
              autoFocus
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded">
              Ctrl+Enter to submit
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Info className="w-4 h-4" />
              <span>Be as specific as possible for better analysis</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (currentAnswer.trim()) {
                    handleAnswerSubmit(currentAnswer);
                    setCurrentAnswer('');
                  }
                }}
                disabled={!currentAnswer.trim()}
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Answer
              </button>
            </div>
          </div>
          
          {/* Quick response suggestions for common questions */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick responses:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCurrentAnswer('Yes, I have been experiencing this for several days.')}
                className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-50 transition-colors"
              >
                Yes, for several days
              </button>
              <button
                onClick={() => setCurrentAnswer('No, this is the first time I\'ve experienced this.')}
                className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-50 transition-colors"
              >
                No, first time
              </button>
              <button
                onClick={() => setCurrentAnswer('Sometimes, it comes and goes throughout the day.')}
                className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-50 transition-colors"
              >
                Sometimes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const downloadReport = () => {
    console.log('Generating report with symptom sketch result:', {
      hasSymptomSketchResult: !!symptomSketchResult,
      hasSketchImage: !!symptomSketchResult?.sketchImage,
      sketchImageLength: symptomSketchResult?.sketchImage?.length || 0,
      bodyPart: symptomSketchResult?.bodyPart
    });
    if (!prediction) {
      alert('No analysis data available for report generation');
      return;
    }

    // Create a new window for the report
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      alert('Please allow popups to download the report');
      return;
    }

    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Generate the report HTML
    const reportHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Medical Assessment Report - ${patientProfile.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          @media print { body { background: white; padding: 0; } }
        </style>
      </head>
      <body>
        <div style="max-width: 800px; margin: 0 auto; background: white; padding: 20px;">
          <h1 style="color: #1e4d8b; text-align: center; border-bottom: 2px solid #1e4d8b; padding-bottom: 10px;">Medical Assessment Report</h1>
          <p style="text-align: center; color: #666; margin-bottom: 30px;">AI-Powered Health Analysis - ${reportDate}</p>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; border-left: 4px solid #1e4d8b; padding-left: 10px;">Patient Information</h2>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
              <p><strong>Name:</strong> ${patientProfile.name}</p>
              <p><strong>Age:</strong> ${patientProfile.age}</p>
              <p><strong>Gender:</strong> ${patientProfile.gender}</p>
              <p><strong>Diabetes:</strong> ${patientProfile.diabetes}</p>
              <p><strong>Hypertension:</strong> ${patientProfile.hypertension}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; border-left: 4px solid #dc3545; padding-left: 10px;">Reported Symptoms</h2>
            <div style="background: #f8d7da; padding: 15px; border-radius: 5px;">
              ${symptoms.map(s => `<p><strong>• ${s.name}</strong> (Severity: ${s.severity}/10, Duration: ${s.duration})</p>`).join('')}
            </div>
          </div>
          
          ${symptomSketchResult ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; border-left: 4px solid #fd7e14; padding-left: 10px;">Symptom Sketch Analysis</h2>
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px;">
              <p><strong>Body Part:</strong> ${symptomSketchResult.bodyPart || 'Not specified'}</p>
              <p><strong>Marking Type:</strong> ${symptomSketchResult.userSymptoms?.markingType || 'Not specified'}</p>
              <p><strong>Colored In:</strong> ${symptomSketchResult.userSymptoms?.coloredIn || 'Not specified'}</p>
              <p><strong>Exact Location:</strong> ${symptomSketchResult.userSymptoms?.exactLocation || 'Not specified'}</p>
              <p><strong>Symptoms:</strong> ${symptomSketchResult.userSymptoms?.symptoms || 'Not specified'}</p>
              ${symptomSketchResult.sketchImage ? `<div style="margin-top: 15px; text-align: center;"><img src="${symptomSketchResult.sketchImage}" alt="Symptom Sketch" style="max-width: 300px; max-height: 300px; border: 1px solid #ddd; border-radius: 5px;"></div>` : ''}
              <div style="margin-top: 15px; background: white; padding: 10px; border-radius: 5px; border-left: 4px solid #fd7e14;">
                <h4 style="color: #333; margin-top: 0;">AI Analysis:</h4>
                <p style="color: #666; white-space: pre-wrap;">${symptomSketchResult.aiResponse}</p>
              </div>
            </div>
          </div>
          ` : ''}
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; border-left: 4px solid #6f42c1; padding-left: 10px;">AI Medical Analysis</h2>
            <div style="background: #f3e8ff; padding: 15px; border-radius: 5px;">
              ${prediction.possibleConditions.map(c => `
                <div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid #6f42c1;">
                  <h3 style="color: #333; margin-top: 0;">${c.condition} <span style="background: ${c.urgencyLevel === 'emergency' ? '#dc3545' : c.urgencyLevel === 'urgent' ? '#fd7e14' : '#007bff'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${c.urgencyLevel.toUpperCase()}</span> <span style="background: #6c757d; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${(c.probability * 100).toFixed(1)}%</span></h3>
                  <p style="color: #666;">${c.description}</p>
                  <div style="margin-top: 10px;"><strong>Immediate Actions:</strong><ul style="margin: 5px 0; padding-left: 20px;">${c.recommendations.immediate.map(action => `<li>${action}</li>`).join('')}</ul></div>
                  <div style="margin-top: 10px;"><strong>Follow-up:</strong> ${c.followUp.timeframe} - ${c.followUp.actions.join(', ')}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; border-left: 4px solid #28a745; padding-left: 10px;">Prescription Recommendations</h2>
            <div style="background: #d4edda; padding: 15px; border-radius: 5px; border: 2px solid #28a745;">
              <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                <h3 style="color: #333; margin-top: 0; text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 10px;">PRESCRIPTION</h3>
                <p style="text-align: center; font-size: 12px; color: #666; margin: 0;">Dr. AI Assistant - Virtual Consultation</p>
                <p style="text-align: right; font-size: 12px; color: #666; margin: 5px 0;">Date: ${reportDate}</p>
                <p style="font-size: 12px; margin: 10px 0;"><strong>Patient:</strong> ${patientProfile.name}, ${patientProfile.age}, ${patientProfile.gender}</p>
                
                <h4 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px;">Medications</h4>
                ${prediction.prescription?.recommendations?.map(med => `<div style="border-left: 4px solid #28a745; padding-left: 10px; margin-bottom: 10px;"><strong>${med}</strong></div>`).join('') || '<p>No specific medications recommended</p>'}
                
                <div style="background: #fff3cd; padding: 10px; border-radius: 5px; margin-top: 15px;">
                  <h5 style="color: #856404; margin-top: 0;">Important Notes:</h5>
                  <p style="color: #856404; font-size: 12px; margin: 0;">${prediction.prescription?.notes || 'No specific notes provided'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; border: 1px solid #dee2e6;">
            <h3 style="color: #333; margin-top: 0;">Medical Disclaimer</h3>
            <p style="color: #666; font-size: 12px; line-height: 1.4; margin: 0;">${prediction.disclaimer}</p>
            <p style="color: #666; font-size: 12px; line-height: 1.4; margin: 10px 0 0 0;">${prediction.prescription?.disclaimer || 'No prescription disclaimer available'}</p>
            <p style="color: #999; font-size: 10px; text-align: center; margin-top: 20px; border-top: 1px solid #dee2e6; padding-top: 10px;">This report was generated by an AI system and is for informational purposes only. Always consult with a qualified healthcare professional for medical diagnosis and treatment.</p>
          </div>
        </div>
        <script>
          setTimeout(() => { window.print(); }, 1000);
        </script>
      </body>
      </html>
    `;

    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-[#003366] to-[#1e4d8b] p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Doctor-e-Seva AI</h2>
              <p className="text-blue-100 text-sm">AI-powered medical consultation</p>
            </div>
          </div>
          <div className="text-sm text-blue-100">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-3">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center ${
                index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden ${
                index < currentStepIndex 
                  ? 'bg-blue-600 text-white' 
                  : index === currentStepIndex
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {step.icon === 'avatar' ? (
                  <img 
                    src="/interviewer-avatar.jpg" 
                    alt="Doctor" 
                    className="w-full h-full object-cover"
                  />
                ) : index < currentStepIndex ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${
                  index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {currentStep === 'symptoms' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center mb-4 p-3 rounded-full bg-blue-50">
                <Thermometer className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Tell us about your symptoms</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={patientProfile.name}
                    onChange={(e) => setPatientProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={patientProfile.age}
                      onChange={(e) => setPatientProfile(prev => ({ ...prev, age: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={patientProfile.gender}
                      onChange={(e) => setPatientProfile(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Symptoms
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSymptom}
                      onChange={(e) => setNewSymptom(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newSymptom.trim()) {
                          handleAddSymptom();
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter a symptom"
                    />
                    <button
                      onClick={handleAddSymptom}
                      disabled={!newSymptom.trim()}
                      className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {symptoms.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Your symptoms:</div>
                    <div className="space-y-3">
                      {symptoms.map((symptom) => (
                        <div 
                          key={symptom.id}
                          className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-blue-900">{symptom.name}</span>
                            <button
                              onClick={() => handleRemoveSymptom(symptom.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-600">Severity</label>
                              <select
                                value={symptom.severity}
                                onChange={(e) => updateSymptom(symptom.id, 'severity', e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="mild">Mild</option>
                                <option value="moderate">Moderate</option>
                                <option value="severe">Severe</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">Duration</label>
                              <input
                                type="text"
                                value={symptom.duration}
                                onChange={(e) => updateSymptom(symptom.id, 'duration', e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                                placeholder="e.g., 2 days, 1 week"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {symptoms.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <div className="mb-2">
                      <Thermometer className="w-8 h-8 mx-auto text-gray-300" />
                    </div>
                    <p className="text-sm">Add your symptoms using the + button above</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSymptomSubmit}
              disabled={!patientProfile.name || symptoms.length === 0}
              className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Begin Assessment
            </button>
          </div>
        )}

        {currentStep === 'assessment' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center mb-4 p-3 rounded-full bg-green-50">
                <Activity className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready for your health assessment</h3>
              <p className="text-gray-600 mb-6">
                Based on your symptoms, we'll generate personalized questions to better understand your condition
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-blue-800 mb-3">What to expect:</h4>
              <div className="space-y-2 text-left text-blue-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Questions about your symptoms and medical history</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Lifestyle and general health assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Personalized recommendations based on your responses</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setCurrentStep('symptoms')}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={startInterview}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
              >
                Start Interview
              </button>
            </div>
          </div>
        )}

        {currentStep === 'evaluation' && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center mb-4 p-3 rounded-full bg-purple-50">
                <BarChart3 className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Medical Analysis Results</h3>
              <p className="text-gray-600">
                Comprehensive analysis based on your symptoms and medical profile
              </p>
            </div>

            {isAnalyzing ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 mb-2">Performing comprehensive medical analysis...</p>
                <p className="text-sm text-gray-500">This may take a few moments as our AI reviews your symptoms and medical history</p>
              </div>
            ) : prediction ? (
              <div className="space-y-6">
                {/* Possible Conditions */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Possible Conditions</h4>
                  <div className="space-y-4">
                    {prediction.possibleConditions.map((condition, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-semibold text-gray-800">{condition.condition}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            condition.probability > 0.7 ? 'bg-red-100 text-red-800' :
                            condition.probability > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {(condition.probability * 100).toFixed(1)}% probability
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{condition.description}</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            condition.urgencyLevel === 'emergency' ? 'bg-red-100 text-red-800' :
                            condition.urgencyLevel === 'urgent' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {condition.urgencyLevel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setCurrentStep('interview')}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Back to Interview
                  </button>
                  <button
                    onClick={() => setCurrentStep('recommendations')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    View Detailed Recommendations
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center mb-4 p-3 rounded-full bg-red-50">
                  <X className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Analysis Failed</h3>
                <p className="text-gray-600 mb-6">Unable to complete medical analysis. Please try again.</p>
                <button
                  onClick={() => {
                    setCurrentStep('interview');
                    setCurrentQuestionIndex(0);
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Retry Interview
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'recommendations' && prediction && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center mb-4 p-3 rounded-full bg-green-50">
                <Target className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Medical Assessment Results</h3>
              <p className="text-gray-600">
                Comprehensive analysis based on your symptoms and medical profile
              </p>
            </div>

            {/* Possible Conditions */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Possible Conditions</h4>
              <div className="space-y-4">
                {prediction.possibleConditions.map((condition, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-semibold text-gray-800">{condition.condition}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-600">Probability:</span>
                            <span className="text-sm font-medium text-blue-600">
                              {(condition.probability * 100).toFixed(1)}%
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            condition.urgencyLevel === 'emergency' ? 'bg-red-100 text-red-700' :
                            condition.urgencyLevel === 'urgent' ? 'bg-orange-100 text-orange-700' :
                            condition.urgencyLevel === 'routine' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {condition.urgencyLevel.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{condition.description}</p>
                    
                    {/* Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-green-50 rounded-lg p-3">
                        <h6 className="font-medium text-green-800 text-sm mb-2">Immediate Actions</h6>
                        <ul className="space-y-1 text-green-700">
                          {condition.recommendations.immediate.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-1 text-xs">
                              <span className="text-green-500 mt-1">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h6 className="font-medium text-blue-800 text-sm mb-2">Lifestyle</h6>
                        <ul className="space-y-1 text-blue-700">
                          {condition.recommendations.lifestyle.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-1 text-xs">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <h6 className="font-medium text-purple-800 text-sm mb-2">Monitoring</h6>
                        <ul className="space-y-1 text-purple-700">
                          {condition.recommendations.monitoring.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-1 text-xs">
                              <span className="text-purple-500 mt-1">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Follow-up */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Follow-up:</span>
                          <span className="text-sm text-gray-600 ml-2">{condition.followUp.timeframe}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">Recommended actions:</span>
                          <div className="text-xs text-gray-600">{condition.followUp.actions.join(', ')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Advice */}
            {prediction.generalAdvice && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 rounded-xl p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">Precautions</h4>
                  <ul className="space-y-1 text-yellow-700">
                    {prediction.generalAdvice.precautions.map((precaution, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-yellow-500 mt-1">•</span>
                        <span>{precaution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Lifestyle</h4>
                  <ul className="space-y-1 text-blue-700">
                    {prediction.generalAdvice.lifestyle.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <h4 className="font-semibold text-red-800 mb-3">Warning Signs</h4>
                  <ul className="space-y-1 text-red-700">
                    {prediction.generalAdvice.warningSignsToWatch.map((sign, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{sign}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Prescription Recommendations */}
            {prediction.prescription && (
              <div className="bg-indigo-50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Pill className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-indigo-800 mb-1">Medication Recommendations</h4>
                    <p className="text-sm text-indigo-600">Suggested over-the-counter medications for symptom management</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-indigo-700 text-sm mb-2">Recommended Medications:</h5>
                    <ul className="space-y-1">
                      {prediction.prescription.recommendations.map((med, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-indigo-700">
                          <span className="text-indigo-500 mt-1">•</span>
                          <span>{med}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {prediction.prescription.notes && (
                    <div className="bg-indigo-100 rounded-lg p-3">
                      <h5 className="font-medium text-indigo-700 text-sm mb-1">Important Notes:</h5>
                      <p className="text-sm text-indigo-700">{prediction.prescription.notes}</p>
                    </div>
                  )}
                  
                  {prediction.prescription.disclaimer && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-yellow-700">{prediction.prescription.disclaimer}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Important Disclaimer</h4>
                  <p className="text-sm text-gray-600">
                    {prediction.disclaimer || 'This AI analysis is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical concerns.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setCurrentStep('evaluation')}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back to Analysis
              </button>
              <button
                onClick={() => setCurrentStep('followup')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
              >
                Schedule Follow-up
              </button>
            </div>
          </div>
        )}

        {currentStep === 'followup' && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center mb-4 p-3 rounded-full bg-red-50">
                <Heart className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Follow-up Care Plan</h3>
              <p className="text-gray-600">
                Personalized follow-up recommendations based on your analysis
              </p>
            </div>

            {prediction && prediction.possibleConditions && prediction.possibleConditions.length > 0 ? (
              <div className="space-y-6">
                {/* Follow-up Timeline */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Follow-up Schedule</h4>
                  <div className="space-y-4">
                    {prediction.possibleConditions.map((condition, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-800">{condition.condition}</h5>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {condition.followUp?.timeframe || '1 week'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {condition.followUp?.actions ? (
                            <ul className="list-disc list-inside space-y-1">
                              {condition.followUp.actions.map((action, actionIndex) => (
                                <li key={actionIndex}>{action}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>Re-evaluate symptoms and consider further testing if needed</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warning Signs */}
                {prediction.generalAdvice?.warningSignsToWatch && (
                  <div className="bg-red-50 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-semibold text-red-800 mb-4">Warning Signs to Watch</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {prediction.generalAdvice.warningSignsToWatch.map((sign, index) => (
                        <div key={index} className="flex items-center gap-2 bg-white rounded-lg p-3">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="text-sm text-gray-700">{sign}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* General Advice */}
                {prediction.generalAdvice && (
                  <div className="bg-green-50 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-4">General Care Instructions</h4>
                    <div className="space-y-3">
                      {prediction.generalAdvice.precautions && (
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2">Precautions:</h5>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {prediction.generalAdvice.precautions.map((precaution, index) => (
                              <li key={index}>{precaution}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {prediction.generalAdvice.lifestyle && (
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2">Lifestyle Recommendations:</h5>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {prediction.generalAdvice.lifestyle.map((recommendation, index) => (
                              <li key={index}>{recommendation}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">No Follow-up Data Available</h4>
                <p className="text-gray-500">Complete the assessment to receive personalized follow-up care recommendations.</p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setCurrentStep('recommendations')}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back to Recommendations
              </button>
              <button
                onClick={() => setCurrentStep('symptoms')}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Start New Assessment
              </button>
              <button
                onClick={downloadReport}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
              >
                Download Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSevaAI;
