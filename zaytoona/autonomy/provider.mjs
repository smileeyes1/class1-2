/** Provider-neutral LLM boundary. No secrets, network calls, or provider assumptions live in the core. */

export function createProviderRouter({ providers = [], fallback } = {}) {
  const ordered = [...providers].filter(Boolean);
  return {
    async run(request) {
      const failures = [];
      for (const provider of ordered) {
        try {
          const result = await provider.run(request);
          if (result?.ok) return {...result, provider: provider.name};
          failures.push({provider: provider.name, reason: result?.error || 'NON_OK'});
        } catch (error) {
          failures.push({provider: provider.name, reason: String(error?.message || error)});
        }
      }
      if (fallback) {
        const result = await fallback(request, failures);
        if (result?.ok) return {...result, provider: 'deterministic-fallback'};
      }
      return {ok:false, error:'NO_PROVIDER_AVAILABLE', failures};
    }
  };
}
