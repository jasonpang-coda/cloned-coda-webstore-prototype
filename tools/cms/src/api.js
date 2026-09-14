/**
 * Thin fetch wrappers over the /api/* routes served by
 * tools/cms/server/api.mjs (mounted as a Vite dev-server middleware — same
 * origin, no CORS to worry about).
 */

async function request (method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(json?.error ?? `${method} ${path} failed (${res.status})`)
  return json
}

export const api = {
  schema: () => request('GET', '/schema'),
  previewOrigin: () => request('GET', '/preview-origin'),
  listStores: () => request('GET', '/stores'),
  getStore: key => request('GET', `/stores/${key}`),
  createStore: definition => request('POST', '/stores', definition),
  updateStore: (key, definition) => request('PUT', `/stores/${key}`, definition),
  uploadAsset: (key, { slot, name, dataBase64 }) => request('POST', `/stores/${key}/assets`, { slot, name, dataBase64 }),
  gitStatus: key => request('GET', `/stores/${key}/git`),
  commit: (key, { message, newBranch }) => request('POST', `/stores/${key}/commit`, { message, newBranch }),
  push: key => request('POST', `/stores/${key}/push`),
  deployments: key => request('GET', `/stores/${key}/deployments`),
  createVercelProject: (key, { linkEnvVars }) => request('POST', `/stores/${key}/vercel-project`, { linkEnvVars }),
  writerInfo: () => request('GET', '/writer-info'),
  styleGuides: () => request('GET', '/style-guides'),
  styleGuidePrefill: name => request('GET', `/style-guides/${name}`),
}
