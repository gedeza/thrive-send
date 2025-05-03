import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Tab, 
  Tabs as MUITabs, 
  useTheme, 
  useMediaQuery, 
  Typography, 
  Badge 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Enhanced styled Tab component with better animations and hover states
const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 600,
  textTransform: 'none',
  minWidth: 90,
  fontSize: '0.875rem',
  marginRight: theme.spacing(1),
  padding: theme.spacing(1.5, 2),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    color: theme.palette.primary.main,
    opacity: 1,
    backgroundColor: `${theme.palette.primary.main}10`, // 10% opacity version of primary color
    borderRadius: theme.shape.borderRadius,
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 700,
  },
  '&.Mui-disabled': {
    color: theme.palette.text.disabled,
    opacity: 0.7,
  },
}));

// Animated TabPanel component for content
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  const isActive = value === index;

  return (
    <motion.div
      role="tabpanel"
      hidden={!isActive}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      initial={{ opacity: 0, y: 10 }}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      {...other}
      style={{ 
        padding: '16px 0',
        height: isActive ? 'auto' : 0,
      }}
    >
      {isActive && <Box>{children}</Box>}
    </motion.div>
  );
};

export interface TabItem {
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: number | string;
  icon?: React.ReactNode;
  id?: string;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: number;
  orientation?: 'horizontal' | 'vertical';
  onChange?: (index: number, tabId?: string) => void;
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  centered?: boolean;
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  showAnimation?: boolean;
  ariaLabel?: string;
  fullHeight?: boolean;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab = 0,
  orientation = 'horizontal',
  onChange,
  variant = 'standard',
  centered = false,
  className,
  color = 'primary',
  showAnimation = true,
  ariaLabel = 'navigation tabs',
  fullHeight = false,
}) => {
  const [value, setValue] = useState(defaultTab);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Automatically switch to scrollable on mobile
  const effectiveVariant = isMobile ? 'scrollable' : variant;

  // Handle external tab value changes
  useEffect(() => {
    if (defaultTab !== value) {
      setValue(defaultTab);
    }
  }, [defaultTab]);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue, tabs[newValue]?.id);
    }
  };

  const a11yProps = (index: number) => {
    return {
      id: `tab-${index}`,
      'aria-controls': `tabpanel-${index}`,
    };
  };

  // Create the tab label with optional badge and icon
  const renderTabLabel = (tab: TabItem, index: number) => {
    if (!tab.badge && !tab.icon) {
      return tab.label;
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {tab.icon && <Box component="span">{tab.icon}</Box>}
        <Typography component="span" noWrap>
          {tab.label}
        </Typography>
        {tab.badge && (
          <Badge 
            badgeContent={tab.badge} 
            color={color} 
            sx={{ ml: 1 }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box 
      className={className} 
      sx={{ 
        width: '100%',
        height: fullHeight ? '100%' : 'auto',
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'row' : 'column',
      }}
    >
      <Box sx={{ 
        borderBottom: orientation === 'horizontal' ? 1 : 0,
        borderRight: orientation === 'vertical' ? 1 : 0,
        borderColor: 'divider',
        mb: orientation === 'horizontal' ? 2 : 0,
        mr: orientation === 'vertical' ? 2 : 0,
        ...(orientation === 'vertical' && {
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'column' },
        })
      }}>
        <MUITabs
          value={value}
          onChange={handleChange}
          variant={effectiveVariant}
          scrollButtons={effectiveVariant === 'scrollable' ? 'auto' : undefined}
          orientation={orientation === 'vertical' && !isMobile ? 'vertical' : 'horizontal'}
          centered={centered && !isMobile && effectiveVariant !== 'scrollable'}
          aria-label={ariaLabel}
          textColor={color}
          textColor={color}
          sx={{
            ...(orientation === 'vertical' && !isMobile ? {
              borderRight: 1,
              borderColor: 'divider',
              minWidth: '200px',
              mr: 3,
            } : {}),
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette[color].main,
              height: orientation === 'horizontal' || isMobile ? 3 : undefined,
              width: orientation === 'vertical' && !isMobile ? 3 : undefined,
              borderRadius: '3px 3px 0 0',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          }}
        >
          {tabs.map((tab, index) => (
            <StyledTab 
              key={index} 
              label={renderTabLabel(tab, index)} 
              disabled={tab.disabled} 
              {...a11yProps(index)} 
              sx={{
                borderRadius: theme.shape.borderRadius,
              }}
            />
          ))}
        </MUITabs>
      </Box>
      
      <Box sx={{
        ...(orientation === 'vertical' && !isMobile ? {
          flexGrow: 1,
          pl: 3,
        } : {}),
        width: '100%',
        overflow: 'hidden',
      }}>
        {tabs.map((tab, index) => (
          showAnimation ? (
            <TabPanel key={index} value={value} index={index}>
              {tab.content}
            </TabPanel>
          ) : (
            <div
              key={index}
              role="tabpanel"
              hidden={value !== index}
              id={`tabpanel-${index}`}
              aria-labelledby={`tab-${index}`}
              style={{ padding: '16px 0' }}
            >
              {value === index && <Box>{tab.content}</Box>}
            </div>
          )
        ))}
      </Box>
    </Box>
  );
};

export default Tabs;
