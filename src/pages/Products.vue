<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/stores/products'
const route = useRoute()
const router = useRouter()
const tg = ref(window.Telegram.WebApp)
const store = useProductStore()
</script>

<template>
    <div>
        <p v-for="product in store.products" :key="product.id">
        {{ product.title }}
        </p>
    </div>
    <p>
        Products
    </p>
</template>

<style scoped>
</style>
