class BiometricEngine {
    constructor() {
        this.database = {}; // Persistent registry dictionary mapping identities to VQ codebooks
    }

    /**
     * Extracts voice vector profiles (mocking MFCC cepstral coefficients using spectral geometry)
     */
    extractVoiceVectors(audioBuffer) {
        const rawData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const frameSize = 1024;
        const hopSize = 512;
        const featureVectors = [];

        // Dynamic frame slice iteration
        for (let offset = 0; offset + frameSize < rawData.length; offset += hopSize) {
            const frame = rawData.subarray(offset, offset + frameSize);

            // Calculate absolute energy (Root Mean Square Profile)
            let rms = 0;
            for (let i = 0; i < frame.length; i++) rms += frame[i] * frame[i];
            rms = Math.sqrt(rms / frame.length);

            // Ignore silent operational frames below system voice gate threshold
            if (rms < 0.005) continue;

            // Compute Zero Crossing Rate (ZCR)
            let zcr = 0;
            for (let i = 1; i < frame.length; i++) {
                if ((frame[i] >= 0 && frame[i - 1] < 0) || (frame[i] < 0 && frame[i - 1] >= 0)) zcr++;
            }
            zcr = zcr / frame.length;

            // Generate artificial spectral variance bounds to emulate voice tract signatures
            const vector = [rms * 10, zcr * 100];
            for (let b = 0; b < 6; b++) {
                let segmentSum = 0;
                let step = Math.floor(frame.length / 6);
                for (let j = b * step; j < (b + 1) * step; j++) segmentSum += Math.abs(frame[j]);
                vector.push((segmentSum / step) * 20);
            }
            featureVectors.push(vector);
        }
        return featureVectors;
    }

    /**
     * Vector Quantization (VQ) K-Means Clustering Engine[cite: 1]
     */
    generateCodebook(vectors, codebookSize) {
        if (vectors.length <= codebookSize) return vectors;

        // Step 1: Initialize random centroid vectors
        let centroids = [];
        const indices = new Set();
        while (centroids.length < codebookSize) {
            let randIdx = Math.floor(Math.random() * vectors.length);
            if (!indices.has(randIdx)) {
                indices.add(randIdx);
                centroids.push([...vectors[randIdx]]);
            }
        }

        const maxIterations = 15;
        for (let iter = 0; iter < maxIterations; iter++) {
            // Initialize cluster definitions
            const clusters = Array.from({ length: codebookSize }, () => []);

            // Assignment phase: Calculate nearest centroid via Euclidean Distance
            for (let v of vectors) {
                let minDst = Infinity;
                let clusterIdx = 0;
                for (let c = 0; c < codebookSize; c++) {
                    let dst = this.euclideanDistance(v, centroids[c]);
                    if (dst < minDst) {
                        minDst = dst;
                        clusterIdx = c;
                    }
                }
                clusters[clusterIdx].push(v);
            }

            // Update Phase: Compute mean vector centers
            for (let c = 0; c < codebookSize; c++) {
                if (clusters[c].length === 0) continue;
                let dim = vectors[0].length;
                let meanVector = new Array(dim).fill(0);
                for (let v of clusters[c]) {
                    for (let d = 0; d < dim; d++) meanVector[d] += v[d];
                }
                for (let d = 0; d < dim; d++) meanVector[d] /= clusters[c].length;
                centroids[c] = meanVector;
            }
        }
        return centroids;
    }

    euclideanDistance(v1, v2) {
        let sum = 0;
        for (let i = 0; i < v1.length; i++) {
            let diff = v1[i] - v2[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }

    /**
     * Calculates the average distortion score between validation signatures and codebook states
     */
    calculateDistortion(testVectors, codebook) {
        let totalDistortion = 0;
        for (let v of testVectors) {
            let minDst = Infinity;
            for (let c of codebook) {
                let dst = this.euclideanDistance(v, c);
                if (dst < minDst) minDst = dst;
            }
            totalDistortion += minDst;
        }
        return totalDistortion / testVectors.length;
    }

    trainSpeaker(name, audioBuffer, codebookSize) {
        const vectors = this.extractVoiceVectors(audioBuffer);
        if (vectors.length < 5) throw new Error("Acoustic matrix payload density low. Please speak clearly and extend capture duration.");
        const codebook = this.generateCodebook(vectors, codebookSize);
        this.database[name] = { codebook, size: codebookSize };
        return vectors.length;
    }

    identifySpeaker(audioBuffer, matchSize) {
        const testVectors = this.extractVoiceVectors(audioBuffer);
        if (testVectors.length === 0) return { name: "Unknown Profile", score: Infinity };

        let bestMatch = null;
        let lowestDistortion = Infinity;

        for (let speakerName in this.database) {
            const profile = this.database[speakerName];
            const distortion = this.calculateDistortion(testVectors, profile.codebook);
            if (distortion < lowestDistortion) {
                lowestDistortion = distortion;
                bestMatch = speakerName;
            }
        }

        return { name: bestMatch || "No Profile Matches", score: lowestDistortion };
    }
}

window.biometricEngine = new BiometricEngine();