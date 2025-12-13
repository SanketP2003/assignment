<script lang="ts">
  import { configStore, toastStore, reportStore } from '$lib/stores/index.svelte';
  import { api } from '$lib/api/client';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  // Form state
  let subject = $state('');
  let htmlContent = $state('');
  let excelFile = $state<File | null>(null);
  let htmlTemplateFile = $state<File | null>(null);

  // Contacts from Excel
  let contacts = $state<any[]>([]);
  let contactColumns = $state<string[]>([]);

  // Send range
  let sendRange = $state<'all' | 'first' | 'range'>('all');
  let firstN = $state(10);
  let rangeFrom = $state(1);
  let rangeTo = $state(10);

  // Batch settings
  let useBatch = $state(false);
  let batchSize = $state(20);
  let batchDelay = $state(60);
  let emailDelay = $state(45);

  // Schedule settings
  let scheduleEmail = $state(false);
  let scheduledTime = $state('');
  let notifyEmail = $state('');

  // UI state
  let isLoading = $state(false);
  let isSending = $state(false);
  let previewHtml = $state('');

  // Computed
  let selectedContacts = $derived(() => {
    if (contacts.length === 0) return [];
    switch (sendRange) {
      case 'first':
        return contacts.slice(0, firstN);
      case 'range':
        return contacts.slice(rangeFrom - 1, rangeTo);
      default:
        return contacts;
    }
  });

  let selectedContactCount = $derived(selectedContacts().length);

  async function handleExcelChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    excelFile = file;
    isLoading = true;

    try {
      const formData = new FormData();
      formData.append('excelFile', file);

      const response = await api.parseExcel(formData);
      if (response.success && response.data) {
        contacts = response.data.contacts || [];
        contactColumns = response.data.columns || [];
        toastStore.success(`Loaded ${contacts.length} contacts from Excel`);
      } else {
        toastStore.error(response.message || 'Failed to parse Excel file');
      }
    } catch (error) {
      toastStore.error('Error parsing Excel file');
    } finally {
      isLoading = false;
    }
  }

  async function handleHtmlTemplateChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    htmlTemplateFile = file;

    try {
      const text = await file.text();
      htmlContent = text;
      previewHtml = text;
      toastStore.success('HTML template loaded');
    } catch (error) {
      toastStore.error('Error loading HTML template');
    }
  }

  async function handleSend() {
    // Validation
    if (!configStore.selectedConfigId) {
      toastStore.error('Please select an SMTP configuration');
      return;
    }

    if (!subject.trim()) {
      toastStore.error('Please enter a subject');
      return;
    }

    if (!excelFile) {
      toastStore.error('Please upload an Excel file with contacts');
      return;
    }

    if (!htmlContent.trim() && !htmlTemplateFile) {
      toastStore.error('Please enter email content or upload an HTML template');
      return;
    }

    if (scheduleEmail && !scheduledTime) {
      toastStore.error('Please select a scheduled time');
      return;
    }

    isSending = true;

    try {
      const formData = new FormData();
      formData.append('configId', configStore.selectedConfigId);
      formData.append('subject', subject);
      formData.append('htmlContent', htmlContent);
      formData.append('excelFile', excelFile);

      if (htmlTemplateFile) {
        formData.append('htmlTemplate', htmlTemplateFile);
      }

      // Range settings
      formData.append('sendRange', sendRange);
      formData.append('firstN', String(firstN));
      formData.append('rangeFrom', String(rangeFrom));
      formData.append('rangeTo', String(rangeTo));

      // Batch settings
      if (useBatch) {
        formData.append('useBatch', 'on');
        formData.append('batchSize', String(batchSize));
        formData.append('batchDelay', String(batchDelay));
        formData.append('emailDelay', String(emailDelay));
      }

      // Schedule settings
      if (scheduleEmail) {
        formData.append('scheduleEmail', 'on');
        formData.append('scheduledTime', scheduledTime);
        if (notifyEmail) {
          formData.append('notifyEmail', notifyEmail);
        }
      }

      const response = await api.sendEmail(formData);

      if (response.success) {
        toastStore.success(response.message || 'Emails sent successfully!');
        await reportStore.loadReport();

        // Reset form
        subject = '';
        htmlContent = '';
        excelFile = null;
        htmlTemplateFile = null;
        contacts = [];
      } else {
        toastStore.error(response.message || 'Failed to send emails');
      }
    } catch (error) {
      toastStore.error('Error sending emails');
    } finally {
      isSending = false;
    }
  }
</script>

<div class="space-y-4">
  <Card title="SMTP Configuration">
    {#if configStore.configs.length === 0}
      <p class="text-gray-500 text-center py-4 text-sm">
        No SMTP configurations found. Add one in Settings.
      </p>
    {:else}
      <div class="space-y-2">
        {#each configStore.configs as config}
          <button
            onclick={() => configStore.selectConfig(config.id)}
            class="w-full text-left p-3 rounded-md border transition-colors
                   {configStore.selectedConfigId === config.id
                     ? 'border-indigo-500 bg-indigo-50'
                     : 'border-gray-200 hover:border-gray-300'}"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="text-sm font-medium text-gray-900">{config.name}</div>
                <div class="text-xs text-gray-500">{config.host}:{config.port}</div>
              </div>
              {#if config.isDefault}
                <span class="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                  Default
                </span>
              {/if}
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </Card>

  <Card title="Contact List">
    <div class="space-y-3">
      <div>
        <label for="excelFile" class="block text-sm text-gray-600 mb-1.5">
          Upload Excel (.xlsx, .xls)
        </label>
        <input
          id="excelFile"
          type="file"
          accept=".xlsx,.xls"
          onchange={handleExcelChange}
          class="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3
                 file:rounded-md file:border-0 file:text-sm
                 file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100
                 cursor-pointer"
        />
      </div>

      {#if contacts.length > 0}
        <div class="bg-green-50 border border-green-200 rounded-md p-3">
          <div class="text-sm font-medium text-green-800">{contacts.length} contacts loaded</div>
          <div class="text-xs text-green-600 mt-0.5 truncate">
            {contactColumns.join(', ')}
          </div>
        </div>

        <div class="space-y-2">
          <span class="block text-sm text-gray-600">Send Range</span>
          <div class="space-y-1.5">
            <label class="flex items-center gap-2 text-sm">
              <input type="radio" bind:group={sendRange} value="all" class="text-indigo-600" />
              <span>All ({contacts.length})</span>
            </label>
            <label class="flex items-center gap-2 text-sm flex-wrap">
              <input type="radio" bind:group={sendRange} value="first" class="text-indigo-600" />
              <span>First</span>
              <input
                type="number"
                bind:value={firstN}
                min="1"
                max={contacts.length}
                class="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </label>
            <label class="flex items-center gap-2 text-sm flex-wrap">
              <input type="radio" bind:group={sendRange} value="range" class="text-indigo-600" />
              <span>Range</span>
              <input
                type="number"
                bind:value={rangeFrom}
                min="1"
                max={contacts.length}
                class="w-14 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <span>-</span>
              <input
                type="number"
                bind:value={rangeTo}
                min={rangeFrom}
                max={contacts.length}
                class="w-14 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </label>
          </div>
          <div class="text-xs text-gray-500">
            Sending to <strong>{selectedContactCount}</strong> contacts
          </div>
        </div>
      {/if}
    </div>
  </Card>

  <Card title="Email Content">
    <div class="space-y-3">
      <Input
        label="Subject"
        bind:value={subject}
        placeholder="Enter email subject..."
        required
      />

      <div>
        <label for="emailBody" class="block text-sm font-medium text-gray-700 mb-1">
          Email Body
        </label>
        <textarea
          id="emailBody"
          bind:value={htmlContent}
          placeholder="Write your email content here. HTML supported."
          rows="8"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md
                 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        ></textarea>
        <p class="mt-1 text-xs text-gray-400">
          Use placeholders: &#123;&#123;FirstName&#125;&#125;, &#123;&#123;Email&#125;&#125;, &#123;&#123;Company&#125;&#125;
        </p>
      </div>

      <div>
        <label for="htmlTemplate" class="block text-sm text-gray-600 mb-1.5">
          Or upload HTML template
        </label>
        <input
          id="htmlTemplate"
          type="file"
          accept=".html,.htm"
          onchange={handleHtmlTemplateChange}
          class="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3
                 file:rounded-md file:border-0 file:text-sm
                 file:bg-gray-100 file:text-gray-600 hover:file:bg-gray-200
                 cursor-pointer"
        />
      </div>
    </div>
  </Card>

  <Card title="Options">
    <div class="space-y-4">
      <label class="flex items-center gap-2">
        <input type="checkbox" bind:checked={useBatch} class="rounded text-indigo-600" />
        <span class="text-sm font-medium text-gray-700">Batch Processing</span>
      </label>

      {#if useBatch}
        <div class="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-md">
          <div>
            <label for="batchSize" class="block text-xs text-gray-500 mb-1">Size</label>
            <input
              id="batchSize"
              type="number"
              bind:value={batchSize}
              min="1"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label for="batchDelay" class="block text-xs text-gray-500 mb-1">Batch Delay</label>
            <input
              id="batchDelay"
              type="number"
              bind:value={batchDelay}
              min="1"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label for="emailDelay" class="block text-xs text-gray-500 mb-1">Email Delay</label>
            <input
              id="emailDelay"
              type="number"
              bind:value={emailDelay}
              min="1"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
          </div>
        </div>
      {/if}

      <label class="flex items-center gap-2">
        <input type="checkbox" bind:checked={scheduleEmail} class="rounded text-indigo-600" />
        <span class="text-sm font-medium text-gray-700">Schedule</span>
      </label>

      {#if scheduleEmail}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-md">
          <div>
            <label for="scheduledTime" class="block text-xs text-gray-500 mb-1">When</label>
            <input
              id="scheduledTime"
              type="datetime-local"
              bind:value={scheduledTime}
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label for="notifyEmail" class="block text-xs text-gray-500 mb-1">Notify (optional)</label>
            <input
              id="notifyEmail"
              type="email"
              bind:value={notifyEmail}
              placeholder="email@example.com"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
          </div>
        </div>
      {/if}
    </div>
  </Card>

  <div class="sticky bottom-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
    <Button
      variant="primary"
      size="lg"
      loading={isSending}
      onclick={handleSend}
      disabled={!configStore.selectedConfigId || !subject || !excelFile || isSending}
      class="w-full"
    >
      {#if scheduleEmail}
        Schedule Email
      {:else}
        Send ({selectedContactCount})
      {/if}
    </Button>
  </div>
</div>


