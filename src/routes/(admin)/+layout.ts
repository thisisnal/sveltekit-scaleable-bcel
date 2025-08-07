import { redirect } from "@sveltejs/kit"
import { browser } from "$app/environment"

export const load = async () => {
  // ถ้าไม่ใช่ในเบราว์เซอร์ (เช่น SSR) ให้ไม่ทำอะไร
  if (!browser) {
    return {}
  }

  // อ่าน token จาก localStorage
  const token = localStorage.getItem("token")

  // ถ้าไม่มี token ให้ redirect ไปที่หน้า login
  if (!token) {
    throw redirect(302, "/login")
  }

  return {}
}
