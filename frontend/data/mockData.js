export const userData = {
  id: "U-8924",
  name: "Sai Kumar Reddy",
  city: "Hyderabad",
  avatarInitials: "SK",
  memberSince: "Feb 2025",
  activeDays: 47,
  platform: "Swiggy",
  vehicle: "2-Wheeler",
  protectionScore: 76,
  earningsProtectedTotal: 14280,
  totalClaims: 8,
  totalPaid: 6840,
  upiId: "sai@paytm",
  phone: "+91 9876543210",
  email: "sai.kumar@example.com",
};

export const activePolicy = {
  planName: "Standard Plan",
  pricePerWeek: 35,
  coverageLimit: 1500,
  nextBilling: "Jul 5, 2025",
  zones: ["Kondapur", "Gachibowli", "HITEC City"],
  isActive: true,
};

export const weeklyEarnings = [
  { day: "Mon", actual: 1240, protected: 1240 },
  { day: "Tue", actual: 980, protected: 980 },
  { day: "Wed", actual: 1560, protected: 1560 },
  { day: "Thu", actual: 720, protected: 1100 }, // Rain disruption
  { day: "Fri", actual: 1890, protected: 1890 },
  { day: "Sat", actual: 1340, protected: 1340 },
  { day: "Sun", actual: 2100, protected: 2100 },
];

export const claimsHistory = [
  { id: "C-1481", date: "Jun 24", event: "Heavy Rain", loss: 680, payout: 510, status: "Paid" },
  { id: "C-1432", date: "Jun 21", event: "Heatwave", loss: 420, payout: 315, status: "Paid" },
  { id: "C-1405", date: "Jun 18", event: "Road Block", loss: 250, payout: 188, status: "Processing" },
  { id: "C-1342", date: "Jun 12", event: "Heavy Rain", loss: 890, payout: 668, status: "Paid" },
  { id: "C-1290", date: "Jun 8", event: "Storm", loss: 340, payout: 255, status: "Paid" },
];

export const adminData = {
  totalUsers: { value: "12,847", growth: "+8.3%" },
  activePolicies: { value: "9,234", percent: "71.8%" },
  claimsThisMonth: { value: "1,456", avgPayout: "₹387" },
  fraudPrevented: { value: "₹2.3L", cases: 47 },
  platformRevenue: { value: "₹18.4L", timeline: "this month" },
};

export const adminClaimsTrend = [
  { day: "1", filed: 45, approved: 42 },
  { day: "5", filed: 52, approved: 48 },
  { day: "10", filed: 120, approved: 110 }, // Weather event
  { day: "15", filed: 58, approved: 50 },
  { day: "20", filed: 65, approved: 58 },
  { day: "25", filed: 180, approved: 165 }, // Weather event
  { day: "30", filed: 48, approved: 45 },
];

export const adminFraudAlerts = [
  { id: "U-4821", name: "Ramesh K.", city: "Hyderabad", flag: "GPS Mismatch", score: 91 },
  { id: "U-2934", name: "Anil S.", city: "Mumbai", flag: "Duplicate Claim", score: 87 },
  { id: "U-7102", name: "Suresh M.", city: "Chennai", flag: "Velocity Fraud", score: 94 },
];
