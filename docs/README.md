# Documentation - Repair Shop AI MVP

Complete documentation for setting up and using the Repair Shop AI MVP with Bland AI voice integration.

## 📚 Documentation Index

### Getting Started

- **[Quick Start Guide](./QUICKSTART.md)** - Get up and running in 30 minutes
  - Fast-track setup for testing
  - Minimal configuration
  - Quick verification steps

### Deployment

- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Complete production deployment
  - Detailed Supabase setup
  - Edge Function deployment
  - GitHub Pages hosting
  - Production checklist
  - Cost breakdown

### Integrations

- **[Bland AI Setup](./BLAND_AI_SETUP.md)** - Configure your voice agent
  - Account creation
  - Agent prompt engineering
  - Webhook configuration
  - Data extraction setup
  - Testing & troubleshooting

## 🏗️ Architecture

```
Customer Call → Bland AI → Webhook → Supabase → Dashboard
```

### Components

1. **Bland AI Voice Agent**
   - Answers inbound calls
   - Collects customer information
   - Creates transcripts
   - Records calls

2. **Supabase Backend**
   - PostgreSQL database
   - Edge Functions for webhooks
   - Real-time subscriptions
   - Authentication (optional)

3. **Frontend Dashboard**
   - HTML/JavaScript SPA
   - Real-time updates
   - Lead management
   - Voice call review

## 🚀 Quick Links

- **New to this project?** → Start with [Quick Start](./QUICKSTART.md)
- **Ready for production?** → Read [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- **Setting up voice calls?** → Follow [Bland AI Setup](./BLAND_AI_SETUP.md)

## 📁 File Structure

```
repair-shop-ai-mvp/
├── docs/                          # Documentation
│   ├── README.md                  # This file
│   ├── QUICKSTART.md              # Quick start guide
│   ├── DEPLOYMENT_GUIDE.md        # Full deployment guide
│   └── BLAND_AI_SETUP.md          # Bland AI configuration
│
├── supabase/                      # Supabase configuration
│   ├── schema.sql                 # Database schema
│   ├── config.toml                # Project config
│   ├── test-payload.json          # Test webhook data
│   └── functions/
│       └── bland-webhook/
│           └── index.ts           # Webhook handler
│
├── js/                            # JavaScript files
│   ├── supabase-config.js         # Supabase credentials
│   └── supabase-client.js         # Database operations
│
├── dashboard.html                 # Main dashboard
├── index.html                     # Landing page
├── app.js                         # Application logic
└── styles.css                     # Styling
```

## 🛠️ Setup Overview

### Phase 1: Backend (Supabase)
1. Create Supabase project
2. Run database schema
3. Deploy Edge Functions
4. Configure secrets

### Phase 2: Frontend
1. Update Supabase config
2. Test locally
3. Deploy to GitHub Pages

### Phase 3: Voice AI (Bland AI)
1. Create Bland AI account
2. Configure voice agent
3. Set up webhook
4. Test end-to-end

## 📊 Features

### Voice Call Management
- ✅ AI-powered call answering
- ✅ Automatic data extraction
- ✅ Call transcripts
- ✅ Call recordings
- ✅ Real-time notifications

### Lead Management
- ✅ Create leads manually or from calls
- ✅ Track lead status
- ✅ Source attribution (Voice AI vs Manual)
- ✅ Communication history
- ✅ Quote generation

### Dashboard
- ✅ Real-time updates via Supabase
- ✅ Lead filtering and search
- ✅ Analytics and metrics
- ✅ Parts search integration
- ✅ Responsive design

## 🔧 Configuration

### Required Environment Variables

**Supabase Edge Function:**
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

**Frontend (js/supabase-config.js):**
```javascript
url: 'https://xxxxx.supabase.co'
anonKey: 'eyJhbG...'
```

**Bland AI:**
```
Webhook URL: https://xxxxx.supabase.co/functions/v1/bland-webhook
Events: call.completed
```

## 🧪 Testing

### Test Database Connection
```bash
# Test from command line
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/bland-webhook \
  -H "Content-Type: application/json" \
  -d @supabase/test-payload.json
```

### Test Frontend
1. Open `dashboard.html` in browser
2. Open console (F12)
3. Look for: `✓ Supabase client initialized successfully`
4. Create a test lead
5. Verify it appears in Supabase

### Test Voice Integration
1. Call your Bland AI number
2. Complete the conversation
3. Check dashboard for new call
4. Create lead from call
5. Verify lead has "Voice AI" badge

## 💰 Costs

### Free Tier (Development)
- **Supabase**: Free (up to 500MB DB, 500K Edge Function calls)
- **GitHub Pages**: Free
- **Bland AI**: Free trial credits

### Production (Estimated)
- **Supabase**: $0-25/month
- **Bland AI**: ~$50-100/month (100-200 calls)
- **Total**: ~$50-125/month

See [Deployment Guide](./DEPLOYMENT_GUIDE.md#cost-breakdown) for detailed breakdown.

## 🐛 Troubleshooting

### Common Issues

**Issue: Supabase connection failed**
- Check credentials in `js/supabase-config.js`
- Verify using `anon` key, not `service_role` key
- Check CORS settings in Supabase

**Issue: Webhook not receiving data**
- Verify webhook URL in Bland AI
- Check Edge Function logs in Supabase
- Test webhook with curl command

**Issue: Real-time updates not working**
- Enable replication in Supabase for tables
- Check browser console for subscription errors
- Verify Supabase client initialized

See individual guides for more troubleshooting tips.

## 📞 Support

- **GitHub Issues**: Report bugs or request features
- **Supabase Docs**: https://supabase.com/docs
- **Bland AI Docs**: https://docs.bland.ai

## 🔐 Security

### Production Recommendations

- [ ] Enable Row Level Security (RLS) in Supabase
- [ ] Add webhook authentication (secret header)
- [ ] Use environment variables (never commit secrets)
- [ ] Enable rate limiting on Edge Functions
- [ ] Set up monitoring and alerts
- [ ] Regular security audits

See [Deployment Guide](./DEPLOYMENT_GUIDE.md#production-checklist) for full checklist.

## 📈 Monitoring

### Metrics to Track

- Call volume and duration
- Lead conversion rate (calls → leads)
- Response time for webhooks
- Database query performance
- Error rates and types

### Tools

- **Supabase Dashboard**: Database metrics, Edge Function logs
- **Bland AI Dashboard**: Call analytics, transcript review
- **Browser Console**: Frontend errors, real-time logs

## 🚦 Next Steps

After deployment:

1. **Test thoroughly** - Make multiple test calls
2. **Refine AI agent** - Improve prompt based on transcripts
3. **Train team** - Ensure staff knows how to use the system
4. **Monitor performance** - Watch metrics and costs
5. **Iterate** - Continuously improve based on feedback

## 📝 Changelog

### v2.0.0 - Bland AI Integration
- Added Bland AI voice agent support
- Implemented Supabase backend
- Real-time dashboard updates
- Call recording playback
- Source badges (Voice AI vs Manual)
- Comprehensive documentation

### v1.0.0 - Initial Release
- Basic lead management
- Parts search
- Quote generation
- localStorage-based storage

---

**Ready to get started?** → [Quick Start Guide](./QUICKSTART.md)

**Questions?** → Open an issue on GitHub

