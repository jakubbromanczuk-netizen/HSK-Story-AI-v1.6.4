(function(){
    // Normalizacja APP_CONFIG -> window.APP_CFG (krótko)
    const APP_CONFIG = window.APP_CONFIG || {};
    window.APP_CFG = {
        API_KEY: APP_CONFIG.API_KEY || '',
        MODEL_NAME: APP_CONFIG.MODEL_NAME || 'gemini-2.5-pro',
        MODEL_NAME_LITE: APP_CONFIG.MODEL_NAME_LITE || 'gemini-2.5-flash-lite',
        LOCAL_TTS_URL: (typeof APP_CONFIG.LOCAL_TTS_URL !== 'undefined') ? APP_CONFIG.LOCAL_TTS_URL : 'http://localhost:59125/synthesize',
        ENABLE_WORD_DEFINITION: (typeof APP_CONFIG.ENABLE_WORD_DEFINITION !== 'undefined') ? APP_CONFIG.ENABLE_WORD_DEFINITION : false
    };
})();
