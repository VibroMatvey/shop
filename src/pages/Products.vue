<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductsStore } from '@/stores/products'
const route = useRoute()
const router = useRouter()
const store = useProductsStore()
const tg = ref(window.Telegram.WebApp)
onBeforeMount(async () => {
    await store.request_products(route.query?.shop_id)
})
const cart = ref(new Object())

function setCartItem(item) {
    item['inCart'] = 1
    cart.value[item.id] = item
}
</script>

<template>
    <p>
        Products
    </p>
    <div class="products__grid">
        <article v-for="product in store.products" :key="product.id">
            <h3>{{ product.title }}</h3>
            <p>{{ product.description }}</p>
            <p>{{ product.price }} $</p>
            <button v-if="!cart[product.id]" @click="setCartItem(product)">В корзину</button>
            <div v-else>
                <button @click="cart[product.id]['inCart'] === 1 ? delete cart[product.id] : cart[product.id]['inCart'] -= 1">-</button>
                <p>{{ cart[product.id]['inCart'] }}</p>
                <button @click="cart[product.id]['inCart'] += 1">+</button>
            </div>
        </article>
        <p v-if="store.products.length === 0">
            Продукты не найдены
        </p>
    </div>
</template>

<style scoped>
button {
    background-color: var(--tg-theme-button-color);
    color: var(--tg-theme-button-text-color);
}
.products__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
}
</style>
