// =====================================================
// BLAND AI WEBHOOK ENDPOINT
// Supabase Edge Function to receive Bland AI call data
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// CORS headers for allowing requests from any origin
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Extract customer information from Bland AI transcript
 */
function extractCustomerInfo(transcript: any[], variables: any) {
  // Bland AI sends extracted variables in the 'variables' field
  // Fallback to parsing transcript if needed

  return {
    customerName: variables?.customer_name || variables?.name || "Unknown Customer",
    phone: variables?.phone || variables?.phone_number || "",
    vehicleYear: variables?.vehicle_year || variables?.year || "",
    vehicleMake: variables?.vehicle_make || variables?.make || "",
    vehicleModel: variables?.vehicle_model || variables?.model || "",
    serviceNeeded: variables?.service_needed || variables?.issue || "",
    urgency: determineUrgency(variables?.urgency || variables?.priority || transcript),
    notes: variables?.notes || generateNotesFromTranscript(transcript),
  };
}

/**
 * Determine urgency level from variables or transcript
 */
function determineUrgency(urgencyData: any): string {
  if (typeof urgencyData === 'string') {
    const lower = urgencyData.toLowerCase();
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('emergency')) {
      return 'urgent';
    }
    if (lower.includes('flexible') || lower.includes('whenever') || lower.includes('no rush')) {
      return 'flexible';
    }
  }
  return 'standard';
}

/**
 * Generate notes from transcript
 */
function generateNotesFromTranscript(transcript: any[]): string {
  if (!Array.isArray(transcript) || transcript.length === 0) {
    return "No transcript available";
  }

  // Summarize key customer statements
  const customerStatements = transcript
    .filter((entry) => entry.speaker === "user" || entry.speaker === "customer")
    .map((entry) => entry.text)
    .join(" ");

  return customerStatements.substring(0, 500) || "Call completed";
}

/**
 * Format transcript for storage
 */
function formatTranscript(transcript: any[]): any[] {
  if (!Array.isArray(transcript)) return [];

  return transcript.map((entry) => ({
    speaker: entry.speaker === "user" ? "Customer" : "AI",
    text: entry.text || entry.message || "",
    timestamp: entry.timestamp || null,
  }));
}

// =====================================================
// MAIN HANDLER
// =====================================================

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const webhookData = await req.json();

    console.log("Received Bland AI webhook:", JSON.stringify(webhookData, null, 2));

    // Extract data from Bland AI webhook payload
    // Bland AI webhook structure (adjust based on actual payload):
    // {
    //   call_id: "string",
    //   to: "phone_number",
    //   from: "phone_number",
    //   status: "completed",
    //   duration: 123,
    //   recording_url: "https://...",
    //   transcript: [...],
    //   variables: { ... extracted data ... },
    //   created_at: "timestamp",
    //   ended_at: "timestamp"
    // }

    const {
      call_id,
      to,
      from,
      status: callStatus,
      duration,
      recording_url,
      transcript,
      variables,
      created_at,
      ended_at,
    } = webhookData;

    // Extract customer information
    const customerInfo = extractCustomerInfo(transcript || [], variables || {});

    // Store voice call in database
    const { data: voiceCall, error: voiceCallError } = await supabase
      .from("voice_calls")
      .insert({
        bland_call_id: call_id,
        phone_number: to || from || "",
        duration: duration || 0,
        status: "new",
        customer_name: customerInfo.customerName,
        vehicle_year: customerInfo.vehicleYear,
        vehicle_make: customerInfo.vehicleMake,
        vehicle_model: customerInfo.vehicleModel,
        service_needed: customerInfo.serviceNeeded,
        urgency: customerInfo.urgency,
        ai_notes: customerInfo.notes,
        recording_url: recording_url || null,
        transcript: formatTranscript(transcript || []),
        call_started_at: created_at || new Date().toISOString(),
        call_ended_at: ended_at || new Date().toISOString(),
        raw_webhook_data: webhookData,
      })
      .select()
      .single();

    if (voiceCallError) {
      console.error("Error inserting voice call:", voiceCallError);
      throw voiceCallError;
    }

    console.log("Voice call stored successfully:", voiceCall.id);

    // Auto-create lead if we have minimum required information
    const shouldAutoCreateLead =
      customerInfo.customerName &&
      customerInfo.customerName !== "Unknown Customer" &&
      (customerInfo.vehicleMake || customerInfo.serviceNeeded);

    if (shouldAutoCreateLead) {
      console.log("Auto-creating lead from voice call...");

      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert({
          customer_name: customerInfo.customerName,
          phone: to || from || "",
          car_make: customerInfo.vehicleMake,
          car_model: customerInfo.vehicleModel,
          car_year: customerInfo.vehicleYear,
          issue: customerInfo.serviceNeeded,
          source: "Voice AI",
          status: "New",
          notes: customerInfo.notes,
        })
        .select()
        .single();

      if (leadError) {
        console.error("Error creating lead:", leadError);
      } else {
        console.log("Lead created successfully:", lead.id);

        // Update voice call with lead reference
        await supabase
          .from("voice_calls")
          .update({
            lead_id: lead.id,
            status: "converted",
          })
          .eq("id", voiceCall.id);

        // Add communication record
        await supabase.from("communications").insert({
          lead_id: lead.id,
          sender: "ai",
          sender_name: "Voice AI Agent",
          message: `Initial contact via voice call. Duration: ${duration || 0} seconds. Urgency: ${customerInfo.urgency}`,
          type: "voice_call",
          metadata: {
            call_id: voiceCall.id,
            urgency: customerInfo.urgency,
            recording_url: recording_url || null,
          },
        });

        console.log("Communication record added");
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook processed successfully",
        voice_call_id: voiceCall.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

/* =====================================================
 * DEPLOYMENT NOTES:
 * =====================================================
 *
 * 1. Deploy this function using Supabase CLI:
 *    supabase functions deploy bland-webhook
 *
 * 2. Get the function URL:
 *    https://YOUR_PROJECT.supabase.co/functions/v1/bland-webhook
 *
 * 3. Configure this URL in Bland AI:
 *    - Go to your Bland AI agent settings
 *    - Add webhook URL in "Post-Call Webhook" section
 *    - Select events: "call.completed"
 *
 * 4. Test webhook:
 *    curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/bland-webhook \
 *      -H "Content-Type: application/json" \
 *      -d @test-payload.json
 *
 * ===================================================== */
