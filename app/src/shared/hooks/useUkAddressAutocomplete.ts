// src/hooks/useUkAddressAutocomplete.ts
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

interface AddressSuggestion {
  id: string;
  line_1: string;
  line_2?: string;
  line_3?: string;
  post_town: string;
  county?: string;
  postcode: string;
}

export const useUkAddressAutocomplete = (apiKey: string) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPostcodeLookup = useCallback(
    debounce(async (postcode: string) => {
      if (!postcode || postcode.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.getaddress.io/v1/uk/addresses?expand=address&postcode=${encodeURIComponent(postcode)}&api-key=${apiKey}`
        );
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        setSuggestions(data.addresses || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch addresses'
        );
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [apiKey]
  );

  const clearSuggestions = () => setSuggestions([]);

  return { suggestions, loading, error, fetchPostcodeLookup, clearSuggestions };
};
