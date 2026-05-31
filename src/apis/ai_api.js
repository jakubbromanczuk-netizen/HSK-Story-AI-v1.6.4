// Wrapper AI: wywołania do dostawców AI (Gemini itp.) - krótko
(function(){
    const cfg = window.APP_CONFIG || {};
    async function generateContent(model, requestBody = {}){
        const apiKey = cfg.API_KEY || '';
        if (!apiKey) throw new Error('No API key set in APP_CONFIG.API_KEY');
        const provider = (cfg.PROVIDER || 'gemini').toLowerCase();
        if (provider === 'gemini' || provider === 'google'){
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            if (!resp.ok) {
                const txt = await resp.text().catch(()=>'<no body>');
                throw new Error(`HTTP ${resp.status}: ${txt}`);
            }
            return await resp.json();
        } else if (provider === 'openai'){
            // Placeholder for future OpenAI-compatible call
            // Expect cfg.OPENAI_API_KEY to be set if using OpenAI
            const apiKeyOpen = cfg.OPENAI_API_KEY || '';
            if (!apiKeyOpen) throw new Error('No OpenAI key (OPENAI_API_KEY) set in APP_CONFIG');
            // Implement if/when needed
            throw new Error('OpenAI provider not implemented yet');
        } else {
            throw new Error('Unknown AI provider: ' + provider);
        }
    }

    window.AI_API = {
        generateContent
    };
})();
