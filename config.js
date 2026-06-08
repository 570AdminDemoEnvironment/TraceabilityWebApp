// TP Aerospace — Configuration
// Paste your Power Automate Flow URL below to connect to live F&O data.
// The app will fall back to mock data if this URL is empty or unreachable.

const CONFIG = {
    // Power Automate HTTP trigger URL — paste yours here:
    POWER_AUTOMATE_URL: 'https://21ed5c536622e18f93ed1eef12563a.4e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/f2d3815c147e445ca446bc4556089988/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2cnhOFtIOTZPeisAwWjt__4DzU1iL9yTban4QhkeeW8',

    // Power Automate write-back flow URL (for creating work orders, updating assets)
    POWER_AUTOMATE_ACTION_URL: '',

    // Company ID in F&O
    COMPANY: 'USMF',

    // Data refresh interval (milliseconds) — 0 = manual only
    REFRESH_INTERVAL: 0,

    // Set to true to always use mock data (for offline demos)
    FORCE_MOCK: false
};
