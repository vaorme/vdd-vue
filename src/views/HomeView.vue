<script setup>
	import Form from '@/components/Form.vue';
	import Media from '@/components/Media.vue';
	import GuestAlert from '@/components/GuestAlert.vue';
	//@ts-ignore
	import { useAuthStore } from '@/stores/authStore';
	import { onMounted } from 'vue';

	const authStore = useAuthStore();
	onMounted(() => {
		authStore.checkAuthState();
	});
</script>
<template>
	<div class="wrapper">
		<Media/>
		<Form v-if="authStore.isAuthenticated"/>
		<GuestAlert v-else/>
	</div>
</template>