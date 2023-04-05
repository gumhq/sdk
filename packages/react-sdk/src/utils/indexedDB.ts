const DB_NAME = 'session_data';
const SESSION_OBJECT_STORE = 'sessions';
const WALLET_PUBKEY_TO_SESSION_STORE = 'walletPublicKeyToSessionData';
const ENCRYPTION_KEY_OBJECT_STORE = 'user_preferences';

export const openIndexedDB = async () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      db.createObjectStore(SESSION_OBJECT_STORE);
      db.createObjectStore(ENCRYPTION_KEY_OBJECT_STORE);
      db.createObjectStore(WALLET_PUBKEY_TO_SESSION_STORE);
    };
    request.onsuccess = (event) => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      reject(request.error);
    };
  });
};

export const getItemFromIndexedDB = async (storeName: string, key: IDBValidKey) => {
  const db = await openIndexedDB();
  return new Promise<any>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = (event) => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      reject(request.error);
    };
  });
};

export const setItemToIndexedDB = async <T>(storeName: string, data: T, key: IDBValidKey) => {
  const db = await openIndexedDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data, key);
    request.onsuccess = (event) => {
      resolve();
    };
    request.onerror = (event) => {
      reject(request.error);
    };
  });
};

export const deleteItemFromIndexedDB = async (storeName: string, key: IDBValidKey) => {
  const db = await openIndexedDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = (event) => {
      resolve();
    };
    request.onerror = (event) => {
      reject(request.error);
    };
  });
};
