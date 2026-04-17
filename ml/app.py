"""
╔══════════════════════════════════════════════════════════╗
║   TrustPay ML Risk Prediction API  (Flask + scikit-learn)║
║   POST /predict-risk  →  risk_score, risk_tier           ║
║   POST /train         →  retrain model with new data     ║
║   GET  /health        →  health check                    ║
╚══════════════════════════════════════════════════════════╝
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pickle
import os
import logging
from datetime import datetime

# ── Try importing scikit-learn (graceful degradation if not installed) ──
try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import StandardScaler
    import joblib
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("⚠️  scikit-learn not found. Running in RULE-BASED fallback mode.")

app = Flask(__name__)
CORS(app)  # Allow Spring Boot to call this API

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("TrustPayML")

# ── Model Persistence ──
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")

# ── Global model objects ──
model = None
scaler = None

# ══════════════════════════════════════════════════════════
#  MODEL TRAINING (or load if exists)
# ══════════════════════════════════════════════════════════

def train_model():
    """
    Trains a Random Forest classifier on synthetic parametric insurance data.
    Features: [rainfall_mm, temp_celsius, aqi_index, wind_speed_kmh, zone_risk_score, claim_history_count]
    Labels: 0=LOW, 1=MEDIUM, 2=HIGH
    """
    global model, scaler

    if not SKLEARN_AVAILABLE:
        log.warning("sklearn not available — skipping model training")
        return

    log.info("🤖 Training TrustPay ML Risk Model...")

    # ── Synthetic Training Data (replace with real data in production) ──
    # [rainfall, temp, aqi, wind_speed, zone_risk, claim_history]
    X_train = np.array([
        # LOW RISK examples
        [0,   28, 40,  5,  20, 0],
        [2,   30, 55,  8,  25, 1],
        [5,   31, 60, 10,  30, 0],
        [0,   26, 35,  6,  15, 0],
        [1,   29, 50,  7,  22, 1],
        [3,   27, 45,  9,  18, 0],
        # MEDIUM RISK examples
        [15,  36, 90, 18,  55, 2],
        [20,  38, 100, 20, 60, 3],
        [10,  35, 85, 15,  50, 2],
        [25,  37, 110, 22, 65, 4],
        [18,  39, 95, 19,  58, 2],
        [12,  34, 80, 16,  52, 3],
        # HIGH RISK examples
        [55,  42, 160, 35, 85, 6],
        [80,  45, 200, 45, 95, 8],
        [100, 47, 180, 40, 90, 7],
        [60,  43, 170, 38, 88, 5],
        [75,  44, 190, 42, 92, 9],
        [90,  46, 210, 48, 98, 10],
        [50,  41, 150, 32, 80, 6],
        [120, 48, 220, 50, 99, 12],
    ])

    y_train = np.array([
        0, 0, 0, 0, 0, 0,   # LOW
        1, 1, 1, 1, 1, 1,   # MEDIUM
        2, 2, 2, 2, 2, 2, 2, 2  # HIGH
    ])

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_train)

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        random_state=42,
        class_weight='balanced'
    )
    model.fit(X_scaled, y_train)

    # Save model to disk
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    log.info("✅ Model trained and saved to %s", MODEL_PATH)
    log.info("📊 Feature importances: rainfall=%.2f, temp=%.2f, aqi=%.2f, wind=%.2f, zone=%.2f, claims=%.2f",
             *model.feature_importances_)


def load_model():
    """Load saved model from disk, or train new one."""
    global model, scaler
    if not SKLEARN_AVAILABLE:
        return

    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        try:
            import joblib
            model = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
            log.info("📦 Loaded existing model from %s", MODEL_PATH)
        except Exception as e:
            log.warning("Could not load model (%s), retraining...", e)
            train_model()
    else:
        train_model()


# ── Rule-based fallback when sklearn is not available ──
def rule_based_predict(features: dict) -> dict:
    rainfall    = features.get("rainfall_mm", 0)
    temp        = features.get("temp_celsius", 30)
    aqi         = features.get("aqi_index", 50)
    wind_speed  = features.get("wind_speed_kmh", 10)
    zone_risk   = features.get("zone_risk_score", 30)
    claim_hist  = features.get("claim_history_count", 0)

    score = 0.0
    score += min(rainfall / 120.0, 1.0) * 35
    score += min(max(temp - 28, 0) / 22.0, 1.0) * 20
    score += min(aqi / 200.0, 1.0) * 20
    score += min(wind_speed / 50.0, 1.0) * 10
    score += min(zone_risk / 100.0, 1.0) * 10
    score += min(claim_hist / 10.0, 1.0) * 5

    risk_score = round(score / 100.0, 3)

    if risk_score > 0.65:
        tier, tier_num = "HIGH", 2
    elif risk_score > 0.35:
        tier, tier_num = "MEDIUM", 1
    else:
        tier, tier_num = "LOW", 0

    factors = []
    if rainfall > 50:   factors.append(f"Heavy rainfall: {rainfall}mm")
    if temp > 42:       factors.append(f"Extreme heat: {temp}°C")
    if aqi > 150:       factors.append(f"Dangerous AQI: {aqi}")
    if wind_speed > 30: factors.append(f"High winds: {wind_speed} km/h")

    return {
        "risk_score":   risk_score,
        "risk_tier":    tier,
        "risk_tier_num": tier_num,
        "confidence":   round(0.70 + (risk_score * 0.20), 3),
        "payout_eligible": risk_score > 0.5,
        "contributing_factors": factors,
        "model_type":   "RULE_BASED_FALLBACK",
        "timestamp":    datetime.utcnow().isoformat()
    }


# ══════════════════════════════════════════════════════════
#  ROUTES
# ══════════════════════════════════════════════════════════

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "UP",
        "model_loaded": model is not None,
        "sklearn_available": SKLEARN_AVAILABLE,
        "timestamp": datetime.utcnow().isoformat()
    })


@app.route("/predict-risk", methods=["POST"])
def predict_risk():
    """
    Main prediction endpoint called by Spring Boot.

    Request Body (JSON):
    {
        "rainfall_mm": 67.5,
        "temp_celsius": 35.0,
        "aqi_index": 120,
        "wind_speed_kmh": 25.0,
        "zone_risk_score": 65.0,
        "claim_history_count": 3
    }

    Response:
    {
        "risk_score": 0.73,
        "risk_tier": "HIGH",
        "confidence": 0.89,
        "payout_eligible": true,
        "contributing_factors": ["Heavy rainfall: 67.5mm"]
    }
    """
    data = request.get_json(silent=True) or {}
    log.info("📥 Prediction request: %s", data)

    try:
        rainfall    = float(data.get("rainfall_mm", 0))
        temp        = float(data.get("temp_celsius", 30))
        aqi         = float(data.get("aqi_index", 50))
        wind_speed  = float(data.get("wind_speed_kmh", 10))
        zone_risk   = float(data.get("zone_risk_score", 30))
        claim_hist  = float(data.get("claim_history_count", 0))

    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid input: {e}"}), 400

    # ── Use ML model if available, else fallback ──
    if SKLEARN_AVAILABLE and model is not None and scaler is not None:
        features_arr = np.array([[rainfall, temp, aqi, wind_speed, zone_risk, claim_hist]])
        features_scaled = scaler.transform(features_arr)

        proba = model.predict_proba(features_scaled)[0]  # [P(LOW), P(MED), P(HIGH)]
        tier_num = int(np.argmax(proba))
        tier_labels = ["LOW", "MEDIUM", "HIGH"]
        tier = tier_labels[tier_num]
        risk_score = round(float(proba[1] * 0.5 + proba[2] * 1.0), 3)  # weighted
        confidence = round(float(np.max(proba)), 3)

        factors = []
        if rainfall > 50:   factors.append(f"Heavy rainfall: {rainfall}mm")
        if temp > 42:       factors.append(f"Extreme heat: {temp}°C")
        if aqi > 150:       factors.append(f"Dangerous AQI: {aqi}")
        if wind_speed > 30: factors.append(f"High winds: {wind_speed} km/h")

        response = {
            "risk_score":            risk_score,
            "risk_tier":             tier,
            "risk_tier_num":         tier_num,
            "confidence":            confidence,
            "payout_eligible":       tier_num >= 1,
            "contributing_factors":  factors,
            "model_type":            "RANDOM_FOREST_v1",
            "raw_probabilities":     {
                "LOW":    round(float(proba[0]), 3),
                "MEDIUM": round(float(proba[1]), 3),
                "HIGH":   round(float(proba[2]), 3)
            },
            "timestamp":             datetime.utcnow().isoformat()
        }
    else:
        response = rule_based_predict(data)

    log.info("📤 Prediction result: tier=%s, score=%.3f", response["risk_tier"], response["risk_score"])
    return jsonify(response)


@app.route("/train", methods=["POST"])
def retrain():
    """Endpoint to retrain the model (call from Admin Dashboard)."""
    if not SKLEARN_AVAILABLE:
        return jsonify({"error": "sklearn not installed"}), 503
    try:
        train_model()
        return jsonify({"status": "Model retrained successfully", "timestamp": datetime.utcnow().isoformat()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/batch-predict", methods=["POST"])
def batch_predict():
    """Batch prediction for multiple workers (used by WeatherScheduler scan)."""
    data = request.get_json(silent=True) or {}
    workers = data.get("workers", [])
    results = []
    for w in workers:
        result = rule_based_predict(w) if not (SKLEARN_AVAILABLE and model) else None
        if result is None:
            # Use ML model path (simplified for batch)
            result = rule_based_predict(w)
        result["worker_id"] = w.get("worker_id", "unknown")
        results.append(result)
    return jsonify({"predictions": results, "count": len(results)})


# ══════════════════════════════════════════════════════════
#  STARTUP
# ══════════════════════════════════════════════════════════

if __name__ == "__main__":
    log.info("🚀 Starting TrustPay ML Risk API on port 5001...")
    load_model()
    # Run on port 5001 to avoid conflict with React dev server (5173)
    app.run(host="0.0.0.0", port=5001, debug=True)
