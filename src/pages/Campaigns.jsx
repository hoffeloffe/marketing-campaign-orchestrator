import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  LinearProgress,
  Fab,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  TrendingUp,
} from '@mui/icons-material'
import api from '../services/api'

const CHANNELS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'slack', label: 'Slack' },
]

export default function Campaigns() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    startDate: '',
    endDate: '',
    goals: '',
    channels: [],
  })

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: api.getCampaigns,
  })

  const createMutation = useMutation({
    mutationFn: api.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns'])
      setCreateDialogOpen(false)
      setNewCampaign({
        name: '',
        startDate: '',
        endDate: '',
        goals: '',
        channels: [],
      })
    },
  })

  const handleCreateCampaign = () => {
    createMutation.mutate(newCampaign)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'scheduled': return 'info'
      case 'completed': return 'default'
      case 'draft': return 'warning'
      default: return 'default'
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading campaigns...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Campaigns
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Campaign
        </Button>
      </Box>

      <Grid container spacing={3}>
        {campaigns?.map((campaign) => (
          <Grid item xs={12} md={6} lg={4} key={campaign.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2">
                    {campaign.name}
                  </Typography>
                  <Chip
                    label={campaign.status}
                    color={getStatusColor(campaign.status)}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {campaign.goals}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Channels:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {campaign.channels.map((channel) => (
                      <Chip key={channel} label={channel} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Duration:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                  </Typography>
                </Box>

                {campaign.metrics && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Performance:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Impressions</Typography>
                        <Typography variant="h6">{campaign.metrics.impressions.toLocaleString()}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Clicks</Typography>
                        <Typography variant="h6">{campaign.metrics.clicks.toLocaleString()}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">CTR</Typography>
                        <Typography variant="h6">
                          {campaign.metrics.impressions > 0 
                            ? ((campaign.metrics.clicks / campaign.metrics.impressions) * 100).toFixed(2)
                            : 0}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </CardContent>

              <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  size="small"
                  startIcon={<ViewIcon />}
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                >
                  View Details
                </Button>
                <IconButton size="small">
                  <EditIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Campaign Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Campaign</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Campaign Name"
              fullWidth
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
            />
            
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newCampaign.startDate}
              onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
            />
            
            <TextField
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newCampaign.endDate}
              onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
            />
            
            <FormControl fullWidth>
              <InputLabel>Channels</InputLabel>
              <Select
                multiple
                value={newCampaign.channels}
                onChange={(e) => setNewCampaign({ ...newCampaign, channels: e.target.value })}
                input={<OutlinedInput label="Channels" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {CHANNELS.map((channel) => (
                  <MenuItem key={channel.value} value={channel.value}>
                    {channel.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Goals & Description"
              multiline
              rows={3}
              fullWidth
              value={newCampaign.goals}
              onChange={(e) => setNewCampaign({ ...newCampaign, goals: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateCampaign} 
            variant="contained"
            disabled={createMutation.isLoading || !newCampaign.name || !newCampaign.startDate}
          >
            {createMutation.isLoading ? 'Creating...' : 'Create Campaign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
