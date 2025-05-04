import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CodeIcon from '@mui/icons-material/Code';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface PropDetail {
  name: string;
  type: string;
  description: string;
  default?: string;
  required?: boolean;
}

interface UsageExample {
  code: string;
  description: string;
}

interface DocSectionProps {
  title: string;
  description: string;
  props?: PropDetail[];
  usage?: UsageExample[];
  bestPractices?: string[];
  componentPath?: string;
  children?: React.ReactNode;
}

export const DocSection: React.FC<DocSectionProps> = ({
  title,
  description,
  props,
  usage,
  bestPractices,
  componentPath,
  children
}) => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {description}
          </Typography>
        </Box>
        {componentPath && (
          <Tooltip title={`Component path: ${componentPath}`}>
            <Chip 
              icon={<CodeIcon fontSize="small" />} 
              label={componentPath.split('/').pop()} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          </Tooltip>
        )}
      </Box>

      {/* Component Preview */}
      {children && (
        <Box sx={{ mb: 3, p: 2, border: '1px dashed rgba(0, 0, 0, 0.12)', borderRadius: 1 }}>
          {children}
        </Box>
      )}

      {/* Component API Documentation */}
      <Accordion 
        expanded={expanded === 'props'} 
        onChange={handleChange('props')}
        disabled={!props || props.length === 0}
        sx={{ mb: 1 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={500}>Component API</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {props && props.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 2fr 1fr' },
                gap: 1,
                '& > div': { p: 1 },
                '& .header': { fontWeight: 'bold', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }
              }}>
                <Box className="header">Name</Box>
                <Box className="header">Type</Box>
                <Box className="header" sx={{ display: { xs: 'none', md: 'block' } }}>Description</Box>
                <Box className="header">Default</Box>
                
                {props.map((prop, index) => (
                  <React.Fragment key={index}>
                    <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {prop.name}
                      {prop.required && <Typography component="span" color="error">*</Typography>}
                    </Box>
                    <Box><Chip size="small" label={prop.type} /></Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>{prop.description}</Box>
                    <Box sx={{ fontStyle: prop.default ? 'normal' : 'italic' }}>
                      {prop.default || '-'}
                    </Box>
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          ) : (
            <Typography color="text.secondary">This component has no configurable props.</Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Usage Examples */}
      <Accordion 
        expanded={expanded === 'usage'} 
        onChange={handleChange('usage')}
        disabled={!usage || usage.length === 0}
        sx={{ mb: 1 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={500}>Usage Examples</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {usage && usage.length > 0 ? (
            <Box>
              {usage.map((example, index) => (
                <Box key={index} sx={{ mb: index < usage.length - 1 ? 3 : 0 }}>
                  <Typography variant="subtitle2" gutterBottom>{example.description}</Typography>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(0, 0, 0, 0.05)', 
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      overflowX: 'auto'
                    }}
                  >
                    <pre style={{ margin: 0 }}>{example.code}</pre>
                  </Paper>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">No usage examples available.</Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Best Practices */}
      <Accordion 
        expanded={expanded === 'practices'} 
        onChange={handleChange('practices')}
        disabled={!bestPractices || bestPractices.length === 0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={500}>Best Practices</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {bestPractices && bestPractices.length > 0 ? (
            <Box component="ul" sx={{ pl: 2, mt: 0 }}>
              {bestPractices.map((practice, index) => (
                <Typography component="li" key={index} variant="body2" sx={{ mb: 1 }}>
                  {practice}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">No best practices documented yet.</Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export const CodeSnippet: React.FC<{ code: string; language?: string }> = ({ 
  code,
  language = 'jsx'
}) => {
  return (
    <Paper 
      sx={{ 
        p: 2, 
        bgcolor: 'rgba(0, 0, 0, 0.05)', 
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        overflowX: 'auto',
        position: 'relative'
      }}
    >
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <Tooltip title={`${language} code snippet`}>
          <Chip size="small" label={language} />
        </Tooltip>
      </Box>
      <pre style={{ margin: 0 }}>{code}</pre>
    </Paper>
  );
};

export const InfoTooltip: React.FC<{ title: string }> = ({ title }) => {
  return (
    <Tooltip title={title}>
      <IconButton size="small" color="primary">
        <InfoIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};