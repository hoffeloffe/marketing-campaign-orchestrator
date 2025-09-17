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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  LinearProgress,
  IconButton,
  Avatar,
  Fab,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon,
} from '@mui/icons-material'
import api from '../services/api'

const CHANNELS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'slack', label: 'Slack' },
]

const CONTENT_TYPES = [
  { value: 'post', label: 'Social Post', icon: <ArticleIcon /> },
  { value: 'image', label: 'Image Post', icon: <ImageIcon /> },
  { value: 'video', label: 'Video Post', icon: <VideoIcon /> },
]

export default function ContentLibrary() {
  const queryClient = useQueryClient()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [filterTab, setFilterTab] = useState(0)
  const [newContent, setNewContent] = useState({
    campaignId: '',
    type: 'post',
    title: '',
    body: '',
    channels: [],
    tags: '',
  })

  const { data: content, isLoading } = useQuery({
    queryKey: ['content'],
    queryFn: () => api.getContent(),
  })

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: api.getCampaigns,
  })

  const createMutation = useMutation({
    mutationFn: api.createContent,
    onSuccess: () => {
      queryClient.invalidateQueries(['content'])
      setCreateDialogOpen(false)
      setNewContent({
        campaignId: '',
        type: 'post',
        title: '',
        body: '',
        channels: [],
        tags: '',
      })
    },
  })

  const handleCreateContent = () => {
    createMutation.mutate(newContent)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success'
      case 'scheduled': return 'info'
      case 'draft': return 'warning'
      default: return 'default'
    }
  }

  const getTypeIcon = (type) => {
    const contentType = CONTENT_TYPES.find(t => t.value === type)
    return contentType ? contentType.icon : <ArticleIcon />
  }

  const filteredContent = content?.filter((item) => {
    switch (filterTab) {
      case 1: return item.status === 'draft'
      case 2: return item.status === 'scheduled'
      case 3: return item.status === 'published'
      default: return true
    }
  }) || []

  if (isLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading content...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Content Library
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Content
        </Button>
      </Box>

      {/* Filter Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={filterTab} onChange={(e, newValue) => setFilterTab(newValue)}>
          <Tab label={`All (${content?.length || 0})`} />
          <Tab label={`Drafts (${content?.filter(c => c.status === 'draft').length || 0})`} />
          <Tab label={`Scheduled (${content?.filter(c => c.status === 'scheduled').length || 0})`} />
          <Tab label={`Published (${content?.filter(c => c.status === 'published').length || 0})`} />
        </Tabs>
      </Card>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {filteredContent.map((item) => (
          <Grid item xs={12} md={6} lg={4} key={item.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {getTypeIcon(item.type)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h2" noWrap>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {CONTENT_TYPES.find(t => t.value === item.type)?.label}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={item.status}
                    color={getStatusColor(item.status)}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {item.body}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Channels:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {item.channels.map((channel) => (
                      <Chip key={channel} label={channel} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>

                {item.scheduledAt && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Scheduled:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(item.scheduledAt).toLocaleString()}
                    </Typography>
                  </Box>
                )}

                {item.metrics && item.status === 'published' && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Performance:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Views</Typography>
                        <Typography variant="h6">{item.metrics.impressions}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Clicks</Typography>
                        <Typography variant="h6">{item.metrics.clicks}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Likes</Typography>
                        <Typography variant="h6">{item.metrics.likes}</Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </CardContent>

              <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <IconButton size="small" title="View">
                    <ViewIcon />
                  </IconButton>
                  <IconButton size="small" title="Edit">
                    <EditIcon />
                  </IconButton>
                  {item.status === 'draft' && (
                    <IconButton size="small" title="Schedule">
                      <ScheduleIcon />
                    </IconButton>
                  )}
                </Box>
                <IconButton size="small" color="error" title="Delete">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredContent.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No content found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first piece of content to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Content
          </Button>
        </Box>
      )}

      {/* Create Content Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Content</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Campaign</InputLabel>
              <Select
                value={newContent.campaignId}
                onChange={(e) => setNewContent({ ...newContent, campaignId: e.target.value })}
                label="Campaign"
              >
                <MenuItem value="">
                  <em>No Campaign</em>
                </MenuItem>
                {campaigns?.map((campaign) => (
                  <MenuItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Content Type</InputLabel>
              <Select
                value={newContent.type}
                onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
                label="Content Type"
              >
                {CONTENT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {type.icon}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Title"
              fullWidth
              value={newContent.title}
              onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
            />
            
            <TextField
              label="Content"
              multiline
              rows={4}
              fullWidth
              value={newContent.body}
              onChange={(e) => setNewContent({ ...newContent, body: e.target.value })}
              placeholder="Write your content here..."
            />
            
            <FormControl fullWidth>
              <InputLabel>Channels</InputLabel>
              <Select
                multiple
                value={newContent.channels}
                onChange={(e) => setNewContent({ ...newContent, channels: e.target.value })}
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
              label="Tags (comma separated)"
              fullWidth
              value={newContent.tags}
              onChange={(e) => setNewContent({ ...newContent, tags: e.target.value })}
              placeholder="marketing, product, announcement"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateContent} 
            variant="contained"
            disabled={createMutation.isLoading || !newContent.title || !newContent.body}
          >
            {createMutation.isLoading ? 'Creating...' : 'Create Content'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
