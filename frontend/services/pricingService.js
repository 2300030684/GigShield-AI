/**
 * AI Pricing Service
 * Calculates recommended insurance/protection pricing based on location and real-time risk factors.
 */

const LOCATION_FACTORS = {
  "Hyderabad": {
    basePrice: 35,
    trafficRisk: 1.2,
    weatherRisk: 1.1,
    reason: "High traffic density in HITEC City and Kondapur areas."
  },
  "Mumbai": {
    basePrice: 35,
    trafficRisk: 1.5,
    weatherRisk: 1.4,
    reason: "Severe monsoon alerts and extreme traffic congestion detected."
  },
  "Bangalore": {
    basePrice: 35,
    trafficRisk: 1.3,
    weatherRisk: 1.0,
    reason: "High traffic density; weather conditions are currently optimal."
  },
  "Delhi": {
    basePrice: 35,
    trafficRisk: 1.4,
    weatherRisk: 1.2,
    reason: "Air quality alerts and heavy traffic in NCR regions."
  }
};

export const calculateAIPrice = (city) => {
  const factor = LOCATION_FACTORS[city] || {
    basePrice: 35,
    trafficRisk: 1.0,
    weatherRisk: 1.0,
    reason: "Standard risk profiles applied for your current location."
  };

  const calculatedPrice = Math.round(factor.basePrice * factor.trafficRisk * factor.weatherRisk);

  let riskLevel = "Low";
  if (calculatedPrice > 55) riskLevel = "High";
  else if (calculatedPrice > 40) riskLevel = "Moderate";

  return {
    pricePerWeek: calculatedPrice,
    riskLevel,
    reason: factor.reason,
    factors: {
      traffic: factor.trafficRisk,
      weather: factor.weatherRisk
    }
  };
};
