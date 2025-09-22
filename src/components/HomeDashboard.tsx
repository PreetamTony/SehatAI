import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Activity, Brain, Utensils, Bell, FileText, Heart, Ambulance, Dumbbell, Video, ChevronRight, Plus, TrendingUp, User, Stethoscope, MessageSquare, ArrowRight, Target } from 'lucide-react';
import ReminderList from './features/ReminderList';
import MoodTracker from './features/MoodTracker';
import AppointmentManager from './features/AppointmentManager';
import FitnessTracker from './features/FitnessTracker';
import DietPlanner from './features/DietPlanner';
import HealthEducation from './features/HealthEducation';
import HealthCoaching from './features/HealthCoaching';
import EmergencyServices from './features/EmergencyServices';
import RehabExercises from './features/RehabExercises';
import DoctorConsultation from './features/DoctorConsultation';

const DashboardCard = ({ 
  title, 
  subtitle, 
  icon, 
  iconBg, 
  children, 
  className = '',
  expandable = false,
  accent = '#003366'
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  children: React.ReactNode;
  className?: string;
  expandable?: boolean;
  accent?: string;
}) => {
  const [isExpanded, setIsExpanded] = React.useState(!expandable);

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}>
      <div 
        className={`flex items-center justify-between p-6 ${expandable ? 'cursor-pointer' : ''}`}
        onClick={() => expandable && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`${iconBg} p-4 rounded-2xl shadow-md`}>
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
        {expandable && (
          <ChevronRight 
            className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} 
            style={{ color: accent }}
          />
        )}
      </div>
      {isExpanded && (
        <div className="px-6 pb-6">
          <div className="border-t border-gray-100 pt-6">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, change, icon, iconBg, accent = '#003366' }: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  iconBg: string;
  accent?: string;
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`${iconBg} p-3 rounded-xl shadow-md`}>
        {icon}
      </div>
      <div className="flex items-center gap-1 text-sm font-medium" style={{ color: accent }}>
        <TrendingUp className="w-4 h-4" />
        {change}
      </div>
    </div>
    <h4 className="text-2xl font-bold text-gray-800 mb-1">{value}</h4>
    <p className="text-sm text-gray-600">{title}</p>
  </div>
);

interface HealthDashboardProps {
  onNavigate?: (page: string) => void;
}

export default function HealthDashboard({ onNavigate }: HealthDashboardProps) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003366] to-[#1e4d8b] p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FFD700] to-transparent rounded-full opacity-20 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="bg-[#FFD700] text-[#003366] px-4 py-2 rounded-full text-sm font-bold">
                SEHAT AI
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('dashboard.heroTitle')}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl">
              {t('dashboard.heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => window.open('https://aimedicalapplication.netlify.app/', '_blank')}
                className="bg-[#FFD700] text-[#003366] px-8 py-3 rounded-2xl font-bold hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                {t('dashboard.getStarted')}
              </button>
              <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-2xl font-bold hover:bg-white/30 transition-all duration-300 border border-white/30">
                {t('dashboard.viewReports')}
              </button>
            </div>
          </div>
        </div>

        {/* Health Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={t('dashboard.healthScore')}
            value="92%"
            change="+5%"
            icon={<Heart className="w-6 h-6 text-red-500" />}
            iconBg="bg-red-100"
            accent="#003366"
          />
          <StatCard
            title={t('dashboard.activeGoals')}
            value="8"
            change="+2"
            icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            iconBg="bg-green-100"
            accent="#003366"
          />
          <StatCard
            title={t('dashboard.upcoming')}
            value="3"
            change={t('dashboard.thisWeek')}
            icon={<Calendar className="w-6 h-6 text-blue-500" />}
            iconBg="bg-blue-100"
            accent="#003366"
          />
          <StatCard
            title={t('dashboard.completed')}
            value="24"
            change={t('dashboard.thisMonth')}
            icon={<User className="w-6 h-6 text-purple-500" />}
            iconBg="bg-purple-100"
            accent="#003366"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="bg-[#003366] p-2 rounded-xl">
              <Plus className="w-6 h-6 text-white" />
            </div>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Book Appointment', icon: <Stethoscope className="w-6 h-6 text-purple-600" />, bg: 'bg-purple-100', accent: '#8B5CF6' },
              { title: 'Emergency Help', icon: <Ambulance className="w-6 h-6 text-red-600" />, bg: 'bg-red-100', accent: '#EF4444' },
              { title: 'Health Coach', icon: <Heart className="w-6 h-6 text-green-600" />, bg: 'bg-green-100', accent: '#10B981' },
              { title: 'View Calendar', icon: <Calendar className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-100', accent: '#3B82F6' }
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => action.title === 'Health Coach' ? window.open('https://zestlynutrition.netlify.app/', '_blank') : undefined}
                className="group flex items-center gap-4 p-5 bg-gradient-to-r from-white to-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-gray-200"
              >
                <div className={`${action.bg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <span className="font-semibold text-gray-800 group-hover:text-gray-900">{action.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Doctor Consultation"
            subtitle="Connect with healthcare professionals"
            icon={<Video className="w-7 h-7 text-purple-600" />}
            iconBg="bg-purple-100"
            expandable
            accent="#8B5CF6"
          >
            <DoctorConsultation />
          </DashboardCard>

          <DashboardCard
            title="Emergency Services"
            subtitle="Quick access to emergency care"
            icon={<Ambulance className="w-7 h-7 text-red-600" />}
            iconBg="bg-red-100"
            expandable
            accent="#EF4444"
          >
            <EmergencyServices />
          </DashboardCard>
        </div>

        {/* Doctor-e-Seva AI Section */}
        <div className="bg-gradient-to-r from-[#003366] to-[#1e4d8b] rounded-3xl p-1 shadow-2xl">
          <div className="bg-white rounded-3xl p-1">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#003366] p-3 rounded-2xl">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Doctor-e-Seva AI</h2>
                  <p className="text-gray-600">AI-powered medical consultation and health assessment</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center mb-4 p-4 rounded-full bg-blue-100">
                    <Brain className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Experience AI-Powered Medical Consultation
                  </h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Get personalized health assessments, medical interviews, and expert recommendations 
                    through our advanced AI system. Start your journey to better health today.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="text-blue-600 mb-2">
                      <MessageSquare className="w-6 h-6 mx-auto" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">Smart Interview</h4>
                    <p className="text-sm text-gray-600">AI-guided medical questions</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="text-green-600 mb-2">
                      <Activity className="w-6 h-6 mx-auto" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">Health Analysis</h4>
                    <p className="text-sm text-gray-600">Comprehensive assessment</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="text-purple-600 mb-2">
                      <Target className="w-6 h-6 mx-auto" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">Personalized Care</h4>
                    <p className="text-sm text-gray-600">Tailored recommendations</p>
                  </div>
                </div>
                
                <button
                  onClick={() => onNavigate?.('doctor-seva-ai')}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Stethoscope className="w-5 h-5" />
                  Start AI Consultation
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Health Monitoring Section */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="bg-[#003366] p-2 rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
            Health Monitoring
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard
              title="Health Coaching"
              subtitle="Personalized wellness guidance"
              icon={<Heart className="w-7 h-7 text-green-600" />}
              iconBg="bg-green-100"
              expandable
              accent="#10B981"
            >
              <HealthCoaching />
            </DashboardCard>

            <DashboardCard
              title="Appointments"
              subtitle="Manage your medical visits"
              icon={<Calendar className="w-7 h-7 text-blue-600" />}
              iconBg="bg-blue-100"
              expandable
              accent="#3B82F6"
            >
              <AppointmentManager />
            </DashboardCard>

            <DashboardCard
              title="Fitness Tracking"
              subtitle="Monitor your physical activity"
              icon={<Activity className="w-7 h-7 text-orange-600" />}
              iconBg="bg-orange-100"
              expandable
              accent="#F97316"
            >
              <FitnessTracker />
            </DashboardCard>

            <DashboardCard
              title="Diet Planning"
              subtitle="Manage your nutrition"
              icon={<Utensils className="w-7 h-7 text-yellow-600" />}
              iconBg="bg-yellow-100"
              expandable
              accent="#EAB308"
            >
              <DietPlanner />
            </DashboardCard>

            <DashboardCard
              title="Mood Tracking"
              subtitle="Monitor emotional wellbeing"
              icon={<Brain className="w-7 h-7 text-pink-600" />}
              iconBg="bg-pink-100"
              expandable
              accent="#EC4899"
            >
              <MoodTracker />
            </DashboardCard>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Health Reminders"
            subtitle="Stay on top of your health"
            icon={<Bell className="w-7 h-7 text-blue-600" />}
            iconBg="bg-blue-100"
            expandable
            accent="#3B82F6"
          >
            <ReminderList />
          </DashboardCard>

          <DashboardCard
            title="Health Education"
            subtitle="Learn about health topics"
            icon={<FileText className="w-7 h-6 text-teal-600" />}
            iconBg="bg-teal-100"
            expandable
            accent="#14B8A6"
          >
            <HealthEducation />
          </DashboardCard>

          <DashboardCard
            title="Rehabilitation"
            subtitle="Recovery exercises & tracking"
            icon={<Dumbbell className="w-7 h-7 text-cyan-600" />}
            iconBg="bg-cyan-100"
            expandable
            accent="#06B6D4"
          >
            <RehabExercises />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}