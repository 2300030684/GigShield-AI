// ══════════════════════════════════════════════════════
//  TRUSTPAY FRONTEND API CLIENT
//  Supports both Real Backend and MOCK_MODE for local testing
// ══════════════════════════════════════════════════════

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://10.123.62.0:8080/api';

// Set this to true to force Mock Mode (useful if backend is not running)
const MOCK_MODE = false;

// ── TOKEN MANAGEMENT ──
const TOKEN_KEY = 'trustpay_token';

const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
const getToken = () => localStorage.getItem(TOKEN_KEY);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// ── CORE REQUEST ──
const request = async (method, path, data = null) => {
  if (MOCK_MODE) {
    console.warn(`[MOCK] ${method} ${path}`, data);
    return handleMock(method, path, data);
  }

  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (data && method !== 'GET') options.body = JSON.stringify(data);

  try {
    const response = await fetch(`${API_BASE}${path}`, options);

    // Handle 401: clear token and redirect to auth
    if (response.status === 401) {
      clearToken();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }

    const json = await response.json();
    if (!response.ok && !json.success) {
      throw new Error(json.message || `API error ${response.status}`);
    }
    return json;
  } catch (err) {
    console.error('API Request failed:', err);
    // Auto-fallback to mock if server is down
    if (err.message.includes('Failed to fetch') || err.message.includes('ECONNREFUSED')) {
      console.warn('Backend unresponsive. Falling back to MOCK_MODE.');
      return handleMock(method, path, data);
    }
    throw err;
  }
};

// ── MOCK HANDLER ──
const handleMock = async (method, path, data) => {
  await new Promise(r => setTimeout(r, 600)); // Simulate network latency

  if (path === '/auth/send-otp') {
    return { success: true, message: 'OTP sent successfully', devOtp: '123456' };
  }
  if (path === '/auth/verify-otp') {
    if (data.otp === '123456' || data.otp === '000000') {
      return { success: true, token: 'mock-jwt-token', isNewUser: true };
    }
    throw new Error('Invalid OTP. Hint: Use 123456');
  }

  // ── NEW: OAUTH TOKEN EXCHANGE MOCK ──
  if (path === '/auth/exchange-token') {
    return {
      success: true,
      user: {
        name: "Sai Kumar Reddy",
        email: "sai.kumar@example.com",
        platform: data.provider || "LinkedIn",
        workerID: "TP-OAUTH-92837",
        city: "Hyderabad",
        zone: "Kondapur",
        vehicleType: "2-Wheeler",
        avgDailyEarnings: 1450,
        platformBadge: {
          color: data.provider === 'google' ? '#4285F4' : '#0077B5',
          label: `${data.provider === 'google' ? 'Google' : 'LinkedIn'} Verified`
        }
      },
      token: "mock_jwt_" + Date.now()
    };
  }
  if (method === 'PUT' && path === '/auth/me') {
    const existingStr = localStorage.getItem('tp_user');
    const existingUser = existingStr ? JSON.parse(existingStr) : {};
    const updatedUser = { ...existingUser, ...data };
    localStorage.setItem('tp_user', JSON.stringify(updatedUser));
    return { success: true, user: updatedUser };
  }

  if (method === 'GET' && path === '/auth/me') {
    let u = {};
    const localUser = localStorage.getItem('tp_user');
    if (localUser) {
      try { u = JSON.parse(localUser); } catch (e) { }
    }

    // Global IP Location Auto-Detection for missing or default locations
    if (!u.city || u.city === 'Hyderabad') {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        if (ipData && ipData.city) {
          u.city = ipData.city;
          u.zone = ipData.region || ipData.city;
          u.coordinates = { lat: ipData.latitude, lng: ipData.longitude };
          localStorage.setItem('tp_user', JSON.stringify(u)); // Persist permanently
        }
      } catch (err) { console.warn('[MOCK] IP Location Auto-detect failed:', err); }
    }

    try {
      // Merge with rich defaults so dashboard never sees undefined
      const richUser = {
        name: u.name || 'Trustpay User',
        phone: u.phone || '9876543210',
        zone: u.zone || 'Kondapur',
        city: u.city || 'Hyderabad',
        platform: u.platform || 'Swiggy',
        platforms: u.platforms || ['Swiggy'],
        vehicleType: u.vehicleType || '2-Wheeler',
        plan: u.plan || 'standard',
        activeDays: u.activeDays || 134,
        upiID: u.upiID || 'sai.kumar@paytm',
        protectionScore: u.protectionScore || 76,
        nextBilling: u.nextBilling || 'Jul 5, 2025',
        isOnboardingComplete: u.isOnboardingComplete || false,
        coordinates: u.coordinates || { lat: 17.4726, lng: 78.3572 },
        platformBadge: {
          color: u.platform === 'Zomato' ? '#CB202D' : u.platform === 'Zepto' ? '#5E00A4' : '#FC8019',
          label: `${u.platform || 'Swiggy'} Partner`
        }
      };
      return {
        success: true, user: richUser, policy: {
          planType: richUser.plan, weeklyPremium: richUser.plan === 'lite' ? 20 : richUser.plan === 'pro' ? 50 : 35,
          maxWeeklyCoverage: richUser.plan === 'lite' ? 800 : richUser.plan === 'pro' ? 3000 : 1500,
          coverageRate: richUser.plan === 'lite' ? 0.60 : richUser.plan === 'pro' ? 0.90 : 0.75,
          nextBilling: richUser.nextBilling
        }
      };
    } catch (e) { console.warn('[MOCK] Could not parse tp_user:', e); }

    // Fallback default user
    return {
      success: true,
      user: {
        name: 'Sai Kumar Reddy', phone: '+91 98765 43210',
        zone: 'Kondapur', city: 'Hyderabad', platform: 'Swiggy', platforms: ['Swiggy'],
        vehicleType: '2-Wheeler', plan: 'standard', activeDays: 134,
        upiID: 'sai.kumar@paytm', protectionScore: 76, nextBilling: 'Jul 5, 2025',
        coordinates: { lat: 17.4726, lng: 78.3572 }, isOnboardingComplete: true,
        platformBadge: { color: '#FC8019', label: 'Swiggy Partner' }
      },
      policy: {
        planType: 'standard', weeklyPremium: 35, maxWeeklyCoverage: 1500,
        coverageRate: 0.75, nextBilling: 'Jul 5, 2025'
      }
    };
  }
  if (path === '/auth/signup') {
    return { success: true };
  }
  if (path === '/claims/stats') {
    const claims = (() => { try { return JSON.parse(localStorage.getItem('tp_claims') || '[]'); } catch { return []; } })();
    if (claims.length === 0) {
      // initialize blank seed
      const seed = [
        { id: 'TRP-20250628-1042', date: '2025-06-28', displayDate: 'Jun 28, 2025', event: 'Heavy Rainfall', zone: 'Kondapur', incomeLoss: 338, approvedPayout: 254, status: 'paid', payoutTime: 'Auto — 18 min' },
        { id: 'TRP-20250621-3318', date: '2025-06-21', displayDate: 'Jun 21, 2025', event: 'Heatwave', zone: 'Kondapur', incomeLoss: 315, approvedPayout: 236, status: 'paid', payoutTime: 'Auto — 9 min' }
      ];
      localStorage.setItem('tp_claims', JSON.stringify(seed));
      claims.push(...seed);
    }
    const totalPaid = claims.reduce((acc, c) => acc + (c.approvedPayout || 0), 0);
    return {
      success: true,
      totalPaid: totalPaid,
      thisWeekProtected: 1271,
      thisWeekEarnings: 11580,
      totalClaims: claims.length,
      claimSuccessRate: 98,
      returnRatio: 3.76,
      recentClaims: claims.slice(0, 3)
    };
  }
  if (path.includes('/ai/earnings-forecast')) {
    return {
      success: true, forecast: [
        { day: 'Mon', date: 'Jun 30', expectedEarnings: 800, protectedFloor: 700 },
        { day: 'Tue', date: 'Jul 1', expectedEarnings: 950, protectedFloor: 700 },
        { day: 'Wed', date: 'Jul 2', expectedEarnings: 1100, protectedFloor: 700 },
        { day: 'Thu', date: 'Jul 3', expectedEarnings: 750, protectedFloor: 700 },
        { day: 'Fri', date: 'Jul 4', expectedEarnings: 1400, protectedFloor: 700 },
        { day: 'Sat', date: 'Jul 5', expectedEarnings: 1600, protectedFloor: 700 },
        { day: 'Sun', date: 'Jul 6', expectedEarnings: 1200, protectedFloor: 700 }
      ]
    };
  }

  if (path === '/ai/insights') {
    return {
      success: true,
      riskScore: 55, riskLevel: 'MODERATE', riskReason: 'Evening rain likely in Kondapur',
      safeHours: '7AM – 12PM',
      recommendations: [
        { type: 'timing', msg: 'Best earnings window: 10AM–1PM (low traffic + high demand)' },
        { type: 'zone', msg: 'Banjara Hills: 22% higher orders than Kondapur today' },
        { type: 'risk', msg: 'Storm probability 84% after 5PM — file claim if disrupted' },
      ],
      hourlyRisk: [
        { hour: '6AM', risk: 12, level: 'low' }, { hour: '7AM', risk: 15, level: 'low' },
        { hour: '8AM', risk: 35, level: 'medium' }, { hour: '9AM', risk: 42, level: 'medium' },
        { hour: '10AM', risk: 22, level: 'low' }, { hour: '11AM', risk: 18, level: 'low' },
        { hour: '12PM', risk: 30, level: 'medium' }, { hour: '1PM', risk: 25, level: 'medium' },
        { hour: '2PM', risk: 20, level: 'low' }, { hour: '3PM', risk: 40, level: 'medium' },
        { hour: '4PM', risk: 62, level: 'high' }, { hour: '5PM', risk: 78, level: 'high' },
        { hour: '6PM', risk: 90, level: 'high' }, { hour: '7PM', risk: 85, level: 'high' },
        { hour: '8PM', risk: 65, level: 'high' }, { hour: '9PM', risk: 45, level: 'medium' },
        { hour: '10PM', risk: 28, level: 'medium' }, { hour: '11PM', risk: 15, level: 'low' },
      ]
    };
  }

  if (path.includes('/claims/history')) {
    const claims = (() => { try { return JSON.parse(localStorage.getItem('tp_claims') || '[]'); } catch { return []; } })();
    return {
      success: true,
      claims: claims
    };
  }

  // /policies/plans — return full plan objects with all fields
  if (path === '/policies/plans') {
    return {
      success: true,
      recommendedPlan: 'standard',
      userZoneRisk: 55,
      plans: [
        { id: 'lite', name: 'Lite', weeklyPremium: 20, annualPremium: 1040, maxWeeklyCoverage: 800, coverageRate: 0.60, events: ['Heavy Rain', 'Storm'], claimsPerMonth: 3, payoutTime: '2 hours', features: ['Basic weather coverage', 'UPI payout', 'App alerts'], recommended: false },
        { id: 'standard', name: 'Standard', weeklyPremium: 35, annualPremium: 1820, maxWeeklyCoverage: 1500, coverageRate: 0.75, events: ['Heavy Rain', 'Storm', 'Heatwave'], claimsPerMonth: 8, payoutTime: '45 minutes', features: ['Everything in Lite', 'AI risk alerts', 'Zone recommendations', 'Priority support'], recommended: true },
        { id: 'pro', name: 'Pro', weeklyPremium: 50, annualPremium: 2600, maxWeeklyCoverage: 3000, coverageRate: 0.90, events: ['Heavy Rain', 'Storm', 'Heatwave', 'Flood', 'Custom'], claimsPerMonth: 999, payoutTime: '15 minutes', features: ['Everything in Standard', 'Fraud guarantee', 'Account manager', 'Income forecasting'], recommended: false }
      ]
    };
  }

  if (path === '/location/verify') {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.lat}&lon=${data.lng}`);
      const json = await res.json();

      const city = json.address?.city || json.address?.town || json.address?.state || 'Hyderabad';
      const zone = json.address?.suburb || json.address?.neighbourhood || city;

      const existingStr = localStorage.getItem('tp_user');
      if (existingStr) {
        const u = JSON.parse(existingStr);
        u.city = city;
        u.zone = zone;
        u.coordinates = { lat: data.lat, lng: data.lng };
        localStorage.setItem('tp_user', JSON.stringify(u));
      }

      return { success: true, city, zone, isCovered: true };
    } catch (e) {
      return { success: true, city: "Hyderabad", zone: "Kondapur", isCovered: true };
    }
  }

  if (path.startsWith('/weather/current')) {
    const urlParams = new URLSearchParams(path.split('?')[1]);
    const lat = urlParams.get('lat') || 17.3850;
    const lng = urlParams.get('lng') || 78.4867;
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=YOUR_KEY&units=metric`);
      const weatherData = await res.json();
      if (!weatherData || !weatherData.main) {
        throw new Error("Invalid API payload");
      }

      const rain = weatherData.rain?.["1h"] || 0;
      const temp = weatherData.main.temp || 30;
      let event = 'Clear';

      if (rain > 20) event = 'Heavy Rain';
      else if (temp > 40) event = 'Heatwave';

      return {
        success: true,
        weather: {
          event: event !== 'Clear' ? event : 'Normal Weather',
          intensity: (weatherData.wind?.speed || 0) + 'm/s wind',
          temperature: Math.round(temp),
          humidity: weatherData.main.humidity || 50,
          raw: weatherData // To be accessed by getCityRiskLevel if needed
        }
      };
    } catch (e) {
      console.warn("Using fallback weather");
      return { success: true, weather: { event: 'Heavy Rain', intensity: '12m/s', temperature: 28, humidity: 65, raw: { rain: { "1h": 22 }, main: { temp: 28 } } } };
    }
  }

  if (path === '/claims/initiate') {
    return {
      success: true,
      claimID: `TRP-${Date.now()}`,
      aiResult: {
        approved: true,
        fraudScore: 4,
        confidence: 94,
        planName: 'Standard',
        approvedPayout: 350,
        finalPayout: 350,
        processingSteps: [
          { title: 'Location Verified', detail: 'GPS matches zone', status: 'success' },
          { title: 'Weather Analyzed', detail: 'Conditions met policy', status: 'success' },
          { title: 'Earnings Impact', detail: 'Calculated 40% loss', status: 'success' },
          { title: 'Fraud Check', detail: 'Passed successfully', status: 'success' }
        ]
      }
    };
  }

  if (path === '/claims/confirm') {
    const existing = JSON.parse(localStorage.getItem('tp_user') || '{}');
    const claimID = data.claimID || `TRP-${Date.now()}`;

    const claims = (() => { try { return JSON.parse(localStorage.getItem('tp_claims') || '[]'); } catch { return []; } })();
    // Insert new realtime claim directly into our history pool
    claims.unshift({
      id: claimID,
      date: new Date().toISOString().split('T')[0],
      displayDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      event: data.customEventLabel || 'Disruption Event',
      zone: existing.zone || 'Current Zone',
      incomeLoss: 350,
      approvedPayout: 350,
      status: 'paid',
      payoutTime: 'Auto — 2 min'
    });
    localStorage.setItem('tp_claims', JSON.stringify(claims));

    return {
      success: true,
      amount: 350,
      upiID: existing.upiID || 'your UPI',
      txnID: 'TXN-' + Math.floor(Math.random() * 1000000000),
      claimID: claimID
    };
  }

  if (path === '/admin/metrics') {
    const claims = (() => { try { return JSON.parse(localStorage.getItem('tp_claims') || '[]'); } catch { return []; } })();
    // basic realtime metrics based on active offline claims
    return {
      success: true,
      adminData: {
        totalUsers: 1420 + (claims.length * 3), // scale visually with claims for demo
        activePolicies: 940,
        claimsThisMonth: claims.length,
        avgPayout: claims.length > 0 ? Math.round(claims.reduce((a, c) => a + (c.approvedPayout || 0), 0) / claims.length) : 0,
        fraudPreventedValue: 184500,
        fraudPreventedCases: 42,
        platformRevenue: 284000,
        totalUsersGrowth: '+12%',
        activePoliciesPercent: '66%',
        zonesFlagged: 2,
        cityDistribution: [
          { city: 'Hyderabad', users: 840, claims: claims.filter(c => c.zone === 'Kondapur' || c.zone === 'Gachibowli').length || 45 },
          { city: 'Bangalore', users: 420, claims: 12 },
          { city: 'Pune', users: 160, claims: 3 }
        ]
      },
      adminAnalytics: {
        claimsTrend: [
          ...claims.map((c, i) => ({ day: c.displayDate, filed: c.incomeLoss, approved: c.approvedPayout })).reverse().slice(0, 7)
        ],
        fraudStatsByType: [
          { name: 'GPS Mismatch', value: 42, color: '#FF4D6A' },
          { name: 'Velocity Fraud', value: 28, color: '#FF8C42' },
          { name: 'Duplicate Claim', value: 19, color: '#FFD166' },
          { name: 'Other', value: 11, color: '#8899BB' },
        ],
        recentActivity: claims.slice(0, 5).map(c => ({
          user: 'Realtime User', city: c.zone, time: c.displayDate, amount: c.approvedPayout, status: c.status
        }))
      }
    };
  }

  // Default success for others
  return { success: true };
};

// ══════════════════════════════════════════════════════
//  API METHODS
// ══════════════════════════════════════════════════════
const api = {
  // Token helpers
  setToken,
  getToken,
  clearToken,
  isAuthenticated: () => !!getToken(),
  request,

  // ── AUTH ──
  register: (data) => request('POST', '/users/register', data),
  login: (data) => request('POST', '/users/login', data),
  signup: (data) => request('POST', '/auth/signup', data),
  getMe: () => request('GET', '/auth/me'),
  updateProfile: (data) => request('PUT', '/auth/me', data),
  logout: async () => {
    try { await request('POST', '/auth/logout'); } catch (_) { }
    clearToken();
  },

  // ── PLATFORM CONNECTION (NEW) ──
  sendPlatformOTP: (platform, phone) => request('POST', '/login/platform/send-otp', { platform, phone }),
  verifyPlatformOTP: (platform, phone, otp) => request('POST', '/login/platform/verify-otp', { platform, phone, otp }),

  // ── POLICIES ──
  getPlans: () => request('GET', '/policies/plans'),
  activatePlan: (planType, upiID) => request('POST', '/policies/activate', { planType, upiID }),
  confirmPayment: (data) => request('POST', '/policies/payment-success', data),
  getMyPolicy: () => request('GET', '/policies/my-policy'),
  cancelPolicy: () => request('POST', '/policies/cancel'),

  // ── CLAIMS ──
  initiateClaim: (data) => request('POST', '/claims/initiate', data),
  confirmClaim: (claimID) => request('POST', '/claims/confirm', { claimID }),
  getClaimHistory: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/claims/history${qs ? '?' + qs : ''}`);
  },
  getClaimStats: () => request('GET', '/claims/stats'),
  getClaim: (claimID) => request('GET', `/claims/${claimID}`),

  // ── WEATHER ──
  getWeather: (lat, lng) => request('GET', `/weather/current?lat=${lat}&lng=${lng}`),
  getWeatherForecast: (lat, lng) => request('GET', `/weather/forecast?lat=${lat}&lng=${lng}`),
  getWeatherRiskTimeline: (zone) => request('GET', `/weather/risk-timeline?zone=${encodeURIComponent(zone)}`),

  // ── LOCATION ──
  verifyLocation: (lat, lng, accuracy) => request('POST', '/location/verify', { lat, lng, accuracy }),
  updateLiveLocation: (lat, lng, claimID) => request('POST', '/location/update-live', { lat, lng, claimID }),

  // ── AI ──
  getInsights: () => request('GET', '/ai/insights'),
  getEarningsForecast: () => request('GET', '/ai/earnings-forecast'),
  runPrediction: (data) => request('POST', '/ai/predict', data),

  // ── PAYMENTS ──
  createPaymentOrder: (planType) => request('POST', '/payments/create-order', { planType }),
  verifyPaymentSignature: (data) => request('POST', '/payments/verify-signature', data),

  // ── ADMIN ──
  getAdminMetrics: () => request('GET', '/admin/metrics'),
  getAdminClaims: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/admin/claims${qs ? '?' + qs : ''}`);
  },
  getAdminUsers: (params = {}) => request('GET', `/admin/users?${new URLSearchParams(params)}`),

  // ── FRAUD ──
  getFraudCases: (status) => request('GET', `/fraud${status ? `?status=${status}` : ''}`),
  updateFraudCase: (caseID, action) => request('POST', `/fraud/${caseID}/action`, { action }),
};

export default api;

// ══════════════════════════════════════════════════════
//  NAMED EXPORTS — backward compat with existing imports
// ══════════════════════════════════════════════════════
export const fetchUserData = async () => {
  const res = await api.getMe();
  return { ...res.user, policy: res.policy };
};

export const fetchWeeklyEarnings = async () => {
  const res = await api.getClaimStats();
  return { weeklyEarnings: res.thisWeekEarnings || 0, weeklyProtected: res.thisWeekProtected || 0 };
};

export const fetchClaimsHistory = async () => {
  const res = await api.getClaimHistory({ limit: 20 });
  return res.claims || [];
};

export const fetchActivePolicy = async () => {
  const res = await api.getMyPolicy();
  return res.policy;
};

export const updateUserSettings = async (userId, data) => {
  return api.updateProfile(data);
};
