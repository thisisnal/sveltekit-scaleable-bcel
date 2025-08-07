<script lang="ts">
  import AdminFooter from "$lib/components/AdminFooter.svelte"
  import AdminNavbar from "$lib/components/AdminNavbar.svelte"
  import AdminSidebar from "$lib/components/AdminSidebar.svelte"

  let { children } = $props()
</script>

<div class="flex min-h-screen bg-gray-100">
  <AdminSidebar />
  <div class="flex-1 flex flex-col">
    <AdminNavbar />
    <main class="p-6">
      {@render children?.()}
    </main>
    <AdminFooter />
  </div>
</div>
