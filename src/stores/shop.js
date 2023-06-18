import { ref } from "vue"
import ky from "ky"
import { defineStore } from "pinia"

export const useShopsStore = defineStore('shop', () => {
    const shop = ref(null)
    const shops = ref(null)

    async function request_shop(shop_id) {
        try {
            if (shop_id) {
                const response = await ky.get(`http://127.0.0.1:8000/shops/${shop_id}`).json()
                shop.value = response
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function request_shops() {
        try {
            const response = await ky.get(`http://127.0.0.1:8000/shops/`).json()
            shops.value = response
        } catch (e) {
            console.log(e);
        }
    }
  
    return { shop, shops, request_shop, request_shops }
  })