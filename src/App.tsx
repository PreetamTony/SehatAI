import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { punjabTheme } from './theme/punjabTheme';
import './i18n/config';

// Components
import SplashScreen from './components/SplashScreen';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Header from './components/common/Header';
import NavSidebar from './components/NavSidebar';
import HomeDashboard from './components/HomeDashboard';
import DoctorSevaAIPage from './pages/DoctorSevaAIPage';

// Page placeholder component for now
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ 
    padding: '2rem', 
    textAlign: 'center', 
    minHeight: '60vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <h2 style={{ color: '#003366', fontFamily: 'Poppins, sans-serif' }}>
      {title}
    </h2>
    <p style={{ color: '#666', maxWidth: '600px' }}>
      This feature is being developed and will be available soon. 
      The {title.toLowerCase()} module will provide comprehensive functionality 
      as outlined in the specifications.
    </p>
  </div>
);

type AppState = 'splash' | 'landing' | 'login' | 'dashboard';

function App() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  const handleSplashComplete = () => setAppState('landing');
  const handleGetStarted = () => setAppState('login');
  const handleLogin = () => {
    setAppState('dashboard');
    setCurrentPage('dashboard');
  };
  
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <HomeDashboard onNavigate={handleNavigate} />;
      case 'medical-chat':
        return <PlaceholderPage title="Medical Chat" />;
      case 'speech-chat':
        return <PlaceholderPage title="Speech Chat" />;
      case 'symptom-checker':
        return <PlaceholderPage title="Symptom Checker" />;
      case 'diagnostic-tools':
        return <PlaceholderPage title="Diagnostic Tools" />;
      case 'doctor-consultation':
        return <PlaceholderPage title="Doctor Consultation" />;
      case 'appointments':
        return <PlaceholderPage title="Appointments" />;
      case 'emergency':
        return <PlaceholderPage title="Emergency Services" />;
      case 'health-coaching':
        return <PlaceholderPage title="Health Coaching" />;
      case 'fitness':
        return <PlaceholderPage title="Fitness Tracking" />;
      case 'diet':
        return <PlaceholderPage title="Diet Management" />;
      case 'mood':
        return <PlaceholderPage title="Mood Tracking" />;
      case 'medication-management':
        return <PlaceholderPage title="Medication Management" />;
      case 'reminders':
        return <PlaceholderPage title="Health Reminders" />;
      case 'education':
        return <PlaceholderPage title="Health Education" />;
      case 'rehabilitation':
        return <PlaceholderPage title="Rehabilitation" />;
      case 'doctor-seva-ai':
        return <DoctorSevaAIPage />;
      default:
        return <HomeDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <ThemeProvider theme={punjabTheme}>
      <CssBaseline />
      <div style={{ fontFamily: 'Roboto, sans-serif' }}>
        {/* Load Poppins and Roboto fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />

        <AnimatePresence mode="wait">
          {appState === 'splash' && (
            <motion.div
              key="splash"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SplashScreen onComplete={handleSplashComplete} />
            </motion.div>
          )}

          {appState === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <Header onMenuClick={() => setSidebarOpen(true)} />
              <LandingPage onGetStarted={handleGetStarted} />
            </motion.div>
          )}

          {appState === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <LoginPage onLogin={handleLogin} />
            </motion.div>
          )}

          {appState === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Header onMenuClick={() => setSidebarOpen(true)} />
              <NavSidebar 
                open={sidebarOpen} 
                onClose={() => setSidebarOpen(false)}
                onNavigate={handleNavigate}
              />
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {renderCurrentPage()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}

export default App;