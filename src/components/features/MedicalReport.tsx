import React from 'react';
import { FileText, User, Activity, Pill, AlertTriangle, Calendar, Phone, Mail, MapPin } from 'lucide-react';

interface MedicalReportProps {
  patientProfile: {
    name: string;
    age: string;
    gender: string;
    contact: string;
    email: string;
    address: string;
    bloodGroup: string;
    smoking: string;
    medications: string;
    allergies: string;
    pastMedicalHistory: string;
    familyHistory: string;
  };
  symptoms: Array<{
    name: string;
    severity: string;
    duration: string;
  }>;
  patientAnswers: Array<{
    question: string;
    answer: string;
    category: string;
  }>;
  prediction: {
    possibleConditions: Array<{
      condition: string;
      probability: number;
      description: string;
      recommendations: {
        immediate: string[];
        lifestyle: string[];
        monitoring: string[];
      };
      urgencyLevel: string;
      followUp: {
        timeframe: string;
        actions: string[];
      };
    }>;
    generalAdvice: {
      precautions: string[];
      lifestyle: string[];
      warningSignsToWatch: string[];
    };
    prescription: {
      recommendations: string[];
      notes: string;
      disclaimer: string;
    };
    disclaimer: string;
  };
  reportDate: string;
}

const MedicalReport: React.FC<MedicalReportProps> = ({
  patientProfile,
  symptoms,
  patientAnswers,
  prediction,
  reportDate
}) => {
  const formatProbability = (prob: number) => `${(prob * 100).toFixed(1)}%`;
  
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'text-red-600 bg-red-100';
      case 'urgent': return 'text-orange-600 bg-orange-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 font-sans text-sm" id="medical-report">
      {/* Header */}
      <div className="border-b-2 border-gray-300 pb-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Medical Assessment Report</h1>
              <p className="text-gray-600">AI-Powered Health Analysis</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{reportDate}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Report ID: {crypto.randomUUID().slice(0, 8).toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* Patient Information Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Patient Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg">
          <div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-gray-700">Full Name</label>
                <p className="text-gray-900">{patientProfile.name}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Age</label>
                <p className="text-gray-900">{patientProfile.age}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Gender</label>
                <p className="text-gray-900">{patientProfile.gender}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Blood Group</label>
                <p className="text-gray-900">{patientProfile.bloodGroup}</p>
              </div>
            </div>
          </div>
          <div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">{patientProfile.contact}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">{patientProfile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">{patientProfile.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Symptoms Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-800">Reported Symptoms</h2>
        </div>
        <div className="bg-red-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {symptoms.map((symptom, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-red-200">
                <div className="font-medium text-gray-800 mb-1">{symptom.name}</div>
                <div className="text-sm text-gray-600">
                  <div>Severity: <span className="font-medium">{symptom.severity}/10</span></div>
                  <div>Duration: <span className="font-medium">{symptom.duration}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-800">AI Medical Analysis</h2>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="space-y-6">
            {/* Possible Conditions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Possible Conditions</h3>
              <div className="space-y-4">
                {prediction.possibleConditions.map((condition, index) => (
                  <div key={index} className="bg-white p-5 rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 text-lg">{condition.condition}</h4>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(condition.urgencyLevel)}`}>
                          {condition.urgencyLevel.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {formatProbability(condition.probability)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{condition.description}</p>
                    
                    {/* Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h5 className="font-medium text-red-700 mb-2">Immediate Actions</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {condition.recommendations.immediate.map((action, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-red-500 mt-1">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-blue-700 mb-2">Lifestyle Changes</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {condition.recommendations.lifestyle.map((action, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-blue-500 mt-1">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-green-700 mb-2">Monitoring</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {condition.recommendations.monitoring.map((action, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-green-500 mt-1">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Follow-up */}
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <h5 className="font-medium text-yellow-800 mb-2">Follow-up Plan</h5>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-yellow-700">
                          <strong>Timeframe:</strong> {condition.followUp.timeframe}
                        </span>
                        <div className="text-sm text-yellow-700">
                          <strong>Actions:</strong> {condition.followUp.actions.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Signs */}
            <div className="bg-red-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">Warning Signs to Watch</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {prediction.generalAdvice.warningSignsToWatch.map((sign, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white p-2 rounded">
                    <span className="text-red-500 font-bold">!</span>
                    <span className="text-sm text-gray-700">{sign}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Pill className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">Prescription Recommendations</h2>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          {/* Prescription Header */}
          <div className="bg-white p-4 rounded-lg border-2 border-green-300 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-lg text-gray-800">PRESCRIPTION</div>
                <div className="text-sm text-gray-600">Dr. AI Assistant - Virtual Consultation</div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div>Date: {reportDate}</div>
                <div>Valid for 30 days</div>
              </div>
            </div>
            
            {/* Patient Info on Prescription */}
            <div className="border-t border-gray-200 pt-3 mb-3">
              <div className="text-sm">
                <strong>Patient:</strong> {patientProfile.name}, {patientProfile.age}, {patientProfile.gender}
              </div>
            </div>

            {/* Medications */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-1">Medications</h4>
              {prediction.prescription.recommendations.map((medication, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="font-medium text-gray-800">{medication}</div>
                </div>
              ))}
            </div>

            {/* Prescription Notes */}
            <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
              <h5 className="font-medium text-yellow-800 mb-2">Important Notes:</h5>
              <p className="text-sm text-yellow-700">{prediction.prescription.notes}</p>
            </div>
          </div>

          {/* General Advice */}
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-gray-800 mb-3">General Care Instructions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-blue-700 mb-2">Precautions</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {prediction.generalAdvice.precautions.map((precaution, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-blue-500 mt-1">•</span>
                      {precaution}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-green-700 mb-2">Lifestyle Recommendations</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {prediction.generalAdvice.lifestyle.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-green-500 mt-1">•</span>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
        <h3 className="font-semibold text-gray-800 mb-3">Medical Disclaimer</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {prediction.disclaimer}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mt-2">
          {prediction.prescription.disclaimer}
        </p>
        <div className="mt-4 pt-4 border-t border-gray-300 text-xs text-gray-500">
          This report was generated by an AI system and is for informational purposes only. 
          Always consult with a qualified healthcare professional for medical diagnosis and treatment.
        </div>
      </div>
    </div>
  );
};

export default MedicalReport;
