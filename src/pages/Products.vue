<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute()
const router = useRouter()
const tg = ref(window.Telegram.WebApp)
</script>

<template>
    <p>
        {{ route.query?.shop_id }}
    </p>
    <p>
        Products
    </p>
</template>

<style scoped>
</style>
