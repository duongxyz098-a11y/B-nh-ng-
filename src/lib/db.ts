import { get, set, del, keys, createStore } from 'idb-keyval';

// Create a custom store to avoid version conflicts with the default 'keyval-store'
const customStore = createStore('banhnho-db', 'banhnho-store');

export const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      // Quota exceeded. Try to clear old chat messages to make space.
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('koko_npc_msgs_')) {
          localStorage.removeItem(k);
        }
      });
      // Try again
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (e2) {
        console.error('Failed to save to localStorage even after clearing old data:', e2);
        return false;
      }
    } else {
      console.error('Failed to save to localStorage:', e);
      return false;
    }
  }
};

export const setLargeData = async (key: string, value: any): Promise<void> => {
  try {
    await set(key, value, customStore);
  } catch (e) {
    console.error('Failed to save large data to IndexedDB:', e);
  }
};

export const getLargeData = async (key: string): Promise<any> => {
  try {
    return await get(key, customStore);
  } catch (e) {
    console.error('Failed to get large data from IndexedDB:', e);
    return null;
  }
};

export const removeLargeData = async (key: string): Promise<void> => {
  try {
    await del(key, customStore);
  } catch (e) {
    console.error('Failed to remove large data from IndexedDB:', e);
  }
};

export const getAllLargeDataKeys = async (): Promise<IDBValidKey[]> => {
  try {
    return await keys(customStore);
  } catch (e) {
    console.error('Failed to get keys from IndexedDB:', e);
    return [];
  }
};

export const initKeyValueDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BanhNhoKV');

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('backgrounds')) {
        db.createObjectStore('backgrounds');
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('backgrounds')) {
        const currentVersion = db.version;
        db.close();

        const upgradeReq = indexedDB.open('BanhNhoKV', currentVersion + 1);
        upgradeReq.onupgradeneeded = (e) => {
          const upgradeDb = (e.target as IDBOpenDBRequest).result;
          if (!upgradeDb.objectStoreNames.contains('backgrounds')) {
            upgradeDb.createObjectStore('backgrounds');
          }
        };
        upgradeReq.onsuccess = () => resolve(upgradeReq.result);
        upgradeReq.onerror = () => reject(upgradeReq.error);
      } else {
        resolve(db);
      }
    };

    request.onerror = () => reject(request.error);
  });
};

export const saveToDB = async (storeName: string, key: string, value: any): Promise<void> => {
  const db = await initKeyValueDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getFromDB = async (storeName: string, key: string): Promise<any> => {
  const db = await initKeyValueDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllFromDB = async (storeName: string): Promise<Record<string, any>> => {
  const db = await initKeyValueDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    const keysRequest = store.getAllKeys();

    transaction.oncomplete = () => {
      const result: Record<string, any> = {};
      const keys = keysRequest.result as string[];
      const values = request.result;
      keys.forEach((key, index) => {
        result[key] = values[index];
      });
      resolve(result);
    };
    transaction.onerror = () => reject(transaction.error);
  });
};


export const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'banhnho_db';
const STORE_NAME = 'bot_cards';
const BG_STORE_NAME = 'backgrounds';
const STORY_STORE_NAME = 'stories';
const CHAT_STORE_NAME = 'chat_history';
const VERSION = 4;

export async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, VERSION, {
    upgrade(db, oldVersion, newVersion) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(BG_STORE_NAME)) {
        db.createObjectStore(BG_STORE_NAME);
      }
      if (!db.objectStoreNames.contains(STORY_STORE_NAME)) {
        db.createObjectStore(STORY_STORE_NAME);
      }
      if (!db.objectStoreNames.contains(CHAT_STORE_NAME)) {
        db.createObjectStore(CHAT_STORE_NAME);
      }
    },
  });
}

export async function saveChat(botId: string, messages: any[]) {
  const db = await getDB();
  await db.put(CHAT_STORE_NAME, messages, botId);
}

export async function loadChat(botId: string): Promise<any[]> {
  const db = await getDB();
  return (await db.get(CHAT_STORE_NAME, botId)) || [];
}

export async function saveChatSettings(botId: string, settings: any) {
  const db = await getDB();
  await db.put(CHAT_STORE_NAME, settings, `settings_${botId}`);
}

export async function loadChatSettings(botId: string): Promise<any> {
  const db = await getDB();
  return await db.get(CHAT_STORE_NAME, `settings_${botId}`);
}

export async function saveCards(cards: any[]) {
  const db = await getDB();
  await db.put(STORE_NAME, cards, 'saved_cards');
}

export async function loadCards(): Promise<any[]> {
  const db = await getDB();
  return (await db.get(STORE_NAME, 'saved_cards')) || [];
}

export async function saveDraft(key: string, value: any) {
  const db = await getDB();
  await db.put(STORE_NAME, value, `draft_${key}`);
}

export async function loadDraft(key: string): Promise<any> {
  const db = await getDB();
  return await db.get(STORE_NAME, `draft_${key}`);
}

export async function clearDrafts() {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const keys = await store.getAllKeys();
  for (const key of keys) {
    if (typeof key === 'string' && key.startsWith('draft_')) {
      await store.delete(key);
    }
  }
  await tx.done;
}

export async function saveBackground(tabId: string, base64: string) {
  const db = await getDB();
  await db.put(BG_STORE_NAME, base64, tabId);
}

export async function loadBackgrounds(): Promise<Record<string, string>> {
  const db = await getDB();
  const tx = db.transaction(BG_STORE_NAME, 'readonly');
  const store = tx.objectStore(BG_STORE_NAME);
  const keys = await store.getAllKeys();
  const values = await store.getAll();

  const result: Record<string, string> = {};
  keys.forEach((key, i) => {
    result[key as string] = values[i];
  });
  return result;
}

export async function getAllStories(): Promise<any[]> {
  const db = await getDB();
  return await db.getAll(STORY_STORE_NAME);
}

export async function saveStory(story: any) {
  const db = await getDB();
  await db.put(STORY_STORE_NAME, story, story.id);
}

export async function deleteStory(id: string) {
  const db = await getDB();
  await db.delete(STORY_STORE_NAME, id);
}

export interface ApiProxySettings {
  id?: string;
  name?: string;
  endpoint: string;
  apiKey: string;
  model: string;
  maxTokens?: number;
  isUnlimited?: boolean;
  timeoutMinutes?: number;
}

export const fetchAvailableModels = async (endpoint: string, apiKey: string): Promise<string[]> => {
  return ['gemini-3.1-pro-preview', 'gemini-3-flash-preview'];
};
