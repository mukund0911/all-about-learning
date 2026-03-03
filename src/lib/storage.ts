"use client";

import type { Paper, PaperAnalysis, StoredPaper } from "./types";

const PAPERS_KEY = "papervis_papers";
const DB_NAME = "papervis_db";
const DB_VERSION = 1;
const STORE_NAME = "papers";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "meta.id" });
      }
    };
    request.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePaper(stored: StoredPaper): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(stored);
    tx.oncomplete = () => {
      // Save meta to localStorage for quick listing
      const metas = getPaperMetas();
      const existing = metas.findIndex((p) => p.id === stored.meta.id);
      if (existing >= 0) metas[existing] = stored.meta;
      else metas.unshift(stored.meta);
      localStorage.setItem(PAPERS_KEY, JSON.stringify(metas));
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadPaper(id: string): Promise<StoredPaper | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => {
      const paper = request.result as StoredPaper | undefined;
      if (paper) {
        // Migrate old contentByDepth format to unified content field
        for (const section of paper.analysis.conceptSections) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const raw = section as any;
          if (!section.content && raw.contentByDepth) {
            const cbd = raw.contentByDepth as string[];
            section.content = cbd[1] || cbd[0] || "";
          }
        }
      }
      resolve(paper || null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deletePaper(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => {
      const metas = getPaperMetas().filter((p) => p.id !== id);
      localStorage.setItem(PAPERS_KEY, JSON.stringify(metas));
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export function getPaperMetas(): Paper[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(PAPERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export { generateId, THUMBNAIL_COLORS, randomThumbnailColor } from "./utils";
