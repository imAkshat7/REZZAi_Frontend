import axios from "axios"
import { API_BASE_URL } from "../../utils/axios"

export const getCurrentUser = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/me`, {
            withCredentials: true
        })


        return response.data
    } catch (error) {
        console.error("Could not get current user:", error.response?.data ?? error.message)
        return null
    }
}

export default getCurrentUser
