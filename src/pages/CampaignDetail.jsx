import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  IconButton,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Add as AddIcon,
  TrendingUp,
  Visibility,
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../services/api'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => api.getCampaign(id),
  })

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => api.getContent(id),
  })

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', id],
    queryFn: () => api.getAnalytics(id),
  })

  if (campaignLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading campaign...</Typography>
      </Box>
    )
  }

  if (!campaign) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">Campaign not found</Typography>
        <Button onClick={() => navigate('/campaigns')} sx={{ mt: 2 }}>
          Back to Campaigns
        </Button>
      </Box>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'scheduled': return 'info'
      case 'completed': return 'default'
      case 'draft': return 'warning'
      case 'published': return 'success'
      default: return 'default'
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/campaigns')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">
            {campaign.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Chip label={campaign.status} color={getStatusColor(campaign.status)} />
            <Typography variant="body2" color="text.secondary">
              {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
        <Button variant="outlined" startIcon={<EditIcon />}>
          Edit Campaign
        </Button>
      </Box>

      {/* Campaign Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign Overview
              </Typography>
              <Typography variant="body1" paragraph>
                {campaign.goals}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {campaign.channels.map((channel) => (
                  <Chip key={channel} label={channel} variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Impressions</Typography>
                  <Typography variant="h5">{campaign.metrics?.impressions?.toLocaleString() || '0'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Clicks</Typography>
                  <Typography variant="h5">{campaign.metrics?.clicks?.toLocaleString() || '0'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Engagement Rate</Typography>
                  <Typography variant="h5">{campaign.metrics?.engagement || 0}%</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Conversions</Typography>
                  <Typography variant="h5">{campaign.metrics?.conversions || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Content" />
            <Tab label="Analytics" />
            <Tab label="Schedule" />
          </Tabs>
        </Box>

        {/* Content Tab */}
        {tabValue === 0 && (
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Campaign Content</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/content')}>
                Add Content
              </Button>
            </Box>
            
            {contentLoading ? (
              <LinearProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Channels</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Scheduled</TableCell>
                      <TableCell>Performance</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {content?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="subtitle2">{item.title}</Typography>
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                            {item.body}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {item.channels.map((channel) => (
                              <Chip key={channel} label={channel} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={item.status} color={getStatusColor(item.status)} size="small" />
                        </TableCell>
                        <TableCell>
                          {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : '-'}
                        </TableCell>
                        <TableCell>
                          {item.metrics && (
                            <Box>
                              <Typography variant="body2">{item.metrics.impressions} views</Typography>
                              <Typography variant="body2">{item.metrics.clicks} clicks</Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        )}

        {/* Analytics Tab */}
        {tabValue === 1 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Campaign Analytics
            </Typography>
            
            {analyticsLoading ? (
              <LinearProgress />
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" gutterBottom>
                    Performance Timeline
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics?.timeline || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="impressions" stroke="#8884d8" />
                        <Line type="monotone" dataKey="clicks" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Platform Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics?.byPlatform || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="impressions"
                        >
                          {analytics?.byPlatform?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>
            )}
          </CardContent>
        )}

        {/* Schedule Tab */}
        {tabValue === 2 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Content Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Schedule view will be implemented in the Scheduler page.
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/scheduler')}
            >
              Go to Scheduler
            </Button>
          </CardContent>
        )}
      </Card>
    </Box>
  )
}
