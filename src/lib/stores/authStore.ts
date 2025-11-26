import { writable } from 'svelte/store';
import type { User } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  let authInitialized = false;

  onAuthStateChanged(auth, (user) => {
    authInitialized = true;
    update(state => ({
      ...state,
      user,
      loading: false
    }));
  });

  setTimeout(() => {
    if (!authInitialized) {
      update(state => ({
        ...state,
        loading: false
      }));
    }
  }, 3000);

  return {
    subscribe,
    signIn: async (email: string, password: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      try {
        await signInWithEmailAndPassword(auth, email, password);
        update(state => ({ ...state, loading: false }));
      } catch (error: any) {
        update(state => ({
          ...state,
          loading: false,
          error: error.message
        }));
        throw error;
      }
    },
    signOut: async () => {
      update(state => ({ ...state, loading: true }));
      try {
        await firebaseSignOut(auth);
        update(state => ({ ...state, user: null, loading: false }));
      } catch (error: any) {
        update(state => ({ ...state, loading: false, error: error.message }));
      }
    },
    clearError: () => {
      update(state => ({ ...state, error: null }));
    }
  };
}

export const authStore = createAuthStore();
