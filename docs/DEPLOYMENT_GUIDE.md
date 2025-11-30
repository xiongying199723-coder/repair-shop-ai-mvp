# Deployment Guide - Repair Shop AI MVP with Bland AI

Complete step-by-step guide to deploy your Repair Shop AI application with Bland AI voice integration.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Part 1: Supabase Setup](#part-1-supabase-setup)
4. [Part 2: Deploy Edge Functions](#part-2-deploy-edge-functions)
5. [Part 3: Configure Frontend](#part-3-configure-frontend)
6. [Part 4: Deploy to GitHub Pages](#part-4-deploy-to-github-pages)
7. [Part 5: Connect Bland AI](#part-5-connect-bland-ai)
8. [Verification & Testing](#verification--testing)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────┐
│   Customer      │
│   Calls In      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Bland AI      │◄──── Voice Agent (AI-powered)
│   Voice Agent   │
└────────┬────────┘
         │
         │ Webhook (POST)
         ▼
┌─────────────────┐
│   Supabase      │
│   Edge Function │◄──── Processes call data
└────────┬────────┘
         │
         │ Insert
         ▼
┌─────────────────┐
│   Supabase      │
│   PostgreSQL DB │◄──── Stores leads & calls
└────────┬────────┘
         │
         │ Real-time
         ▼
┌─────────────────┐
│   Frontend      │
│   (GitHub Pages)│◄──── Dashboard displays data
└─────────────────┘
```

---

## Prerequisites

Before starting, make sure you have:

- ✅ **GitHub Account** (for hosting)
- ✅ **Node.js** v18+ installed (for local testing)
- ✅ **Git** installed
- ✅ **A code editor** (VS Code recommended)
- ✅ **Credit card** for Supabase (free tier available) and Bland AI

---

## Part 1: Supabase Setup

### Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

### Step 2: Create a New Project

1. Click **"New Project"**
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `repair-shop-ai-mvp`
   - **Database Password**: Generate a strong password (save it somewhere safe!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is fine to start
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

### Step 3: Get Your Project Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy these values (you'll need them later):
   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbG...
   service_role key: eyJhbG... (keep this secret!)
   ```

### Step 4: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire content from `supabase/schema.sql` in your repo
4. Paste it into the SQL editor
5. Click **"Run"** (bottom right)
6. You should see: "Success. No rows returned"

### Step 5: Verify Database Tables

1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ `leads`
   - ✅ `voice_calls`
   - ✅ `communications`
3. Click on each table to verify the columns match the schema

---

## Part 2: Deploy Edge Functions

Edge Functions are serverless functions that run on Supabase's infrastructure. We'll use one to receive webhooks from Bland AI.

### Step 1: Install Supabase CLI

**On macOS (using Homebrew):**
```bash
brew install supabase/tap/supabase
```

**On Windows (using Scoop):**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**On Linux:**
```bash
brew install supabase/tap/supabase
```

**Verify installation:**
```bash
supabase --version
```

### Step 2: Login to Supabase CLI

```bash
supabase login
```

This will open a browser window. Login with the same account you used to create your project.

### Step 3: Link Your Project

In your project directory:

```bash
cd /path/to/repair-shop-ai-mvp
supabase link --project-ref YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with your project reference ID from Supabase dashboard (Settings → General).

When prompted for the database password, enter the password you created in Step 2.

### Step 4: Deploy the Edge Function

```bash
supabase functions deploy bland-webhook
```

You should see:
```
Deploying function bland-webhook...
Function deployed successfully!
URL: https://YOUR_PROJECT.supabase.co/functions/v1/bland-webhook
```

**Important:** Save this URL - you'll need it for Bland AI setup!

### Step 5: Set Environment Variables

The Edge Function needs access to your Supabase credentials:

```bash
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Replace the values with your actual credentials from Part 1, Step 3.

### Step 6: Test the Edge Function

Test with a simple POST request:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/bland-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "test-123",
    "to": "+15551234567",
    "status": "completed",
    "duration": 120,
    "transcript": [
      {"speaker": "AI", "text": "Hello!"},
      {"speaker": "user", "text": "Hi there!"}
    ],
    "variables": {
      "customer_name": "Test Customer",
      "vehicle_make": "Honda",
      "vehicle_model": "Civic",
      "vehicle_year": "2020",
      "service_needed": "Oil change",
      "urgency": "standard"
    }
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "voice_call_id": "..."
}
```

### Step 7: Check Function Logs

1. Go to Supabase dashboard → **Edge Functions**
2. Click on `bland-webhook`
3. Go to **Logs** tab
4. You should see your test request logged
5. Verify there are no errors

---

## Part 3: Configure Frontend

### Step 1: Update Supabase Config

Open `js/supabase-config.js` in your editor:

```javascript
const SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT.supabase.co',  // ← Update this
  anonKey: 'YOUR_ANON_KEY',                  // ← Update this
};
```

Replace with your actual values from Part 1, Step 3.

**Important:** Only use the `anon` key here, NOT the `service_role` key!

### Step 2: Test Locally

1. Install a local server (if you don't have one):
   ```bash
   npm install -g http-server
   ```

2. Start the server:
   ```bash
   http-server -p 8000
   ```

3. Open your browser to `http://localhost:8000/dashboard.html`

4. Open browser console (F12) and check for:
   ```
   ✓ Supabase client initialized successfully
   Running in development mode with Supabase
   ✓ Leads loaded from Supabase: 0
   ✓ Voice calls loaded from Supabase: 0
   ✓ Real-time subscriptions active
   ```

### Step 3: Test Database Connection

1. In your dashboard, click **"New Lead"**
2. Fill in the form and submit
3. Check Supabase dashboard → **Table Editor** → `leads`
4. You should see your new lead!

If the lead appears in Supabase, your frontend is properly connected! 🎉

---

## Part 4: Deploy to GitHub Pages

### Step 1: Commit Your Changes

```bash
git add .
git commit -m "Add Bland AI integration with Supabase backend"
```

### Step 2: Push to GitHub

```bash
git push origin main
```

Or if you're on the feature branch:
```bash
git push origin claude/add-bland-ai-voice-01LfpxzcvzACC8J3CknSKM5p
```

### Step 3: Merge to Main Branch (if on feature branch)

1. Go to your GitHub repository
2. Click **"Pull Requests"**
3. Click **"New Pull Request"**
4. Select your branch → `main`
5. Click **"Create Pull Request"**
6. Click **"Merge Pull Request"**

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
4. Click **"Save"**
5. Wait 1-2 minutes for deployment

### Step 5: Access Your Live Site

Your site will be available at:
```
https://YOUR_USERNAME.github.io/repair-shop-ai-mvp/
```

For your dashboard:
```
https://YOUR_USERNAME.github.io/repair-shop-ai-mvp/dashboard.html
```

---

## Part 5: Connect Bland AI

### Step 1: Create Bland AI Account

Follow the detailed guide in [BLAND_AI_SETUP.md](./BLAND_AI_SETUP.md).

Quick steps:
1. Sign up at [https://app.bland.ai](https://app.bland.ai)
2. Create a new inbound agent
3. Configure the agent prompt (see guide)
4. Set up data extraction variables

### Step 2: Configure Webhook

In Bland AI agent settings:

1. Find **Webhooks** section
2. Add webhook URL:
   ```
   https://YOUR_PROJECT.supabase.co/functions/v1/bland-webhook
   ```
3. Select event: `call.completed` or `call.ended`
4. Save

### Step 3: Test End-to-End

1. Get your Bland AI phone number
2. Call the number
3. Have a conversation with the AI agent
4. After the call ends, check:
   - ✅ Bland AI dashboard shows the call
   - ✅ Supabase `voice_calls` table has new record
   - ✅ Your dashboard shows new call in "Missed Calls"

---

## Verification & Testing

### Checklist: Database Layer

- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] Tables created: `leads`, `voice_calls`, `communications`
- [ ] Test data can be inserted manually

### Checklist: Edge Function

- [ ] Edge function deployed successfully
- [ ] Function logs show no errors
- [ ] Test POST request returns success
- [ ] Environment variables set correctly

### Checklist: Frontend

- [ ] Supabase config updated with correct credentials
- [ ] Local testing shows Supabase connection working
- [ ] Can create leads from dashboard
- [ ] Real-time updates working
- [ ] Deployed to GitHub Pages successfully

### Checklist: Bland AI Integration

- [ ] Bland AI account created
- [ ] Voice agent configured
- [ ] Agent prompt tested
- [ ] Webhook URL configured
- [ ] Test call completed successfully
- [ ] Call data appears in dashboard

### Checklist: End-to-End Flow

- [ ] Customer calls Bland AI number
- [ ] AI agent collects all required information
- [ ] Webhook fires when call ends
- [ ] Data stored in Supabase
- [ ] Dashboard shows new call in real-time
- [ ] Can create lead from call
- [ ] Lead has correct "Voice AI" source badge
- [ ] Call recording plays (if available)

---

## Troubleshooting

### Issue: "Supabase client not initialized"

**Cause:** Config not set or invalid credentials

**Fix:**
1. Check `js/supabase-config.js` has correct URL and key
2. Verify you're using `anon` key, not `service_role` key
3. Clear browser cache and reload
4. Check browser console for detailed error

### Issue: Edge Function returns 500 error

**Cause:** Missing environment variables or code error

**Fix:**
1. Check function logs in Supabase dashboard
2. Verify environment variables are set:
   ```bash
   supabase secrets list
   ```
3. Re-deploy function:
   ```bash
   supabase functions deploy bland-webhook
   ```

### Issue: No real-time updates

**Cause:** Real-time not enabled or subscription failed

**Fix:**
1. In Supabase dashboard, go to **Database** → **Replication**
2. Enable replication for `leads` and `voice_calls` tables
3. Check browser console for subscription errors
4. Verify Supabase anon key has correct permissions

### Issue: CORS errors in browser

**Cause:** Supabase CORS settings or wrong origin

**Fix:**
1. Check Supabase dashboard → **Authentication** → **URL Configuration**
2. Add your GitHub Pages URL to allowed origins:
   ```
   https://YOUR_USERNAME.github.io
   ```
3. Add localhost for testing:
   ```
   http://localhost:8000
   ```

### Issue: Calls not appearing in dashboard

**Cause:** Webhook not firing or data not saving

**Fix:**
1. Check Bland AI webhook logs for delivery status
2. Check Supabase Edge Function logs for incoming requests
3. Verify webhook URL is correct in Bland AI
4. Test webhook with curl command from Part 2, Step 6
5. Check Supabase `voice_calls` table directly

### Issue: Call recordings not playing

**Cause:** Invalid URL or CORS issue

**Fix:**
1. Check if `recording_url` is present in `voice_calls` table
2. Try opening recording URL directly in browser
3. Verify Bland AI has recordings enabled
4. Check browser console for CORS errors

---

## Production Checklist

Before going live with real customers:

- [ ] Database backups enabled (Supabase → Settings → Database)
- [ ] Row Level Security (RLS) policies configured
- [ ] Webhook authentication/secret added (optional but recommended)
- [ ] Rate limiting configured on Edge Function
- [ ] Error monitoring set up (e.g., Sentry)
- [ ] Analytics tracking added (e.g., Google Analytics)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate verified
- [ ] Privacy policy and terms of service added
- [ ] GDPR/CCPA compliance verified for call recordings
- [ ] Team training completed
- [ ] Customer support process defined

---

## Cost Breakdown

### Supabase (Free Tier)
- **Database**: Up to 500MB (enough for thousands of leads)
- **Edge Functions**: 500K invocations/month
- **Real-time**: Unlimited connections
- **Bandwidth**: 5GB/month
- **Cost**: **$0/month**

**Upgrade needed when:**
- Database > 500MB → $25/month (Pro plan)
- Edge Functions > 500K/month → $25/month
- Need more bandwidth → $25/month

### Bland AI (Pay-as-you-go)
- **Phone Number**: ~$2-5/month
- **Inbound Calls**: ~$0.05-0.15/minute
- **Storage**: Usually included

**Example monthly cost for 100 calls (5 min avg):**
- 100 calls × 5 min × $0.10 = $50/month
- Phone number = $2/month
- **Total: ~$52/month**

### GitHub Pages
- **Free for public repositories**
- Unlimited bandwidth for reasonable use

### Total Estimated Cost
- **Starting**: $0/month (Supabase free + Bland AI credits)
- **Light usage (100 calls/month)**: ~$52/month
- **Medium usage (500 calls/month)**: ~$250/month

---

## Next Steps

After successful deployment:

1. **Monitor Performance**
   - Check Supabase dashboard daily for issues
   - Review Bland AI call logs for quality
   - Monitor costs and usage

2. **Gather Feedback**
   - Ask team members to test the system
   - Collect customer feedback on the voice agent
   - Track conversion rates (calls → leads → customers)

3. **Iterate & Improve**
   - Refine Bland AI agent prompt based on transcripts
   - Optimize Edge Function for faster processing
   - Add new features to dashboard as needed

4. **Scale**
   - Upgrade Supabase plan if needed
   - Add more phone numbers for high volume
   - Implement caching for better performance

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Bland AI Docs**: https://docs.bland.ai
- **GitHub Issues**: [Your repo]/issues
- **Community Support**: [Your repo]/discussions

---

## Appendix: Environment Variables Reference

### Supabase Edge Function
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### Frontend (js/supabase-config.js)
```javascript
url: 'https://xxxxx.supabase.co'
anonKey: 'eyJhbG...'
```

### Bland AI Webhook
```
URL: https://xxxxx.supabase.co/functions/v1/bland-webhook
Events: call.completed
```

---

**Congratulations!** 🎉 Your Repair Shop AI MVP with Bland AI voice integration is now live!

