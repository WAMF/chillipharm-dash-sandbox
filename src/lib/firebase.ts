import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAudqbkOI2z0uoYy3fvhA8oaYHSNYIPprs",
  authDomain: "chillipharm-dashboard.firebaseapp.com",
  projectId: "chillipharm-dashboard",
  storageBucket: "chillipharm-dashboard.firebasestorage.app",
  messagingSenderId: "336772253694",
  appId: "1:336772253694:web:d9fcc4475657f90e8722af"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
