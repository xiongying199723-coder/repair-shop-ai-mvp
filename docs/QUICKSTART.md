# Quick Start Guide - Bland AI Integration

Get your Repair Shop AI with voice capabilities running in under 30 minutes!

## Overview

This guide will help you quickly set up:
- ✅ Supabase backend for storing leads and voice calls
- ✅ Bland AI voice agent to answer customer calls
- ✅ Real-time dashboard to manage leads

**Estimated time:** 20-30 minutes

---

## Prerequisites

- GitHub account
- Credit card (for Supabase and Bland AI - free tiers available)
- Phone to test calls

---

## 5-Step Quick Setup

### Step 1: Create Supabase Project (5 min)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it `repair-shop-ai`
3. Set a strong database password (save it!)
4. Wait for project to initialize (2-3 min)

### Step 2: Run Database Setup (2 min)

1. In Supabase dashboard: **SQL Editor** → **New Query**
2. Copy everything from `supabase/schema.sql` in this repo
3. Paste and click **Run**
4. Verify tables created: **Table Editor** → see `leads`, `voice_calls`, `communications`

### Step 3: Deploy Webhook Function (5 min)

Install Supabase CLI:
```bash
# macOS
brew install supabase/tap/supabase

# Windows (Scoop)
scoop install supabase
```

Deploy function:
```bash
cd repair-shop-ai-mvp
supabase login
supabase link --project-ref YOUR_PROJECT_ID
supabase functions deploy bland-webhook
```

Set secrets:
```bash
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Save your function URL** - you'll need it for Bland AI!

### Step 4: Configure Frontend (3 min)

Edit `js/supabase-config.js`:
```javascript
const SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_ANON_KEY',
};
```

Get these values from Supabase dashboard: **Settings** → **API**

### Step 5: Set Up Bland AI (10 min)

1. Sign up at [app.bland.ai](https://app.bland.ai)
2. Create new **Inbound Agent**
3. Copy the agent prompt from `docs/BLAND_AI_SETUP.md`
4. Configure data extraction variables:
   - customer_name
   - phone_number
   - vehicle_year, vehicle_make, vehicle_model
   - service_needed
   - urgency
5. Add webhook:
   - URL: `https://YOUR_PROJECT.supabase.co/functions/v1/bland-webhook`
   - Event: `call.completed`

---

## Test Your Setup

### Test 1: Database Connection

1. Open `dashboard.html` in browser
2. Press F12 to open console
3. Look for: `✓ Supabase client initialized successfully`
4. Click "New Lead" and create a test lead
5. Check Supabase dashboard → `leads` table

✅ If lead appears in database, frontend is connected!

### Test 2: Voice Call

1. Get your Bland AI phone number
2. Call it from your phone
3. Talk to the AI agent:
   - Give your name
   - Say: "2020 Honda Civic"
   - Say: "I need an oil change"
   - Say: "It's standard priority"
4. After call ends, refresh dashboard
5. Check "Missed Calls" button

✅ If call appears, integration is working!

### Test 3: Create Lead from Call

1. Click "Missed Calls" in dashboard
2. Find your test call
3. Click "Create Lead"
4. Check "Leads" tab

✅ If lead appears with "Voice AI" badge, you're all set!

---

## What's Next?

### Refine Your AI Agent

Review call transcripts and improve your prompt:
- Make questions clearer
- Add handling for common issues
- Adjust tone and pacing

### Deploy to Production

1. Push code to GitHub
2. Enable GitHub Pages
3. Update Bland AI with production URL
4. Add your custom phone number

### Monitor Performance

- Check Bland AI dashboard for call analytics
- Review Supabase logs for any errors
- Track conversion rate in your dashboard

---

## Troubleshooting

**Problem: "Supabase not available"**
- Check `js/supabase-config.js` has correct credentials
- Clear browser cache
- Check browser console for errors

**Problem: Calls not appearing**
- Verify webhook URL in Bland AI
- Check Supabase Edge Function logs
- Test webhook with curl (see deployment guide)

**Problem: Real-time not working**
- Enable replication in Supabase: Database → Replication
- Check subscription in browser console

---

## Full Documentation

- **Complete Deployment Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Bland AI Setup**: [BLAND_AI_SETUP.md](./BLAND_AI_SETUP.md)
- **Architecture Details**: [README.md](../README.md)

---

## Need Help?

- Open an issue on GitHub
- Check Bland AI docs: [docs.bland.ai](https://docs.bland.ai)
- Check Supabase docs: [supabase.com/docs](https://supabase.com/docs)

---

**That's it!** You now have a working AI voice agent for your repair shop! 🎉

Total cost: **~$0-5/month** for testing, **~$50-100/month** for production

