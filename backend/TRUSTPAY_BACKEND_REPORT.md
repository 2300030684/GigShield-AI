# TRUSTPAY: AI-Powered Parametric Backend Upgrade Report

This report defines the technical roadmap to transition the current **Trustpay** Spring Boot backend into a production-level, AI-driven parametric insurance engine.

---

## 1. Core Advancement: H3 Geospatial Grid System
Traditional city-level tracking is replaced with **Uber H3 Hexagonal Indexing** for street-level precision.

### Implementation Requirements:
- **Library**: Integrate `h3-java` (for Spring Boot) or `h3-py` (if using a sidecar Python ML service).
- **Resolution**: Use **Resolution 9** (approx. 0.1 km²) for worker tracking and **Resolution 8** for broader disruption events.
- **Data Flow**:
  1. Frontend sends GPS (Lat/Lng).
  2. Backend converts to H3 Index: `String h3Index = H3Core.newInstance().geoToH3Address(lat, lng, 9);`
  3. Store `h3_index` in `worker_activity_logs` and `active_disruptions` tables.

---

## 2. Real-Time Disruption Engine (Ingestion Layer)
A scheduled ingestion service to pull environmental "Triggers" from external APIs.

### Ingestion Pipeline:
- **Weather (OpenWeatherMap)**: Every 10 mins. If `rain_intensity` > 15mm/hr → Flag hexes as "Disrupted".
- **AQI (AirVisual/OpenAQ)**: Every 30 mins. If `aqi` > 300 → Flag hexes as "Disrupted".
- **Traffic (TomTom/Google Maps)**: Real-time. If `delay_index` > 2.5 vs baseline → Flag hexes as "Disrupted".

### Database Schema (New Table):
```sql
CREATE TABLE disruption_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_type VARCHAR(50), -- RAIN, AQI, TRAFFIC, SHUTDOWN
    h3_index VARCHAR(15) INDEX,
    intensity_value FLOAT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

---

## 3. Parametric Trigger Logic
The engine fires when the "Matching Condition" is met.

### Logic Flow:
```pseudo
FOR EACH active_worker in system:
    worker_hex = get_latest_hex(worker_id)
    IF EXISTS(disruption_event WHERE h3_index == worker_hex AND is_active == TRUE):
        INITIATE_CLAIM_EVALUATION(worker_id, disruption_id)
```

---

## 4. AI Verification Layer (5-Signal System)
A dedicated service to validate claims without human adjusters.

| Signal | Logic / Check |
| :--- | :--- |
| **Active Status** | Cross-reference with Swiggy/Zomato OAuth activity state during the event window. |
| **H3 Zone Presence** | Verify GPS pings confirmed the worker stayed within the disrupted hex for >30 mins. |
| **Route Impact** | Compare "Actual Delivery Time" vs "Expected Delivery Time" for that hex. |
| **Activity Drop** | Check if orders-per-hour dropped by >30% compared to the worker's average for that day/time. |
| **Peer Anomaly** | Check if >60% of other workers in the *same* H3 cell also saw an earnings drop. |

---

## 5. Automated Payout Engine
Once the AI Verification score exceeds **85%**, the payout is triggered.

- **Calculation**: `Payout = (Base_Hourly_Rate * Disruption_Hours) * Coverage_Multiplier`
- **Disbursement**: Send `POST` to Payment Gateway (Razorpay/PayTM) or update `wallet_balance` in MySQL.
- **Ledger**: Record all payouts in a `transactions` table with a `parametric_payout` flag.

---

## 6. Machine Learning Models (AI Layer)

### Model 1: Dynamic Premium Prediction
- **Goal**: Adjust the weekly premium based on the upcoming risk.
- **Inputs**: (Worker Home Zone, Historical Disruption Frequency, Forecasted Weather, Vehicle Type).
- **Execution**: Run weekly on Sunday midnight to set the `next_week_premium`.

### Model 2: Fraud/Confidence Scoring
- **Goal**: Combine the 5 signals into a single approval probability.
- **Logic**: Weighted scoring or a Simple Random Forest classifier.

---

## 7. Recommended API Design (New Endpoints)

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/disruptions/live` | `GET` | Returns list of currently disrupted H3 hexes. |
| `/api/worker/zone` | `POST` | Updates worker's current H3 index from GPS. |
| `/api/claim/evaluate` | `POST` | Triggers the 5-signal AI verification for a specific event. |
| `/api/premium/calculate`| `GET` | Returns the dynamic premium for a specific user profile. |
| `/api/simulate/rain` | `POST` | **Developer Tool**: Manually injects a heavy rain event into specific hexes. |

---

## 8. Database Migration Summary
Add the following tables to the existing MySQL schema:
1. `h3_zones`: Central registry of city hexes and their risk scores.
2. `disruption_events`: Active and historical environmental disruptions.
3. `worker_zone_logs`: Time-series data of worker H3 locations.
4. `claims`: Records of auto-generated claims and their AI scores.
5. `transactions`: Financial ledger for all premiums and payouts.

---
> [!IMPORTANT]
> The frontend is already prepared to consume these endpoints via `api.js`. This backend upgrade will enable "Real-Time" mode by simply toggling the `MOCK_MODE` flag to `false` in the frontend configuration.
