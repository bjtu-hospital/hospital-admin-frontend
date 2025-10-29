import axios from "./axios"

export async function login(credentials) {
  const response = await axios.post("/auth/staff/login", credentials)
  return response.data
}
