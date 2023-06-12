<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductsStore } from '@/stores/products'
const route = useRoute()
const router = useRouter()
const tg = ref(window.Telegram.WebApp)
const store = useProductsStore()
onBeforeMount(async () => {
    await store.request_products(route.query?.shop_id)
})
</script>

<template>
    <p>
        Products
    </p>
    <div>
        <p v-for="product in store.products" :key="product.id">
        {{ product.title }}
        </p>
        <p v-if="store.products.length === 0">
            Продукты не найдены
        </p>
    </div>
</template>

<style scoped>
</style>
