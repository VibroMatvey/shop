import { ref } from "vue"
import ky from "ky"
import { defineStore } from "pinia"

export const useProductsStore = defineStore('product', () => {
    const products = ref([])

    async function request_products(shop_id, page = 1) {
        try {
            if (shop_id) {
                const response = await ky.get(`http://127.0.0.1:8000/products/${shop_id}?page=${page}&size=10`).json()
                products.value = response
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function request_products_by_category(shop_id, category_id, page = 1) {
        try {
            if (shop_id) {
                const response = await ky.get(`http://127.0.0.1:8000/products/${shop_id}/${category_id}/?page=${page}&size=10`).json()
                products.value = response
            }
        } catch (e) {
            console.log(e);
        }
    }
  
    return { products, request_products, request_products_by_category }
  })