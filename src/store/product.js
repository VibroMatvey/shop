import { ref } from "vue"
import ky from "ky"

export const useProductsStore = defineStore('products', () => {
    const products = ref([])

    async function request_products() {
        products.value = await ky.get('http://127.0.0.1:8000/products/1?skip=0&limit=100').json()
    }
  
    return { products, request_products }
  })