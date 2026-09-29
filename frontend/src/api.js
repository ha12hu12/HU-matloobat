const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

function getToken() {
  return localStorage.getItem('hu_token')
}

// ---------- offline cache: remember the last good answer of each GET request ----------
const CACHE_PREFIX = 'hu_cache:'

export function clearCache() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}

function saveCache(path, data) {
  // searches change all the time, so we don't keep them
  if (path.includes('search_order_name=')) return
  try {
    localStorage.setItem(CACHE_PREFIX + path, JSON.stringify({ data, savedAt: Date.now() }))
  } catch {
    /* storage full or blocked: just skip */
  }
}

function readCache(path) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + path)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

async function request(path, { method = 'GET', body, form, auth = true } = {}) {
  const headers = {}
  let payload

  if (form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    payload = new URLSearchParams(body).toString()
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, { method, headers, body: payload })
  } catch {
    if (method === 'GET') {
      const cached = readCache(path)
      if (cached) {
        window.dispatchEvent(new CustomEvent('hu:stale', { detail: { savedAt: cached.savedAt } }))
        return cached.data
      }
    }
    throw new ApiError('ما قدرنا نوصل للسيرفر. تأكد من اتصالك بالإنترنت.', 0)
  }

  if (res.status === 401) {
    localStorage.removeItem('hu_token')
    localStorage.removeItem('hu_username')
    clearCache()
    window.dispatchEvent(new Event('hu:unauthorized'))
    throw new ApiError('انتهت جلستك، سجّل الدخول مرة أخرى', 401)
  }

  if (res.status === 204) return null

  let data = null
  try {
    data = await res.json()
  } catch {
    /* no body */
  }

  if (!res.ok) {
    throw new ApiError(data?.detail || 'صار خطأ غير متوقع', res.status)
  }

  if (method === 'GET') {
    saveCache(path, data)
    window.dispatchEvent(new Event('hu:fresh'))
  }

  return data
}

// 404 on these list endpoints just means "nothing yet" — not a real error
async function requestListOr404Empty(path, opts) {
  try {
    return await request(path, opts)
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

const qs = (params = {}) => {
  const clean = Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  if (!clean.length) return ''
  return '?' + new URLSearchParams(clean).toString()
}

export const api = {
  // ---------- auth ----------
  signup: (username, password) =>
    request('/users/', { method: 'POST', body: { username, password }, auth: false }),

  login: (username, password) =>
    request('/login/', { method: 'POST', form: true, body: { username, password }, auth: false }),

  me: () => request('/users/me'),

  updateUsername: (username) =>
    request('/users/me/username', { method: 'PUT', body: { username } }),

  updatePassword: (current_password, new_password) =>
    request('/users/me/password', { method: 'PUT', body: { current_password, new_password } }),

  // ---------- single orders ----------
  createOrder: ({ order_name, desc }) =>
    request('/orders/', { method: 'POST', body: { order_name, desc } }),

  allOrders: async (search) =>
    (await requestListOr404Empty(`/orders/${qs({ search_order_name: search })}`)) || [],

  myOrders: async (search) =>
    (await requestListOr404Empty(`/orders/my_orders${qs({ search_order_name: search })}`)) || [],

  takeOrUntakeOrder: (id) => request(`/orders/${id}`, { method: 'PUT' }),

  ordersITook: async (search) => {
    const res = await requestListOr404Empty(`/orders/orders_i_took${qs({ search_order_name: search })}`)
    return res || { orders: [], orders_lists: [] }
  },

  updateOrder: (id, patch) =>
    request(`/orders/my_orders/${id}`, { method: 'PATCH', body: patch }),

  deleteOrder: (id) => request(`/orders/my_orders/${id}`, { method: 'DELETE' }),

  // one-way: applicant confirms they received their order
  markReceived: (id) =>
    request(`/orders/my_orders/received/${id}`, { method: 'PATCH', body: { received: true } }),

  // one-way: taker confirms they were paid by the applicant
  markPayedToTaker: (id) =>
    request(`/orders/orders_i_took/${id}`, { method: 'PATCH', body: { payed_to_taker: true } }),

  // ---------- lists ----------
  createList: (list_name) =>
    request('/orders_list/', { method: 'POST', body: { list_name } }),

  allLists: async () => (await requestListOr404Empty('/orders_list/')) || [],

  myLists: async () => (await requestListOr404Empty('/orders_list/my_lists')) || [],

  listDetail: (id) => request(`/orders_list/specific_list/${id}`),

  myListDetail: (id) => request(`/orders_list/my_lists/${id}`),

  deleteList: (id) => request(`/orders_list/specific_list/${id}`, { method: 'DELETE' }),

  updateList: async (id, list_name) => {
    try {
      return await request(`/orders_list/specific_list/${id}`, { method: 'PATCH', body: { list_name } })
    } catch (err) {
      // backend may not return a clean serialized body here — treat a non-401/404 hiccup
      // after a successful network round-trip as best-effort success for the UI
      if (err.status && err.status >= 500) return null
      throw err
    }
  },

  takeOrUntakeList: (id) => request(`/orders_list/${id}`, { method: 'PUT' }),

  addListItem: ({ list_id, order_name, price }) =>
    request('/orders_list/add_order', { method: 'POST', body: { list_id, order_name, price } }),

  deleteListItem: (listId, itemId) =>
    request(`/orders_list/specific_list/${listId}/specific_order/${itemId}`, { method: 'DELETE' }),

  updateListItem: (listId, itemId, order_name) =>
    request(`/orders_list/specific_list/${listId}/specific_order/${itemId}`, {
      method: 'PATCH',
      body: { order_name },
    }),

  setItemDone: (listId, itemId, done) =>
    request(`/orders_list/orders_i_took/list/${listId}/item/${itemId}`, {
      method: 'PATCH',
      body: { done },
    }),
}
