import React, { useState } from 'react';
import { Box, Tab, Tabs as MUITabs, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Custom styled Tab component
const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 600,
  textTransform: 'none',
  minWidth: 90,
  fontSize: '0.875rem',
  marginRight: theme.spacing(1),
  '&:hover': {
    color: theme.palette.primary.main,
    opacity: 1,
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 700,
  },
}));

// Custom styled TabPanel component for content
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ padding: '16px 0' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

export interface TabItem {
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: number;
  orientation?: 'horizontal' | 'vertical';
  onChange?: (index: number) => void;
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  centered?: boolean;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab = 0,
  orientation = 'horizontal',
  onChange,
  variant = 'standard',
  centered = false,
  className,
}) => {
  const [value, setValue] = useState(defaultTab);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Automatically switch to scrollable on mobile
  const effectiveVariant = isMobile ? 'scrollable' : variant;

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const a11yProps = (index: number) => {
    return {
      id: `tab-${index}`,
      'aria-controls': `tabpanel-${index}`,
    };
  };

  return (
    <Box className={className} sx={{ width: '100%' }}>
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        mb: 2,
        ...(orientation === 'vertical' && {
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
        })
      }}>
        <MUITabs
          value={value}
          onChange={handleChange}
          variant={effectiveVariant}
          scrollButtons={effectiveVariant === 'scrollable' ? 'auto' : undefined}
          orientation={orientation === 'vertical' && !isMobile ? 'vertical' : 'horizontal'}
          centered={centered && !isMobile && effectiveVariant !== 'scrollable'}
          sx={{
            ...(orientation === 'vertical' && !isMobile ? {
              borderRight: 1,
              borderColor: 'divider',
              width: '200px',
              mr: 3,
            } : {}),
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
              height: orientation === 'horizontal' || isMobile ? 3 : undefined,
              width: orientation === 'vertical' && !isMobile ? 3 : undefined,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          {tabs.map((tab, index) => (
            <StyledTab 
              key={index} 
              label={tab.label} 
              disabled={tab.disabled} 
              {...a11yProps(index)} 
            />
          ))}
        </MUITabs>
      </Box>
      
      <Box sx={{
        ...(orientation === 'vertical' && !isMobile ? {
          flexGrow: 1,
          pl: 3,
        } : {}),
      }}>
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={value} index={index}>
            {tab.content}
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
};

export default Tabs;