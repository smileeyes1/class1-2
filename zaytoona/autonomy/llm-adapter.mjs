/** Provider-neutral LLM adapter. Credentials stay in runtime secrets, never in git. */
export function createLLMAdapter({ provider, apiKey, baseUrl, model, fetchImpl = fetch }) {
  if (!provider || !apiKey || !model) return {configured:false, reason:'LLM_NOT_CONFIGURED'};
  return {
    configured:true,
    async generate(input) {
      if (provider === 'openai-compatible') {
        const res = await fetchImpl(`${baseUrl || 'https://api.openai.com/v1'}/chat/completions`, {
          method:'POST', headers:{'content-type':'application/json', authorization:`Bearer ${apiKey}`},
          body:JSON.stringify({model, messages:[{role:'user',content:input}], temperature:0.2})
        });
        if (!res.ok) throw new Error(`LLM_HTTP_${res.status}`);
        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? '';
      }
      throw new Error(`UNSUPPORTED_LLM_PROVIDER:${provider}`);
    }
  };
}
