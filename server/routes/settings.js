import { Router } from 'express'
import { db } from '../lib/firestore.js'
import { requirePermission } from '../lib/adminAuth.js'

export const settingsRouter = Router()

// Default fallback configuration
const DEFAULT_COD_CONFIG = {
  default: {
    ebikeFee: 999,
    accessoryFee: 199,
  },
  states: {},
}

// GET /api/config/cod-fees (Public)
settingsRouter.get('/config/cod-fees', async (_req, res) => {
  try {
    const doc = await db.collection('settings').doc('codFees').get()
    if (!doc.exists) {
      return res.json(DEFAULT_COD_CONFIG)
    }
    res.json(doc.data())
  } catch (err) {
    console.error('GET /config/cod-fees error:', err?.message || err)
    res.status(500).json({ error: 'Could not load COD fee settings.' })
  }
})

// PUT /api/admin/settings/cod-fees (Admin Settings Management)
settingsRouter.put('/admin/settings/cod-fees', requirePermission('manageSettings'), async (req, res) => {
  try {
    const { default: defaultFees, states } = req.body || {}

    if (!defaultFees || defaultFees.ebikeFee == null || defaultFees.accessoryFee == null) {
      return res.status(400).json({ error: 'Default ebikeFee and accessoryFee are required.' })
    }

    const cleanedDefault = {
      ebikeFee: Math.max(0, Number(defaultFees.ebikeFee) || 0),
      accessoryFee: Math.max(0, Number(defaultFees.accessoryFee) || 0),
    }

    const cleanedStates = {}
    if (states && typeof states === 'object') {
      for (const [stateName, stateFees] of Object.entries(states)) {
        if (stateFees && stateFees.ebikeFee != null && stateFees.accessoryFee != null) {
          cleanedStates[stateName] = {
            ebikeFee: Math.max(0, Number(stateFees.ebikeFee) || 0),
            accessoryFee: Math.max(0, Number(stateFees.accessoryFee) || 0),
          }
        }
      }
    }

    const data = {
      default: cleanedDefault,
      states: cleanedStates,
      updatedAt: new Date().toISOString(),
    }

    await db.collection('settings').doc('codFees').set(data)
    res.json({ success: true, settings: data })
  } catch (err) {
    console.error('PUT /admin/settings/cod-fees error:', err?.message || err)
    res.status(500).json({ error: 'Could not save COD fee settings.' })
  }
})
