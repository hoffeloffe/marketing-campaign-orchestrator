// API service for communicating with n8n webhooks
const API_BASE_URL = import.meta.env.VITE_N8N_BASE_URL
const API_KEY = import.meta.env.VITE_N8N_API_KEY
// Check localStorage first, then fall back to env variable
const getUseMockData = () => {
  const savedSettings = localStorage.getItem('app-settings')
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings)
      return settings.useMockData
    } catch (e) {
      console.warn('Failed to parse saved settings')
    }
  }
  return import.meta.env.VITE_USE_MOCK_DATA === 'true'
}

// Mock data for development
const mockCampaigns = [
  {
    id: '1',
    name: 'Q1 Product Launch',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    status: 'active',
    channels: ['linkedin', 'twitter', 'slack'],
    goals: 'Increase brand awareness and drive product adoption',
    metrics: {
      impressions: 45000,
      clicks: 1200,
      engagement: 8.5,
      conversions: 85
    }
  },
  {
    id: '2',
    name: 'Holiday Campaign',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'scheduled',
    channels: ['linkedin', 'twitter'],
    goals: 'Drive holiday sales and engagement',
    metrics: {
      impressions: 0,
      clicks: 0,
      engagement: 0,
      conversions: 0
    }
  }
]

const mockContent = [
  {
    id: '1',
    campaignId: '1',
    type: 'post',
    title: 'Introducing Our New Product',
    body: 'We are excited to announce the launch of our revolutionary new product that will change how you work.',
    channels: ['linkedin', 'twitter'],
    status: 'published',
    scheduledAt: '2024-01-20T10:00:00Z',
    publishedAt: '2024-01-20T10:00:00Z',
    metrics: {
      impressions: 5000,
      clicks: 150,
      likes: 45,
      shares: 12
    }
  },
  {
    id: '2',
    campaignId: '1',
    type: 'post',
    title: 'Product Demo Video',
    body: 'Check out this amazing demo of our new product in action! Link in comments.',
    channels: ['linkedin'],
    status: 'scheduled',
    scheduledAt: '2024-01-25T14:00:00Z',
    metrics: {
      impressions: 0,
      clicks: 0,
      likes: 0,
      shares: 0
    }
  }
]

const mockAnalytics = {
  overview: {
    totalImpressions: 45000,
    totalClicks: 1200,
    totalEngagement: 8.5,
    totalConversions: 85,
    ctr: 2.67,
    conversionRate: 7.08
  },
  byPlatform: [
    { platform: 'LinkedIn', impressions: 25000, clicks: 750, engagement: 9.2 },
    { platform: 'Twitter', impressions: 15000, clicks: 350, engagement: 7.1 },
    { platform: 'Slack', impressions: 5000, clicks: 100, engagement: 8.8 }
  ],
  timeline: [
    { date: '2024-01-15', impressions: 2000, clicks: 60, engagement: 8.0 },
    { date: '2024-01-16', impressions: 2500, clicks: 75, engagement: 8.5 },
    { date: '2024-01-17', impressions: 3000, clicks: 90, engagement: 9.0 },
    { date: '2024-01-18', impressions: 2800, clicks: 85, engagement: 8.8 },
    { date: '2024-01-19', impressions: 3200, clicks: 95, engagement: 9.2 },
    { date: '2024-01-20', impressions: 4000, clicks: 120, engagement: 9.5 },
    { date: '2024-01-21', impressions: 3500, clicks: 105, engagement: 9.0 }
  ]
}

// Helper function to make API requests
const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': API_KEY,
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

// Mock delay to simulate API calls
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// API methods
export const api = {
  // Campaigns
  async getCampaigns() {
    if (getUseMockData()) {
      await mockDelay()
      return mockCampaigns
    }
    const result = await makeRequest('/webhook/campaigns')
    // If n8n returns a single object, wrap it in an array
    return Array.isArray(result) ? result : [result]
  },

  async getCampaign(id) {
    if (getUseMockData()) {
      await mockDelay()
      return mockCampaigns.find(c => c.id === id)
    }
    return makeRequest(`/webhook/campaigns/${id}`)
  },

  async createCampaign(campaign) {
    if (getUseMockData()) {
      await mockDelay()
      const newCampaign = {
        ...campaign,
        id: Date.now().toString(),
        status: 'draft',
        metrics: {
          impressions: 0,
          clicks: 0,
          engagement: 0,
          conversions: 0
        }
      }
      mockCampaigns.push(newCampaign)
      return newCampaign
    }
    return makeRequest('/webhook/create-campaign', {
      method: 'POST',
      body: JSON.stringify(campaign),
    })
  },

  async updateCampaign(id, updates) {
    if (getUseMockData()) {
      await mockDelay()
      const index = mockCampaigns.findIndex(c => c.id === id)
      if (index !== -1) {
        mockCampaigns[index] = { ...mockCampaigns[index], ...updates }
        return mockCampaigns[index]
      }
      throw new Error('Campaign not found')
    }
    return makeRequest(`/webhook/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  // Content
  async getContent(campaignId = null) {
    if (getUseMockData()) {
      await mockDelay()
      return campaignId 
        ? mockContent.filter(c => c.campaignId === campaignId)
        : mockContent
    }
    const endpoint = campaignId 
      ? `/webhook/content?campaignId=${campaignId}`
      : '/webhook/content'
    return makeRequest(endpoint)
  },

  async createContent(content) {
    if (getUseMockData()) {
      await mockDelay()
      const newContent = {
        ...content,
        id: Date.now().toString(),
        status: 'draft',
        metrics: {
          impressions: 0,
          clicks: 0,
          likes: 0,
          shares: 0
        }
      }
      mockContent.push(newContent)
      return newContent
    }
    return makeRequest('/webhook/create-content', {
      method: 'POST',
      body: JSON.stringify(content),
    })
  },

  // Scheduling
  async scheduleContent(scheduleData) {
    if (getUseMockData()) {
      await mockDelay()
      return { success: true, scheduledCount: scheduleData.items?.length || 1 }
    }
    return makeRequest('/webhook/schedule', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    })
  },

  // Analytics
  async getAnalytics(campaignId = null) {
    if (getUseMockData()) {
      await mockDelay()
      return mockAnalytics
    }
    const endpoint = campaignId 
      ? `/webhook/analytics?campaignId=${campaignId}`
      : '/webhook/analytics'
    return makeRequest(endpoint)
  },

  // Settings
  async testConnection() {
    if (getUseMockData()) {
      await mockDelay()
      return { status: 'connected', message: 'Mock API connection successful' }
    }
    return makeRequest('/webhook/health')
  }
}

export default api
