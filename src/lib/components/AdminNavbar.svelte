<script>
  import { browser } from "$app/environment"
  import { onMount } from "svelte"
  import { authService } from "../../features/auth/services/authService"

  /** @type {{ fullname?: string, username?: string, email?: string, role?: string } | null} */
  let user = null

  const logout = async () => {
    await authService.logout()
    if (browser) {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    }
    window.location.href = "/login"
  }

  // Read User data from localStorage only on client side
  onMount(() => {
    if (browser) {
      const userData = localStorage.getItem("user")
      if (userData) {
        try {
          user = JSON.parse(userData)
        } catch (error) {
          console.error("Error parsing user data:", error)
          user = null
        }
      }
    }
  })
</script>

<header class="flex justify-between items-center p-4 bg-gray-800 text-white">
  <div class="text-lg font-bold">Admin Panel</div>
  <div class="flex items-center space-x-4">
    <span class="text-white">Welcome, {user?.fullname || "Admin"}</span>
    <button
      on:click={logout}
      class="hover:underline text-white bg-transparent border-none cursor-pointer"
      >Logout</button
    >
  </div>
</header>
