// Supabase Edge Function: send-push
// Sends web push notification to Moez or Eliza's devices using standard Web Push API
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import webpush from "https://esm.sh/web-push@3.6.7";

interface PushPayload {
  couple_id: string;
  recipient_name: "Moez" | "Eliza";
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:hello@us.app";

    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    }

    const { couple_id, recipient_name, title, body, url, tag }: PushPayload = await req.json();

    // Query recipient member user_id
    const { data: member, error: memberErr } = await supabaseClient
      .from("members")
      .select("user_id")
      .eq("couple_id", couple_id)
      .eq("name", recipient_name)
      .single();

    if (memberErr || !member) {
      return new Response(JSON.stringify({ error: "Recipient not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Retrieve active push subscriptions for that user
    const { data: subscriptions, error: subErr } = await supabaseClient
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", member.user_id);

    if (subErr || !subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: "No active push subscriptions registered" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = JSON.stringify({
      title: title || "Us.",
      body: body || "A new moment from your love.",
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      data: { url: url || "/" },
      tag: tag || "us-notification",
    });

    const sendPromises = subscriptions.map((sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };
      return webpush.sendNotification(pushSubscription, payload).catch((err: any) => {
        console.error("Failed sending notification to endpoint:", sub.endpoint, err);
      });
    });

    await Promise.all(sendPromises);

    return new Response(JSON.stringify({ success: true, count: subscriptions.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
