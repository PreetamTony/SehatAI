import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  Psychology,
  RecordVoiceOver,
  Search,
  LocalHospital,
  VideoCall,
  CalendarToday,
  Emergency,
  FitnessCenter,
  Restaurant,
  Mood,
  MedicalServices,
  Notifications,
  School,
  Healing,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface NavSidebarProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

const NavSidebar: React.FC<NavSidebarProps> = ({ open, onClose, onNavigate }) => {
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['ai-tools']);

  const handleExpand = (item: string) => {
    setExpandedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const menuItems = [
    {
      id: 'ai-tools',
      title: 'AI Health Tools',
      icon: <Psychology sx={{ color: '#FFD700' }} />,
      items: [
        { id: 'medical-chat', title: 'Medical Chat', icon: <Psychology /> },
        { id: 'speech-chat', title: 'Speech Chat', icon: <RecordVoiceOver /> },
        { id: 'symptom-checker', title: 'Symptom Checker', icon: <Search /> },
        { id: 'diagnostic-tools', title: 'Diagnostic Tools', icon: <LocalHospital /> },
      ],
    },
    {
      id: 'consultations',
      title: 'Consultations',
      icon: <VideoCall sx={{ color: '#228B22' }} />,
      items: [
        { id: 'doctor-consultation', title: 'Doctor Consultation', icon: <VideoCall /> },
        { id: 'appointments', title: 'Appointments', icon: <CalendarToday /> },
      ],
    },
    {
      id: 'emergency',
      title: 'Emergency Services',
      icon: <Emergency sx={{ color: '#ff4444' }} />,
      items: [
        { id: 'emergency', title: 'Emergency', icon: <Emergency /> },
      ],
    },
    {
      id: 'wellness',
      title: 'Wellness',
      icon: <FitnessCenter sx={{ color: '#003366' }} />,
      items: [
        { id: 'health-coaching', title: 'Health Coaching', icon: <FitnessCenter /> },
        { id: 'fitness', title: 'Fitness', icon: <FitnessCenter /> },
        { id: 'diet', title: 'Diet', icon: <Restaurant /> },
        { id: 'mood', title: 'Mood', icon: <Mood /> },
      ],
    },
    {
      id: 'management',
      title: 'Management',
      icon: <MedicalServices sx={{ color: '#B8860B' }} />,
      items: [
        { id: 'medication-management', title: 'Medication Management', icon: <MedicalServices /> },
        { id: 'reminders', title: 'Reminders', icon: <Notifications /> },
      ],
    },
    {
      id: 'education',
      title: 'Education & Recovery',
      icon: <School sx={{ color: '#228B22' }} />,
      items: [
        { id: 'education', title: 'Education', icon: <School /> },
        { id: 'rehabilitation', title: 'Rehabilitation', icon: <Healing /> },
      ],
    },
  ];

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          background: 'linear-gradient(180deg, #003366 0%, #004d99 100%)',
          color: 'white',
          boxShadow: '4px 0 20px rgba(0, 51, 102, 0.3)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255, 215, 0, 0.2)' }}>
        <img
          src="https://pbs.twimg.com/profile_images/1491700416010395652/G6FSnL-G_400x400.jpg"
          alt="Punjab Health Logo"
          style={{ width: 50, height: 50, borderRadius: 12, marginBottom: 8 }}
        />
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 700,
            color: '#FFD700',
          }}
        >
          PRHAA
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Punjab Rural Health AI Assistant
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 2 }}>
        {menuItems.map((section) => (
          <motion.div key={section.id}>
            <ListItemButton
              onClick={() => handleExpand(section.id)}
              sx={{
                mx: 2,
                my: 1,
                borderRadius: 2,
                '&:hover': {
                  background: 'rgba(255, 215, 0, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                {section.icon}
              </ListItemIcon>
              <ListItemText 
                primary={section.title}
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontWeight: 600,
                    fontSize: '0.95rem',
                  } 
                }}
              />
              {expandedItems.includes(section.id) ? 
                <ExpandLess sx={{ color: '#FFD700' }} /> : 
                <ExpandMore sx={{ color: '#FFD700' }} />
              }
            </ListItemButton>

            <AnimatePresence>
              {expandedItems.includes(section.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <Collapse in={expandedItems.includes(section.id)} timeout="auto">
                    <List component="div" disablePadding>
                      {section.items.map((item) => (
                        <motion.div
                          key={item.id}
                          whileHover={{ x: 8 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <ListItemButton
                            sx={{
                              pl: 6,
                              pr: 2,
                              mx: 2,
                              my: 0.5,
                              borderRadius: 2,
                              '&:hover': {
                                background: 'rgba(34, 139, 34, 0.2)',
                              },
                            }}
                            onClick={() => {
                              onNavigate(item.id);
                              onClose();
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {React.cloneElement(item.icon, { 
                                sx: { fontSize: 20, color: 'rgba(255, 255, 255, 0.8)' } 
                              })}
                            </ListItemIcon>
                            <ListItemText
                              primary={item.title}
                              sx={{ 
                                '& .MuiTypography-root': { 
                                  fontSize: '0.875rem',
                                  opacity: 0.9,
                                } 
                              }}
                            />
                          </ListItemButton>
                        </motion.div>
                      ))}
                    </List>
                  </Collapse>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ p: 3, borderTop: '1px solid rgba(255, 215, 0, 0.2)' }}>
        <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.7 }}>
          Department of Health and Family Welfare, Punjab
        </Typography>
      </Box>
    </Drawer>
  );
};

export default NavSidebar;