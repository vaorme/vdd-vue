<script setup>
	//@ts-ignore
	import { useFormStore } from '@/stores/formStore';
	//@ts-ignore
	import { useMediaStore } from '@/stores/mediaStore';
	//@ts-ignore
	import { useAuthStore } from '@/stores/authStore';
	//@ts-ignore
	import { humanizeFileSize, isImage } from '@/helpers/helpers';
	import { onMounted, watch, onUnmounted, ref } from 'vue';
	import { useRoute, useRouter } from 'vue-router';
	import Button from "primevue/button";
	import Skeleton from 'primevue/skeleton';
	import Message from 'primevue/message';
	import ConfirmDialog from 'primevue/confirmdialog';
	import { useConfirm } from "primevue/useconfirm";
	import Image from 'primevue/image';
	import Drawer from 'primevue/drawer';
	import Dialog from 'primevue/dialog';
	import InputText from 'primevue/inputtext';
	import Fieldset from 'primevue/fieldset';
	import FolderIcon from './icons/FolderIcon.vue';
	import FileIcon from './icons/FileIcon.vue';
	import PinnedIcon from './icons/PinnedIcon.vue';
	import PinnIcon from './icons/PinnIcon.vue';
	import Deleteicon from './icons/Deleteicon.vue';
	import EditIcon from './icons/EditIcon.vue';

	const route = useRoute();
	const router = useRouter();
	const confirm = useConfirm();
	const mediaStore = useMediaStore();
	const formStore = useFormStore();
	const authStore = useAuthStore();
	const isVisibleRemoveDialog = ref(false);
	const visible = ref(false);
	const visibleDrawer = ref(false);
	const itemDetail = ref(null);

	function goBack() {
		router.back()
	}

	const dialogFolder = async () =>{
		const res = await mediaStore.createFolder();
		if(res?.status){
			visible.value = false;
		}
	}

	const viewItem = async (item) =>{
		if(item.type === 'folder'){
			router.push({ name: 'home', params: { folder: item.id } })
		}else{
			visibleDrawer.value = true;
			itemDetail.value = item;
		}
	}

	const editItem = async (item) =>{
		formStore.isEditing = true;
		formStore.id = item.id;
		formStore.idNumber = item.id_number;
		formStore.firstName = item.first_name;
		formStore.lastName = item.last_name;
		formStore.fileName = item.file_name;
		formStore.pages = item.pages;
		formStore.size = item.file_size;
		formStore.fileType = item.file_type;
		formStore.folderId = item.folder_id;
	}

	const openDialog = (item) => {
		confirm.require({
			message: 'Are you sure you want to delete this media?',
			header: 'Confirmation',
			rejectClass: 'p-button-contrast',
			acceptClass: 'p-button-danger',
			onShow: () => {
				isVisibleRemoveDialog.value = true;
			},
			onHide: () => {
				isVisibleRemoveDialog.value = false;
			},
			accept: () =>{
				mediaStore.deleteMedia(item);
				isVisibleRemoveDialog.value = false;
			}
		});
	};
	watch(() => route.params.folder, (newFolderId) => {
		mediaStore.listenForMediaUpdates(newFolderId);
		mediaStore.folderId = route.params.folder;
	});
	onMounted(() => {
		authStore.checkAuthState();
		mediaStore.folderId = route.params.folder;
		mediaStore.listenForMediaUpdates(route.params.folder);
	});
	onUnmounted(() => {
		mediaStore.stopListening();
	});
</script>
<template>
	<div class="explorer">
		<div class="title flex mb-6 justify-between items-center">
			<h2 class="font-bold uppercase text-lg">Media</h2>
			<div class="actions flex gap-4">
				<Button label="Go Back" severity="contrast" v-if="route.params.folder" @click="goBack"/>
				<Button @click="visible = true" v-if="authStore.isAuthenticated">Create Folder</Button>
			</div>
		</div>
		<div v-if="mediaStore.isLoading" class="media-item">
			<Skeleton width="100%" height="10rem"></Skeleton>
		</div>
		<div class="media grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" v-else-if="mediaStore.mediaItems.length > 0">
			<div v-for="item in mediaStore.mediaItems" :key="item.id" class="media-item" :class="{
				pinned: item.pinned,
				folder: item.type === 'folder'
			}" @click="viewItem(item)">
				<div class="box">
					<div class="image">
						<img :src="item.file_url" v-if="isImage(item.file_type)">
						<div class="icon" v-else-if="item.type !== 'folder'"><FileIcon/></div>
						<div class="icon" v-if="item.type === 'folder'"><FolderIcon/></div>
					</div>
					<h4 v-if="item.type === 'folder'" class="font-bold text-sm text-center">{{ item.folder_name }}</h4>
					<h4 v-if="item.type !== 'folder' && !isImage(item.file_type)" class="font-bold text-sm text-center">{{ item.file_name }}</h4>
					<div class="actions">
						<Button severity="warn" aria-label="Pin" @click.stop="mediaStore.pinMedia(item.id, !item.pinned)" v-if="authStore.isAuthenticated">
							<div class="icon" v-if="item.pinned"><PinnedIcon/></div>
							<div class="icon" v-else><PinnIcon/></div>
						</Button>
						<Button severity="contrast" aria-label="Edit" @click.stop="editItem(item)" v-if="authStore.isAuthenticated && item.type !== 'folder'"><EditIcon/></Button>
						<Button severity="danger" aria-label="Cancel" @click.stop="openDialog(item)" v-if="authStore.isAuthenticated && !item.pinned"><Deleteicon/></Button>
					</div>
				</div>
			</div>
		</div>
		<Message v-else severity="secondary" class="text-center">No media found</Message>
		<!-- ? Confirm Delete -->
		<ConfirmDialog></ConfirmDialog>
		<!-- ? Dialog Create Folder -->
		<Dialog v-model:visible="visible" modal header="Create folder" :style="{ width: '25rem' }">
			<input type="hidden" name="folderId" v-model="mediaStore.folderId">
			<div class="flex items-center gap-4 mb-4">
				<label for="username" class="font-semibold w-24">Name</label>
				<InputText id="username" v-model="mediaStore.folderName" class="flex-auto" autocomplete="off" />
			</div>
			<div class="flex justify-end gap-2">
				<Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
				<Button type="button" label="Save" @click="dialogFolder"></Button>
			</div>
		</Dialog>
		<!-- ? File detail -->
		<Drawer v-model:visible="visibleDrawer" :header="itemDetail.file_name" v-if="itemDetail">
			<div class="image" v-if="isImage(itemDetail.file_type)">
				<Image :src="itemDetail.file_url" alt="Image" width="180" preview />
			</div>
			<Fieldset legend="ID Number" v-if="itemDetail.id_number">
				<p class="m-0">{{ itemDetail.id_number }}</p>
			</Fieldset>
			<Fieldset legend="Name" v-if="itemDetail.first_name">
				<p class="m-0">{{ itemDetail.first_name + ' ' + itemDetail.last_name }}</p>
			</Fieldset>
			<Fieldset legend="Pages" v-if="itemDetail.pages">
				<p class="m-0">{{ itemDetail.pages }}</p>
			</Fieldset>
			<Fieldset legend="Size" v-if="itemDetail.file_size">
				<p class="m-0">{{ humanizeFileSize(itemDetail.file_size) }}</p>
			</Fieldset>
			<Fieldset legend="Type" v-if="itemDetail.file_type">
				<p class="m-0">{{ itemDetail.file_type }}</p>
			</Fieldset>
		</Drawer>
	</div>
</template>