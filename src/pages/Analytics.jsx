import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Remove as RemoveIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import api from '../services/api'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedCampaign, setSelectedCampaign] = useState('')

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', selectedCampaign],
    queryFn: () => api.getAnalytics(selectedCampaign || null),
  })

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: api.getCampaigns,
  })

  const { data: content } = useQuery({
    queryKey: ['content'],
    queryFn: () => api.getContent(),
  })

  if (analyticsLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading analytics...</Typography>
      </Box>
    )
  }

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <TrendingUp color="success" />
    if (current < previous) return <TrendingDown color="error" />
    return <RemoveIcon color="disabled" />
  }

  const getTrendColor = (current, previous) => {
    if (current > previous) return 'success.main'
    if (current < previous) return 'error.main'
    return 'text.secondary'
  }

  const exportData = () => {
    // Mock export functionality
    const csvContent = [
      ['Date', 'Impressions', 'Clicks', 'Engagement'],
      ...analytics.timeline.map(item => [
        item.date,
        item.impressions,
        item.clicks,
        item.engagement
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'analytics-report.csv'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const topPerformingContent = content
    ?.filter(item => item.status === 'published' && item.metrics)
    .sort((a, b) => (b.metrics.impressions + b.metrics.clicks) - (a.metrics.impressions + a.metrics.clicks))
    .slice(0, 5) || []

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Campaign</InputLabel>
            <Select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              label="Campaign"
            >
              <MenuItem value="">All Campaigns</MenuItem>
              {campaigns?.map((campaign) => (
                <MenuItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportData}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Impressions
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.overview?.totalImpressions?.toLocaleString() || '0'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getTrendIcon(45000, 38000)}
                    <Typography variant="body2" sx={{ ml: 0.5, color: getTrendColor(45000, 38000) }}>
                      +18.4%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Clicks
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.overview?.totalClicks?.toLocaleString() || '0'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getTrendIcon(1200, 950)}
                    <Typography variant="body2" sx={{ ml: 0.5, color: getTrendColor(1200, 950) }}>
                      +26.3%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Click-Through Rate
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.overview?.ctr?.toFixed(2) || '0.00'}%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getTrendIcon(2.67, 2.50)}
                    <Typography variant="body2" sx={{ ml: 0.5, color: getTrendColor(2.67, 2.50) }}>
                      +6.8%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Conversions
                  </Typography>
                  <Typography variant="h4">
                    {analytics?.overview?.totalConversions || '0'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {getTrendIcon(85, 72)}
                    <Typography variant="body2" sx={{ ml: 0.5, color: getTrendColor(85, 72) }}>
                      +18.1%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Performance Timeline */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Over Time
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.timeline || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="impressions"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="clicks"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Platform Performance */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Platform Performance
              </Typography>
              <Box sx={{ height: 400 }}>
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
            </CardContent>
          </Card>
        </Grid>

        {/* Platform Comparison */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Platform Comparison
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.byPlatform || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="impressions" fill="#8884d8" />
                    <Bar dataKey="clicks" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performing Content */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performing Content
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Content</TableCell>
                      <TableCell align="right">Views</TableCell>
                      <TableCell align="right">Clicks</TableCell>
                      <TableCell align="right">CTR</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topPerformingContent.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="subtitle2" noWrap sx={{ maxWidth: 200 }}>
                            {item.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            {item.channels.map((channel) => (
                              <Chip key={channel} label={channel} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {item.metrics.impressions.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          {item.metrics.clicks.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          {item.metrics.impressions > 0 
                            ? ((item.metrics.clicks / item.metrics.impressions) * 100).toFixed(2)
                            : 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
