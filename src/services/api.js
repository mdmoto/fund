// API service for MaoMall backend communication
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.maollar.com'

const http = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
})

// Inject auth token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('mao_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

// Handle 401
http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mao_token')
      localStorage.removeItem('mao_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const api = {
  // Auth
  login: (username, password) =>
    http.post('/buyer/passport/login', { username, password }),

  // User profile
  getProfile: () => http.get('/buyer/member/info'),

  // Maollar points balance (pending exchange)
  getPointBalance: () => http.get('/buyer/point/balance'),

  // Maollar price info
  getPriceInfo: () => http.get('/buyer/maollar/price'),

  // Platform stats (GMV, milestone, fund)
  getPlatformStats: () => http.get('/buyer/maollar/stats'),

  // Initiate exchange (points → MEOW on-chain)
  initiateExchange: (amount, walletAddress) =>
    http.post('/buyer/maollar/exchange', { amount, walletAddress }),

  // Check exchange transaction status
  getExchangeStatus: (txId) =>
    http.get(`/buyer/maollar/exchange/${txId}`),

  // Save wallet address to user account
  saveWalletAddress: (address) =>
    http.post('/buyer/maollar/wallet/bind', { address }),

  // Get bound wallet address
  getWalletInfo: () => http.get('/buyer/maollar/wallet'),

  // Recent exchange history
  getExchangeHistory: () => http.get('/buyer/maollar/history'),
}

export default http
