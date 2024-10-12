import { defineStore } from 'pinia';
import { db, storage } from '@/config/firebase';
import { doc, addDoc, getDoc, updateDoc, deleteDoc,collection, query, where, onSnapshot } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";
import { useAuthStore } from '@/stores/authStore';
import { errorMessages } from 'vue/compiler-sfc';

export const useMediaStore = defineStore('media', {
	state: () => ({
		mediaItems: [],
		isLoading: true,
		unsubscribe: null,
		folderName: '',
		folderId: null,
	}),
	actions: {
		async listenForMediaUpdates(folder){
			if (this.unsubscribe) {
				this.unsubscribe();
			}
			let queryWhere = [];
			if(folder && /^[a-zA-Z0-9]+$/.test(folder)){
				const docExists = await this.mediaExists(folder);
				if (docExists) {
					queryWhere.push(where("folder_id", "==", folder));
				}else{
					queryWhere.push(where("folder_id", "==", ""));
				}
			}else{
				queryWhere.push(where("folder_id", "==", ""));
			}
			const q = query(collection(db, 'media'), ...queryWhere);
			this.unsubscribe = onSnapshot(q, (snapshot) => {
				this.mediaItems = snapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data(),
					loaded: false
				}));
				this.isLoading = false;
			});
		},
		stopListening() {
			if (this.unsubscribe) {
				this.unsubscribe();
			}
		},
		async createFolder(){
			try {
				const authStore = useAuthStore();
				const tryit = await addDoc(collection(db, "media"), {
					folder_name: this.folderName,
					type: "folder",
					pinned: false,
					folder_id: this.folderId,
					user_id: authStore.user.uid,
				});
				return {
					status: true,
					data: tryit
				}
			} catch (error) {
				console.error("Error submitting form:", error);
				return {
					status: false,
					data: error
				}
			}
		},
		async pinMedia(id, status) {
			const updateRef = doc(db, "media", id);
			await updateDoc(updateRef, {
				pinned: status
			});
		},
		async mediaExists(id){
			const docRef = doc(db, "media", id);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				return true;
			}
			return false;
		},
		async deleteMedia(item) {
			if(item.file_path){
				const deleteFile = ref(storage, item.file_path);
				await deleteObject(deleteFile).then(async () => {
					await deleteDoc(doc(db, "media", item.id));
				}).catch((error) => {
					console.log(error);

				});
			}else{
				await deleteDoc(doc(db, "media", item.id));
			}
		}
	}
});
