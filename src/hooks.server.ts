import type { Handle } from "@sveltejs/kit"

export const authHandle: Handle = async ({ event, resolve }) => {
  // console.log("Handling request:", event.request.method, event.url.pathname)
  //  Read the token from headers

  const authHeader = event.request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (token) {
    try {
      // ตรวจสอบ token
      const payload = JSON.parse(atob(token.split(".")[1]))
      console.log("Token payload:", payload)

      // ตรวจสอบว่า token ยังไม่หมดอายุ
      if (payload.exp > Date.now() / 1000) {
        // Set the user in the event.locals for use in the application
        event.locals.user = payload.user
        event.locals.token = token
      }
    } catch (error) {
      console.error("Invalid token:", error)
    }
  }

  return resolve(event)
}

export const handle = authHandle
