<script lang="ts">
  let { title = '', class: className = '', children }: { title?: string; class?: string; children?: any } = $props();
</script>

<div class="bg-white rounded-lg border border-gray-200 {className}">
  {#if title}
    <div class="px-4 py-3 border-b border-gray-100">
      <h3 class="text-sm font-medium text-gray-900">{title}</h3>
    </div>
  {/if}
  <div class="p-4">
    {@render children?.()}
  </div>
</div>

