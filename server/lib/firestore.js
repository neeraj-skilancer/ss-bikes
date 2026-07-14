import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { seedProducts } from './seedData.js'

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || 'ss-bikes-501907'

if (!getApps().length) {
  initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID })
}

export const db = getFirestore()
export { FieldValue }

// Seeds the `products` collection from the original static catalog the very
// first time it's empty (e.g. right after the Firestore database is created).
// Safe to call on every boot — it no-ops once products exist.
export async function seedIfEmpty() {
  try {
    const snap = await db.collection('products').limit(1).get()
    if (!snap.empty) return
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
  } catch (err) {
    console.error('Seed check failed (non-fatal):', err?.message || err)
  }
}
