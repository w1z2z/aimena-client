const DB_NAME = "swaply-listing-create-draft";
const DB_VERSION = 1;
const PHOTO_STORE = "photos";

export type DraftPhotoRecord = {
  id: string;
  kind: "item" | "doc";
  blob: Blob;
  mime: string;
  isPdf: boolean;
  fileName: string;
};

function openDraftPhotosDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        db.createObjectStore(PHOTO_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open draft photos DB"));
  });
}

function runPhotoStore<T>(
  mode: IDBTransactionMode,
  runner: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDraftPhotosDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(PHOTO_STORE, mode);
        const store = transaction.objectStore(PHOTO_STORE);
        const request = runner(store);

        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error ?? new Error("Draft photo store error"));

        transaction.oncomplete = () => db.close();
        transaction.onerror = () => reject(transaction.error ?? new Error("Draft photo transaction error"));
      }),
  );
}

export async function saveDraftPhotoRecord(record: DraftPhotoRecord): Promise<void> {
  try {
    await runPhotoStore("readwrite", (store) => store.put(record));
  } catch {
    // Best-effort local persistence for MVP.
  }
}

export async function readDraftPhotoRecord(photoId: string): Promise<DraftPhotoRecord | null> {
  try {
    const record = await runPhotoStore<DraftPhotoRecord | undefined>("readonly", (store) =>
      store.get(photoId),
    );
    return record ?? null;
  } catch {
    return null;
  }
}

export async function deleteDraftPhotoRecord(photoId: string): Promise<void> {
  try {
    await runPhotoStore("readwrite", (store) => store.delete(photoId));
  } catch {
    // Best-effort.
  }
}

export async function deleteDraftPhotoRecords(photoIds: string[]): Promise<void> {
  if (photoIds.length === 0) return;

  try {
    const db = await openDraftPhotosDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(PHOTO_STORE, "readwrite");
      const store = transaction.objectStore(PHOTO_STORE);

      for (const photoId of photoIds) {
        store.delete(photoId);
      }

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error ?? new Error("Failed to delete draft photos"));
    });
  } catch {
    // Best-effort.
  }
}

export async function clearAllDraftPhotoRecords(): Promise<void> {
  try {
    await runPhotoStore("readwrite", (store) => store.clear());
  } catch {
    // Best-effort.
  }
}
