
// ── TRUSTPAY DATABASE — SINGLE SOURCE OF TRUTH ──

export const TrustpayDB = {

  // ── CURRENT LOGGED-IN USER ──
  currentUser: {
    id: "USR-2025-0847",
    name: "Sai Kumar Reddy",
    phone: "+91 98765 43210",
    email: "sai.kumar@gmail.com",
    city: "Hyderabad",
    zone: "Kondapur",
    pincode: "500084",
    coordinates: { lat: 17.4726, lng: 78.3572 },
    platform: "Swiggy",
    vehicleType: "2-Wheeler",
    workerID: "SWG-HYD-20847",
    aadhaarVerified: true,
    memberSince: "2025-02-14",
    activeDays: 134,
    upiID: "sai.kumar@paytm",
    avatar: "SK",
    plan: "standard",
    planActivatedOn: "2025-02-14",
    nextBilling: "2025-07-05",
    protectionScore: 76,
    totalEarningsProtected: 14280,
    totalClaimsPaid: 6840,
    totalClaimsCount: 8,
    premiumPaidToDate: 1820,   // 52 weeks × ₹35
    claimReturnRatio: 3.76,    // ₹6840 returned / ₹1820 paid
    rewardsBalance: 450,        // Loyalty credits
    currentHexID: '8a2a1072b59ffff',
  },

  // ── PLANS (single source of truth) ──
  plans: {
    lite: {
      id: "lite",
      name: "Lite",
      weeklyPremium: 20,
      annualPremium: 1040,
      maxWeeklyCoverage: 800,
      maxMonthlyCoverage: 3200,
      coverageRate: 0.60,
      events: ["Heavy Rain", "Storm"],
      claimsPerMonth: 3,
      payoutTime: "2 hours",
      features: ["Basic weather coverage", "UPI payout", "App alerts"],
      color: "#8899BB",
      recommended: false,
    },
    standard: {
      id: "standard",
      name: "Standard",
      weeklyPremium: 35,
      annualPremium: 1820,
      maxWeeklyCoverage: 1500,
      maxMonthlyCoverage: 6000,
      coverageRate: 0.75,
      events: ["Heavy Rain", "Storm", "Heatwave", "Road Block"],
      claimsPerMonth: 8,
      payoutTime: "45 minutes",
      features: ["Everything in Lite", "AI risk alerts", "Zone recommendations", "Priority support"],
      color: "#00E0FF",
      recommended: true,
    },
    pro: {
      id: "pro",
      name: "Pro",
      weeklyPremium: 50,
      annualPremium: 2600,
      maxWeeklyCoverage: 3000,
      maxMonthlyCoverage: 12000,
      coverageRate: 0.90,
      events: ["Heavy Rain", "Storm", "Heatwave", "Road Block", "Flood", "Custom"],
      claimsPerMonth: 999,
      payoutTime: "15 minutes",
      features: ["Everything in Standard", "Fraud guarantee", "Account manager", "Income forecasting"],
      color: "#FFD166",
      recommended: false,
    }
  },

  // ── DAILY EARNINGS (last 30 days) ──
  dailyEarnings: [
    { date: "2025-06-01", day: "Sun", earnings: 2100, protected: 0,   weather: "Clear",      risk: "low"    },
    { date: "2025-06-02", day: "Mon", earnings: 1240, protected: 0,   weather: "Clear",      risk: "low"    },
    { date: "2025-06-03", day: "Tue", earnings: 980,  protected: 315, weather: "Heavy Rain", risk: "high"   },
    { date: "2025-06-04", day: "Wed", earnings: 1560, protected: 0,   weather: "Cloudy",     risk: "medium" },
    { date: "2025-06-05", day: "Thu", earnings: 720,  protected: 450, weather: "Storm",      risk: "high"   },
    { date: "2025-06-06", day: "Fri", earnings: 1890, protected: 0,   weather: "Clear",      risk: "low"    },
    { date: "2025-06-07", day: "Sat", earnings: 1340, protected: 0,   weather: "Cloudy",     risk: "medium" },
    { date: "2025-06-08", day: "Sun", earnings: 940,  protected: 255, weather: "Heavy Rain", risk: "high"   },
    { date: "2025-06-09", day: "Mon", earnings: 1680, protected: 0,   weather: "Clear",      risk: "low"    },
    { date: "2025-06-10", day: "Tue", earnings: 1420, protected: 0,   weather: "Cloudy",     risk: "medium" },
    { date: "2025-06-11", day: "Wed", earnings: 1750, protected: 0,   weather: "Clear",      risk: "low"    },
    { date: "2025-06-12", day: "Thu", earnings: 590,  protected: 668, weather: "Heavy Rain", risk: "high"   },
    { date: "2025-06-13", day: "Fri", earnings: 1980, protected: 0,   weather: "Clear",      risk: "low"    },
    { date: "2025-06-14", day: "Sat", earnings: 2200, protected: 0,   weather: "Clear",      risk: "low"    },
    { date: "2025-06-15", day: "Sun", earnings: 1870, protected: 0,   weather: "Cloudy",     risk: "medium" },
    { date: "2025-06-16", day: "Mon", earnings: 1320, protected: 0,   weather: "Clear",      risk: "low"    },
    { date: "2025-06-17", day: "Tue", earnings: 1540, protected: 0,   weather: "Cloudy",     risk: "medium" },
    { date: "2025-06-18", day: "Wed", earnings: 1060, protected: 188, weather: "Road Block", risk: "medium" },
    { date: "2025-06-19", day: "Thu", earnings: 1730, protected: 0,   weather: "Clear",      risk: "low"    },
    { date: "2025-06-20", day: "Fri", earnings: 1950, protected: 0,   weather: "Clear",      risk: "low"    },
    { date: "2025-06-21", day: "Sat", earnings: 980,  protected: 315, weather: "Heatwave",   risk: "high"   },
    { date: "2025-06-22", day: "Sun", earnings: 2050, protected: 0,   weather: "Clear",      risk: "low"    },
    { date: "2025-06-23", day: "Mon", earnings: 1460, protected: 0,   weather: "Cloudy",     risk: "medium" },
    { date: "2025-06-24", day: "Tue", earnings: 770,  protected: 510, weather: "Heavy Rain", risk: "high"   },
    { date: "2025-06-25", day: "Wed", earnings: 1610, protected: 0,   weather: "Clear",      risk: "low"    },
    { date: "2025-06-26", day: "Thu", earnings: 1800, protected: 0,   weather: "Cloudy",     risk: "medium" },
    { date: "2025-06-27", day: "Fri", earnings: 1920, protected: 0,   weather: "Clear",      risk: "low"    },
    { date: "2025-06-28", day: "Sat", earnings: 640,  protected: 338, weather: "Heavy Rain", risk: "high"   },
  ],

  // ── CLAIM HISTORY (connected to dailyEarnings) ──
  claims: [
    {
      id: "TRP-2025-06-28-0847",
      date: "2025-06-28",
      displayDate: "Jun 28, 2025",
      event: "Heavy Rain",
      zone: "Kondapur",
      coordinates: { lat: 17.4726, lng: 78.3572 },
      weatherIntensity: "47mm/hr",
      hoursAffected: 2.4,
      expectedEarnings: 920,
      actualEarnings: 640,
      incomeLoss: 450,
      coverageRate: 0.75,
      approvedPayout: 338,
      status: "paid",
      payoutTime: "52 seconds",
      upiTxnID: "TXN2025062800487",
      fraudScore: 4,
      aiConfidence: 97.4,
      plan: "standard",
    },
    {
      id: "TRP-2025-06-24-0612",
      date: "2025-06-24",
      displayDate: "Jun 24, 2025",
      event: "Heavy Rain",
      zone: "Gachibowli",
      coordinates: { lat: 17.4401, lng: 78.3489 },
      weatherIntensity: "39mm/hr",
      hoursAffected: 1.8,
      expectedEarnings: 1100,
      actualEarnings: 770,
      incomeLoss: 680,
      coverageRate: 0.75,
      approvedPayout: 510,
      status: "paid",
      payoutTime: "44 seconds",
      upiTxnID: "TXN2025062400612",
      fraudScore: 3,
      aiConfidence: 98.1,
      plan: "standard",
    },
    {
      id: "TRP-2025-06-21-0389",
      date: "2025-06-21",
      displayDate: "Jun 21, 2025",
      event: "Heatwave",
      zone: "Kondapur",
      coordinates: { lat: 17.4726, lng: 78.3572 },
      weatherIntensity: "44°C",
      hoursAffected: 3.0,
      expectedEarnings: 680,
      actualEarnings: 980,
      incomeLoss: 420,
      coverageRate: 0.75,
      approvedPayout: 315,
      status: "paid",
      payoutTime: "61 seconds",
      upiTxnID: "TXN2025062100389",
      fraudScore: 6,
      aiConfidence: 95.8,
      plan: "standard",
    },
    {
      id: "TRP-2025-06-18-0201",
      date: "2025-06-18",
      displayDate: "Jun 18, 2025",
      event: "Road Block",
      zone: "Madhapur",
      coordinates: { lat: 17.4485, lng: 78.3908 },
      weatherIntensity: "N/A",
      hoursAffected: 1.2,
      expectedEarnings: 680,
      actualEarnings: 1060,
      incomeLoss: 250,
      coverageRate: 0.75,
      approvedPayout: 188,
      status: "processing",
      payoutTime: null,
      upiTxnID: null,
      fraudScore: 12,
      aiConfidence: 91.2,
      plan: "standard",
    },
    {
      id: "TRP-2025-06-12-0094",
      date: "2025-06-12",
      displayDate: "Jun 12, 2025",
      event: "Heavy Rain",
      zone: "HITEC City",
      coordinates: { lat: 17.4474, lng: 78.3762 },
      weatherIntensity: "52mm/hr",
      hoursAffected: 3.1,
      expectedEarnings: 1100,
      actualEarnings: 590,
      incomeLoss: 890,
      coverageRate: 0.75,
      approvedPayout: 668,
      status: "paid",
      payoutTime: "38 seconds",
      upiTxnID: "TXN2025061200094",
      fraudScore: 2,
      aiConfidence: 99.1,
      plan: "standard",
    },
    {
      id: "TRP-2025-06-08-0047",
      date: "2025-06-08",
      displayDate: "Jun 8, 2025",
      event: "Storm",
      zone: "Kondapur",
      coordinates: { lat: 17.4726, lng: 78.3572 },
      weatherIntensity: "Cat-1",
      hoursAffected: 2.0,
      expectedEarnings: 920,
      actualEarnings: 940,
      incomeLoss: 340,
      coverageRate: 0.75,
      approvedPayout: 255,
      status: "paid",
      payoutTime: "49 seconds",
      upiTxnID: "TXN2025060800047",
      fraudScore: 5,
      aiConfidence: 96.7,
      plan: "standard",
    },
    {
      id: "TRP-2025-06-05-0031",
      date: "2025-06-05",
      displayDate: "Jun 5, 2025",
      event: "Storm",
      zone: "Gachibowli",
      coordinates: { lat: 17.4401, lng: 78.3489 },
      weatherIntensity: "Cat-2",
      hoursAffected: 2.8,
      expectedEarnings: 540,
      actualEarnings: 720,
      incomeLoss: 450,
      coverageRate: 0.75,
      approvedPayout: 338,
      status: "paid",
      payoutTime: "55 seconds",
      upiTxnID: "TXN2025060500031",
      fraudScore: 7,
      aiConfidence: 94.3,
      plan: "standard",
    },
    {
      id: "TRP-2025-06-03-0018",
      date: "2025-06-03",
      displayDate: "Jun 3, 2025",
      event: "Heavy Rain",
      zone: "Kondapur",
      coordinates: { lat: 17.4726, lng: 78.3572 },
      weatherIntensity: "31mm/hr",
      hoursAffected: 1.5,
      expectedEarnings: 680,
      actualEarnings: 980,
      incomeLoss: 420,
      coverageRate: 0.75,
      approvedPayout: 315,
      status: "paid",
      payoutTime: "41 seconds",
      upiTxnID: "TXN2025060300018",
      fraudScore: 3,
      aiConfidence: 97.9,
      plan: "standard",
    },
  ],

  // ── PREMIUM PAYMENT HISTORY (connected to plan cost) ──
  premiumPayments: [
    { week: "W52", date: "2025-06-23", amount: 35, plan: "standard", status: "paid", txnID: "PMT-0052" },
    { week: "W51", date: "2025-06-16", amount: 35, plan: "standard", status: "paid", txnID: "PMT-0051" },
    { week: "W50", date: "2025-06-09", amount: 35, plan: "standard", status: "paid", txnID: "PMT-0050" },
    { week: "W49", date: "2025-06-02", amount: 35, plan: "standard", status: "paid", txnID: "PMT-0049" },
    { week: "W48", date: "2025-05-26", amount: 35, plan: "standard", status: "paid", txnID: "PMT-0048" },
    { week: "W47", date: "2025-05-19", amount: 35, plan: "standard", status: "paid", txnID: "PMT-0047" },
    { week: "W46", date: "2025-05-12", amount: 35, plan: "standard", status: "paid", txnID: "PMT-0046" },
    { week: "W45", date: "2025-05-05", amount: 35, plan: "standard", status: "paid", txnID: "PMT-0045" },
  ],

  // ── ZONE RISK DATA (drives AI predictions) ──
  zoneRiskMap: {
    "Kondapur":    { riskScore: 72, floodRisk: "high",   heatRisk: "medium", avgClaims: 3.2, safeHours: "7AM-12PM" },
    "Gachibowli":  { riskScore: 65, floodRisk: "medium", heatRisk: "medium", avgClaims: 2.8, safeHours: "8AM-1PM"  },
    "HITEC City":  { riskScore: 68, floodRisk: "high",   heatRisk: "low",    avgClaims: 3.0, safeHours: "7AM-11AM" },
    "Madhapur":    { riskScore: 58, floodRisk: "medium", heatRisk: "medium", avgClaims: 2.4, safeHours: "9AM-2PM"  },
    "Banjara Hills":{ riskScore: 41, floodRisk: "low",   heatRisk: "low",    avgClaims: 1.6, safeHours: "Any time" },
    "Jubilee Hills":{ riskScore: 38, floodRisk: "low",   heatRisk: "low",    avgClaims: 1.4, safeHours: "Any time" },
    "Kukatpally":  { riskScore: 81, floodRisk: "high",   heatRisk: "high",   avgClaims: 4.1, safeHours: "6AM-10AM" },
    "Secunderabad":{ riskScore: 55, floodRisk: "medium", heatRisk: "medium", avgClaims: 2.2, safeHours: "8AM-12PM" },
  },

  // ── HOURLY RISK TODAY (drives AI timeline) ──
  hourlyRiskToday: [
    { hour: "6AM",  risk: 18, level: "low",    reason: "Clear skies" },
    { hour: "7AM",  risk: 22, level: "low",    reason: "Clear skies" },
    { hour: "8AM",  risk: 25, level: "low",    reason: "Clear skies" },
    { hour: "9AM",  risk: 30, level: "low",    reason: "Partly cloudy" },
    { hour: "10AM", risk: 35, level: "low",    reason: "Partly cloudy" },
    { hour: "11AM", risk: 42, level: "medium", reason: "Cloud buildup" },
    { hour: "12PM", risk: 48, level: "medium", reason: "Humidity rising" },
    { hour: "1PM",  risk: 52, level: "medium", reason: "Heat peak" },
    { hour: "2PM",  risk: 58, level: "medium", reason: "Heat 40°C" },
    { hour: "3PM",  risk: 65, level: "medium", reason: "Heat 42°C" },
    { hour: "4PM",  risk: 72, level: "high",   reason: "Rain clouds forming" },
    { hour: "5PM",  risk: 84, level: "high",   reason: "Heavy rain likely" },
    { hour: "6PM",  risk: 91, level: "high",   reason: "Storm warning active" },
    { hour: "7PM",  risk: 88, level: "high",   reason: "Heavy rain ongoing" },
    { hour: "8PM",  risk: 74, level: "high",   reason: "Rain reducing" },
    { hour: "9PM",  risk: 55, level: "medium", reason: "Light rain" },
    { hour: "10PM", risk: 38, level: "low",    reason: "Clearing up" },
    { hour: "11PM", risk: 25, level: "low",    reason: "Clear" },
  ],

  // ── AI FORECAST NEXT 7 DAYS ──
  forecastData: [
    { date: "Jun 29", day: "Sun", expectedEarnings: 1800, protectedFloor: 1080, riskLevel: "low",    weather: "Clear"      },
    { date: "Jun 30", day: "Mon", expectedEarnings: 1400, protectedFloor: 840,  riskLevel: "medium", weather: "Cloudy"     },
    { date: "Jul 1",  day: "Tue", expectedEarnings: 900,  protectedFloor: 675,  riskLevel: "high",   weather: "Heavy Rain" },
    { date: "Jul 2",  day: "Wed", expectedEarnings: 1600, protectedFloor: 960,  riskLevel: "low",    weather: "Clear"      },
    { date: "Jul 3",  day: "Thu", expectedEarnings: 1100, protectedFloor: 825,  riskLevel: "high",   weather: "Storm"      },
    { date: "Jul 4",  day: "Fri", expectedEarnings: 1900, protectedFloor: 1140, riskLevel: "low",    weather: "Clear"      },
    { date: "Jul 5",  day: "Sat", expectedEarnings: 2100, protectedFloor: 1260, riskLevel: "low",    weather: "Clear"      },
  ],

  // ── ADMIN / PLATFORM DATA ──
  adminMetrics: {
    totalUsers: 12847,
    activePolices: 9234,
    activationRate: 71.8,
    claimsThisMonth: 1456,
    avgPayoutAmount: 387,
    totalPayoutsThisMonth: 563772,
    fraudPrevented: 230000,
    fraudCases: 47,
    platformRevenue: 1840000,
    monthlyGrowth: 8.3,
    cityBreakdown: [
      { city: "Hyderabad", users: 3840, claims: 421, fraud: 12, revenue: 537600  },
      { city: "Bengaluru", users: 3210, claims: 389, fraud: 9,  revenue: 449400  },
      { city: "Mumbai",    users: 2180, claims: 298, fraud: 11, revenue: 305200  },
      { city: "Delhi",     users: 1640, claims: 201, fraud: 8,  revenue: 229600  },
      { city: "Chennai",   users: 1120, claims: 147, fraud: 7,  revenue: 156800  },
      { city: "Pune",      users: 857,  claims: 0,   fraud: 0,  revenue: 119980  },
    ],
    claimEventBreakdown: [
      { event: "Heavy Rain", count: 898,  percentage: 61.7, avgPayout: 412 },
      { event: "Heatwave",   count: 335,  percentage: 23.0, avgPayout: 318 },
      { event: "Road Block", count: 218,  percentage: 15.0, avgPayout: 201 },
      { event: "Storm",      count: 5,    percentage: 0.3,  avgPayout: 580 },
    ],
    claimsTrend: [
      { date: "Apr 1",  filed: 28, approved: 24 }, { date: "Apr 8",  filed: 35, approved: 31 },
      { date: "Apr 15", filed: 42, approved: 38 }, { date: "Apr 22", filed: 31, approved: 28 },
      { date: "Apr 29", filed: 55, approved: 49 }, { date: "May 6",  filed: 48, approved: 43 },
      { date: "May 13", filed: 62, approved: 57 }, { date: "May 20", filed: 71, approved: 65 },
      { date: "May 27", filed: 58, approved: 51 }, { date: "Jun 3",  filed: 84, approved: 76 },
      { date: "Jun 10", filed: 91, approved: 83 }, { date: "Jun 17", filed: 78, approved: 71 },
      { date: "Jun 24", filed: 103,approved: 94 },
    ],
    riskDistribution: { low: 45, medium: 38, high: 17 },
    fraudByType: [
      { type: "GPS Mismatch",    count: 20, percentage: 42 },
      { type: "Velocity Fraud",  count: 13, percentage: 28 },
      { type: "Duplicate Claim", count: 9,  percentage: 19 },
      { type: "Other",           count: 5,  percentage: 11 },
    ],
  },

  // ── FRAUD FLAGGED USERS ──
  fraudCases: [
    { id: "U-4821", name: "Ramesh K.",  city: "Hyderabad", issue: "GPS Mismatch",    score: 91, status: "pending", amount: 780,  date: "Jun 26" },
    { id: "U-2934", name: "Anil S.",    city: "Mumbai",    issue: "Duplicate Claim", score: 87, status: "pending", amount: 520,  date: "Jun 25" },
    { id: "U-7102", name: "Suresh M.",  city: "Chennai",   issue: "Velocity Fraud",  score: 94, status: "pending", amount: 640,  date: "Jun 25" },
    { id: "U-3318", name: "Deepak R.",  city: "Delhi",     issue: "GPS Mismatch",    score: 83, status: "review",  amount: 410,  date: "Jun 24" },
    { id: "U-5509", name: "Vinod P.",   city: "Bengaluru", issue: "Velocity Fraud",  score: 79, status: "review",  amount: 890,  date: "Jun 24" },
    { id: "U-6641", name: "Manoj T.",   city: "Pune",      issue: "Duplicate Claim", score: 76, status: "review",  amount: 330,  date: "Jun 23" },
    { id: "U-1122", name: "Raju B.",    city: "Hyderabad", issue: "GPS Mismatch",    score: 88, status: "pending", amount: 560,  date: "Jun 23" },
    { id: "U-8834", name: "Santosh L.", city: "Mumbai",    issue: "Velocity Fraud",  score: 82, status: "review",  amount: 720,  date: "Jun 22" },
  ],

  // ── NEW: WORKER ZONE LOGS (H3 History) ──
  workerZoneLogs: [
    { timestamp: "2025-06-28T16:00:00Z", h3Index: "8a2a1072b59ffff", speed: 22, activity: "active" },
    { timestamp: "2025-06-28T16:15:00Z", h3Index: "8a2a1072b59ffff", speed: 5,  activity: "delivering" },
    { timestamp: "2025-06-28T16:30:00Z", h3Index: "8a2a1072b59ffff", speed: 18, activity: "active" },
  ],

  // ── NEW: PARAMETRIC TRANSACTIONS ──
  transactions: [
    { id: "TXN-7721", date: "2025-06-28", type: "payout", amount: 338, status: "completed", method: "UPI", desc: "Rain Disruption Payout" },
    { id: "TXN-7720", date: "2025-06-23", type: "premium", amount: 35, status: "completed", method: "Wallet", desc: "Weekly Premium W52" },
  ],
};

// ── COMPUTED VALUES (derived from raw data, always in sync) ──

export const TrustpayComputed = {

  // Last 7 days earnings for dashboard chart
  last7DaysEarnings() {
    return TrustpayDB.dailyEarnings.slice(-7);
  },

  // This week's total earnings
  thisWeekEarnings() {
    return TrustpayDB.dailyEarnings.slice(-7).reduce((sum, d) => sum + d.earnings, 0);
  },

  // This week's total protected
  thisWeekProtected() {
    return TrustpayDB.dailyEarnings.slice(-7).reduce((sum, d) => sum + d.protected, 0);
  },

  // Total premium paid (computed from premiumPayments)
  totalPremiumPaid() {
    return TrustpayDB.premiumPayments.reduce((sum, p) => sum + p.amount, 0);
  },

  // Total claims returned
  totalClaimsReturned() {
    return TrustpayDB.claims
      .filter(c => c.status === "paid")
      .reduce((sum, c) => sum + c.approvedPayout, 0);
  },

  // Return ratio (claims paid back / premiums paid)
  returnRatio() {
    const premium = this.totalPremiumPaid();
    if (premium === 0) return 0;
    return (this.totalClaimsReturned() / premium).toFixed(2);
  },

  // Net benefit to user (claims received - premiums paid)
  netBenefit() {
    return this.totalClaimsReturned() - this.totalPremiumPaid();
  },

  // Claim success rate
  claimSuccessRate() {
    const total = TrustpayDB.claims.length;
    if (total === 0) return 0;
    const paid = TrustpayDB.claims.filter(c => c.status === "paid").length;
    return Math.round((paid / total) * 100);
  },

  // Current plan object
  currentPlan() {
    return TrustpayDB.plans[TrustpayDB.currentUser.plan];
  },

  // Weekly coverage remaining
  weeklyClaimedSoFar() {
    const thisWeek = TrustpayDB.claims.filter(c => {
      const claimDate = new Date(c.date);
      const today = new Date("2025-06-28");
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return claimDate >= weekStart;
    });
    return thisWeek.reduce((sum, c) => sum + c.approvedPayout, 0);
  },

  weeklyCoverageRemaining() {
    return this.currentPlan().maxWeeklyCoverage - this.weeklyClaimedSoFar();
  },
};

// ── TRUSTPAY AI MODEL ──

export const TrustpayAI = {

  // ── CORE PAYOUT PREDICTION ──
  predictPayout(userLocation, weatherEvent, userPlan, currentTime) {

    const plan = TrustpayDB.plans[userPlan];
    const hour = currentTime || new Date().getHours();
    const zone = userLocation.zone || TrustpayDB.currentUser.zone;
    const zoneData = TrustpayDB.zoneRiskMap[zone] || TrustpayDB.zoneRiskMap["Kondapur"];

    // STEP 1 — Base earnings by time of day
    const timeProfile = this._getTimeProfile(hour);

    // STEP 2 — Weather impact on earnings
    const weatherImpact = this._getWeatherImpact(weatherEvent);

    // STEP 3 — Zone risk modifier
    const zoneModifier = this._getZoneModifier(zoneData.riskScore);

    // STEP 4 — Calculate income loss
    const expectedEarnings = timeProfile.baseEarnings;
    const impactedEarnings = Math.round(expectedEarnings * weatherImpact.earningsMultiplier * zoneModifier);
    const rawLoss = expectedEarnings - impactedEarnings;
    const incomeLoss = Math.max(rawLoss, 0);

    // STEP 5 — Apply plan coverage
    const coverageRate = plan.coverageRate;
    const rawPayout = incomeLoss * coverageRate;

    // STEP 6 — Cap at weekly remaining coverage
    const weeklyRemaining = TrustpayComputed.weeklyCoverageRemaining();
    const cappedPayout = Math.min(rawPayout, weeklyRemaining);

    // STEP 7 — Add slight variance (±4%) to simulate real AI
    const variance = 1 + (Math.random() * 0.08 - 0.04);
    const finalPayout = Math.round(cappedPayout * variance);

    // STEP 8 — Fraud score
    const fraudScore = this._calculateFraudScore(userLocation, weatherEvent, hour);

    // STEP 9 — AI confidence score
    const confidence = this._calculateConfidence(fraudScore, weatherImpact.certainty, zoneData.riskScore);

    // STEP 10 — Check if claim is valid
    const isValid = incomeLoss > 50 && fraudScore < 40 && plan.events.includes(weatherEvent);

    return {
      zone,
      weatherEvent,
      weatherIntensity: weatherImpact.intensity,
      userPlan: plan.name,
      timeOfDay: timeProfile.label,
      hour,
      expectedEarnings,
      impactedEarnings,
      incomeLoss,
      coverageRate: Math.round(coverageRate * 100),
      planName: plan.name,
      weeklyRemaining,
      rawPayout: Math.round(rawPayout),
      finalPayout: Math.max(finalPayout, 0),
      fraudScore,
      confidence: confidence.toFixed(1),
      zoneRiskScore: zoneData.riskScore,
      weatherCertainty: Math.round(weatherImpact.certainty * 100),
      approved: isValid,
      rejectionReason: !isValid ? this._getRejectionReason(incomeLoss, fraudScore, plan, weatherEvent) : null,
      processingSteps: this._buildProcessingSteps(
        zone, weatherEvent, weatherImpact, expectedEarnings,
        impactedEarnings, incomeLoss, coverageRate, finalPayout,
        fraudScore, plan, confidence
      ),
    };
  },

  _getTimeProfile(hour) {
    if (hour >= 6  && hour < 10) return { label: "Morning Rush",    baseEarnings: 680,  peakFactor: 0.85 };
    if (hour >= 10 && hour < 13) return { label: "Late Morning",    baseEarnings: 820,  peakFactor: 0.90 };
    if (hour >= 13 && hour < 15) return { label: "Lunch Peak",      baseEarnings: 1100, peakFactor: 1.20 };
    if (hour >= 15 && hour < 17) return { label: "Afternoon Lull",  baseEarnings: 540,  peakFactor: 0.70 };
    if (hour >= 17 && hour < 21) return { label: "Evening Peak",    baseEarnings: 1200, peakFactor: 1.30 };
    if (hour >= 21 && hour < 24) return { label: "Late Night",      baseEarnings: 480,  peakFactor: 0.65 };
    return                               { label: "Early Morning",   baseEarnings: 320,  peakFactor: 0.45 };
  },

  _getWeatherImpact(event) {
    const impacts = {
      "Heavy Rain":    { earningsMultiplier: 0.38, certainty: 0.92, intensity: "47mm/hr",   severity: 3 },
      "Storm":         { earningsMultiplier: 0.28, certainty: 0.95, intensity: "Category 2", severity: 4 },
      "Heatwave":      { earningsMultiplier: 0.55, certainty: 0.88, intensity: "44°C",       severity: 3 },
      "Road Block":    { earningsMultiplier: 0.62, certainty: 0.79, intensity: "Major roads", severity: 2 },
      "Moderate Rain": { earningsMultiplier: 0.72, certainty: 0.85, intensity: "18mm/hr",    severity: 2 },
      "Flood":         { earningsMultiplier: 0.18, certainty: 0.97, intensity: "Severe",     severity: 5 },
    };
    return impacts[event] || { earningsMultiplier: 0.85, certainty: 0.70, intensity: "Moderate", severity: 1 };
  },

  _getZoneModifier(riskScore) {
    if (riskScore >= 75) return 0.94;
    if (riskScore >= 55) return 0.97;
    return 1.00;
  },

  _calculateFraudScore(location, weatherEvent, hour) {
    let score = 0;
    if (location.accuracy && location.accuracy > 100) score += 15;
    if (hour >= 1 && hour <= 5) score += 20;
    score += 2;
    const recentClaims = TrustpayDB.claims.filter(c => {
      const days = (new Date("2025-06-28") - new Date(c.date)) / (1000 * 60 * 60 * 24);
      return days <= 7 && c.status !== "rejected";
    }).length;
    if (recentClaims >= 3) score += 15;
    if (recentClaims >= 5) score += 25;
    score += Math.floor(Math.random() * 5);
    return Math.min(score, 100);
  },

  _calculateConfidence(fraudScore, weatherCertainty, zoneRisk) {
    const baseConfidence = 99;
    const fraudPenalty   = fraudScore * 0.18;
    const weatherBonus   = weatherCertainty * 2;
    const zoneAdjust     = zoneRisk > 70 ? 1.5 : 0;
    return Math.min(99.9, Math.max(85, baseConfidence - fraudPenalty + weatherBonus - zoneAdjust));
  },

  _getRejectionReason(incomeLoss, fraudScore, plan, weatherEvent) {
    if (!plan.events.includes(weatherEvent)) return `${weatherEvent} not covered under ${plan.name} Plan`;
    if (fraudScore >= 40) return "Suspicious activity detected — manual review required";
    if (incomeLoss <= 50) return "Income loss below minimum threshold (₹50)";
    return "Claim does not meet coverage criteria";
  },

  _buildProcessingSteps(zone, event, weatherImpact, expected, impacted, loss, coverageRate, payout, fraudScore, plan, confidence) {
    return [
      { id: 1, icon: "📍", title: "Location Verified", detail: `${zone}, Hyderabad — Confirmed`, subDetail: `Coordinates matched to coverage zone`, status: "success", delay: 500 },
      { id: 2, icon: "🌧", title: "Weather Data Fetched", detail: `${event} — Intensity: ${weatherImpact.intensity}`, subDetail: `Source: IMD + OpenWeatherMap | Certainty: ${Math.round(weatherImpact.certainty * 100)}%`, status: "success", delay: 1500 },
      { id: 3, icon: "⚠️", title: "Disruption Confirmed", detail: `${event} event active since 4:32 PM`, subDetail: `Earnings impact multiplier: ${Math.round((1 - weatherImpact.earningsMultiplier) * 100)}% reduction`, status: "success", delay: 2500 },
      { id: 4, icon: "📊", title: "Earnings Impact Calculated", detail: `Expected: ₹${expected} → Actual: ₹${impacted}`, subDetail: `Income loss: ₹${loss} during this period`, status: "success", delay: 3500 },
      { id: 5, icon: "🛡️", title: "Fraud Check Passed", detail: `Fraud score: ${fraudScore}/100 — ${fraudScore < 20 ? "Clean" : fraudScore < 40 ? "Low Risk" : "Review"}`, subDetail: `GPS verified | Order history consistent | No anomalies`, status: fraudScore < 40 ? "success" : "warning", delay: 4500 },
      { id: 6, icon: "💳", title: "Policy Coverage Applied", detail: `${plan.name} Plan: ${Math.round(coverageRate * 100)}% coverage`, subDetail: `Payout = ₹${loss} × ${Math.round(coverageRate * 100)}% = ₹${payout}`, status: "success", delay: 5500 },
    ];
  },

  getDashboardInsight() {
    const weekEarnings = TrustpayComputed.thisWeekEarnings();
    const weekProtected = TrustpayComputed.thisWeekProtected();
    const returnRatio = TrustpayComputed.returnRatio();
    const hour = new Date().getHours();
    const timeLabel = `${hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)}${hour >= 12 ? "PM" : "AM"}`;
    const todayRisk = TrustpayDB.hourlyRiskToday.find(h => h.hour === timeLabel) || TrustpayDB.hourlyRiskToday[10];

    return {
      riskLevel: todayRisk.level.toUpperCase(),
      riskScore: todayRisk.risk,
      riskReason: todayRisk.reason,
      weekEarnings,
      weekProtected,
      returnRatio,
      netBenefit: TrustpayComputed.netBenefit(),
      recommendation: this._getDashboardRecommendation(todayRisk.risk),
    };
  },

  _getDashboardRecommendation(riskScore) {
    if (riskScore >= 75) return "⚠️ High disruption risk today. Stay in Banjara Hills or Jubilee Hills zones.";
    if (riskScore >= 50) return "🌤 Moderate risk. Rain possible after 4 PM. Plan accordingly.";
    return "✅ Low risk day. Good conditions for maximising earnings.";
  },

  getEarningsForecast() {
    return TrustpayDB.forecastData.map(day => ({
      ...day,
      protectedFloor: Math.round(day.expectedEarnings * TrustpayDB.plans[TrustpayDB.currentUser.plan].coverageRate),
      riskColor: day.riskLevel === "high" ? "#FF4D6A" : day.riskLevel === "medium" ? "#FF8C42" : "#00FF9C",
    }));
  },
};
