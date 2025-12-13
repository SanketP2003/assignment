<script lang="ts">
  import { toastStore } from '$lib/stores/index.svelte';
  const styles: Record<string, string> = { success: 'bg-green-600', error: 'bg-red-600', warning: 'bg-amber-500', info: 'bg-indigo-600' };
</script>

<div class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 flex flex-col gap-2">
  {#each toastStore.toasts as toast (toast.id)}
    <div class="flex items-center gap-2 px-3 py-2.5 rounded-md text-white text-sm sm:min-w-[240px] {styles[toast.type]} animate-slide-up" role="alert">
      <p class="flex-1">{toast.message}</p>
      <button onclick={() => toastStore.remove(toast.id)} class="hover:opacity-70 text-white/80 text-xs" aria-label="Dismiss">✕</button>
    </div>
  {/each}
</div>



