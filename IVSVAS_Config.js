// System Hardware & Threshold Configurations
const SystemConfig = {
    specs: {
        cpu: "Intel Core i5 (8th Gen+)",
        ram: "16 GB DDR4",
        gpu: "Nvidia AI Analytics GPU",
        storage: "1TB HDD",
        os: "Linux Ubuntu 20.04"
    },
    cameras: {
        count: 4,
        resolution: "2MP",
        type: "CCTV / RTSP Feed"
    },
    aiThresholds: {
        fireSmokeInterval: 8000, // Ms between simulated events
        crowdInterval: 12000
    }
};