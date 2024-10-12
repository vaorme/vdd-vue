<script setup>
	import { useRoute } from 'vue-router';
	import { onMounted, watch } from 'vue';
	import Button from "primevue/button";
	import InputText from 'primevue/inputtext';
	import InputNumber from 'primevue/inputnumber';
	import Message from 'primevue/message';

	import { useToast } from "primevue/usetoast";
	//@ts-ignore
	import { useFormStore } from '@/stores/formStore';

	const toast = useToast();
	const formStore = useFormStore();
	const route = useRoute();

	const handleFormSubmit = async () => {
		if(!validateFields()){
			return;
		}
		formStore.errorMessages = [];
		const resForm = await formStore.submitForm();
		if(resForm.status){
			toast.add({severity: 'success', summary: 'Success', detail: resForm.message, life: 3000});
		}else{
			toast.add({severity: 'error', summary: 'Error', detail: resForm.message, life: 3000});
		}
		formStore.clearForm();
	};

	const validateFields = () => {
		formStore.errorMessages = [];
		if(!formStore.idNumber){
			formStore.errorMessages.push("ID Number is required");
		}
		if(!formStore.firstName){
			formStore.errorMessages.push("First Name is required");
		}
		if(!formStore.lastName){
			formStore.errorMessages.push("Last Name is required");
		}
		if(!formStore.fileName){
			formStore.errorMessages.push("File Name is required");
		}
		if(!formStore.file && !formStore.isEditing){
			formStore.errorMessages.push("File is required");
		}
		if(formStore.errorMessages.length > 0){
			return false;
		}
		if(!formStore.isEditing && formStore.file.size > 1024 * 1024 * 2){
			formStore.errorMessages.push("File size cannot be greater than 2MB");
			return false;
		}
		return true;
	}
	watch(() => route.params.folder, () => {
		formStore.folderId = route.params.folder;
	});
	onMounted(() => {
		formStore.folderId = route.params.folder;
	});
</script>
<template>
	<form @submit.prevent="handleFormSubmit" class="frmo flex flex-col gap-2">
		<Message severity="error" v-if="formStore.errorMessages.length > 0">
			<ul>
				<li v-for="(error, index) in formStore.errorMessages" :key="index">{{ error }}</li>
			</ul>
		</Message>
		<input type="hidden" name="itemId" v-model="formStore.id">
		<input type="hidden" name="folderId" v-model="formStore.folderId">
		<div class="frmo-group flex flex-col gap-2">
			<label for="firstName">ID Number:</label>
			<InputNumber type="text" inputId="withoutgrouping" :useGrouping="false" v-model="formStore.idNumber"/>
		</div>
		<div class="frmo-group flex flex-col gap-2">
			<label for="firstName">First Name:</label>
			<InputText type="text" v-model="formStore.firstName"/>
		</div>
		<div class="frmo-group flex flex-col gap-2">
			<label for="lastName">Last Name:</label>
			<InputText type="text" v-model="formStore.lastName"/>
		</div>
		<div class="frmo-group flex flex-col gap-2" v-if="!formStore.isEditing">
			<label for="fileInput">Select File:</label>
			<input type="file" @change="formStore.onFileChange" />
		</div>
		<div class="frmo-group flex flex-col gap-2">
			<label for="fileName">File Name:</label>
			<InputText type="text" v-model="formStore.fileName"/>
		</div>
		<div class="frmo-group flex flex-col gap-2">
			<label for="pages">Amount of Pages:</label>
			<InputNumber type="text" inputId="withoutgrouping" :useGrouping="false" v-model="formStore.pages"/>
		</div>
		<div class="frmo-group flex flex-col gap-2">
			<label>Size:</label>
			<InputText type="text" :value="formStore.size" disabled />
		</div>
		<Button type="submit" severity="contrast">{{ formStore.isEditing ? 'Update' : 'Submit' }}</Button>
		<Button severity="secondary" @click="formStore.clearForm()" v-if="formStore.isEditing">Cancel</Button>
	</form>
</template>