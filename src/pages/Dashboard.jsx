import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Paper,
} from '@mui/material'
import {
  TrendingUp,
  Campaign,
  Schedule,
  Analytics,
  Add as AddIcon,
} from '@mui/icons-material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../services/api'

export default function Dashboard() {
  const navigate = useNavigate()

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: api.getCampaigns,
  })

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: api.getAnalytics,
  })

  const activeCampaigns = campaigns?.filter(c => c.status === 'active') || []
  const scheduledCampaigns = campaigns?.filter(c => c.status === 'scheduled') || []

  const stats = [
    {
      title: 'Active Campaigns',
      value: activeCampaigns.length,
      icon: <Campaign />,
      color: 'primary',
      onClick: () => navigate('/campaigns'),
    },
    {
      title: 'Total Impressions',
      value: analytics?.overview?.totalImpressions?.toLocaleString() || '0',
      icon: <TrendingUp />,
      color: 'success',
      onClick: () => navigate('/analytics'),
    },
    {
      title: 'Scheduled Posts',
      value: scheduledCampaigns.length,
      icon: <Schedule />,
      color: 'info',
      onClick: () => navigate('/scheduler'),
    },
    {
      title: 'Conversion Rate',
      value: analytics?.overview?.conversionRate ? `${analytics.overview.conversionRate}%` : '0%',
      icon: <Analytics />,
      color: 'warning',
      onClick: () => navigate('/analytics'),
    },
  ]

  if (campaignsLoading || analyticsLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/campaigns')}
        >
          New Campaign
        </Button>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
              onClick={stat.onClick}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: `${stat.color}.main`,
                    color: 'white',
                    display: 'flex'
                  }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    <Typography color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Campaigns */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Campaigns
              </Typography>
              {campaigns?.slice(0, 5).map((campaign) => (
                <Box
                  key={campaign.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                >
                  <Box>
                    <Typography variant="subtitle2">{campaign.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {campaign.channels.join(', ')}
                    </Typography>
                  </Box>
                  <Chip
                    label={campaign.status}
                    color={
                      campaign.status === 'active' ? 'success' :
                      campaign.status === 'scheduled' ? 'info' : 'default'
                    }
                    size="small"
                  />
                </Box>
              ))}
              <Button
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/campaigns')}
              >
                View All Campaigns
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Platform Performance
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.byPlatform || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="impressions" fill="#8884d8" />
                    <Bar dataKey="clicks" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
