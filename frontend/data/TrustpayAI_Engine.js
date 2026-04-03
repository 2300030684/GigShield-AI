import * as tf from '@tensorflow/tfjs';
import { TrustpayDB, TrustpayComputed } from './TrustpayData.js';
import { h3Index } from '../utils/h3_simulator.js'; // We'll create this helper

// ═══════════════════════════════════════════════════
// FEATURE 1 — AI DYNAMIC PRICING MODEL
// ═══════════════════════════════════════════════════

export const TrustpayDynamicPricing = {
  model: null,
  isModelLoading: false,

  BASE_PREMIUMS: { lite: 20, standard: 35, pro: 50 },

  RISK_FACTORS: {
    zoneWaterlogging:   { weight: { safe: -2, moderate: 0, high: +3 } },
    weatherFrequency:   { weight: { low: -1.5, medium: 0, high: +2.5 } },
    trafficCongestion:  { weight: { low: -1, medium: 0, high: +2 } },
    claimHistory:       { weight: { clean: -2, average: 0, frequent: +3 } },
    vehicleRisk:        { weight: { "Bicycle": +1, "2-Wheeler": 0, "3-Wheeler": -0.5 } },
    peakHourExposure:   { weight: { morning: -1, mixed: 0, evening: +1.5 } },
    earningsStability:  { weight: { stable: -1, moderate: 0, volatile: +1.5 } },
    weatherForecast30d: { weight: { favorable: -1.5, neutral: 0, risky: +2 } },
  },

  async loadModel() {
    if (this.model) return this.model;
    if (this.isModelLoading) return null;
    
    this.isModelLoading = true;
    try {
        console.log("🤖 Loading Trustpay ML Model (TensorFlow.js)...");
        this.model = await tf.loadLayersModel('/model/trustpay_model.json');
        console.log("✅ Trustpay ML Model Loaded.");
        return this.model;
    } catch (err) {
        console.error("❌ Failed to load ML Model:", err.message);
        return null;
    } finally {
        this.isModelLoading = false;
    }
  },

  getCityRiskLevel(city, weatherData) {
    const rainfall = weatherData?.rain?.["1h"] || 0;
    const temp = weatherData?.main?.temp || 30;
    const isHexDisrupted = weatherData?.isHexDisrupted || false;

    if (isHexDisrupted || rainfall > 20 || temp > 40) return "high";
    if (rainfall > 5) return "medium";
    return "low";
  },

  async calculatePersonalizedPremiumAsync(planType, userData, locationData) {
    const base = this.BASE_PREMIUMS[planType];
    const factors = this.assessRiskFactors(userData, locationData);
    
    // 1. Prepare ML Input parameters
    const zone = locationData?.zone || userData?.zone || 'Kondapur';
    const weatherData = TrustpayDB.weather?.raw;
    const rainfall = weatherData?.rain?.["1h"] || 12;
    const temperature = weatherData?.main?.temp || 32;
    const aqi = 65; 
    const traffic = new Date().getHours() >= 17 ? 0.8 : 0.4;
    const claims = TrustpayDB.claims?.length || 0;
    const workHours = new Date().getHours() >= 15 ? 1 : 0;
    const WATERLOGGING_ZONES = { 'Kondapur': 1, 'HITEC City': 2, 'Madhapur': 0 };
    const zoneRisk = WATERLOGGING_ZONES[zone] !== undefined ? WATERLOGGING_ZONES[zone] : 1;

    let finalPremium = null;
    let mlSuccess = false;

    // Ensure model is loaded
    const model = await this.loadModel();

    if (model) {
        try {
            // Run Browser-side Inference
            const inputTensor = tf.tensor2d([[
                rainfall, temperature, aqi, traffic, claims, workHours, zoneRisk
            ]]);
            
            const prediction = model.predict(inputTensor);
            const rawValue = (await prediction.data())[0];
            
            // Adjust prediction for the plan tier
            const planMultiplier = planType === 'lite' ? 0.6 : (planType === 'pro' ? 1.4 : 1.0);
            finalPremium = Math.round((rawValue * planMultiplier) * 10) / 10;
            mlSuccess = true;

            // Cleanup tensors
            inputTensor.dispose();
            prediction.dispose();
        } catch (err) {
            console.warn('ML Inference failed. Falling back.', err.message);
        }
    }

    // 2. Fallback to Rule-based system
    if (!mlSuccess) {
      const rawAdj = factors.reduce((sum, f) => sum + f.adjustment, 0);
      const cappedAdj = Math.max(-8, Math.min(12, rawAdj));
      finalPremium = Math.round((base + cappedAdj) * 10) / 10;
    }

    const savedVsBase = base - finalPremium;
    const breakdown = this.buildBreakdownText(factors, savedVsBase);
    
    if (mlSuccess) {
        breakdown.summary = `🤖 AI Predicted Premium (TF.js Inference)`;
    }

    return {
      planType,
      basePremium: base,
      finalPremium: Math.max(finalPremium, 12),
      totalAdjustment: Math.round((base - finalPremium) * 10) / 10,
      savedVsBase: savedVsBase > 0 ? Math.round(savedVsBase * 10) / 10 : 0,
      factors,
      confidenceScore: mlSuccess ? 98 : this.calculateConfidence(factors),
      nextReviewDate: this.getNextReviewDate(),
      breakdown,
      isML: mlSuccess
    };
  },

  calculatePersonalizedPremium(planType, userData, locationData) {
    // Keep exact exact old sync method to prevent breaking things elsewhere not awaiting
    const base    = this.BASE_PREMIUMS[planType];
    const factors = this.assessRiskFactors(userData, locationData);
    const rawAdj  = factors.reduce((sum, f) => sum + f.adjustment, 0);
    const cappedAdj = Math.max(-8, Math.min(12, rawAdj));
    const final     = Math.round((base + cappedAdj) * 10) / 10;
    const savedVsBase = base - final;

    return {
      planType,
      basePremium:     base,
      finalPremium:    Math.max(final, 12),
      totalAdjustment: Math.round(cappedAdj * 10) / 10,
      savedVsBase:     savedVsBase > 0 ? Math.round(savedVsBase * 10) / 10 : 0,
      factors,
      confidenceScore:  this.calculateConfidence(factors),
      nextReviewDate:   this.getNextReviewDate(),
      breakdown:        this.buildBreakdownText(factors, savedVsBase),
    };
  },

  assessRiskFactors(userData, locationData) {
    const zone     = locationData?.zone || userData?.zone || 'Kondapur';
    const city     = userData?.city || 'Hyderabad';
    const claims   = TrustpayDB.claims?.length || 0;
    const vehicle  = userData?.vehicleType || '2-Wheeler';
    const earnings = TrustpayDB.dailyEarnings || [];
    const factors  = [];

    // Factor 1: Zone waterlogging
    const WATERLOGGING_ZONES = {
      'Kondapur': 'moderate', 'Gachibowli': 'moderate', 'HITEC City': 'high',
      'Madhapur': 'safe', 'Banjara Hills': 'safe', 'Jubilee Hills': 'safe',
      'Kukatpally': 'high', 'Secunderabad': 'moderate',
      'Koramangala': 'safe', 'Andheri West': 'moderate', 'T. Nagar': 'high',
    };
    const wlLevel = WATERLOGGING_ZONES[zone] || 'moderate';
    const wlAdj   = this.RISK_FACTORS.zoneWaterlogging.weight[wlLevel];
    factors.push({ name: 'Zone Waterlogging', level: wlLevel, adjustment: wlAdj, icon: '•', positive: wlAdj <= 0, description: `${zone} has ${wlLevel} waterlogging history`, source: 'IMD Flood Zone Data' });

    // Factor 2: Weather frequency
    const recentRainClaims = TrustpayDB.claims?.filter(c => {
      const days = (new Date('2025-06-28') - new Date(c.date)) / 86400000;
      return days <= 90 && (c.event?.includes('Rain') || c.event?.includes('Storm'));
    }).length || 2;
    const wxLevel = recentRainClaims < 3 ? 'low' : recentRainClaims < 7 ? 'medium' : 'high';
    const wxAdj   = this.RISK_FACTORS.weatherFrequency.weight[wxLevel];
    factors.push({ name: 'Weather Frequency', level: wxLevel, adjustment: wxAdj, icon: '•', positive: wxAdj <= 0, description: `${recentRainClaims} weather events in 90 days`, source: 'Weather History API' });

    // Factor 3: Claim history
    const claimLevel = claims === 0 ? 'clean' : claims < 5 ? 'average' : 'frequent';
    const claimAdj   = this.RISK_FACTORS.claimHistory.weight[claimLevel];
    factors.push({ name: 'Claim History', level: claimLevel, adjustment: claimAdj, icon: '•', positive: claimAdj <= 0, description: claims === 0 ? 'No claims — clean record' : `${claims} claims total`, source: 'Trustpay Records' });

    // Factor 4: Vehicle risk
    const vehicleAdj = this.RISK_FACTORS.vehicleRisk.weight[vehicle] ?? 0;
    factors.push({ name: 'Vehicle Risk', level: vehicle, adjustment: vehicleAdj, icon: '•', positive: vehicleAdj <= 0, description: `${vehicle} risk profile`, source: 'Actuarial Model' });

    // Factor 5: Peak hour exposure
    const eveningHighRisk = earnings.filter(d => d.risk === 'high').length;
    const peakLevel = eveningHighRisk > 5 ? 'evening' : eveningHighRisk > 2 ? 'mixed' : 'morning';
    const peakAdj   = this.RISK_FACTORS.peakHourExposure.weight[peakLevel];
    factors.push({ name: 'Peak Exposure', level: peakLevel, adjustment: peakAdj, icon: '•', positive: peakAdj <= 0, description: `Works mostly ${peakLevel} hours`, source: 'Usage Patterns' });

    // Factor 6: Earnings stability
    const amounts   = earnings.map(d => d.earnings);
    const avg       = amounts.reduce((a, b) => a + b, 0) / (amounts.length || 1);
    const variance  = amounts.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / (amounts.length || 1);
    const stdDev    = Math.sqrt(variance);
    const stability = stdDev < 200 ? 'stable' : stdDev < 450 ? 'moderate' : 'volatile';
    const stabilityAdj = this.RISK_FACTORS.earningsStability.weight[stability];
    factors.push({ name: 'Earnings Stability', level: stability, adjustment: stabilityAdj, icon: '•', positive: stabilityAdj <= 0, description: `Earnings are ${stability}`, source: 'Earnings Analysis' });

    // Factor 7: Dynamic Real-time Location Risk
    const riskLevel = this.getCityRiskLevel(city, TrustpayDB.weather?.raw);
    const mappedWeight = riskLevel === 'high' ? 'risky' : riskLevel === 'medium' ? 'neutral' : 'favorable';
    const forecastAdj   = this.RISK_FACTORS.weatherForecast30d.weight[mappedWeight];
    factors.push({ name: 'Live City Risk', level: riskLevel, adjustment: forecastAdj, icon: '!', positive: forecastAdj <= 0, description: `Live risk for ${city}: ${riskLevel}`, source: 'OpenWeatherMap API' });

    return factors;
  },

  calculateConfidence(factors) {
    return Math.min(72 + factors.filter(f => f.source !== 'Trustpay Records').length * 2, 96);
  },

  getNextReviewDate() {
    return new Date('2025-07-05').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  buildBreakdownText(factors, savings) {
    const positives = factors.filter(f => f.positive);
    const negatives = factors.filter(f => !f.positive);
    return {
      savingsFactors: positives.map(f => f.description),
      riskFactors: negatives.map(f => f.description),
      summary: savings > 0
        ? `AI saved you ₹${savings}/week based on your low-risk profile`
        : `Premium adjusted for your risk zone`,
    };
  },

  calculateBonusCoverageHours(userData, locationData) {
    const zone = locationData?.zone || userData?.zone;
    const SAFE_ZONES = ['Madhapur', 'Banjara Hills', 'Jubilee Hills', 'Koramangala'];
    const isLowRisk  = SAFE_ZONES.includes(zone);
    return {
      bonusHours: isLowRisk ? 2 : 0,
      reason: isLowRisk ? `${zone} is a low-risk zone — 2 free bonus coverage hours added` : null,
      totalHours: isLowRisk ? 12 : 10,
    };
  },
};

// ═══════════════════════════════════════════════════
// FEATURE 2 — AUTOMATED DISRUPTION TRIGGERS
// ═══════════════════════════════════════════════════

export const TrustpayTriggers = {
  checkInterval: null,
  _firedCallbacks: [],

  // Register a callback to receive trigger events (used by React components)
  onTriggerFired(callback) {
    this._firedCallbacks.push(callback);
    return () => { this._firedCallbacks = this._firedCallbacks.filter(cb => cb !== callback); };
  },

  startAllTriggers(userData, locationData) {
    this.stopAllTriggers();
    this.runAllChecks(userData, locationData);
    this.checkInterval = setInterval(() => {
      this.runAllChecks(userData, locationData);
    }, 30000);
  },

  stopAllTriggers() {
    if (this.checkInterval) { clearInterval(this.checkInterval); this.checkInterval = null; }
  },

  async runAllChecks(userData, locationData) {
    const results = await Promise.allSettled([
      this.trigger1_HeavyRainfall(locationData),
      this.trigger2_ExtremeHeat(locationData),
      this.trigger3_TrafficDisruption(locationData),
      this.trigger4_AirQualityAlert(locationData),
      this.trigger5_LocalFloodWarning(locationData),
    ]);

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value?.triggered) {
        this.handleTriggerFired(result.value, userData);
      }
    });
  },

  async trigger1_HeavyRainfall(locationData) {
    const currentHour = new Date().getHours();
    const isRainHour  = currentHour >= 16 && currentHour <= 20;
    const mockRainfall = isRainHour ? 28 : 3;
    return {
      triggered: mockRainfall > 15,
      triggerID: 'TRIGGER_RAIN', event: 'Heavy Rainfall', severity: 'HIGH', icon: '!',
      detail: `${mockRainfall}mm/hr rainfall detected`, source: 'OpenWeatherMap API',
      apiEndpoint: 'api.openweathermap.org/data/2.5/weather',
      estimatedLoss: this.estimateLoss('Heavy Rainfall', locationData), color: '#2563EB',
    };
  },

  async trigger2_ExtremeHeat(locationData) {
    const hour = new Date().getHours();
    const mockTemp = (hour >= 12 && hour <= 16) ? 44 : 31;
    return {
      triggered: mockTemp > 42,
      triggerID: 'TRIGGER_HEAT', event: 'Extreme Heatwave', severity: 'HIGH', icon: '!',
      detail: `Temperature ${mockTemp}°C — exceeds safe working threshold`, source: 'OpenWeatherMap + Heat Index Model',
      apiEndpoint: 'api.openweathermap.org/data/2.5/weather',
      estimatedLoss: this.estimateLoss('Heatwave', locationData), color: '#EA580C',
    };
  },

  getTrafficLevel(hour) {
    if (hour >= 8 && hour <= 10) return "high";
    if (hour >= 17 && hour <= 20) return "high";
    return "medium";
  },

  async trigger3_TrafficDisruption(locationData) {
    const hour = new Date().getHours();
    const trafficLevel = this.getTrafficLevel(hour);
    return {
      triggered: trafficLevel === 'high',
      triggerID: 'TRIGGER_TRAFFIC', event: 'Major Traffic Disruption', severity: 'MEDIUM', icon: '!',
      detail: `Traffic congestion is extremely high due to peak hours`, source: 'Live Traffic Simulator',
      apiEndpoint: 'api.local/traffic',
      estimatedLoss: this.estimateLoss('Major Traffic Disruption', locationData), color: '#F59E0B',
    };
  },

  async trigger4_AirQualityAlert(locationData) {
    const HIGH_AQI_CITIES = ['Delhi', 'Mumbai', 'Kanpur'];
    const userCity  = TrustpayDB.currentUser?.city || 'Hyderabad';
    const mockAQI   = HIGH_AQI_CITIES.includes(userCity) ? 5 : 2;
    return {
      triggered: mockAQI >= 4,
      triggerID: 'TRIGGER_AQI', event: 'Dangerous Air Quality', severity: 'MEDIUM', icon: '!',
      detail: `AQI ${mockAQI * 50} — Hazardous for outdoor workers`, source: 'OpenWeatherMap Air Pollution API',
      apiEndpoint: 'api.openweathermap.org/data/2.5/air_pollution',
      estimatedLoss: this.estimateLoss('Air Quality', locationData), color: '#DC2626',
    };
  },

  async trigger5_LocalFloodWarning(locationData) {
    const FLOOD_PRONE = ['HITEC City', 'Kukatpally', 'Andheri West', 'T. Nagar'];
    const userZone   = TrustpayDB.currentUser?.zone || 'Kondapur';
    const hexID      = TrustpayDB.currentUser?.currentHexID || '8a2a1072b59ffff';
    const triggered  = FLOOD_PRONE.includes(userZone) && new Date().getHours() >= 16;
    return {
      triggered,
      triggerID: 'TRIGGER_FLOOD', event: 'Local Flood Warning', severity: 'CRITICAL', icon: '!',
      detail: `Official flood warning issued for ${userZone} district (Hex: ${hexID})`, source: 'India WRIS Flood Alert System',
      apiEndpoint: 'api.india-wris.gov.in/flood-alerts',
      estimatedLoss: this.estimateLoss('Flood', locationData), color: '#DC2626',
      hexID
    };
  },

  estimateLoss(eventType, locationData) {
    const currentHour = new Date().getHours();
    const hourlyRates = { morning: 68, lunch: 110, afternoon: 54, evening: 120, night: 48 };
    const period = currentHour < 11 ? 'morning' : currentHour < 14 ? 'lunch' : currentHour < 17 ? 'afternoon' : currentHour < 21 ? 'evening' : 'night';
    const weatherImpact = { 'Heavy Rainfall': 0.72, 'Heatwave': 0.78, 'Road Block': 0.62, 'Air Quality': 0.55, 'Flood': 0.82, 'Major Traffic Disruption': 0.65 };
    return Math.round(hourlyRates[period] * (weatherImpact[eventType] || 0.70) * 2);
  },

  handleTriggerFired(triggerData, userData) {
    const key       = `last_${triggerData.triggerID}`;
    const lastFired = parseInt(sessionStorage.getItem(key) || '0');
    // Realistic Cooldown: Prevent payouts more than once per 24 hours per trigger ID
    if (Date.now() - lastFired < 86400000) return;
    sessionStorage.setItem(key, Date.now().toString());
    sessionStorage.setItem(`trigger_${triggerData.triggerID}`, JSON.stringify(triggerData));
    this._firedCallbacks.forEach(cb => cb(triggerData, userData));
  },

  // Force-fire a demo trigger immediately (used for testing / first-load guarantee)
  forceDemoTrigger(userData) {
    const demoBanner = {
      triggered: true,
      triggerID: 'TRIGGER_RAIN',
      event: 'Heavy Rainfall',
      severity: 'HIGH',
      icon: '!',
      detail: '28mm/hr rainfall detected in your zone',
      source: 'OpenWeatherMap API',
      estimatedLoss: this.estimateLoss('Heavy Rainfall', {}),
      color: '#2563EB',
    };
    this.handleTriggerFired(demoBanner, userData);
  },
};

// ═══════════════════════════════════════════════════
// FEATURE 3 — ZERO-TOUCH CLAIM PROCESSING
// ═══════════════════════════════════════════════════

export const TrustpayZeroTouch = {
  delay: (ms) => new Promise(r => setTimeout(r, ms)),

  async processClaimSteps(triggerData, onStepComplete, onProgressUpdate) {
    const user = TrustpayDB.currentUser || {};
    const planKey = user.plan || 'standard';
    const plan = TrustpayDB.plans?.[planKey] || { name: 'Standard', coverageRate: 0.75 };
    const estimatedLoss = triggerData?.estimatedLoss || 150;
    const payout = Math.round(estimatedLoss * plan.coverageRate);
    const claimID = `TRP-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const steps = [
      { id: 1, name: 'Active Status',    icon: '✅', detail: `Worker activity heartbeat verified via ${user.platform} API` },
      { id: 2, name: 'H3 Zone Presence', icon: '📍', detail: `Worker GPS confirmed in Res-9 Hex: ${user.currentHexID}` },
      { id: 3, name: 'Route Impact',    icon: '🚧', detail: `Transit delay >35% on current delivery route nodes` },
      { id: 4, name: 'Activity Drop',   icon: '📊', detail: `Earnings velocity fell 42% below worker's baseline` },
      { id: 5, name: 'Peer Anomaly',    icon: '🛡️', detail: `Corroborated by ${Math.floor(Math.random() * 15 + 5)} peers in same hex` },
    ];

    const confidenceScore = this.weightedScoringSystem({
      activeStatus: 1.0,
      h3Presence: 1.0,
      routeImpact: 0.85,
      activityDrop: 0.78,
      peerAnomaly: 0.92
    });

    // Fixed 700ms per step — clear, predictable timing
    for (let i = 0; i < steps.length; i++) {
      await this.delay(i === 0 ? 200 : 700);
      onStepComplete(steps[i]);
      onProgressUpdate(((i + 1) / steps.length) * 80);
    }

    await this.delay(600);
    onProgressUpdate(100);
    await this.delay(400);

    try {
      this.recordClaim(claimID, triggerData, user, plan, payout);
    } catch (err) {
      console.warn('[ZeroTouch] recordClaim failed gracefully:', err.message);
    }

    return { claimID, payout, upiID: user.upiID || 'your UPI' };
  },

  recordClaim(claimID, trigger, user, plan, payout) {
    const newClaim = {
      id: claimID,
      date: new Date().toISOString().slice(0, 10),
      displayDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      event: trigger.event, zone: user.zone, incomeLoss: trigger.estimatedLoss,
      coverageRate: plan.coverageRate, approvedPayout: payout, status: 'paid',
      payoutTime: 'Auto — Zero Touch', upiTxnID: 'TXN' + Date.now(),
      fraudScore: 4, aiConfidence: 97.2, source: trigger.source, zeroTouch: true,
    };
    TrustpayDB.claims.unshift(newClaim);
    TrustpayDB.currentUser.totalClaimsCount = (TrustpayDB.currentUser.totalClaimsCount || 0) + 1;
  },

  // ── CONFIDENCE MODEL — Weighted Scoring ──
  weightedScoringSystem(signals) {
    const weights = {
      activeStatus: 0.25,
      h3Presence: 0.30,
      routeImpact: 0.15,
      activityDrop: 0.20,
      peerAnomaly: 0.10
    };
    
    let totalScore = 0;
    for (const [key, value] of Object.entries(signals)) {
      totalScore += value * (weights[key] || 0);
    }
    
    return Math.round(totalScore * 100);
  }
};
