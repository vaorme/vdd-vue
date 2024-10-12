<script setup>
	//@ts-ignore
	import { auth } from '@/config/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import InputText from 'primevue/inputtext';
	import Button from 'primevue/button';
	import Message from 'primevue/message';
	import { ref } from 'vue';
	import { useRouter } from 'vue-router';
	//@ts-ignore
	import { useAuthStore } from '@/stores/authStore';

	const router = useRouter();
	onAuthStateChanged(auth, (user) => {
		if (user) {
			router.push('/');
		}
	});

	const authStore = useAuthStore();

	const email = ref('');
	const password = ref('');
	const error = ref('');

	const submitForm = async () => {
		try {
			await authStore.logIn(email.value, password.value);
		} catch (err) {
			error.value = err.message;
		}
	}
</script>
<template>
	<div class="login">
		<form @submit.prevent="submitForm" class="frmo grid gap-4 m-auto max-w-md">
			<div class="frmo-group grid">
				<label for="firstName">Email:</label>
				<InputText type="text" v-model="email" required/>
			</div>
			<div class="frmo-group grid">
				<label for="firstName">Password</label>
				<InputText type="password" v-model="password" required/>
			</div>
			<Button type="submit" label="Log In" severity="info"/>
			<Button to="/sign-up" as="router-link" label="Sign Up"/>
			<Message severity="error" v-if="error">{{ error }}</Message>
		</form>
	</div>
</template>
