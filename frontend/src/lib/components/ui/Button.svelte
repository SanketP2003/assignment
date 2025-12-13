<script lang="ts">
  let {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    type = 'button',
    class: className = '',
    onclick,
    children
  }: {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
    onclick?: (e: MouseEvent) => void;
    children?: any;
  } = $props();

  const variants: Record<string, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-600 hover:bg-gray-100'
  };

  const sizes: Record<string, string> = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-sm'
  };
</script>

<button
  {type}
  class="inline-flex items-center justify-center font-medium rounded-md transition-colors disabled:opacity-50 {variants[variant]} {sizes[size]} {className}"
  disabled={disabled || loading}
  {onclick}
>
  {#if loading}
    <svg class="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
  {/if}
  {@render children?.()}
</button>

