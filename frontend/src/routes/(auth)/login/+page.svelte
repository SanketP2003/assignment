<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore, toastStore } from '$lib/stores/index.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  let activeTab = $state<'login' | 'register'>('login');
  let isLoading = $state(false);

  // Login form
  let loginEmail = $state('');
  let loginPassword = $state('');

  // Register form
  let registerName = $state('');
  let registerEmail = $state('');
  let registerPassword = $state('');
  let registerConfirmPassword = $state('');

  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toastStore.error('Please fill in all fields');
      return;
    }

    isLoading = true;
    try {
      const response = await authStore.login(loginEmail, loginPassword);
      if (response.success) {
        toastStore.success('Login successful!');
        goto('/');
      } else {
        toastStore.error(response.message || 'Login failed');
      }
    } catch (error) {
      toastStore.error('An error occurred. Please try again.');
    } finally {
      isLoading = false;
    }
  }

  async function handleRegister(e: SubmitEvent) {
    e.preventDefault();

    if (!registerName || !registerEmail || !registerPassword) {
      toastStore.error('Please fill in all fields');
      return;
    }

    if (registerPassword.length < 6) {
      toastStore.error('Password must be at least 6 characters');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toastStore.error('Passwords do not match');
      return;
    }

    isLoading = true;
    try {
      const response = await authStore.register(registerEmail, registerName, registerPassword);
      if (response.success) {
        toastStore.success('Account created successfully!');
        goto('/');
      } else {
        toastStore.error(response.message || 'Registration failed');
      }
    } catch (error) {
      toastStore.error('An error occurred. Please try again.');
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Login - Email Sender</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <div class="w-full max-w-sm">
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="text-center mb-6">
        <h1 class="text-xl font-semibold text-gray-900">
          📧 Email Sender
        </h1>
        <p class="text-sm text-gray-500 mt-1">Bulk email management</p>
      </div>

      <div class="flex border-b border-gray-200 mb-5">
        <button
          class="flex-1 pb-2.5 text-sm font-medium border-b-2 transition-colors
                 {activeTab === 'login'
                   ? 'border-indigo-600 text-indigo-600'
                   : 'border-transparent text-gray-500 hover:text-gray-700'}"
          onclick={() => activeTab = 'login'}
        >
          Sign In
        </button>
        <button
          class="flex-1 pb-2.5 text-sm font-medium border-b-2 transition-colors
                 {activeTab === 'register'
                   ? 'border-indigo-600 text-indigo-600'
                   : 'border-transparent text-gray-500 hover:text-gray-700'}"
          onclick={() => activeTab = 'register'}
        >
          Sign Up
        </button>
      </div>

      {#if activeTab === 'login'}
        <form onsubmit={handleLogin} class="space-y-4">
          <Input
            label="Email"
            type="email"
            bind:value={loginEmail}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            bind:value={loginPassword}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            class="w-full"
          >
            Sign In
          </Button>
        </form>
      {:else}
        <form onsubmit={handleRegister} class="space-y-4">
          <Input
            label="Name"
            type="text"
            bind:value={registerName}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email"
            type="email"
            bind:value={registerEmail}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            bind:value={registerPassword}
            placeholder="At least 6 characters"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            bind:value={registerConfirmPassword}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            class="w-full"
          >
            Create Account
          </Button>
        </form>
      {/if}
    </div>
  </div>
</div>

