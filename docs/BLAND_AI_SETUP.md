# Bland AI Voice Agent Setup Guide

This guide will help you configure Bland AI to work with your Repair Shop AI MVP application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create Bland AI Account](#create-bland-ai-account)
3. [Configure Voice Agent](#configure-voice-agent)
4. [Set Up Webhook Integration](#set-up-webhook-integration)
5. [Test Your Setup](#test-your-setup)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you start, make sure you have:

- ✅ Deployed Supabase database (see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md))
- ✅ Supabase Edge Function deployed for webhook endpoint
- ✅ Your Supabase webhook URL ready
- ✅ A phone number to use for the voice agent (provided by Bland AI)

---

## Create Bland AI Account

### Step 1: Sign Up

1. Go to [https://app.bland.ai](https://app.bland.ai)
2. Click "Sign Up" and create your account
3. Verify your email address
4. Complete the onboarding process

### Step 2: Get Your API Key

1. Navigate to **Settings** → **API Keys**
2. Copy your API key (you'll need this for advanced integrations)
3. Keep this key secure and never commit it to GitHub

---

## Configure Voice Agent

### Step 1: Create a New Agent

1. In the Bland AI dashboard, click **"Create Agent"** or **"New Phone Agent"**
2. Choose **"Inbound Agent"** (to receive calls)
3. Give your agent a name: `"Repair Shop Voice Assistant"`

### Step 2: Configure Voice Settings

**Voice Selection:**
- **Voice**: Choose a friendly, professional voice (recommended: `nova` or `alloy`)
- **Language**: English (US)
- **Speed**: 1.0 (normal)
- **Tone**: Professional and helpful

### Step 3: Write the Agent Prompt

Copy and paste this prompt into the **Agent Instructions** field:

```
You are a professional voice assistant for Conneverse Auto Repair Shop. Your job is to help customers who call in about their vehicle service needs.

GREETING:
"Thank you for calling Conneverse Auto Repair! I'm here to help you with your vehicle service needs. May I have your name please?"

YOUR OBJECTIVES:
1. Greet the customer warmly
2. Collect the following information:
   - Customer name
   - Phone number (confirm the number they're calling from)
   - Vehicle year, make, and model
   - The service or issue they need help with
   - How urgent the service is (urgent, standard, or flexible)

CONVERSATION FLOW:
1. Start with the greeting
2. Ask for their name
3. Confirm their callback number
4. Ask about their vehicle: "What vehicle do you need service for? Please tell me the year, make, and model."
5. Ask about the issue: "What seems to be the problem with your vehicle, or what service do you need?"
6. Ask about urgency: "How soon do you need this taken care of? Is this urgent, or is the timing flexible?"
7. Summarize what you collected and thank them

TONE & STYLE:
- Be warm, friendly, and professional
- Speak clearly and at a moderate pace
- Show empathy if they describe a problem
- Don't use technical jargon
- Keep responses concise (1-2 sentences)

IMPORTANT RULES:
- Never give quotes or estimates over the phone
- Never diagnose issues - just collect information
- If asked about pricing, say: "Our team will review your case and provide you with a detailed quote shortly."
- If asked about appointment times, say: "Once we review your information, our team will reach out to schedule the best time for you."

CLOSING:
"Thank you [Name]! We have all your information. Our team will review your [vehicle year/make/model] [issue] and get back to you shortly with a quote. Is there anything else you'd like to add before we go?"

Then say: "Perfect! We'll be in touch soon. Thank you for calling Conneverse Auto Repair. Have a great day!"

VARIABLES TO EXTRACT:
- customer_name: The customer's full name
- phone_number: Their phone number (confirm the one they called from)
- vehicle_year: The year of their vehicle
- vehicle_make: The make/brand (e.g., Honda, Toyota)
- vehicle_model: The model (e.g., Civic, Camry)
- service_needed: Description of the issue or service they need
- urgency: How urgent (urgent/standard/flexible)
- notes: Any additional context or details
```

### Step 4: Configure Data Collection

In the **Variables** or **Data Extraction** section, set up these fields:

| Variable Name | Type | Required | Example |
|---------------|------|----------|---------|
| `customer_name` | Text | Yes | "John Smith" |
| `phone_number` | Phone | Yes | "+15551234567" |
| `vehicle_year` | Number | Yes | "2018" |
| `vehicle_make` | Text | Yes | "Honda" |
| `vehicle_model` | Text | Yes | "Civic" |
| `service_needed` | Text | Yes | "Brake pads replacement" |
| `urgency` | Select | No | urgent/standard/flexible |
| `notes` | Text | No | "Customer mentioned squeaking noise" |

### Step 5: Set Call Duration & Behavior

- **Max Duration**: 5 minutes
- **Interruption Handling**: Allow customer to interrupt
- **Background Noise**: Filter enabled
- **End Call Detection**: Automatic after silence

---

## Set Up Webhook Integration

### Step 1: Get Your Webhook URL

Your Supabase webhook URL should be:

```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/bland-webhook
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.

### Step 2: Configure Webhook in Bland AI

1. In your agent settings, find **Webhooks** or **Integrations**
2. Click **"Add Webhook"** or **"Configure Webhook"**
3. Enter your webhook URL from Step 1
4. Select these events to send:
   - ✅ `call.ended` or `call.completed`
   - ✅ `call.transcribed` (if available)

### Step 3: Set Webhook Headers (Optional but Recommended)

For security, you can add a secret header:

- **Header Name**: `X-Webhook-Secret`
- **Header Value**: `your-random-secret-key-here` (generate a strong random string)

**Note:** If you add this header, you'll need to update your Supabase Edge Function to verify it.

### Step 4: Test Webhook Connection

1. In Bland AI, use the **"Test Webhook"** button if available
2. Check your Supabase Function Logs to see if the test was received
3. Look for a 200 OK response

---

## Test Your Setup

### Method 1: Test Call via Bland AI Dashboard

1. In Bland AI dashboard, find your agent
2. Click **"Test Call"** or **"Make Test Call"**
3. Call the test number provided
4. Go through the conversation as a customer:
   - Provide a name: "Test Customer"
   - Vehicle: "2020 Honda Civic"
   - Issue: "Need oil change"
   - Urgency: "Standard"
5. After the call ends, check:
   - ✅ Bland AI shows the call in call logs
   - ✅ Supabase `voice_calls` table has a new record
   - ✅ Your dashboard shows the new call in "Missed Calls"

### Method 2: Make a Real Test Call

1. Get your Bland AI phone number from the dashboard
2. Call the number from your phone
3. Have a natural conversation with the agent
4. Verify the data appears in your dashboard

### Verification Checklist

After your test call:

- [ ] Call appears in Bland AI call logs
- [ ] Transcript is captured correctly
- [ ] All variables were extracted (name, vehicle, issue, etc.)
- [ ] Webhook was triggered and received by Supabase
- [ ] New record in Supabase `voice_calls` table
- [ ] Call appears in your dashboard's "Missed Calls" section
- [ ] Audio recording is available (if enabled)
- [ ] You can create a lead from the call

---

## Advanced Configuration

### Custom Phone Number

Bland AI can provide you with a custom phone number:

1. Go to **Phone Numbers** in Bland AI dashboard
2. Click **"Buy Number"** or **"Port Number"**
3. Choose your area code or port your existing number
4. Assign the number to your agent

**Cost:** ~$1-5/month for a phone number

### Call Recording

To enable call recordings:

1. In agent settings, find **Recording** options
2. Enable **"Record All Calls"**
3. Set retention period (e.g., 30 days)
4. Recordings will be available in the webhook payload as `recording_url`

### Business Hours

Set up business hours to control when the agent answers:

1. Go to **Agent Settings** → **Availability**
2. Set your business hours (e.g., Mon-Fri 9am-6pm)
3. Configure after-hours message:
   - "Thank you for calling Conneverse. We're currently closed. Please leave your information and we'll call you back during business hours."

### Call Forwarding

If the agent can't help, forward to a human:

1. In agent settings, find **Fallback** or **Transfer**
2. Add your shop's phone number
3. Set conditions for transfer (e.g., customer explicitly asks for human)

---

## Monitoring & Analytics

### Bland AI Dashboard

Monitor your calls in the Bland AI dashboard:

- **Call Volume**: See how many calls you're receiving
- **Call Duration**: Average call length
- **Success Rate**: Percentage of calls that collected all data
- **Transcripts**: Review conversations for quality
- **Costs**: Monitor usage and spending

### Your Dashboard

In your Repair Shop dashboard:

- Check **Missed Calls** badge for new calls
- Review call transcripts and AI summaries
- Create leads directly from calls
- Track conversion rate (calls → leads → quotes)

---

## Troubleshooting

### Issue: Webhook not receiving data

**Possible causes:**
1. Webhook URL is incorrect
2. Supabase Edge Function not deployed
3. Bland AI webhook events not configured

**Solutions:**
- Verify your webhook URL in both Bland AI and Supabase
- Check Supabase Function Logs for errors
- Re-deploy the Edge Function: `supabase functions deploy bland-webhook`
- Test with a simple curl command:
  ```bash
  curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/bland-webhook \
    -H "Content-Type: application/json" \
    -d '{"call_id": "test", "status": "completed"}'
  ```

### Issue: Missing data in dashboard

**Possible causes:**
1. Variables not extracted by AI
2. Data mapping error in webhook function
3. Supabase connection issue

**Solutions:**
- Check Bland AI call logs for extracted variables
- Review Supabase Function Logs for the specific call
- Verify database schema matches webhook data
- Check browser console for JavaScript errors

### Issue: Agent doesn't understand customers

**Possible causes:**
1. Background noise
2. Accent or speech pattern
3. Agent prompt needs refinement

**Solutions:**
- Enable noise filtering in Bland AI settings
- Review transcripts to see what the AI heard
- Refine your agent prompt based on common misunderstandings
- Adjust conversation flow to be more explicit

### Issue: Call recordings not available

**Possible causes:**
1. Recording not enabled in Bland AI
2. Recording URL not in webhook payload
3. CORS issue accessing audio file

**Solutions:**
- Enable call recording in agent settings
- Check webhook payload for `recording_url` field
- Verify audio URL is publicly accessible
- Add CORS headers if hosting recordings on custom domain

### Issue: High latency or delayed responses

**Possible causes:**
1. Network issues
2. Supabase Edge Function cold start
3. Bland AI server location

**Solutions:**
- Check your internet connection
- Increase Edge Function minimum instances (paid feature)
- Contact Bland AI support about server regions
- Optimize webhook function code

---

## Best Practices

### Prompt Engineering

1. **Keep it concise**: Long prompts can confuse the AI
2. **Use examples**: Show the AI what good responses look like
3. **Test variations**: Try different phrasings to see what works best
4. **Update regularly**: Refine based on real call transcripts

### Data Quality

1. **Validate data**: Check that extracted info is accurate
2. **Follow up**: Call customers back if critical info is missing
3. **Review transcripts**: Regularly check conversations for improvements
4. **A/B test prompts**: Test different agent prompts to improve data collection

### Cost Management

1. **Monitor usage**: Keep an eye on call volume and costs
2. **Set limits**: Configure max call duration to control costs
3. **Business hours**: Use availability settings to reduce after-hours spam calls
4. **Optimize prompts**: Shorter, more efficient conversations cost less

### Security

1. **Webhook secrets**: Use authentication headers for webhooks
2. **Rate limiting**: Protect your webhook endpoint from abuse
3. **Data privacy**: Follow regulations (GDPR, CCPA) for call recordings
4. **Access control**: Limit who can access call recordings and transcripts

---

## Support & Resources

### Bland AI Resources

- **Documentation**: [https://docs.bland.ai](https://docs.bland.ai)
- **Community**: [https://community.bland.ai](https://community.bland.ai)
- **Support**: support@bland.ai
- **Status Page**: [https://status.bland.ai](https://status.bland.ai)

### Supabase Resources

- **Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
- **Community**: [https://github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- **Support**: [https://supabase.com/support](https://supabase.com/support)

### Your Application

- **GitHub Repo**: [Your Repo URL]
- **Issues**: [Your Repo Issues URL]

---

## Next Steps

Once your Bland AI integration is working:

1. ✅ Test thoroughly with multiple test calls
2. ✅ Refine your agent prompt based on results
3. ✅ Set up monitoring and alerts
4. ✅ Train your team on the new system
5. ✅ Gradually roll out to real customers
6. ✅ Collect feedback and iterate

---

**Need help?** Open an issue on GitHub or reach out to Bland AI support!

