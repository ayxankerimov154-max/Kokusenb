export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

/**
 * Fetch authenticated user's Gmail profile summary.
 */
export async function getGmailProfile(accessToken: string): Promise<GmailProfile> {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch Gmail profile (${res.status})`);
  }

  return await res.json();
}

/**
 * List recent messages in user's Gmail.
 */
export async function listRecentGmailMessages(
  accessToken: string,
  maxResults: number = 10
): Promise<GmailMessageSummary[]> {
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=`;
  const res = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to list Gmail messages (${res.status})`);
  }

  const listData = await res.json();
  const messages: any[] = listData.messages || [];

  // Fetch headers for each message concurrently
  const detailedMessages: GmailMessageSummary[] = await Promise.all(
    messages.map(async msg => {
      try {
        const itemRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!itemRes.ok) return { id: msg.id, threadId: msg.threadId };
        const data = await itemRes.json();
        const headers = data.payload?.headers || [];
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
        const date = headers.find((h: any) => h.name === 'Date')?.value || '';

        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: data.snippet,
          subject,
          from,
          date
        };
      } catch {
        return { id: msg.id, threadId: msg.threadId, snippet: 'Message preview unavailable' };
      }
    })
  );

  return detailedMessages;
}

/**
 * Send an email digest via Gmail API.
 * Encodes RFC 2822 email format into URL-safe Base64 string.
 */
export async function sendStrategyDigestEmail(
  accessToken: string,
  toEmail: string,
  subject: string,
  bodyHtml: string
): Promise<{ id: string; threadId: string }> {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${toEmail}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    bodyHtml
  ];

  const rawEmail = emailLines.join('\r\n');
  const base64Safe = btoa(unescape(encodeURIComponent(rawEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: base64Safe })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to send email via Gmail API (${res.status})`);
  }

  return await res.json();
}
