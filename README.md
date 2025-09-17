# Marketing Campaign Orchestrator

A modern web application for managing and automating marketing campaigns across multiple platforms, integrated with n8n workflows.

![Marketing Campaign Orchestrator](https://img.shields.io/badge/React-18.2.0-blue) ![n8n](https://img.shields.io/badge/n8n-Integration-green) ![Material-UI](https://img.shields.io/badge/MUI-5.14.20-purple)

## 🚀 Features

- **Campaign Management** - Create, track, and manage marketing campaigns
- **Content Library** - Centralized content creation and management
- **Smart Scheduler** - Schedule content across multiple platforms
- **Analytics Dashboard** - Real-time performance tracking and insights
- **n8n Integration** - Seamless workflow automation
- **Multi-Platform Support** - LinkedIn, Twitter/X, Slack integration
- **Dark Theme** - Professional, modern interface
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **UI Framework**: Material-UI (MUI) 5
- **State Management**: TanStack Query
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Automation**: n8n webhooks
- **Styling**: Emotion + MUI theming

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- n8n instance (local or hosted)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd MarketingCampaignOrchestrator
npm install
```

### 2. Environment Configuration

Copy the `.env` file and configure your settings:

```bash
# n8n Configuration
VITE_N8N_BASE_URL=https://your-n8n-instance.com
VITE_N8N_API_KEY=your-api-key-here

# App Configuration
VITE_APP_NAME=Marketing Campaign Orchestrator
VITE_APP_VERSION=1.0.0

# Mock Data Mode (set to false to use live n8n)
VITE_USE_MOCK_DATA=true
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔧 n8n Integration Setup

### Required Webhook Endpoints

Create the following webhook nodes in your n8n instance:

#### 1. Create Campaign Webhook
- **Path**: `/webhook/create-campaign`
- **Method**: POST
- **Expected Body**:
```json
{
  "name": "Campaign Name",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "goals": "Campaign objectives",
  "channels": ["linkedin", "twitter", "slack"]
}
```

#### 2. Create Content Webhook
- **Path**: `/webhook/create-content`
- **Method**: POST
- **Expected Body**:
```json
{
  "campaignId": "campaign-id",
  "type": "post",
  "title": "Content Title",
  "body": "Content body text",
  "channels": ["linkedin", "twitter"],
  "tags": "tag1,tag2,tag3"
}
```

#### 3. Schedule Content Webhook
- **Path**: `/webhook/schedule`
- **Method**: POST
- **Expected Body**:
```json
{
  "items": [
    {
      "contentId": "content-id",
      "platform": "linkedin",
      "scheduledAt": "2024-01-20T10:00:00Z"
    }
  ]
}
```

#### 4. Analytics Webhook
- **Path**: `/webhook/analytics`
- **Method**: GET
- **Query Parameters**: `?campaignId=optional-campaign-id`
- **Expected Response**:
```json
{
  "overview": {
    "totalImpressions": 45000,
    "totalClicks": 1200,
    "totalEngagement": 8.5,
    "totalConversions": 85,
    "ctr": 2.67,
    "conversionRate": 7.08
  },
  "byPlatform": [
    {
      "platform": "LinkedIn",
      "impressions": 25000,
      "clicks": 750,
      "engagement": 9.2
    }
  ],
  "timeline": [
    {
      "date": "2024-01-15",
      "impressions": 2000,
      "clicks": 60,
      "engagement": 8.0
    }
  ]
}
```

#### 5. Health Check Webhook
- **Path**: `/webhook/health`
- **Method**: GET
- **Expected Response**:
```json
{
  "status": "connected",
  "message": "n8n connection successful"
}
```

### Authentication

Add the following header to your n8n webhook responses:
```
X-API-KEY: your-api-key-here
```

## 📱 Application Structure

```
src/
├── components/
│   └── Layout.jsx          # Main layout with sidebar navigation
├── pages/
│   ├── Dashboard.jsx       # Overview and key metrics
│   ├── Campaigns.jsx       # Campaign management
│   ├── CampaignDetail.jsx  # Individual campaign view
│   ├── ContentLibrary.jsx  # Content creation and management
│   ├── Scheduler.jsx       # Content scheduling interface
│   ├── Analytics.jsx       # Performance analytics
│   └── Settings.jsx        # App and n8n configuration
├── services/
│   └── api.js             # API service with mock/live data switching
└── main.jsx               # App entry point
```

## 🎯 Usage Guide

### 1. Campaign Management
- Create campaigns with specific goals and target channels
- Set campaign duration and track progress
- View campaign performance metrics

### 2. Content Creation
- Create various content types (posts, images, videos)
- Assign content to specific campaigns
- Tag content for better organization

### 3. Content Scheduling
- Schedule content across multiple platforms
- Drag-and-drop interface for easy scheduling
- View scheduled content in calendar format

### 4. Analytics & Reporting
- Real-time performance tracking
- Platform-specific analytics
- Export data for external analysis
- Top-performing content insights

### 5. Settings & Configuration
- Configure n8n connection settings
- Customize webhook endpoints
- Toggle between mock and live data
- Test connection status

## 🔄 Mock Data vs Live Data

The application supports two modes:

### Mock Data Mode (`VITE_USE_MOCK_DATA=true`)
- Uses predefined sample data
- Perfect for development and testing
- No n8n connection required
- Simulates realistic API responses

### Live Data Mode (`VITE_USE_MOCK_DATA=false`)
- Connects to your n8n instance
- Real-time data synchronization
- Requires proper webhook setup
- Production-ready functionality

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify/Vercel

1. Connect your repository
2. Set environment variables in the hosting platform
3. Deploy with build command: `npm run build`
4. Set output directory: `dist`

### Environment Variables for Production

```bash
VITE_N8N_BASE_URL=https://your-production-n8n.com
VITE_N8N_API_KEY=your-production-api-key
VITE_USE_MOCK_DATA=false
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](../../issues) page
2. Verify your n8n webhook configuration
3. Test the connection in Settings
4. Enable mock data mode for troubleshooting

## 🔮 Roadmap

- [ ] Email marketing integration (Mailchimp, SendGrid)
- [ ] Advanced scheduling with AI optimization
- [ ] Team collaboration features
- [ ] Custom analytics dashboards
- [ ] Mobile app companion
- [ ] Advanced A/B testing
- [ ] Integration with more social platforms

---

**Built with ❤️ for modern marketing teams**
