import { BotMemory } from '../types/simulator';

export interface GoogleDocItem {
  id: string;
  title: string;
  revisionId?: string;
  webViewLink?: string;
}

/**
 * Create a new blank Google Doc.
 */
export async function createGoogleDoc(accessToken: string, title: string): Promise<GoogleDocItem> {
  const res = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create Google Doc (${res.status})`);
  }

  const data = await res.json();
  return {
    id: data.documentId,
    title: data.title,
    revisionId: data.revisionId,
    webViewLink: `https://docs.google.com/document/d/${data.documentId}/edit`
  };
}

/**
 * Insert text into an existing Google Doc using batchUpdate.
 */
export async function insertDocText(
  accessToken: string,
  documentId: string,
  text: string,
  index: number = 1
): Promise<any> {
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index },
            text
          }
        }
      ]
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to update Google Doc (${res.status})`);
  }

  return await res.json();
}

/**
 * Generate a comprehensive strategy guide inside a new Google Doc.
 */
export async function createStrategyGuideDoc(
  accessToken: string,
  docTitle: string,
  memories: BotMemory[]
): Promise<GoogleDocItem> {
  // 1. Create document
  const doc = await createGoogleDoc(accessToken, docTitle);

  // 2. Build structured text content
  const lines: string[] = [
    `TECHNOVISAZE LEARNING BOT — GAMING INTELLIGENCE DOSSIER\n`,
    `Generated on: ${new Date().toLocaleString()}\n`,
    `Autonomous Background Queue: PUBG Mobile -> Roblox -> Minecraft\n`,
    `Zero Gaming Impact Architecture: Low-priority Dispatchers.IO & WakeLock cycle\n`,
    `========================================================================\n\n`
  ];

  memories.forEach((m, idx) => {
    lines.push(`[ENTRY #${idx + 1}] ${m.gameName.toUpperCase()} (${m.gameVersion || 'Latest Meta'})\n`);
    lines.push(`Category: ${m.strategyCategory}\n`);
    lines.push(`Confidence Rating: ${Math.round(m.confidenceScore * 100)}% · Cycle #${m.cycleIteration}\n`);
    lines.push(`Learned Timestamp: ${new Date(m.timestampLearned || m.timestamp).toLocaleString()}\n\n`);
    lines.push(`STRATEGIC INSIGHTS:\n${m.insightContent}\n\n`);
    lines.push(`KEY TACTICAL TAKEAWAYS:\n`);
    m.keyTakeaways.forEach(t => {
      lines.push(`  • ${t}\n`);
    });
    lines.push(`\n------------------------------------------------------------------------\n\n`);
  });

  const fullText = lines.join('');

  // 3. Batch insert text into doc
  await insertDocText(accessToken, doc.id, fullText, 1);

  return doc;
}

/**
 * List all Google Docs created or accessible by the user.
 */
export async function listUserGoogleDocs(accessToken: string): Promise<Array<{ id: string; name: string; modifiedTime?: string; webViewLink?: string }>> {
  const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.document' and trashed = false");
  const fields = encodeURIComponent("files(id, name, modifiedTime, webViewLink)");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=15&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to list Google Docs (${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
}
