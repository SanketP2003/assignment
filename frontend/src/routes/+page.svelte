<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/index.svelte';

  onMount(async () => {
    await authStore.checkAuth();
    if (authStore.isAuthenticated) {
      goto('/dashboard');
    } else {
      goto('/login');
    }
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent"></div>
</div>

