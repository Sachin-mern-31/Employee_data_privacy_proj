const Risk = require("../models/Risk");

/**
 * Calculates risk score and severity dynamically based on Likelihood and Impact matrix.
 * Matrix:
 * Likelihood: LOW (1), MEDIUM (2), HIGH (3)
 * Impact:     LOW (1), MEDIUM (2), HIGH (3)
 * Score = Likelihood x Impact (1 to 9)
 */
const calculateRiskMatrix = (likelihood, impact) => {
    const map = { LOW: 1, MEDIUM: 2, HIGH: 3 };
    const lVal = map[likelihood] || 1;
    const iVal = map[impact] || 1;
    const score = lVal * iVal;

    let severity = "LOW";
    if (score >= 9) {
        severity = "CRITICAL";
    } else if (score >= 6) {
        severity = "HIGH";
    } else if (score >= 3) {
        severity = "MEDIUM";
    }

    return { score, severity };
};

module.exports = {
    calculateRiskMatrix
};
