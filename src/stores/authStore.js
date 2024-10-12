// stores/authStore.js
import { defineStore } from 'pinia';
import { auth } from '@/config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence, } from "firebase/auth";

export const useAuthStore = defineStore('authStore', {
	state: () => ({
		user: null,
		loading: false,
	}),
	getters: {
		isAuthenticated: (state) => !!state.user,
	},
	actions: {
		async initAuth() {
			await setPersistence(auth, browserLocalPersistence);
			onAuthStateChanged(auth, (user) => {
				if (user) {
					this.user = user;
				} else {
					this.user = null;
				}
				this.loading = false;
			});
		},
		async signUp(email, password) {
			try {
				this.loading = true;
				const userCredential = await createUserWithEmailAndPassword(auth, email, password);
				this.user = userCredential.user;
			} catch (error) {
				console.error(error.message);
			throw error;
			} finally {
				this.loading = false;
			}
		},
		async logIn(email, password) {
			try {
				this.loading = true;
				const userCredential = await signInWithEmailAndPassword(auth, email, password);
				this.user = userCredential.user;
			} catch (error) {
				console.error(error.message);
			throw error;
			} finally {
				this.loading = false;
			}
		},
		async logOut() {
			await signOut(auth).then((res) => {
				console.log(res);

			}).catch((error) => {
				console.log(error);

			});
		},
		setUser(user) {
			this.user = user;
		},
		checkAuthState() {
			onAuthStateChanged(auth, (user) => {
				this.user = user;
			});
		},
	},
});
