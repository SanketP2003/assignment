<script lang="ts">
  import { reportStore, toastStore } from '$lib/stores/index.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';

  let isClearing = $state(false);

  async function handleRefresh() {
    await reportStore.loadReport();
    toastStore.success('Report refreshed');
  }

  async function handleExportCSV() {
    try {
      await reportStore.exportCSV();
      toastStore.success('CSV exported successfully');
    } catch (error) {
      toastStore.error('Failed to export CSV');
    }
  }

  async function handleExportJSON() {
    try {
      await reportStore.exportJSON();
      toastStore.success('JSON exported successfully');
    } catch (error) {
      toastStore.error('Failed to export JSON');
    }
  }

  async function handleClearLogs() {
    if (!confirm('Are you sure you want to clear all logs? This cannot be undone.')) {
      return;
    }

    isClearing = true;
    try {
      await reportStore.clearLogs();
      toastStore.success('Logs cleared successfully');
    } catch (error) {
      toastStore.error('Failed to clear logs');
    } finally {
      isClearing = false;
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  function getStatusClass(status: string): string {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<div class="space-y-4">
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="text-2xl font-semibold text-gray-900">{reportStore.stats.total}</div>
      <div class="text-xs text-gray-500">Total</div>
    </div>
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="text-2xl font-semibold text-green-600">{reportStore.stats.sent}</div>
      <div class="text-xs text-gray-500">Sent</div>
    </div>
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="text-2xl font-semibold text-red-600">{reportStore.stats.failed}</div>
      <div class="text-xs text-gray-500">Failed</div>
    </div>
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="text-2xl font-semibold text-amber-600">{reportStore.stats.pending}</div>
      <div class="text-xs text-gray-500">Pending</div>
    </div>
  </div>

  <Card>
    <div class="flex flex-wrap gap-2 items-center justify-between">
      <div class="flex flex-wrap gap-2">
        <Button size="sm" onclick={handleRefresh} loading={reportStore.isLoading}>
          Refresh
        </Button>
        <Button variant="secondary" size="sm" onclick={handleExportCSV}>
          CSV
        </Button>
        <Button variant="secondary" size="sm" onclick={handleExportJSON}>
          JSON
        </Button>
      </div>
      <Button variant="danger" size="sm" onclick={handleClearLogs} loading={isClearing}>
        Clear
      </Button>
    </div>
  </Card>

  <Card title="Email Logs">
    {#if reportStore.logs.length === 0}
      <div class="text-center py-8 text-gray-400">
        <div class="text-3xl mb-2">📭</div>
        <p class="text-sm">No logs yet</p>
      </div>
    {:else}
      <div class="overflow-x-auto -mx-4 px-4">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left py-2 px-2 font-medium text-gray-600">To</th>
              <th class="text-left py-2 px-2 font-medium text-gray-600 hidden sm:table-cell">Subject</th>
              <th class="text-left py-2 px-2 font-medium text-gray-600">Status</th>
              <th class="text-left py-2 px-2 font-medium text-gray-600 hidden md:table-cell">Time</th>
            </tr>
          </thead>
          <tbody>
            {#each reportStore.logs as log}
              <tr class="border-b border-gray-50 hover:bg-gray-50">
                <td class="py-2 px-2">
                  <span class="font-mono text-xs truncate block max-w-[120px] sm:max-w-none">{log.to}</span>
                </td>
                <td class="py-2 px-2 hidden sm:table-cell">
                  <span class="text-xs truncate block max-w-[200px]">{log.subject}</span>
                </td>
                <td class="py-2 px-2">
                  <span class="px-1.5 py-0.5 rounded text-xs font-medium {getStatusClass(log.status)}">
                    {log.status}
                  </span>
                </td>
                <td class="py-2 px-2 hidden md:table-cell">
                  <span class="text-xs text-gray-500">{formatDate(log.timestamp)}</span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </Card>
</div>

