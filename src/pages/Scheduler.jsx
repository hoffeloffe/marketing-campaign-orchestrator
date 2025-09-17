import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  LinearProgress,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
} from '@mui/material'
import {
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Article as ArticleIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
} from '@mui/icons-material'
// Removed DateTimePicker imports to avoid dependency issues
import api from '../services/api'

const CHANNELS = [
  { value: 'linkedin', label: 'LinkedIn', color: '#0077B5' },
  { value: 'twitter', label: 'Twitter/X', color: '#1DA1F2' },
  { value: 'slack', label: 'Slack', color: '#4A154B' },
]

export default function Scheduler() {
  const queryClient = useQueryClient()
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  const [selectedContent, setSelectedContent] = useState(null)
  const [scheduleData, setScheduleData] = useState({
    contentId: '',
    platform: '',
    scheduledAt: new Date(),
  })

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ['content'],
    queryFn: () => api.getContent(),
  })

  const scheduleMutation = useMutation({
    mutationFn: api.scheduleContent,
    onSuccess: () => {
      queryClient.invalidateQueries(['content'])
      setScheduleDialogOpen(false)
      setSelectedContent(null)
      setScheduleData({
        contentId: '',
        platform: '',
        scheduledAt: new Date(),
      })
    },
  })

  const handleScheduleContent = () => {
    scheduleMutation.mutate({
      items: [{
        contentId: scheduleData.contentId,
        platform: scheduleData.platform,
        scheduledAt: scheduleData.scheduledAt.toISOString(),
      }]
    })
  }

  const getContentIcon = (type) => {
    switch (type) {
      case 'image': return <ImageIcon />
      case 'video': return <VideoIcon />
      default: return <ArticleIcon />
    }
  }

  const getChannelColor = (channel) => {
    const channelData = CHANNELS.find(c => c.value === channel)
    return channelData ? channelData.color : '#666'
  }

  const scheduledContent = content?.filter(item => item.status === 'scheduled') || []
  const draftContent = content?.filter(item => item.status === 'draft') || []

  // Group scheduled content by date
  const groupedScheduledContent = scheduledContent.reduce((groups, item) => {
    const date = new Date(item.scheduledAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
    return groups
  }, {})

  if (contentLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading scheduler...</Typography>
      </Box>
    )
  }

  return (
    <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Content Scheduler
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={viewMode === 'list' ? 'contained' : 'outlined'}
              startIcon={<TodayIcon />}
              onClick={() => setViewMode('list')}
            >
              List View
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'contained' : 'outlined'}
              startIcon={<DateRangeIcon />}
              onClick={() => setViewMode('calendar')}
            >
              Calendar View
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Scheduled Content */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Scheduled Content
                </Typography>
                
                {Object.keys(groupedScheduledContent).length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No scheduled content
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Schedule some content to see it here
                    </Typography>
                  </Box>
                ) : (
                  Object.entries(groupedScheduledContent)
                    .sort(([a], [b]) => new Date(a) - new Date(b))
                    .map(([date, items]) => (
                      <Box key={date} sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Typography>
                        <List>
                          {items.map((item) => (
                            <React.Fragment key={item.id}>
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    {getContentIcon(item.type)}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={item.title}
                                  secondary={
                                    <Box>
                                      <Typography variant="body2" component="span">
                                        {new Date(item.scheduledAt).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </Typography>
                                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                        {item.channels.map((channel) => (
                                          <Chip
                                            key={channel}
                                            label={channel}
                                            size="small"
                                            sx={{
                                              bgcolor: getChannelColor(channel),
                                              color: 'white',
                                              fontSize: '0.7rem'
                                            }}
                                          />
                                        ))}
                                      </Box>
                                    </Box>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <IconButton size="small" title="Edit">
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton size="small" title="Delete" color="error">
                                    <DeleteIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                              <Divider variant="inset" component="li" />
                            </React.Fragment>
                          ))}
                        </List>
                      </Box>
                    ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Draft Content */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Draft Content
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Drag content here to schedule or click to schedule manually
                </Typography>
                
                {draftContent.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No draft content available
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => window.open('/content', '_blank')}
                    >
                      Create Content
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {draftContent.map((item) => (
                      <React.Fragment key={item.id}>
                        <ListItem
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                            borderRadius: 1,
                          }}
                          onClick={() => {
                            setSelectedContent(item)
                            setScheduleData({
                              ...scheduleData,
                              contentId: item.id,
                            })
                            setScheduleDialogOpen(true)
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'warning.main' }}>
                              {getContentIcon(item.type)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={item.title}
                            secondary={
                              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                {item.channels.map((channel) => (
                                  <Chip
                                    key={channel}
                                    label={channel}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                ))}
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              size="small"
                              title="Schedule"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedContent(item)
                                setScheduleData({
                                  ...scheduleData,
                                  contentId: item.id,
                                })
                                setScheduleDialogOpen(true)
                              }}
                            >
                              <ScheduleIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Schedule Dialog */}
        <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Schedule Content</DialogTitle>
          <DialogContent>
            {selectedContent && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedContent.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {selectedContent.body.substring(0, 100)}...
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {selectedContent.channels.map((channel) => (
                    <Chip key={channel} label={channel} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Platform</InputLabel>
                <Select
                  value={scheduleData.platform}
                  onChange={(e) => setScheduleData({ ...scheduleData, platform: e.target.value })}
                  label="Platform"
                >
                  {CHANNELS.map((channel) => (
                    <MenuItem key={channel.value} value={channel.value}>
                      {channel.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Schedule Date & Time"
                type="datetime-local"
                fullWidth
                value={scheduleData.scheduledAt ? scheduleData.scheduledAt.toISOString().slice(0, 16) : ''}
                onChange={(e) => setScheduleData({ ...scheduleData, scheduledAt: new Date(e.target.value) })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleScheduleContent} 
              variant="contained"
              disabled={scheduleMutation.isLoading || !scheduleData.platform || !scheduleData.scheduledAt}
            >
              {scheduleMutation.isLoading ? 'Scheduling...' : 'Schedule'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  )
}
