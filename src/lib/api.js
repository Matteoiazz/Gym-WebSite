const TOKEN_KEY = 'mf_token'

// Empty in development (Vite proxies /api); set VITE_API_URL when the API lives on another host.
const API_BASE = `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api`
const UNAVAILABLE = 'Servizio momentaneamente non disponibile. Riprova tra qualche minuto.'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, isFormData = false } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error(UNAVAILABLE)
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // no JSON body (e.g. 204)
  }

  if (!res.ok) {
    if (data?.error) throw new Error(data.error)
    throw new Error(res.status === 404 || res.status >= 500 ? UNAVAILABLE : `Errore ${res.status}`)
  }
  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  upload: (path, formData) => request(path, { method: 'POST', body: formData, isFormData: true }),
  fileUrl: (path) => {
    const token = getToken()
    return `${API_BASE}${path}${token ? `?token=${encodeURIComponent(token)}` : ''}`
  },
}
