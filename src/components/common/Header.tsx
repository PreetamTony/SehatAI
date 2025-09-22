import { Check, Language, Menu as MenuIcon } from '@mui/icons-material';
import { AppBar, Box, IconButton, ListItemIcon, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { t, i18n } = useTranslation();
  const [langAnchor, setLangAnchor] = React.useState<null | HTMLElement>(null);

  const handleLanguageMenu = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchor(event.currentTarget);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem('appLanguage', lang);
    } catch {}
    document.documentElement.lang = lang;
    setLangAnchor(null);
  };

  useEffect(() => {
    // Restore user-preferred language from localStorage if present
    try {
      const saved = localStorage.getItem('appLanguage');
      if (saved && saved !== i18n.language) {
        i18n.changeLanguage(saved).catch(() => {});
        document.documentElement.lang = saved;
      } else {
        document.documentElement.lang = i18n.language || 'en';
      }
    } catch (e) {
      document.documentElement.lang = i18n.language || 'en';
    }
  }, [i18n]);

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'linear-gradient(135deg, #003366 0%, #004d99 100%)',
        boxShadow: '0 4px 20px rgba(0, 51, 102, 0.2)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton 
            color="inherit" 
            onClick={onMenuClick}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box display="flex" alignItems="center" gap={2}>
            <motion.img
              src="https://pbs.twimg.com/profile_images/1491700416010395652/G6FSnL-G_400x400.jpg"
              alt="Punjab Health Logo"
              style={{ height: 40, borderRadius: 8 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                color: '#FFD700',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              PRHAA
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <IconButton 
            color="inherit" 
            onClick={handleLanguageMenu}
            sx={{ 
              '&:hover': { 
                background: 'rgba(255, 215, 0, 0.1)' 
              } 
            }}
          >
            <Language />
          </IconButton>
          <Menu
            anchorEl={langAnchor}
            open={Boolean(langAnchor)}
            onClose={() => setLangAnchor(null)}
          >
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिंदी' },
              { code: 'pa', label: 'ਪੰਜਾਬੀ' },
              { code: 'ta', label: 'தமிழ்' },
              { code: 'ur', label: 'اردو' },
            ].map((l) => (
              <MenuItem key={l.code} onClick={() => handleLanguageChange(l.code)} selected={i18n.language === l.code}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {i18n.language === l.code ? <Check fontSize="small" /> : null}
                </ListItemIcon>
                {l.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;