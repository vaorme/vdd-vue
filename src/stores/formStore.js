import { defineStore } from 'pinia';
import { db } from '@/config/firebase';
import { useAuthStore } from '@/stores/authStore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, updateDoc, collection, doc } from "firebase/firestore";

export const useFormStore = defineStore('formStore', {
	state: () => ({
		id: null,
		idNumber: null,
		firstName: '',
		lastName: '',
		fileName: '',
		fileType: '',
		pages: null,
		file: null,
		size: null,
		folderId: null,
		isEditing: false,
		errorMessages: []
	}),
	actions: {
		onFileChange(event) {
			const fileName = event.target.files[0].name;
			this.fileName = fileName;
			this.size = event.target.files[0].size;
			this.file = event.target.files[0];
			this.fileType = fileName.split('.').pop().toLowerCase();
		},
		async uploadFile() {
			const newFile = this.file;
			let path = "";

			if (newFile) {
				try {
					const storage = getStorage();
					const originalFileName = newFile.name;
					const uniqueSuffix = Date.now() + "-" + Math.random().toString(36).substr(2, 9);
					const newFileName = originalFileName.replace(/(\.[\w\d_-]+)$/i, `_${uniqueSuffix}$1`);
					const storageRef = ref(storage, newFileName);
					const snapshot = await uploadBytes(storageRef, newFile);
					path = await getDownloadURL(snapshot.ref);
					return {
						status: true,
						data: {
							path: storageRef.fullPath,
							url: path,
						},
					};
				} catch (error) {
					console.error("Error uploading file:", error);
					return {
						status: false,
						message: error.message,
					};
				}
			}
			return {
				status: false,
			};
		},
		async submitForm(){
			try {
				const authStore = useAuthStore();
				if(this.isEditing){
					await updateDoc(doc(db, "media", this.id), {
						id_number: this.idNumber,
						first_name: this.firstName,
						last_name: this.lastName,
						file_name: this.fileName,
						file_size: this.size,
						pages: this.pages,
					});
					return {
						status: true,
						message: "File Updated",
					}
				}else{
					const resUpload = await this.uploadFile();
					if(!resUpload.status){
						return {
							status: false,
							message: resUpload.message,
						}
					}

					await addDoc(collection(db, "media"), {
						id_number: this.idNumber,
						first_name: this.firstName,
						last_name: this.lastName,
						file_name: this.fileName,
						file_size: this.size,
						file_path: resUpload.data.path,
						file_url: resUpload.data.url,
						file_type: this.fileType,
						folder_id: this.folderId,
						pages: this.pages,
						type: "file",
						pinned: false,
						email: authStore.user.email,
						user_id: authStore.user.uid,
					});

					return {
						status: true,
						message: "File Added",
					}
				}
			} catch (error) {
				console.error("Error submitting form:", error);
				return {
					status: false,
					message: error.message,
				}
			}
		},
		clearForm(){
			this.errorMessages = [];
			this.isEditing = false;
			this.id = null;
			this.idNumber = null;
			this.firstName = '';
			this.lastName = '';
			this.fileName = '';
			this.pages = null;
			this.file = null;
			this.size = null;
		}
	}
});