window.ENOVISION_DATA = {
    fusion: [
        { t: "00", aroma: 24, colour: 18, maturity: 12 },
        { t: "05", aroma: 38, colour: 31, maturity: 25 },
        { t: "10", aroma: 61, colour: 47, maturity: 44 },
        { t: "15", aroma: 78, colour: 62, maturity: 63 },
        { t: "20", aroma: 92, colour: 79, maturity: 81 },
        { t: "25", aroma: 84, colour: 88, maturity: 90 },
        { t: "30", aroma: 72, colour: 93, maturity: 95 }
    ],
    grades: [
        { label: "Premium A", value: 46, color: "#16805b" },
        { label: "Premium B", value: 28, color: "#0c7885" },
        { label: "Standard", value: 18, color: "#2f67b1" },
        { label: "Reject", value: 8, color: "#b76b10" }
    ],
    swatches: [
        { label: "Leaf 1", color: "#5e4a24" },
        { label: "Leaf 2", color: "#73511f" },
        { label: "Liquor", color: "#b15b16" },
        { label: "Milk", color: "#c98a48" },
        { label: "Infusion", color: "#6f5d35" },
        { label: "Blackness", color: "#2f2822" },
        { label: "Fibre", color: "#a98d5c" },
        { label: "Target", color: "#8b3f16" }
    ],
    references: [
        ["Aroma peak library", "Fermentation tracking", "Known odour fingerprints", "Ready", "94%"],
        ["Leaf colour palette", "Endpoint detection", "HSI match profile", "Ready", "91%"],
        ["Liquor appearance set", "Tasting approximation", "Colour indexing", "Ready", "88%"],
        ["Drier grade model", "Bulk grade estimate", "Image segmentation", "Watch", "82%"],
        ["Fibre detection set", "Made tea inspection", "Particle contrast model", "Ready", "90%"]
    ],
    signals: [
        ["First aroma peak", "Detected"],
        ["Second aroma peak", "Building"],
        ["Colour endpoint", "Inside band"],
        ["Reference drift", "Low"]
    ]
};