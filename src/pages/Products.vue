<script setup>
import { ref, onBeforeMount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductsStore } from '@/stores/products';

const route = useRoute()
const router = useRouter()
const store = useProductsStore()
const tg = ref(window.Telegram.WebApp)
const cart = ref(new Object())

onBeforeMount(async () => {
    await store.request_products(route.query?.shop_id)
    tg.value.expand();
})

function setCartItem(item) {
    item['inCart'] = 1
    cart.value[item.id] = item
}

watch(cart.value, (newVal, oldVal) => {
    if (newVal != {}) {
        tg.value.MainButton.isVisible = true
    } else {
        tg.value.MainButton.isVisible = false
    }
}, {
    deep: true
})
</script>

<template>
    <p class="prosucts__head">
        г. {{ store.products[0].shop.city.title }} | магазин "{{ store.products[0].shop.title }}"
    </p>
    <div class="products__grid">
        <article class="products__item" v-for="product in store.products" :key="product.id">
            <div>
                <h3>{{ product.title }}</h3>
            </div>
            <p>{{ product.description }}</p>
            <p>{{ product.price }} $</p>
            <button v-if="!cart[product.id]" @click="setCartItem(product)">В корзину</button>
            <div v-else class="products__cart_action">
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

<style scoped lang="scss">
button {
    background-color: var(--tg-theme-button-color);
    color: var(--tg-theme-button-text-color);
}

.prosucts__head {
    text-align: center;
    font-weight: 500;
}

.products__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;

    .products__item {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .products__cart_action {
        display: flex;
        justify-content: center;
        gap: 1rem;
    }
}
</style>
