<script lang="ts">
  import { configStore, toastStore } from '$lib/stores/index.svelte';
  import type { SMTPConfig } from '$lib/types';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  // Modal state
  let showModal = $state(false);
  let isEditing = $state(false);
  let editingConfigId = $state<string | null>(null);

  // Form state
  let formName = $state('');
  let formHost = $state('');
  let formPort = $state(587);
  let formSecure = $state(false);
  let formUser = $state('');
  let formPass = $state('');
  let formFromEmail = $state('');
  let formFromName = $state('');
  let formIsDefault = $state(false);

  let isSaving = $state(false);
  let isDeleting = $state<string | null>(null);
  let showPassword = $state(false);

  function resetForm() {
    formName = '';
    formHost = '';
    formPort = 587;
    formSecure = false;
    formUser = '';
    formPass = '';
    formFromEmail = '';
    formFromName = '';
    formIsDefault = false;
    isEditing = false;
    editingConfigId = null;
    showPassword = false;
  }

  function openAddModal() {
    resetForm();
    showModal = true;
  }

  function openEditModal(config: SMTPConfig) {
    isEditing = true;
    editingConfigId = config.id;
    formName = config.name;
    formHost = config.host;
    formPort = config.port;
    formSecure = config.secure;
    formUser = config.user;
    formPass = ''; // Don't show existing password
    formFromEmail = config.fromEmail;
    formFromName = config.fromName;
    formIsDefault = config.isDefault;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    resetForm();
  }

  async function handleSubmit() {
    if (!formName || !formHost || !formUser || !formFromEmail) {
      toastStore.error('Please fill in all required fields');
      return;
    }

    if (!isEditing && !formPass) {
      toastStore.error('Password is required for new configurations');
      return;
    }

    isSaving = true;

    try {
      const configData = {
        name: formName,
        host: formHost,
        port: formPort,
        secure: formSecure,
        user: formUser,
        pass: formPass,
        fromEmail: formFromEmail,
        fromName: formFromName,
        isDefault: formIsDefault
      };

      let response;
      if (isEditing && editingConfigId) {
        // Only send password if it was changed
        if (!formPass) {
          delete (configData as any).pass;
        }
        response = await configStore.updateConfig(editingConfigId, configData);
      } else {
        response = await configStore.createConfig(configData as any);
      }

      if (response.success) {
        toastStore.success(isEditing ? 'Configuration updated' : 'Configuration created');
        closeModal();
      } else {
        toastStore.error(response.message || 'Failed to save configuration');
      }
    } catch (error) {
      toastStore.error('Error saving configuration');
    } finally {
      isSaving = false;
    }
  }

  async function handleDelete(configId: string) {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    isDeleting = configId;
    try {
      const response = await configStore.deleteConfig(configId);
      if (response.success) {
        toastStore.success('Configuration deleted');
      } else {
        toastStore.error(response.message || 'Failed to delete configuration');
      }
    } catch (error) {
      toastStore.error('Error deleting configuration');
    } finally {
      isDeleting = null;
    }
  }

  async function handleSetDefault(configId: string) {
    try {
      const response = await configStore.setDefault(configId);
      if (response.success) {
        toastStore.success('Default configuration updated');
      } else {
        toastStore.error(response.message || 'Failed to set default');
      }
    } catch (error) {
      toastStore.error('Error setting default configuration');
    }
  }

  // Quick presets for common SMTP providers
  function applyPreset(preset: string) {
    switch (preset) {
      case 'gmail':
        formHost = 'smtp.gmail.com';
        formPort = 465;
        formSecure = true;
        break;
      case 'outlook':
        formHost = 'smtp-mail.outlook.com';
        formPort = 587;
        formSecure = false;
        break;
      case 'yahoo':
        formHost = 'smtp.mail.yahoo.com';
        formPort = 465;
        formSecure = true;
        break;
      case 'sendgrid':
        formHost = 'smtp.sendgrid.net';
        formPort = 587;
        formSecure = false;
        break;
    }
  }
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center">
    <div>
      <h2 class="text-lg font-semibold text-gray-900">SMTP Configurations</h2>
      <p class="text-sm text-gray-500">Manage email sending settings</p>
    </div>
    <Button size="sm" onclick={openAddModal}>
      Add
    </Button>
  </div>

  {#if configStore.configs.length === 0}
    <Card>
      <div class="text-center py-8">
        <div class="text-4xl mb-3">📧</div>
        <h3 class="font-medium text-gray-900 mb-1">No Configurations</h3>
        <p class="text-sm text-gray-500 mb-4">Add your first SMTP configuration</p>
        <Button size="sm" onclick={openAddModal}>
          Add Configuration
        </Button>
      </div>
    </Card>
  {:else}
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {#each configStore.configs as config}
        <Card class="relative">
          {#if config.isDefault}
            <span class="absolute top-3 right-3 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">
              Default
            </span>
          {/if}

          <div class="space-y-2">
            <h3 class="text-sm font-medium text-gray-900 pr-14">{config.name}</h3>

            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span class="text-gray-500">Host:</span>
                <span class="font-mono">{config.host}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Port:</span>
                <span class="font-mono">{config.port}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">From:</span>
                <span class="truncate max-w-[140px]">{config.fromEmail}</span>
              </div>
            </div>

            <div class="flex gap-1 pt-2 border-t border-gray-100">
              <Button variant="ghost" size="sm" onclick={() => openEditModal(config)}>
                Edit
              </Button>
              {#if !config.isDefault}
                <Button variant="ghost" size="sm" onclick={() => handleSetDefault(config.id)}>
                  Default
                </Button>
              {/if}
              <Button
                variant="ghost"
                size="sm"
                onclick={() => handleDelete(config.id)}
                loading={isDeleting === config.id}
                class="text-red-600 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>

<!-- Modal -->
{#if showModal}
  <div class="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
    <div class="bg-white rounded-t-xl sm:rounded-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <h2 class="text-base font-medium text-gray-900">
          {isEditing ? 'Edit Configuration' : 'Add Configuration'}
        </h2>
        <button onclick={closeModal} class="text-gray-400 hover:text-gray-600 p-1">
          ✕
        </button>
      </div>

      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="p-4 space-y-4">
        <div class="flex flex-wrap gap-1.5">
          <button type="button" onclick={() => applyPreset('gmail')}
            class="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100">
            Gmail
          </button>
          <button type="button" onclick={() => applyPreset('outlook')}
            class="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
            Outlook
          </button>
          <button type="button" onclick={() => applyPreset('yahoo')}
            class="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100">
            Yahoo
          </button>
          <button type="button" onclick={() => applyPreset('sendgrid')}
            class="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100">
            SendGrid
          </button>
        </div>

        <Input
          label="Name"
          bind:value={formName}
          placeholder="My Gmail Account"
          required
        />

        <div class="grid grid-cols-3 gap-3">
          <div class="col-span-2">
            <Input
              label="Host"
              bind:value={formHost}
              placeholder="smtp.gmail.com"
              required
            />
          </div>
          <Input
            label="Port"
            type="number"
            bind:value={formPort}
            required
          />
        </div>

        <label class="flex items-center gap-2">
          <input type="checkbox" bind:checked={formSecure} class="rounded text-indigo-600" />
          <span class="text-sm text-gray-700">SSL/TLS (port 465)</span>
        </label>

        <div class="grid grid-cols-2 gap-3">
          <Input
            label="Username"
            bind:value={formUser}
            placeholder="you@example.com"
            required
          />
          <div class="relative">
            <Input
              label={isEditing ? "Password" : "Password"}
              type={showPassword ? 'text' : 'password'}
              bind:value={formPass}
              placeholder="App password"
              required={!isEditing}
            />
            <button
              type="button"
              onclick={() => showPassword = !showPassword}
              class="absolute right-2 top-7 text-gray-400 hover:text-gray-600 text-sm"
            >
              {showPassword ? '🔒' : '👁'}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <Input
            label="From Email"
            type="email"
            bind:value={formFromEmail}
            placeholder="sender@example.com"
            required
          />
          <Input
            label="From Name"
            bind:value={formFromName}
            placeholder="Your Name"
          />
        </div>

        <label class="flex items-center gap-2">
          <input type="checkbox" bind:checked={formIsDefault} class="rounded text-indigo-600" />
          <span class="text-sm text-gray-700">Set as default</span>
        </label>

        {#if formHost.includes('gmail')}
          <div class="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs">
            <p class="font-medium text-amber-800 mb-1">Gmail Setup:</p>
            <ul class="text-amber-700 list-disc list-inside space-y-0.5">
              <li>Enable 2FA on your Google account</li>
              <li>Generate App Password at myaccount.google.com/apppasswords</li>
            </ul>
          </div>
        {/if}

        <div class="flex gap-2 pt-3 border-t border-gray-100">
          <Button type="button" variant="secondary" onclick={closeModal} class="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={isSaving} class="flex-1">
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}

