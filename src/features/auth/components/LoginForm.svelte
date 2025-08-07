<script lang="ts">
  // export let form // ใช้รับค่าจาก server action

  // Funcion to handle form submission
  async function handleSubmit(event: SubmitEvent) {
    const formData = new FormData(event.target as HTMLFormElement)
    console.log(formData.get("username"))
    console.log(formData.get("password"))
  }
</script>

<h1>Login Form</h1>
<form method="POST" on:submit|preventDefault={handleSubmit}>
  <div>
    <label for="username">Username:</label>
    <input type="text" id="username" name="username" required />
  </div>
  <div>
    <label for="password">Password:</label>
    <input type="password" id="password" name="password" required />
  </div>
  <button type="submit">Login</button>
  <!-- {#if form.error}
    <p class="error">{form.error}</p>
  {/if} -->
</form>
