import {
  CreditCard,
  Person,
  Phone,
  Security,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    healthId: '',
    mobile: '',
    otp: '',
    aadhaar: '',
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSendOtp = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOtpSent(true);
      setIsLoading(false);
    }, 2000);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 2000);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #003366 0%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url('data:image/svg+xml,<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M20,20 Q100,5 180,20 Q195,100 180,180 Q100,195 20,180 Q5,100 20,20 Z" fill="none" stroke="%23FFD700" stroke-width="2" opacity="0.1"/></svg>')`,
          backgroundSize: '300px 300px',
          animation: 'float 6s ease-in-out infinite',
        },
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0, 51, 102, 0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #003366 0%, #004d99 100%)',
                color: 'white',
                py: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <motion.img
                src="https://pbs.twimg.com/profile_images/1491700416010395652/G6FSnL-G_400x400.jpg"
                alt="Punjab Health Logo"
                style={{ 
                  width: 72, 
                  height: 72, 
                  borderRadius: 14,
                  display: 'block',
                  margin: '0 0 12px',
                  border: '3px solid #FFD700',
                }}
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                  color: '#FFD700',
                  mb: 1,
                }}
              >
                {t('login.title')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Department of Health and Family Welfare, Punjab
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {/* Tabs */}
              <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                centered
                sx={{ mb: 3 }}
              >
                <Tab label="Login" />
                <Tab label="Register" />
              </Tabs>

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Health ID Field */}
                  <TextField
                    fullWidth
                    label={t('login.healthId')}
                    value={formData.healthId}
                    onChange={handleInputChange('healthId')}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCard sx={{ color: '#003366' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#FFD700',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#003366',
                        },
                      },
                    }}
                  />

                  {/* Mobile Number */}
                  <TextField
                    fullWidth
                    label={t('login.mobile')}
                    value={formData.mobile}
                    onChange={handleInputChange('mobile')}
                    required
                    type="tel"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: '#003366' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Send OTP Button */}
                  {!otpSent && (
                    <Button
                      variant="outlined"
                      onClick={handleSendOtp}
                      disabled={!formData.mobile || isLoading}
                      sx={{
                        borderColor: '#003366',
                        color: '#003366',
                        '&:hover': {
                          borderColor: '#FFD700',
                          backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        },
                      }}
                    >
                      {isLoading ? 'Sending...' : 'Send OTP'}
                    </Button>
                  )}

                  {/* OTP Field */}
                  {otpSent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.5 }}
                    >
                      <TextField
                        fullWidth
                        label={t('login.otp')}
                        value={formData.otp}
                        onChange={handleInputChange('otp')}
                        required
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Security sx={{ color: '#228B22' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Alert severity="info" sx={{ mt: 1 }}>
                        OTP sent to {formData.mobile}
                      </Alert>
                    </motion.div>
                  )}

                  {/* Registration Fields */}
                  {tabValue === 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                          fullWidth
                          label={t('login.name')}
                          value={formData.name}
                          onChange={handleInputChange('name')}
                          required={tabValue === 1}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person sx={{ color: '#003366' }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        
                        <TextField
                          fullWidth
                          label={`${t('login.aadhaar')} (Optional)`}
                          value={formData.aadhaar}
                          onChange={handleInputChange('aadhaar')}
                          type="password"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CreditCard sx={{ color: '#666' }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={isLoading || !otpSent}
                      sx={{
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #FFD700 0%, #E6C200 100%)',
                        color: '#003366',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #E6C200 0%, #CCAA00 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
                        },
                        '&:disabled': {
                          background: '#ccc',
                          color: '#888',
                        },
                      }}
                    >
                      {isLoading 
                        ? 'Processing...' 
                        : tabValue === 0 
                          ? t('login.loginButton') 
                          : t('login.registerButton')
                      }
                    </Button>
                  </motion.div>
                </Box>
              </form>

              {/* Footer */}
              <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
                <Typography variant="body2" color="text.secondary">
                  Powered by Ayushman Bharat Digital Mission
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage;