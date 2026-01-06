import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

let app: App | undefined;
let firestore: Firestore | undefined;

function getFirebaseApp(): App | null {
  // 嘗試讀取金鑰檔案
  const keyPath = path.join(process.cwd(), 'ordering-app-firebase.json');

  if (!fs.existsSync(keyPath)) {
    console.warn('Firebase key file not found:', keyPath);
    return null;
  }

  if (!app && getApps().length === 0) {
    try {
      app = initializeApp({
        credential: cert(keyPath),
      });
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      return null;
    }
  }

  return app || getApps()[0] || null;
}

export function getFirestoreDb(): Firestore | null {
  if (firestore) return firestore;

  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;

  try {
    firestore = getFirestore(firebaseApp);
    return firestore;
  } catch (error) {
    console.error('Failed to get Firestore:', error);
    return null;
  }
}

// 訂單同步到 Firebase
export async function syncOrderToFirebase(order: {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  paid: boolean;
  createdAt: Date | null;
  items: Array<{
    menuItemName: string;
    quantity: number;
    price: number;
  }>;
}): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) {
    console.warn('Firebase not configured, skipping order sync');
    return false;
  }

  try {
    await db.collection('orders').doc(order.orderNumber).set({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      paid: order.paid,
      createdAt: order.createdAt,
      items: order.items,
      syncedAt: new Date(),
    });
    console.log(`Order ${order.orderNumber} synced to Firebase`);
    return true;
  } catch (error) {
    console.error('Failed to sync order to Firebase:', error);
    return false;
  }
}

// 更新 Firebase 中的訂單
export async function updateOrderInFirebase(
  orderNumber: string,
  updates: { status?: string; paid?: boolean }
): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) {
    console.warn('Firebase not configured, skipping order update');
    return false;
  }

  try {
    await db.collection('orders').doc(orderNumber).update({
      ...updates,
      updatedAt: new Date(),
    });
    console.log(`Order ${orderNumber} updated in Firebase`);
    return true;
  } catch (error) {
    console.error('Failed to update order in Firebase:', error);
    return false;
  }
}
