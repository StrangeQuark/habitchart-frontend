import { createInitialData, normalizeData } from './habitData'

const DATABASE_NAME = 'habitchart'
const DATABASE_VERSION = 1
const STORE_NAME = 'documents'
const DATA_KEY = 'habit-data'
const LEGACY_STORAGE_KEY = 'habit-tracker:data'

const openDatabase = () => new Promise((resolve, reject) => {
  if (!('indexedDB' in globalThis)) {
    reject(new Error('IndexedDB is not available'))
    return
  }

  const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

  request.onupgradeneeded = () => {
    const db = request.result
    if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME)
  }

  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})

const runTransaction = async (mode, operation) => {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode)
    const store = transaction.objectStore(STORE_NAME)
    const request = operation(store)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => db.close()
    transaction.onerror = () => {
      db.close()
      reject(transaction.error)
    }
  })
}

export const loadHabitData = async () => {
  try {
    const data = await runTransaction('readonly', (store) => store.get(DATA_KEY))
    if (data) return normalizeData(data)

    if ('localStorage' in globalThis) {
      const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY)
      if (legacyData) return normalizeData(JSON.parse(legacyData))
    }

    return normalizeData(createInitialData())
  } catch {
    return normalizeData(createInitialData())
  }
}

export const saveHabitData = async (data) => {
  await runTransaction('readwrite', (store) => store.put(normalizeData(data), DATA_KEY))
}

export const exportHabitData = (data) => JSON.stringify(normalizeData(data), null, 2)
