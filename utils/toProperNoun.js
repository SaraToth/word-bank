// Ensure universal format for storing names in db
const toProperNoun = (rawName) => {
    return rawName
        .toLowerCase()
        // Capitalizes first letter of each word
        .replace(/\b\w/g, char => char.toUpperCase());
};

module.exports = toProperNoun;