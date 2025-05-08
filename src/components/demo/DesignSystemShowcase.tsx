import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider,
  useTheme,
  Button,
  Tooltip
} from '@mui/material';

export const ColorPalette: React.FC = () => {
  const theme = useTheme();
  
  // Extract colors from the theme
  const colors = [
    { name: 'Primary', value: theme.palette.primary.main, text: theme.palette.primary.contrastText },
    { name: 'Secondary', value: theme.palette.secondary.main, text: theme.palette.secondary.contrastText },
    { name: 'Error', value: theme.palette.error.main, text: theme.palette.error.contrastText },
    { name: 'Warning', value: theme.palette.warning.main, text: theme.palette.warning.contrastText },
    { name: 'Info', value: theme.palette.info.main, text: theme.palette.info.contrastText },
    { name: 'Success', value: theme.palette.success.main, text: theme.palette.success.contrastText },
    { name: 'Background', value: theme.palette.background.default, text: theme.palette.text.primary, border: true },
    { name: 'Paper', value: theme.palette.background.paper, text: theme.palette.text.primary, border: true },
  ];
  
  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    // You could add a toast notification here
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Color Palette</Typography>
      <Grid container spacing={2}>
        {colors.map((color) => (
          <Grid item xs={6} sm={4} md={3} key={color.name}>
            <Tooltip title={`Click to copy: ${color.value}`}>
              <Paper 
                onClick={() => copyToClipboard(color.value)}
                sx={{ 
                  height: 100, 
                  bgcolor: color.value, 
                  color: color.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  border: color.border ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Typography variant="subtitle2">{color.name}</Typography>
                <Typography variant="caption">{color.value}</Typography>
              </Paper>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export const TypographyShowcase: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Typography</Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h1" gutterBottom>h1. Heading</Typography>
        <Typography variant="h2" gutterBottom>h2. Heading</Typography>
        <Typography variant="h3" gutterBottom>h3. Heading</Typography>
        <Typography variant="h4" gutterBottom>h4. Heading</Typography>
        <Typography variant="h5" gutterBottom>h5. Heading</Typography>
        <Typography variant="h6" gutterBottom>h6. Heading</Typography>
        <Typography variant="subtitle1" gutterBottom>subtitle1. A subtitle that's a bit smaller than a heading.</Typography>
        <Typography variant="subtitle2" gutterBottom>subtitle2. An even smaller subtitle.</Typography>
        <Typography variant="body1" gutterBottom>body1. Default paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.</Typography>
        <Typography variant="body2" gutterBottom>body2. Smaller paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.</Typography>
        <Typography variant="button" display="block" gutterBottom>BUTTON TEXT</Typography>
        <Typography variant="caption" display="block" gutterBottom>caption text</Typography>
        <Typography variant="overline" display="block" gutterBottom>OVERLINE TEXT</Typography>
      </Paper>
    </Box>
  );
};

export const SpacingShowcase: React.FC = () => {
  const theme = useTheme();
  
  // Generate spacing examples
  const spacings = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12];
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Spacing</Typography>
      
      <Grid container spacing={2}>
        {spacings.map((spacing) => {
          const value = theme.spacing(spacing);
          
          return (
            <Grid item xs={6} sm={4} md={3} lg={2} key={spacing}>
              <Tooltip title={`Click to copy: ${value}`}>
                <Box 
                  onClick={() => navigator.clipboard.writeText(value)}
                  sx={{ 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }}
                >
                  <Box 
                    sx={{ 
                      height: value, 
                      backgroundColor: theme.palette.primary.main,
                      mb: 1,
                      mx: 'auto',
                      width: '100%',
                      maxWidth: '100px',
                      borderRadius: 1
                    }} 
                  />
                  <Typography variant="caption" display="block">
                    {`theme.spacing(${spacing})`}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {value}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export const ElevationShowcase: React.FC = () => {
  // Generate elevation examples
  const elevations = [0, 1, 2, 3, 4, 6, 8, 12, 16, 24];
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Elevation</Typography>
      
      <Grid container spacing={3}>
        {elevations.map((elevation) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={elevation}>
            <Box sx={{ textAlign: 'center' }}>
              <Paper 
                elevation={elevation} 
                sx={{ 
                  height: 80, 
                  width: 80, 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1
                }}
              >
                <Typography variant="body2">{elevation}</Typography>
              </Paper>
              <Typography variant="caption">
                elevation={elevation}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export const ButtonShowcase: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Buttons</Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>Contained Buttons</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained">Default</Button>
            <Button variant="contained" color="primary">Primary</Button>
            <Button variant="contained" color="secondary">Secondary</Button>
            <Button variant="contained" color="error">Error</Button>
            <Button variant="contained" color="warning">Warning</Button>
            <Button variant="contained" color="info">Info</Button>
            <Button variant="contained" color="success">Success</Button>
            <Button variant="contained" disabled>Disabled</Button>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>Outlined Buttons</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="outlined">Default</Button>
            <Button variant="outlined" color="primary">Primary</Button>
            <Button variant="outlined" color="secondary">Secondary</Button>
            <Button variant="outlined" color="error">Error</Button>
            <Button variant="outlined" color="warning">Warning</Button>
            <Button variant="outlined" color="info">Info</Button>
            <Button variant="outlined" color="success">Success</Button>
            <Button variant="outlined" disabled>Disabled</Button>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>Text Buttons</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="text">Default</Button>
            <Button variant="text" color="primary">Primary</Button>
            <Button variant="text" color="secondary">Secondary</Button>
            <Button variant="text" color="error">Error</Button>
            <Button variant="text" color="warning">Warning</Button>
            <Button variant="text" color="info">Info</Button>
            <Button variant="text" color="success">Success</Button>
            <Button variant="text" disabled>Disabled</Button>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>Button Sizes</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" size="small">Small</Button>
            <Button variant="contained" size="medium">Medium</Button>
            <Button variant="contained" size="large">Large</Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export const DesignSystemShowcase: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Design System
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <ColorPalette />
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ mb: 4 }}>
          <TypographyShowcase />
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ mb: 4 }}>
          <SpacingShowcase />
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ mb: 4 }}>
          <ElevationShowcase />
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <Box>
          <ButtonShowcase />
        </Box>
      </Paper>
    </Box>
  );
};
