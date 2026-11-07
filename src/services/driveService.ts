export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
}

/**
 * List files from user's Google Drive.
 */
export async function listDriveFiles(accessToken: string): Promise<DriveFileItem[]> {
  const query = encodeURIComponent("trashed = false");
  const fields = encodeURIComponent("files(id, name, mimeType, size, modifiedTime, webViewLink)");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=25&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Google Drive API error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Upload strategy backup JSON to Google Drive.
 */
export async function uploadStrategyToDrive(
  accessToken: string,
  fileName: string,
  content: string,
  folderId?: string
): Promise<DriveFileItem> {
  const metadata: any = {
    name: fileName,
    mimeType: 'application/json'
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to upload to Google Drive (${res.status})`);
  }

  return await res.json();
}

/**
 * Create a dedicated folder in Google Drive for strategy backups.
 */
export async function createDriveFolder(accessToken: string, folderName: string): Promise<DriveFileItem> {
  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };

  const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create folder in Google Drive (${res.status})`);
  }

  return await res.json();
}

/**
 * Delete a file from Google Drive.
 */
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<boolean> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete file from Google Drive (${res.status})`);
  }

  return true;
}
