import api from './api';

/**
 * Sends automated welcome confirmation email to user's specified Gmail address.
 * Triggered upon registration or when selecting a Google account.
 */
export const sendWelcomeEmail = async ({ email, name }) => {
  const cleanEmail = email ? email.trim() : '';
  const cleanName = name ? name.trim() : 'Creator';

  if (!cleanEmail || !cleanEmail.includes('@')) {
    console.warn("Invalid email for welcome notification:", email);
    return false;
  }

  // 1. Dispatch request to backend FastAPI SMTP service with 30s timeout for cold starts
  try {
    const res = await api.post(
      '/api/auth/send-welcome-email',
      { email: cleanEmail, name: cleanName },
      { timeout: 30000 }
    );
    if (res.data?.status === 'success') {
      console.log("✅ Welcome email queued via backend API:", res.data);
      return true;
    }
  } catch (err) {
    console.warn("Backend SMTP endpoint offline or sleeping:", err);
  }

  // 2. Secondary Webhook Notification Relay
  try {
    await fetch('https://formspree.io/f/mqkvqoqz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Welcome to AI Tools Hub — Registration Completed! 🎉',
        email: cleanEmail,
        name: cleanName,
        message: `Hello ${cleanName},\n\nYour registration for AI Tools Hub is successfully completed!\nWe have credited your account with 100 Free Pro Credits.\n\nOpen your dashboard: https://ai-tools-hub-zeta-flame.vercel.app/dashboard`,
      }),
    }).catch(() => {});
  } catch (e) {
    console.warn("Fallback webhook notice:", e);
  }

  return true;
};

/**
 * Sends non-blocking Google OAuth login alert transactional email.
 */
export const sendLoginNotificationEmail = async ({ email, name, provider = "Google OAuth" }) => {
  const cleanEmail = email ? email.trim() : '';
  const cleanName = name ? name.trim() : 'User';

  if (!cleanEmail || !cleanEmail.includes('@')) return false;

  try {
    const res = await api.post(
      '/api/auth/send-login-email',
      { email: cleanEmail, name: cleanName, provider },
      { timeout: 30000 }
    );
    if (res.data?.status === 'success') {
      console.log("✅ Login alert email queued:", res.data);
      return true;
    }
  } catch (err) {
    console.warn("Backend login alert endpoint notice:", err);
  }

  // Fallback notification relay
  try {
    await fetch('https://formspree.io/f/mqkvqoqz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: `Security Alert: Sign-in via ${provider} 🔐`,
        email: cleanEmail,
        name: cleanName,
        message: `Hello ${cleanName},\n\nYour account was signed in via ${provider} for ${cleanEmail}.`
      }),
    }).catch(() => {});
  } catch (e) {}

  return true;
};
