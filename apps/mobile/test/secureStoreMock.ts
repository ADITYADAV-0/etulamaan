const storage = new Map<string, string>();

export const setItemAsync = async (key: string, value: string) => {
  storage.set(key, value);
};

export const getItemAsync = async (key: string) => storage.get(key) ?? null;

export const deleteItemAsync = async (key: string) => {
  storage.delete(key);
};