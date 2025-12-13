<script lang="ts">
  let {
    label,
    type = 'text',
    name,
    value = $bindable(''),
    placeholder = '',
    required = false,
    disabled = false,
    class: className = ''
  }: {
    label?: string;
    type?: 'text' | 'email' | 'password' | 'number';
    name?: string;
    value?: string | number;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    class?: string;
  } = $props();
</script>

<div class="w-full {className}">
  {#if label}
    <label class="block text-sm font-medium text-gray-700 mb-1">
      {label}{#if required}<span class="text-red-500">*</span>{/if}
    </label>
  {/if}
  <input
    {type}
    {name}
    bind:value
    {placeholder}
    {required}
    {disabled}
    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
  />
</div>

