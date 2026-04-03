# Trustpay Backend System Architecture

This document outlines the 9-layered microservice architecture required to support the **Trustpay AI Geospatial Overhaul**.

## 1. External Data Ingestion Layer
- **Weather Service**: Pull real-time data from OpenWeatherMap/IMD.
- **AQI Service**: Integrate with air pollution monitoring APIs.
- **Civic Service**: Track government-issued curfews, lockdowns, or protests.
- **Traffic Service**: Map-based congestion monitoring for hex-level delays.

## 2. Geospatial Trigger Engine (H3-Based)
- **H3 Indexing**: Implement `h3-js` or `h3-py` to divide cities into Resolution 9/10 hexagons.
- **Spatial Matching**: Match worker GPS traces against "Disrupted Hexagons" in real-time.
- **Parametric Trigger**: Fire a payout signal automatically when `(is_disrupted(hex) && is_active(worker, hex))`.

## 3. Machine Learning Layer
- **Model A: Dynamic Pricing**: Weekly premium forecasting based on historical disruption probability in 100+ micro-zones.
- **Model B: Claim Verification**: A 5-signal classifier (Active, H3 Presence, Route Impact, Activity Drop, Peer Anomaly) to approve/reject payouts.

## 4. Claim Verification Layer (5-Signal Check)
| Signal | Logic |
| :--- | :--- |
| **Active Status** | Verification against delivery platform login/activity heartbeats. |
| **H3 Presence** | Post-processing of GPS pings to confirm the worker was inside the hex. |
| **Route Impact** | Analysis of transit time vs. historical baseline for that specific edge. |
| **Activity Drop** | Statistical deviation in delivery completion rate during the event. |
| **Peer Anomaly** | Correlation check with other workers in the same H3 cell. |

## 5. Payout & Disbursement Layer
- **Instant Transfer**: Integration with Razorpay/UPI for <5min payouts.
- **Parametric Ledger**: Immutable record of trigger conditions for auditability.

## 6. Infrastructure & Storage
- **Primary DB**: PostgreSQL (Users, Policies, Claims).
- **Spatial DB**: Redis/GeoJSON for high-speed hex lookups.
- **Message Queue**: RabbitMQ/Kafka to decouple signal ingestion from claim processing.

---
> [!NOTE]
> The current frontend implementation uses `h3_simulator.js` to mock these IDs. The goal of the backend implementation is to replace these simulators with real-world geospatial calculations.
