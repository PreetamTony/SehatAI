import React from 'react';
import DoctorSevaAI from '../components/features/DoctorSevaAI';

const DoctorSevaAIPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Doctor Avatar */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img 
                src="/interviewer-avatar.jpg" 
                alt="Doctor Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Doctor-e-Seva AI
            </h1>
            <p className="text-gray-600 text-lg">
              AI-powered medical consultation and health assessment
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">Online and ready to help</span>
            </div>
          </div>
        </div>
        
        <DoctorSevaAI />
      </div>
    </div>
  );
};

export default DoctorSevaAIPage;
