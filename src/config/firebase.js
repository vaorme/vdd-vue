import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from 'firebase/firestore';
import { onAuthStateChanged, getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useAuthStore } from '@/stores/authStore';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const fired = initializeApp(firebaseConfig);
const storage = getStorage(fired);
const auth = getAuth(fired);
const db = getFirestore(fired);

setPersistence(auth, browserLocalPersistence).then(() => {
	onAuthStateChanged(auth, (user) => {
		const authStore = useAuthStore();
		if (user) {
			authStore.setUser(user);
		} else {
			authStore.setUser(null);
		}
	});
}).catch((error) => {
	console.error("Error setting persistence:", error);
});
export { fired, db, storage, auth };