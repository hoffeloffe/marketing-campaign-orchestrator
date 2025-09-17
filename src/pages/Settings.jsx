import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Save as SaveIcon,
  NetworkCheck as TestIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import api from '../services/api'

const WEBHOOK_ENDPOINTS = [
  { key: 'createCampaign', label: 'Create Campaign', path: '/webhook/create-campaign', method: 'POST' },
  { key: 'createContent', label: 'Create Content', path: '/webhook/create-content', method: 'POST' },
  { key: 'schedule', label: 'Schedule Content', path: '/webhook/schedule', method: 'POST' },
  { key: 'analytics', label: 'Get Analytics', path: '/webhook/analytics', method: 'GET' },
  { key: 'health', label: 'Health Check', path: '/webhook/health', method: 'GET' },
]

export default function Settings() {
  const [settings, setSettings] = useState({
    n8nBaseUrl: import.meta.env.VITE_N8N_BASE_URL || '',
    apiKey: import.meta.env.VITE_N8N_API_KEY || '',
    useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
    webhookEndpoints: WEBHOOK_ENDPOINTS.reduce((acc, endpoint) => {
      acc[endpoint.key] = endpoint.path
      return acc
    }, {}),
  })
  
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [testingConnection, setTestingConnection] = useState(false)
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState(null)

  const testConnectionMutation = useMutation({
    mutationFn: api.testConnection,
    onSuccess: (data) => {
      setConnectionStatus({ status: 'success', message: data.message || 'Connection successful' })
    },
    onError: (error) => {
      setConnectionStatus({ status: 'error', message: error.message || 'Connection failed' })
    },
    onSettled: () => {
      setTestingConnection(false)
    }
  })

  const handleTestConnection = () => {
    setTestingConnection(true)
    setConnectionStatus(null)
    testConnectionMutation.mutate()
  }

  const handleSaveSettings = () => {
    // In a real app, this would save to backend or update environment
    localStorage.setItem('app-settings', JSON.stringify(settings))
    setConnectionStatus({ status: 'info', message: 'Settings saved locally. Restart the app to apply changes.' })
  }

  const handleWebhookEdit = (webhookKey) => {
    const webhook = WEBHOOK_ENDPOINTS.find(w => w.key === webhookKey)
    setSelectedWebhook({
      ...webhook,
      currentPath: settings.webhookEndpoints[webhookKey]
    })
    setWebhookDialogOpen(true)
  }

  const handleWebhookSave = () => {
    setSettings({
      ...settings,
      webhookEndpoints: {
        ...settings.webhookEndpoints,
        [selectedWebhook.key]: selectedWebhook.currentPath
      }
    })
    setWebhookDialogOpen(false)
    setSelectedWebhook(null)
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* n8n Connection Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                n8n Connection
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="n8n Base URL"
                  fullWidth
                  value={settings.n8nBaseUrl}
                  onChange={(e) => setSettings({ ...settings, n8nBaseUrl: e.target.value })}
                  placeholder="https://your-n8n-instance.com"
                  helperText="The base URL of your n8n instance"
                />
                
                <TextField
                  label="API Key"
                  type="password"
                  fullWidth
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  placeholder="your-api-key"
                  helperText="API key for authenticating with n8n webhooks"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.useMockData}
                      onChange={(e) => setSettings({ ...settings, useMockData: e.target.checked })}
                    />
                  }
                  label="Use Mock Data"
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSettings}
                  >
                    Save Settings
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TestIcon />}
                    onClick={handleTestConnection}
                    disabled={testingConnection || !settings.n8nBaseUrl}
                  >
                    {testingConnection ? 'Testing...' : 'Test Connection'}
                  </Button>
                </Box>
                
                {connectionStatus && (
                  <Alert 
                    severity={connectionStatus.status}
                    icon={
                      connectionStatus.status === 'success' ? <CheckCircleIcon /> :
                      connectionStatus.status === 'error' ? <ErrorIcon /> : <InfoIcon />
                    }
                  >
                    {connectionStatus.message}
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Webhook Endpoints */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Webhook Endpoints
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure the webhook paths for your n8n workflows
              </Typography>
              
              <List>
                {WEBHOOK_ENDPOINTS.map((webhook) => (
                  <ListItem key={webhook.key} divider>
                    <ListItemText
                      primary={webhook.label}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip label={webhook.method} size="small" color="primary" />
                          <Typography variant="body2" component="code" sx={{ bgcolor: 'background.paper', px: 1, borderRadius: 0.5 }}>
                            {settings.webhookEndpoints[webhook.key]}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        size="small" 
                        onClick={() => handleWebhookEdit(webhook.key)}
                        title="Edit endpoint"
                      >
                        <EditIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* App Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Version
                  </Typography>
                  <Typography variant="body1">
                    {import.meta.env.VITE_APP_VERSION || '1.0.0'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Environment
                  </Typography>
                  <Typography variant="body1">
                    {import.meta.env.MODE}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Build Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Data Mode
                  </Typography>
                  <Chip 
                    label={settings.useMockData ? 'Mock Data' : 'Live Data'} 
                    color={settings.useMockData ? 'warning' : 'success'}
                    size="small"
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary">
                This Marketing Campaign Orchestrator connects to your n8n instance to automate 
                marketing workflows across multiple platforms. Configure your n8n webhooks above 
                to enable live data integration.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Webhook Dialog */}
      <Dialog open={webhookDialogOpen} onClose={() => setWebhookDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Webhook Endpoint</DialogTitle>
        <DialogContent>
          {selectedWebhook && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Endpoint Name"
                fullWidth
                value={selectedWebhook.label}
                disabled
              />
              
              <FormControl fullWidth>
                <InputLabel>HTTP Method</InputLabel>
                <Select
                  value={selectedWebhook.method}
                  label="HTTP Method"
                  disabled
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Webhook Path"
                fullWidth
                value={selectedWebhook.currentPath}
                onChange={(e) => setSelectedWebhook({ ...selectedWebhook, currentPath: e.target.value })}
                placeholder="/webhook/your-endpoint"
                helperText="The path where your n8n webhook is listening"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWebhookDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleWebhookSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
