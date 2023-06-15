import { ref } from "vue"
import ky from "ky"
import { defineStore } from "pinia"

export const useCategoryStore = defineStore('categories', () => {
    const categories = ref([])

    async function request_categories() {
        try {
            const response = await ky.get(`http://127.0.0.1:8000/categories/`).json()
            categories.value = response
        } catch (e) {
            console.log(e);
        }
    }
  
    return { categories, request_categories }
  })