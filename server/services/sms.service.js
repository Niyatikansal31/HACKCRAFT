const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2';
const MSG91_URL = 'https://control.msg91.com/api/v5/flow/';

function normalizeNumbers(numbers = []) {
  return numbers
    .map((item) => String(item || '').replace(/\D/g, ''))
    .filter(Boolean);
}

export async function sendSms({ to, message }) {
  const recipients = normalizeNumbers(Array.isArray(to) ? to : [to]);
  if (!recipients.length || !message) {
    return { success: false, message: 'No recipient/message provided' };
  }

  const provider = (process.env.SMS_PROVIDER || 'console').toLowerCase();

  if (provider === 'fast2sms') {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) return { success: false, message: 'FAST2SMS API key missing' };

    const response = await fetch(FAST2SMS_URL, {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message,
        language: 'english',
        flash: 0,
        numbers: recipients.join(','),
      }),
    });
    const data = await response.json().catch(() => ({}));
    return { success: response.ok, provider: 'fast2sms', data };
  }

  if (provider === 'msg91') {
    const authKey = process.env.MSG91_AUTH_KEY;
    const flowId = process.env.MSG91_FLOW_ID;
    if (!authKey || !flowId) return { success: false, message: 'MSG91 auth/flow config missing' };

    const response = await fetch(`${MSG91_URL}${flowId}`, {
      method: 'POST',
      headers: {
        authkey: authKey,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        recipients: recipients.map((mobile) => ({
          mobiles: `91${mobile}`,
          message,
        })),
      }),
    });
    const data = await response.json().catch(() => ({}));
    return { success: response.ok, provider: 'msg91', data };
  }

  console.log('[SMS-CONSOLE]', { recipients, message });
  return { success: true, provider: 'console', queued: true };
}
