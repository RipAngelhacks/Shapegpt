const CONFIG = {
    MODEL_USERNAME: 'star-tr15',
    USER_ID: 'RipAngelhacks',
    CHANNEL_ID: `web_${Date.now()}`,
    STATIC_TIMESTAMP: '2025-05-13 01:33:53',
    // SHA-256 encrypted API key
    API_KEY_HASH: 'e9c2e98e76a73e767ca90b11f931b3328592e5ad854f52ea9e3975ab4d5a9603',
    // The actual API key will be validated against this hash
    API_KEY: 'AhqXQvgXNsmoIR2HfUIUTmGTGs97b_CHpgWXT4NhVXg'
};

// Utility function to hash strings using SHA-256
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Validate API key against stored hash
async function validateApiKey() {
    const computedHash = await sha256(CONFIG.API_KEY);
    return computedHash === CONFIG.API_KEY_HASH;
}
