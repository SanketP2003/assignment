<script lang="ts">
  import { dashboardStore, toastStore } from '$lib/stores/index.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  async function handleCancel(jobId: string) {
    const res = await dashboardStore.cancelJob(jobId);
    if (res.success) {
      toastStore.success('Job cancelled');
    } else {
      toastStore.error('Failed to cancel job');
    }
  }
</script>

<svelte:head>
  <title>Scheduled Jobs - Email Sender</title>
</svelte:head>

<div class="space-y-4">
  <h1 class="text-lg font-semibold text-gray-900">Scheduled Jobs</h1>

  {#if dashboardStore.scheduledJobs.length === 0}
    <Card>
      <div class="text-center py-8 text-gray-400">
        <div class="text-3xl mb-2">📅</div>
        <p class="text-sm">No scheduled jobs</p>
      </div>
    </Card>
  {:else}
    <div class="space-y-3">
      {#each dashboardStore.scheduledJobs as job}
        <Card>
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium text-gray-900">{job.subject}</h3>
              <p class="text-sm text-gray-500 mt-1">
                {job.recipientCount} recipients • Scheduled for {new Date(job.scheduledTime).toLocaleString()}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-0.5 rounded {job.status === 'pending' ? 'bg-amber-100 text-amber-700' : job.status === 'running' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}">
                {job.status}
              </span>
              {#if job.status === 'pending'}
                <Button size="sm" variant="danger" onclick={() => handleCancel(job.id)}>Cancel</Button>
              {/if}
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>

