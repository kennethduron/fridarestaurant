const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize the admin SDK (uses the project the CLI is pointed to)
admin.initializeApp();
const db = admin.firestore();

/**
 * Firestore onCreate trigger for `orders`.
 * - Ensures `createdAt` + `status` exist.
 * - Generates a server `displayId` (transactional counter) when missing.
 * - Writes a backup copy to `orders_backup/{orderId}` with a server timestamp.
 */
exports.onOrderCreated = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap, context) => {
        const data = snap.data() || {};
        const orderRef = snap.ref;
        const updates = {};

        // Ensure server-side createdAt and status
        if (!data.createdAt) updates.createdAt = admin.firestore.FieldValue.serverTimestamp();
        if (!data.status) updates.status = 'pending';

        // If displayId missing, generate a sequential server-side number
        if (!data.displayId) {
            const counterRef = db.doc('counters/orders');
            try {
                await db.runTransaction(async (tx) => {
                    const counterSnap = await tx.get(counterRef);
                    let next = 1;
                    if (counterSnap.exists && Number(counterSnap.data().count)) {
                        next = Number(counterSnap.data().count) + 1;
                    }
                    tx.set(counterRef, { count: next }, { merge: true });
                    updates.displayId = String(next).padStart(4, '0');
                    tx.update(orderRef, updates);
                });
            } catch (err) {
                console.error('onOrderCreated: counter transaction failed', err);
            }
        } else if (Object.keys(updates).length) {
            // only update createdAt/status if needed
            try { await orderRef.update(updates); } catch (err) { console.error('onOrderCreated: update failed', err); }
        }

        // Create a backup copy for redundancy
        try {
            const backupRef = db.collection('orders_backup').doc(context.params.orderId);
            await backupRef.set({
                ...data,
                serverBackupAt: admin.firestore.FieldValue.serverTimestamp(),
                originalId: context.params.orderId
            });
        } catch (err) {
            console.error('onOrderCreated: backup write failed', err);
        }

        return null;
    });