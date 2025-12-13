<script lang="ts">
  import { dashboardStore, reportStore } from '$lib/stores/index.svelte';
  import Card from '$lib/components/ui/Card.svelte';
</script>

<svelte:head>
  <title>Dashboard - Email Sender</title>
</svelte:head>

<div class="space-y-4">
  <h1 class="text-lg font-semibold text-gray-900">Dashboard</h1>

  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <Card>
      <div class="text-2xl font-semibold text-gray-900">{reportStore.stats.total}</div>
      <div class="text-xs text-gray-500">Total Emails</div>
    </Card>
    <Card>
      <div class="text-2xl font-semibold text-green-600">{reportStore.stats.sent}</div>
      <div class="text-xs text-gray-500">Sent</div>
    </Card>
    <Card>
      <div class="text-2xl font-semibold text-red-600">{reportStore.stats.failed}</div>
      <div class="text-xs text-gray-500">Failed</div>
    </Card>
    <Card>
      <div class="text-2xl font-semibold text-amber-600">{reportStore.stats.pending}</div>
      <div class="text-xs text-gray-500">Pending</div>
    </Card>
  </div>

  {#if dashboardStore.hasActiveBatch}
    <Card title="Active Batch">
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span>Progress</span>
          <span>{dashboardStore.batchStatus?.sent}/{dashboardStore.batchStatus?.total}</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="bg-indigo-600 h-2 rounded-full" style="width: {((dashboardStore.batchStatus?.sent || 0) / (dashboardStore.batchStatus?.total || 1)) * 100}%"></div>
        </div>
      </div>
    </Card>
  {/if}

  {#if dashboardStore.hasScheduledJobs}
    <Card title="Scheduled Jobs">
      <div class="space-y-2">
        {#each dashboardStore.scheduledJobs as job}
          <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div>
              <div class="text-sm font-medium">{job.subject}</div>
              <div class="text-xs text-gray-500">{new Date(job.scheduledTime).toLocaleString()}</div>
            </div>
            <span class="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">{job.status}</span>
          </div>
        {/each}
      </div>
    </Card>
  {/if}

  {#if !dashboardStore.hasActiveBatch && !dashboardStore.hasScheduledJobs}
    <Card>
      <div class="text-center py-8 text-gray-400">
        <div class="text-3xl mb-2">📊</div>
        <p class="text-sm">No active jobs. <a href="/send" class="text-indigo-600 hover:underline">Send some emails</a></p>
      </div>
    </Card>
  {/if}
</div>

