export async function checkBackendStatus() {
  try {
    const res = await fetch('/api/health');
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveJSON(path, data) {
  const res = await fetch('/api/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, data })
  });
  if (!res.ok) throw new Error('Failed to save JSON');
  return res.json();
}

export async function readJSON(path) {
  const res = await fetch(`/api/json?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error('Failed to read JSON');
  return res.json();
}

export async function createDirectory(path) {
  const res = await fetch('/api/mkdir', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path })
  });
  if (!res.ok) throw new Error('Failed to create directory');
  return res.json();
}

export async function uploadAsset(file, customPath) {
  const formData = new FormData();
  formData.append('file', file);
  if (customPath) formData.append('path', customPath);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to upload asset');
  return res.json();
}

export async function deleteFile(path) {
  const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete file');
  return res.json();
}


export async function deleteDirectory(dirPath) {
  const res = await fetch(`/api/directory?path=${encodeURIComponent(dirPath)}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete directory');
  }
  return res.json();
}
