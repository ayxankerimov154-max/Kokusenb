import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocFromServer,
  deleteDoc
} from 'firebase/firestore';
import { auth } from './googleAuth';
import firebaseConfig from '../../firebase-applet-config.json';
import { BotMemory } from '../types/simulator';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID from firebase-applet-config.json
export const db = getFirestore(
  app,
  (firebaseConfig as any).firestoreDatabaseId || undefined
);

// Structured error handling matching FirestoreErrorInfo specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate connection to Firestore on app boot
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or waiting for network');
    }
    return false;
  }
}

/**
 * Sync a learned strategy from Room DB into cloud Firestore
 */
export async function syncStrategyToFirestore(memory: BotMemory): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('User must be signed in to sync to Firestore');
  }

  const strategyId = `strat_${memory.id}_${Date.now().toString(36)}`;
  const path = `bot_strategies/${strategyId}`;

  try {
    const payload = {
      id: strategyId,
      authorId: auth.currentUser.uid,
      gameName: memory.gameName,
      gameVersion: memory.gameVersion || 'Latest Meta',
      strategyCategory: memory.strategyCategory,
      insightContent: memory.insightContent,
      keyTakeaways: memory.keyTakeaways || [],
      confidenceScore: memory.confidenceScore || 0.95,
      cycleIteration: memory.cycleIteration || 1,
      executionDurationMs: memory.executionDurationMs || 0,
      timestampLearned: memory.timestampLearned || memory.timestamp || Date.now(),
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'bot_strategies', strategyId), payload);
    return strategyId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Delete a cloud strategy from Firestore
 */
export async function deleteCloudStrategy(strategyId: string): Promise<void> {
  const path = `bot_strategies/${strategyId}`;
  try {
    await deleteDoc(doc(db, 'bot_strategies', strategyId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Listen to cloud synchronized strategies from Firestore
 */
export function subscribeToCloudStrategies(
  onUpdate: (strategies: any[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'bot_strategies');
  const q = query(colRef, limit(20));

  return onSnapshot(
    q,
    snapshot => {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      onUpdate(items);
    },
    error => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'bot_strategies');
    }
  );
}

/**
 * Sync user profile & learning preferences to Firestore
 */
export async function syncUserProfile(preferredIntervalMinutes: number): Promise<void> {
  if (!auth.currentUser) return;
  const userId = auth.currentUser.uid;
  const path = `users/${userId}`;

  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        uid: userId,
        email: auth.currentUser.email || '',
        displayName: auth.currentUser.displayName || '',
        preferredIntervalMinutes,
        createdAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
