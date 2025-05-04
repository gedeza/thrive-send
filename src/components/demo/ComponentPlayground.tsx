import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  TextField, 
  Switch, 
  FormControlLabel,
  Divider,
  Button,
  Grid,
  Slider,
  RadioGroup,
  Radio,
  FormLabel,
  Tooltip,
  IconButton
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import { CodeSnippet } from './InteractiveDocumentation';

interface PropertyControls {
  [key: string]: PropertyControl;
}

interface PropertyControl {
  type: 'text' | 'select' | 'boolean' | 'number' | 'radio' | 'slider';
  label: string;
  defaultValue: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
}

interface ComponentPlaygroundProps {
  name: string;
  description?: string;
  propertyControls: PropertyControls;
  renderComponent: (props: any) => React.ReactNode;
  generateCode: (props: any) => string;
}

export const ComponentPlayground: React.FC<ComponentPlaygroundProps> = ({
  name,
  description,
  propertyControls,
  renderComponent,
  generateCode
}) => {
  // Initialize props with default values
  const initialProps = Object.entries(propertyControls).reduce((acc, [key, control]) => {
    acc[key] = control.defaultValue;
    return acc;
  }, {} as any);

  const [props, setProps] = useState(initialProps);
  const [showCode, setShowCode] = useState(false);

  const handlePropertyChange = (property: string, value: any) => {
    setProps(prevProps => ({
      ...prevProps,
      [property]: value
    }));
  };

  const resetToDefaults = () => {
    setProps(initialProps);
  };

  const renderPropertyControl = (property: string, control: PropertyControl) => {
    switch (control.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={control.label}
            value={props[property] || ''}
            onChange={(e) => handlePropertyChange(property, e.target.value)}
            size="small"
            margin="dense"
          />
        );
      
      case 'select':
        return (
          <FormControl fullWidth size="small" margin="dense">
            <InputLabel>{control.label}</InputLabel>
            <Select
              value={props[property]}
              label={control.label}
              onChange={(e) => handlePropertyChange(property, e.target.value)}
            >
              {control.options?.map((option, index) => (
                <MenuItem key={index} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(props[property])}
                onChange={(e) => handlePropertyChange(property, e.target.checked)}
                size="small"
              />
            }
            label={control.label}
          />
        );
      
      case 'number':
        return (
          <TextField
            fullWidth
            label={control.label}
            type="number"
            value={props[property] || 0}
            onChange={(e) => handlePropertyChange(property, Number(e.target.value))}
            size="small"
            margin="dense"
            inputProps={{
              min: control.min,
              max: control.max,
              step: control.step || 1
            }}
          />
        );
      
      case 'slider':
        return (
          <Box sx={{ px: 1 }}>
            <Typography variant="body2" gutterBottom>
              {control.label}: {props[property]}
            </Typography>
            <Slider
              value={props[property]}
              onChange={(_, value) => handlePropertyChange(property, value)}
              min={control.min || 0}
              max={control.max || 100}
              step={control.step || 1}
              valueLabelDisplay="auto"
              size="small"
            />
          </Box>
        );
      
      case 'radio':
        return (
          <FormControl component="fieldset" margin="dense">
            <FormLabel component="legend">{control.label}</FormLabel>
            <RadioGroup
              value={props[property]}
              onChange={(e) => handlePropertyChange(property, e.target.value)}
              row
            >
              {control.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option.value}
                  control={<Radio size="small" />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ mb: 4, overflow: 'hidden' }}>
      <Box sx={{ p: 3, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
        <Typography variant="h5" gutterBottom>
          {name} Playground
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {description}
          </Typography>
        )}
      </Box>
      
      <Divider />
      
      <Grid container>
        {/* Property controls */}
        <Grid item xs={12} md={3} sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%' 
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 2
            }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Properties
              </Typography>
              <Tooltip title="Reset to defaults">
                <IconButton size="small" onClick={resetToDefaults}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {Object.entries(propertyControls).map(([property, control]) => (
                <Box key={property} sx={{ mb: 2 }}>
                  {renderPropertyControl(property, control)}
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
        
        {/* Component preview */}
        <Grid item xs={12} md={9}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Preview
              </Typography>
              <Button
                size="small"
                startIcon={<CodeIcon />}
                onClick={() => setShowCode(!showCode)}
                variant={showCode ? "contained" : "outlined"}
              >
                {showCode ? "Hide Code" : "Show Code"}
              </Button>
            </Box>
            
            <Box sx={{ 
              p: 3, 
              border: '1px dashed rgba(0, 0, 0, 0.12)', 
              borderRadius: 1,
              mb: showCode ? 3 : 0
            }}>
              {renderComponent(props)}
            </Box>
            
            {showCode && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Generated Code
                </Typography>
                <CodeSnippet code={generateCode(props)} language="tsx" />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};