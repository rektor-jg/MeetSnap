const CUSTOM_API_KEY_STORAGE_KEY = 'custom_api_key';

/**
 * Retrieves the custom API key from local storage.
 * @returns The custom API key or null if not set.
 */
export const getCustomApiKey = (): string | null => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }
    return window.localStorage.getItem(CUSTOM_API_KEY_STORAGE_KEY);
};

/**
 * Saves a custom API key to local storage. If the key is empty, it removes it.
 * @param key The API key to save.
 */
export const setCustomApiKey = (key: string): void => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }
    const trimmedKey = key.trim();
    if (trimmedKey) {
        window.localStorage.setItem(CUSTOM_API_KEY_STORAGE_KEY, trimmedKey);
    } else {
        clearCustomApiKey();
    }
};

/**
 * Removes the custom API key from local storage.
 */
export const clearCustomApiKey = (): void => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }
    window.localStorage.removeItem(CUSTOM_API_KEY_STORAGE_KEY);
};

/**
 * Gets the active API key, prioritizing the custom key from local storage
 * before falling back to the environment variable.
 * @returns The active API key.
 * @throws An error if no API key is available.
 */
export const getApiKey = (): string => {
    const customKey = getCustomApiKey();
    if (customKey) {
        return customKey;
    }
    
    const envKey = process.env.API_KEY;
    if (envKey) {
        return envKey;
    }

    throw new Error("API key is missing. Please set a custom key in the Admin Panel or ensure the default API key is configured in the environment.");
};
