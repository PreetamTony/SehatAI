import {
  AccountBalance,
  FitnessCenter,
  HealthAndSafety,
  LocalHospital,
  MedicalServices,
  Monitor,
  Psychology,
  Security
} from '@mui/icons-material';
import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Psychology sx={{ fontSize: 48, color: '#FFD700' }} />,
      title: t('features.aiDoctor'),
      description: t('features.aiDoctorDesc'),
    },
    {
      icon: <HealthAndSafety sx={{ fontSize: 48, color: '#228B22' }} />,
      title: t('features.healthRecord'),
      description: t('features.healthRecordDesc'),
    },
    {
      icon: <Monitor sx={{ fontSize: 48, color: '#003366' }} />,
      title: t('features.vitalsMonitoring'),
      description: t('features.vitalsDesc'),
    },
    {
      icon: <LocalHospital sx={{ fontSize: 48, color: '#FFD700' }} />,
      title: t('features.diagnostics'),
      description: t('features.diagnosticsDesc'),
    },
    {
      icon: <MedicalServices sx={{ fontSize: 48, color: '#228B22' }} />,
      title: t('features.medication'),
      description: t('features.medicationDesc'),
    },
    {
      icon: <FitnessCenter sx={{ fontSize: 48, color: '#003366' }} />,
      title: t('features.wellness'),
      description: t('features.wellnessDesc'),
    },
  ];

  const schemes = [
    {
      title: "Ayushman Bharat",
      description: "Free/subsidized healthcare for eligible families",
      icon: <AccountBalance sx={{ fontSize: 40, color: '#228B22' }} />,
    },
    {
      title: "Punjab Health Schemes",
      description: "State clinics and insurance programs",
      icon: <LocalHospital sx={{ fontSize: 40, color: '#FFD700' }} />,
    },
    {
      title: "National Digital Health Mission",
      description: "Unified health records and digital services",
      icon: <Security sx={{ fontSize: 40, color: '#003366' }} />,
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #003366 0%, rgba(255, 255, 255, 0.9) 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url('data:image/svg+xml,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="phulkari-bg" patternUnits="userSpaceOnUse" width="40" height="40"><circle cx="20" cy="20" r="3" fill="%23FFD700" opacity="0.1"/><circle cx="10" cy="10" r="2" fill="%23B8860B" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23phulkari-bg)"/></svg>')`,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    color: '#FFD700',
                    mb: 3,
                    textShadow: '0 2px 10px rgba(255, 215, 0, 0.3)',
                  }}
                >
                  {t('yourHealthOurPriority')}
                </Typography>
                
                <Typography
                  variant="h5"
                  sx={{
                    color: '#ffffff',
                    mb: 4,
                    lineHeight: 1.6,
                    fontWeight: 400,
                  }}
                >
                  Advanced AI-powered healthcare solutions for rural Punjab. 
                  Connect with doctors, monitor vitals, and access government health schemes.
                </Typography>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={onGetStarted}
                    sx={{
                      fontSize: '1.2rem',
                      py: 2,
                      px: 4,
                      borderRadius: 3,
                      background: '#FFD700',
                      color: '#003366',
                      fontWeight: 700,
                      boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
                      '&:hover': {
                        background: '#E6C200',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {t('getAIAnalysis')}
                  </Button>
                </motion.div>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  component="img"
                  src="\Logo.PNG"
                  alt="Healthcare Technology"
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    borderRadius: 4,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h2"
            align="center"
            sx={{ mb: 6, color: '#003366' }}
          >
            AI-Powered Health Features
          </Typography>
        </motion.div>

        <Grid container spacing={4} alignItems="stretch">
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={feature.title || index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3,
                    border: '2px solid transparent',
                    '&:hover': {
                      borderColor: '#FFD700',
                      transform: 'translateY(-6px)',
                      boxShadow: '0 20px 40px rgba(0, 51, 102, 0.12)',
                    },
                    transition: 'all 0.25s ease',
                  }}
                >
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                    <Box sx={{ mb: 1 }}>{feature.icon}</Box>
                    <Typography variant="h6" sx={{ mb: 1, color: '#003366', fontWeight: 600, textAlign: 'center' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', maxWidth: 320 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Government Schemes Section */}
      <Box sx={{ background: '#f8f9fa', py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h2"
              align="center"
              sx={{ mb: 6, color: '#003366' }}
            >
              Government Health Schemes
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {schemes.map((scheme, index) => (
              <Grid item xs={12} md={4} key={scheme.title || index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      p: 4,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        {scheme.icon}
                      </Box>
                      <Typography variant="h6" sx={{ mb: 2, color: '#003366', fontWeight: 600 }}>
                        {scheme.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {scheme.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* About Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Box textAlign="center" sx={{ position: 'relative' }}>
            <Typography
              variant="h2"
              sx={{ mb: 4, color: '#003366' }}
            >
              About PRHAA
            </Typography>
            <Typography
              variant="h6"
              sx={{ 
                maxWidth: 800, 
                mx: 'auto',
                color: '#666',
                lineHeight: 1.8,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  background: 'url("https://pbs.twimg.com/profile_images/1491700416010395652/G6FSnL-G_400x400.jpg") no-repeat center',
                  backgroundSize: 'contain',
                  opacity: 0.1,
                  zIndex: -1,
                },
              }}
            >
              Punjab Rural Health AI Assistant is a comprehensive telemedicine platform 
              designed specifically for rural healthcare in Punjab. Developed under the 
              Department of Health and Family Welfare, Punjab, PRHAA leverages cutting-edge 
              AI technology to bridge the healthcare gap in rural areas.
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LandingPage;