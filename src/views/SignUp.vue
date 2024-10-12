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
	const confirmPassword = ref('');
	const error = ref('');
	const success = ref('');

	const createUser = async () => {
		error.value = "";
		if(password.value !== confirmPassword.value){
			error.value = "Password must be the same";
			return true;
		}

		try {
			await authStore.signUp(email.value, password.value);
			success.value = "User created successfully";
			clearFields();
		} catch (err) {
			error.value = err.message;
		}
	}
	const clearFields = () =>{
		email.value = "";
		password.value = "";
	}
</script>
<template>
	<div class="signup">
		<form @submit.prevent="createUser" class="frmo grid gap-4 m-auto max-w-md">
			<div class="frmo-group grid">
				<label for="firstName">Email:</label>
				<InputText type="text" v-model="email" required/>
			</div>
			<div class="frmo-group grid">
				<label for="firstName">Password</label>
				<InputText type="password" v-model="password" required/>
			</div>
			<div class="frmo-group grid">
				<label for="firstName">Confirm Password</label>
				<InputText type="password" v-model="confirmPassword" required/>
			</div>
			<Button type="submit" label="Sign Up"/>
			<Button to="/login" as="router-link" label="Log In" severity="info"/>
			<Message severity="error" v-if="error">{{ error }}</Message>
			<Message severity="success" v-if="success">{{ success }}</Message>
		</form>
	</div>
</template>
