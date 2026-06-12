const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_STORE_ID = process.env.BLOB_STORE_ID || '';

if (!BLOB_READ_WRITE_TOKEN || !BLOB_STORE_ID) {
  console.warn('Blob storage not configured – falling back to local JSON file');
}

// Correct Blob URL format
const BASE_URL = BLOB_STORE_ID
  ? `https://${BLOB_STORE_ID}.blob.vercel-storage.com`
  : null;

export async function blobGet(key: string): Promise<string | null> {
  if (!BASE_URL || !BLOB_READ_WRITE_TOKEN) return null;
  
  const res = await fetch(`${BASE_URL}/${key}`, {
    headers: { Authorization: `Bearer ${BLOB_READ_WRITE_TOKEN}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Blob GET failed: ${res.statusText}`);
  return res.text();
}

export async function blobPut(key: string, body: string): Promise<void> {
  if (!BASE_URL || !BLOB_READ_WRITE_TOKEN) return;
  
  const res = await fetch(`${BASE_URL}/${key}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${BLOB_READ_WRITE_TOKEN}`,
      'Content-Type': 'application/json',
      'x-content-type': 'application/json',
    },
    body,
  });
  if (!res.ok) throw new Error(`Blob PUT failed: ${res.statusText}`);
}

export async function blobDelete(key: string): Promise<void> {
  if (!BASE_URL || !BLOB_READ_WRITE_TOKEN) return;
  
  const res = await fetch(`${BASE_URL}/${key}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${BLOB_READ_WRITE_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Blob DELETE failed: ${res.statusText}`);
}