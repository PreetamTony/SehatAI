import { Lock } from '@mui/icons-material';
import { Box, LinearProgress, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading with progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Voice feedback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(t('welcome'));
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }

    return () => clearInterval(timer);
  }, [onComplete, t]);

  return (
    <AnimatePresence>
      <Box
        sx={{
          height: '100vh',
          background: 'linear-gradient(135deg, #003366 0%, #228B22 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url('data:image/svg+xml,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="phulkari" patternUnits="userSpaceOnUse" width="20" height="20"><circle cx="10" cy="10" r="2" fill="%23FFD700" opacity="0.3"/></pattern></defs><rect width="100" height="100" fill="url(%23phulkari)"/></svg>')`,
            opacity: 0.1,
          },
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}
        >
          {/* Logo with Glow Animation */}
          <motion.div
            animate={{ 
              filter: [
                'drop-shadow(0 0 20px #FFD700)',
                'drop-shadow(0 0 40px #FFD700)',
                'drop-shadow(0 0 20px #FFD700)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src="https://pbs.twimg.com/profile_images/1491700416010395652/G6FSnL-G_400x400.jpg"
              alt="Department of Health and Family Welfare, Punjab"
              style={{
                width: 120,
                height: 120,
                borderRadius: 20,
                display: 'block',
                margin: '0 auto 32px',
                border: '3px solid #FFD700',
              }}
            />
          </motion.div>

          {/* App Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          >
            <Typography
              variant="h1"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.5rem' },
                color: '#FFD700',
                mb: 2,
                textShadow: '0 2px 10px rgba(255, 215, 0, 0.5)',
                textAlign: 'center',
              }}
            >
              PRHAA
            </Typography>
            
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                color: '#ffffff',
                mb: 1,
                textAlign: 'center',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Punjab Rural Health AI Assistant
            </Typography>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          >
            <Typography
              variant="body1"
              sx={{
                color: '#ffffff',
                mb: 3,
                textAlign: 'center',
                maxWidth: 500,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              {t('tagline')}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#B8860B',
                mb: 4,
                fontWeight: 500,
              }}
            >
              {t('subtitle')}
            </Typography>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            style={{ marginBottom: 32, width: '100%', maxWidth: 320, display: 'flex', justifyContent: 'center' }}
          >
            <div style={{ width: '100%' }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  width: '100%',
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#FFD700',
                    borderRadius: 3,
                  },
                }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{
            position: 'absolute',
            bottom: 40,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Lock sx={{ color: '#ffffff', fontSize: 16 }} />
          <Typography
            variant="body2"
            sx={{
              color: '#ffffff',
              fontSize: '0.875rem',
            }}
          >
            {t('secured')}
          </Typography>
        </motion.div>
      </Box>
    </AnimatePresence>
  );
};

export default SplashScreen;