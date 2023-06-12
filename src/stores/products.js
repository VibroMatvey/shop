import { ref } from "vue"
import ky from "ky"
import { defineStore } from "pinia"

export const useProductsStore = defineStore('product', () => {
    const products = ref([])

    async function request_products(shop_id) {
        try {
            if (shop_id) {
                products.value = await ky.get(`http://127.0.0.1:8000/products/${shop_id}?skip=0&limit=100`).json()
            }
        } catch (e) {
            console.log(e);
        }
    }
  
    return { products, request_products }
  })