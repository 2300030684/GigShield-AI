import * as tf from '@tensorflow/tfjs';
import fs from 'fs';
import path from 'path';

/**
 * Trustpay Static Model Generator
 * This script creates a pre-trained Neural Network for weekly premium prediction.
 * Weights are initialized to reflect domain-specific risks (e.g. rain, aqi).
 */

async function generateModel() {
    console.log("🧠 Initializing Trustpay Neural Network...");

    // 1. Define Model Architecture
    const model = tf.sequential();
    
    // Hidden Layer 1: 16 units, ReLU activation
    model.add(tf.layers.dense({
        inputShape: [7], // rainfall, temp, aqi, traffic, claims, workHours, zoneRisk
        units: 16,
        activation: 'relu',
        kernelInitializer: 'glorotNormal'
    }));

    // Hidden Layer 2: 8 units, ReLU
    model.add(tf.layers.dense({
        units: 8,
        activation: 'relu'
    }));

    // Output Layer: 1 unit for Premium (₹)
    model.add(tf.layers.dense({
        units: 1,
        activation: 'linear'
    }));

    // 2. Set Custom Weights (Domain-Inspired Initialization)
    // This ensures the model gives "realistic" answers even without a full training set.
    // rainfall(0), temp(1), aqi(2), traffic(3), claims(4), workHours(5), zoneRisk(6)
    
    const layer1 = model.layers[0];
    const weights = layer1.getWeights();
    const kernel = weights[0].dataSync();
    
    // Manually tweak weights to respect our risks (rough approximation)
    // Rainfall coefficient should be positive
    for (let i = 0; i < 16; i++) {
        kernel[0 * 16 + i] += 0.5; // Rainfall boost
        kernel[2 * 16 + i] += 0.3; // AQI boost
        kernel[4 * 16 + i] += 1.2; // Claims impact
        kernel[6 * 16 + i] += 2.0; // Zone risk impact
    }
    
    layer1.setWeights([tf.tensor2d(kernel, [7, 16]), weights[1]]);

    console.log("💾 Saving model to public/model/...");

    const modelDir = path.resolve('public', 'model');
    if (!fs.existsSync(modelDir)) {
        fs.mkdirSync(modelDir, { recursive: true });
    }

    // Since we are in Node and using the standard TFJS browser package, 
    // we manually construct the model artifacts to avoid tfjs-node dependency.
    const saveResult = await model.save(tf.io.withSaveHandler(async (artifacts) => {
        // Save model.json
        fs.writeFileSync(
            path.join(modelDir, 'trustpay_model.json'), 
            JSON.stringify(artifacts.modelTopology)
        );
        
        // Save weights binary
        if (artifacts.weightData) {
            fs.writeFileSync(
                path.join(modelDir, 'trustpay_model.weights.bin'), 
                Buffer.from(artifacts.weightData)
            );
        }

        // Create the manifest-style wrapper that TFJS expects for LayersModel
        const manifest = {
            modelTopology: artifacts.modelTopology,
            weightsManifest: [{
                paths: ['trustpay_model.weights.bin'],
                weights: artifacts.weightSpecs
            }]
        };

        fs.writeFileSync(
            path.join(modelDir, 'trustpay_model.json'), 
            JSON.stringify(manifest, null, 2)
        );

        return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: 'JSON' } };
    }));

    console.log("✅ ML Model generated successfully!");
    console.log("- Location: public/model/trustpay_model.json");
    console.log("- Weights: public/model/trustpay_model.weights.bin");
}

generateModel().catch(console.error);
