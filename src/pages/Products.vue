<script setup>
import { ref, onBeforeMount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductsStore } from '@/stores/products';

const route = useRoute()
const router = useRouter()
const store = useProductsStore()
let tg = window.Telegram.WebApp
const cart = ref(new Object())

onBeforeMount(async () => {
    await store.request_products(route.query?.shop_id)
})

function setCartItem(item) {
    item['inCart'] = 1
    cart.value[item.id] = item
}

watch(cart.value, (newVal, oldVal) => {
    console.log(Object.keys(newVal));
    if (Object.keys(newVal).length > 0) {
        tg.MainButton.isVisible = true
        let text = []
        let total = 0
        Object.keys(newVal).forEach(item => {
            text += `${cart.value[item].title} ${cart.value[item].inCart} шт. `
            total += cart.value[item].price * cart.value[item].inCart
        })
        text += `Итого: ${total}`
        tg.MainButton.setText(text)
    } else {
        tg.MainButton.isVisible = false
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
