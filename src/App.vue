<script setup>
	import { RouterLink, RouterView } from 'vue-router';
	import { onMounted } from 'vue';
	//@ts-ignore
	import { useAuthStore } from '@/stores/authStore';
	import Button from "primevue/button";
	import Toast from 'primevue/toast';

	const authStore = useAuthStore();
	onMounted(() => {
		authStore.checkAuthState();
	});

	const logout = async () => {
		try {
			await authStore.logOut();
			console.log("User logged out successfully.");
			// Optionally, redirect or update UI state here
		} catch (error) {
			console.error("Logout error:", error);
		}
	};
</script>
<template>
	<header class="header">
		<div class="wrapper">
			<div class="logo">
				<RouterLink to="/">
					<img alt="Vue logo" class="logo" src="@/assets/logo.svg" />
				</RouterLink>
			</div>
			<nav>
				<Button to="/login" as="router-link" v-if="!authStore.isAuthenticated" severity="contrast">Login</Button>
				<Button @click="logout" v-if="authStore.isAuthenticated" severity="danger">Logout</Button>
			</nav>
		</div>
	</header>
	<main class="main">
		<RouterView />
	</main>
	<Toast />
</template>