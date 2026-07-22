import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { seedProducts } from './seedData.js'

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || 'ss-bikes-501907'

if (!getApps().length) {
  initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID })
}

export const db = getFirestore()
export { FieldValue }

// Atomically issues the next order number. Starts at 1000 so every order gets
// a clean 4-digit id (1000, 1001, …) instead of Firestore's long random doc id.
export async function nextOrderNumber() {
  const counterRef = db.collection('counters').doc('orders')
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(counterRef)
    const current = doc.exists ? doc.data().value || 999 : 999
    const next = current + 1
    tx.set(counterRef, { value: next }, { merge: true })
    return next
  })
}

// Seeds the `products` collection from the original static catalog the very
// first time it's empty (e.g. right after the Firestore database is created).
// Safe to call on every boot — it no-ops once products exist.
export async function seedIfEmpty() {
  try {
    const snap = await db.collection('products').limit(1).get()
    if (snap.empty) {
      const batch = db.batch()
      for (const p of seedProducts) {
        batch.set(db.collection('products').doc(p.slug), {
          ...p,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        })
      }
      await batch.commit()
      console.log(`Seeded ${seedProducts.length} products into Firestore.`)
    }
  } catch (err) {
    console.error('Seed check failed (non-fatal):', err?.message || err)
  }

  try {
    const settingsRef = db.collection('settings').doc('codFees')
    const doc = await settingsRef.get()
    if (!doc.exists) {
      await settingsRef.set({
        default: { ebikeFee: 999, accessoryFee: 199 },
        states: {},
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      console.log('Seeded default COD fee configuration into Firestore.')
    }
  } catch (err) {
    console.error('Settings seed check failed (non-fatal):', err?.message || err)
  }
}
