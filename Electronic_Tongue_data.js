const TasteLabData = {
    sensors: [
        { id: "S1", label: "Sweet ion sensor", color: "#0f766e" },
        { id: "S2", label: "Sour pH sensor", color: "#c2410c" },
        { id: "S3", label: "Salt conductivity sensor", color: "#2563eb" },
        { id: "S4", label: "Bitter alkaloid sensor", color: "#7c3aed" },
        { id: "S5", label: "Umami amino sensor", color: "#15803d" },
        { id: "S6", label: "Astringency polymer sensor", color: "#be123c" }
    ],
    samples: {
        tea: { name: "Tea infusion", base: [64, 42, 31, 58, 24, 71], taste: [18, 9, 7, 26, 11, 29] },
        milk: { name: "Milk sample", base: [52, 28, 36, 18, 44, 16], taste: [29, 7, 19, 8, 25, 12] },
        water: { name: "Drinking water", base: [12, 18, 30, 8, 10, 9], taste: [4, 18, 44, 5, 5, 3] },
        syrup: { name: "Syrup batch", base: [88, 23, 25, 14, 16, 12], taste: [61, 8, 11, 6, 5, 4] }
    },
    tasteLabels: ["Sweet", "Sour", "Salty", "Bitter", "Umami", "Astringent"],
    batches: [
        ["B-2407-18", "Tea infusion", 98.2, "pass"],
        ["B-2407-19", "Milk sample", 94.7, "pass"],
        ["B-2407-20", "Syrup batch", 88.6, "review"],
        ["B-2407-21", "Drinking water", 76.4, "fail"]
    ],
    pcaReference: [
        { x: 18, y: 38, c: "#0f766e" },
        { x: 24, y: 44, c: "#0f766e" },
        { x: 30, y: 37, c: "#0f766e" },
        { x: 56, y: 20, c: "#c2410c" },
        { x: 62, y: 24, c: "#c2410c" },
        { x: 68, y: 18, c: "#c2410c" },
        { x: 42, y: 66, c: "#2563eb" },
        { x: 49, y: 72, c: "#2563eb" },
        { x: 54, y: 63, c: "#2563eb" }
    ],
    events: [
        ["09:10", "Reference profile loaded for beverage grading.", "pass"],
        ["09:17", "Baseline response normalized across six sensors.", "pass"],
        ["09:25", "S4 response slightly above bitter control limit.", "review"],
        ["09:31", "Auto-rinse completed with stable recovery curve.", "pass"]
    ]
};