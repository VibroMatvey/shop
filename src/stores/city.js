import { ref } from "vue"
import ky from "ky"
import { defineStore } from "pinia"

export const useCitiesStore = defineStore('city', () => {
    const cities = ref([])
    const city = ref(null)

    async function request_cities() {
        try {
            const response = await ky.get(`http://127.0.0.1:8000/cities/`).json()
            cities.value = response
        } catch (e) {
            console.log(e);
        }
    }

    async function request_city(city_id) {
        try {
            if (city_id) {
                const response = await ky.get(`http://127.0.0.1:8000/cities/${city_id}`).json()
                city.value = response
            }
        } catch (e) {
            console.log(e);
        }
    }
  
    return { cities, city, request_cities, request_city }
  })