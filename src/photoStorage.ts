export type StoredPhotoRecord = {
  id: string;
  name: string;
  type: string;
  lastModified: number;
  original: Blob;
  processed?: Blob;
  /** Transparent foreground cutout used by AIBG region-edit commands. */
  cutout?: Blob;
  background?: 'white' | 'transparent';
  updatedAt: number;
};

const DB_NAME = 'mshkur-photo-studio';
const STORE_NAME = 'photos';
const DB_VERSION = 1;

function openPhotoDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local photo storage.'));
  });
}

export async function loadPhotoRecords(): Promise<StoredPhotoRecord[]> {
  const database = await openPhotoDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve((request.result as StoredPhotoRecord[]).sort((a, b) => b.updatedAt - a.updatedAt));
      request.onerror = () => reject(request.error ?? new Error('Could not read local photos.'));
    });
  } finally {
    database.close();
  }
}

export async function savePhotoRecord(record: StoredPhotoRecord): Promise<void> {
  const database = await openPhotoDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(record);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not save this photo locally.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Local photo save was interrupted.'));
    });
  } finally {
    database.close();
  }
}

export async function deletePhotoRecord(id: string): Promise<void> {
  const database = await openPhotoDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not delete this local photo.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Local photo deletion was interrupted.'));
    });
  } finally {
    database.close();
  }
}
