<script lang="ts">
  import { onMount } from "svelte"
  import { productService } from "../../../../features/admin/services"
  import type { Product } from "$lib/types/product"

  let products: Product[] = []
  let loading = false
  let error: string | null = null
  let searchTerm = ""
  let currentPage = 1
  let totalProducts = 0
  let mounted = false
  let abortController: AbortController | null = null

  const fetchProducts = async (page = 1, search = "", force = false) => {
    // Hard stop for infinity loop protection
    if (loading && !force) {
      console.log("🚫 BLOCKED: Already loading, aborting call")
      return
    }

    // Cancel previous request
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    // Additional protection
    if (!mounted && !force) {
      console.log("🚫 BLOCKED: Component not mounted yet")
      return
    }

    const callId = Math.random().toString(36).substr(2, 9)
    console.log(`🚀 START[${callId}]: Fetching products`, { page, search })

    try {
      loading = true
      error = null

      const result = await productService.getProducts(page, search)
      console.log(`📥 RESULT[${callId}]:`, result)

      // Check if request was aborted
      if (abortController.signal.aborted) {
        console.log(`❌ ABORTED[${callId}]: Request was cancelled`)
        return
      }

      if (result && result.status) {
        products = result.products || []
        totalProducts = result.total || 0
        console.log(`✅ SUCCESS[${callId}]: Loaded ${products.length} products`)
      } else if (result && Array.isArray(result)) {
        products = result
        totalProducts = result.length
        console.log(
          `✅ SUCCESS[${callId}]: Loaded array ${products.length} products`
        )
      } else {
        products = []
        totalProducts = 0
        error = "ไม่สามารถดึงข้อมูลสินค้าได้"
        console.log(`⚠️ EMPTY[${callId}]: No valid data`)
      }
    } catch (err) {
      console.error(`❌ ERROR[${callId}]:`, err)
      if (!abortController.signal.aborted) {
        error = "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า"
        products = []
        totalProducts = 0
      }
    } finally {
      if (!abortController.signal.aborted) {
        loading = false
        console.log(`🏁 END[${callId}]: Loading set to false`)
      }
    }
  }

  const handleSearch = () => {
    console.log("🔍 Search triggered")
    if (loading) {
      console.log("🚫 BLOCKED: Search blocked due to loading")
      return
    }
    currentPage = 1
    fetchProducts(currentPage, searchTerm, true) // force = true
  }

  const handlePageChange = (page: number) => {
    console.log("📄 Page change triggered:", page)
    if (loading) {
      console.log("🚫 BLOCKED: Page change blocked due to loading")
      return
    }
    currentPage = page
    fetchProducts(currentPage, searchTerm, true) // force = true
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH")
  }

  let imageErrors = new Set() // Track failed images

  const handleImageError = (productId: number, event: Event) => {
    imageErrors.add(productId)
    imageErrors = imageErrors // Trigger reactivity
  }

  onMount(() => {
    console.log("🎬 Component mounted")
    mounted = true
    // Add delay to ensure component is fully mounted
    setTimeout(() => {
      fetchProducts(1, "", true) // force = true for initial load
    }, 100)
  })
</script>

<div class="container mx-auto px-4 py-8">
  <!-- Header -->
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold text-gray-900">จัดการสินค้า</h1>
    <button
      class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
    >
      เพิ่มสินค้าใหม่
    </button>
  </div>

  <!-- Search Bar -->
  <div class="mb-6">
    <div class="flex gap-4">
      <input
        type="text"
        bind:value={searchTerm}
        placeholder="ค้นหาสินค้า..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        on:keydown={(e) => e.key === "Enter" && handleSearch()}
      />
      <button
        on:click={handleSearch}
        class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        ค้นหา
      </button>
    </div>
  </div>

  <!-- Loading State -->
  {#if loading}
    <div class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
      <span class="ml-4 text-gray-600">กำลังโหลดข้อมูล...</span>
    </div>

    <!-- Error State -->
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <svg
        class="w-12 h-12 text-red-500 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-red-700 text-lg font-medium">{error}</p>
      <button
        on:click={() => fetchProducts(currentPage, searchTerm, true)}
        class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        disabled={loading}
      >
        {loading ? "กำลังโหลด..." : "ลองใหม่อีกครั้ง"}
      </button>
    </div>

    <!-- Products Table -->
  {:else if products.length > 0}
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Results Info -->
      <div class="px-6 py-4 bg-gray-50 border-b">
        <p class="text-gray-600">
          แสดงสินค้า {products.length} รายการ จากทั้งหมด {totalProducts} รายการ
        </p>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >รูปภาพ</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >ชื่อสินค้า</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >หมวดหมู่</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >ราคา</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >ผู้สร้าง</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >วันที่สร้าง</th
              >
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >จัดการ</th
              >
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each products as product (product.id)}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div
                    class="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden"
                  >
                    {#if product.image && !imageErrors.has(product.id)}
                      <img
                        src={product.image}
                        alt={product.name}
                        class="h-16 w-16 object-cover rounded-lg absolute inset-0"
                        on:error={(e) => handleImageError(product.id, e)}
                      />
                    {:else}
                      <!-- Fallback icon when no image or error -->
                      <svg
                        class="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">
                    {product.name}
                  </div>
                  <div class="text-sm text-gray-500 truncate max-w-xs">
                    {product.description}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {product.category_name || "ไม่ระบุ"}
                  </span>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                >
                  {formatPrice(product.price)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.user_fullname || "ไม่ระบุ"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(product.created_at)}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                >
                  <button class="text-blue-600 hover:text-blue-900 mr-3"
                    >แก้ไข</button
                  >
                  <button class="text-red-600 hover:text-red-900">ลบ</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- No Products Found -->
  {:else}
    <div class="text-center py-12">
      <svg
        class="w-16 h-16 text-gray-400 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1"
        />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบสินค้า</h3>
      <p class="text-gray-500">
        ไม่มีสินค้าในระบบ หรือไม่พบสินค้าที่ตรงกับการค้นหา
      </p>
    </div>
  {/if}
</div>
