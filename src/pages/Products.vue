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

function minusCartItem(product, e) {
    if (e.target.parentNode.childNodes[2].disabled = true) {
        e.target.parentNode.childNodes[2].disabled = false
    }
    if (cart.value[product.id]['inCart'] === 1) {
        return delete cart.value[product.id]
    }
    cart.value[product.id]['inCart'] -= 1
}

function plusCartItem(product, e) {
    if (cart.value[product.id]['inCart'] + 1 === cart.value[product.id]['count']) {
        e.target.disabled = true;
    }
    cart.value[product.id]['inCart'] += 1
}

watch(cart.value, (newVal, oldVal) => {
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
            <span>{{ product.price }} руб.</span>
            <button v-if="!cart[product.id]" @click="setCartItem(product)">В корзину</button>
            <div v-else class="products__cart_action">
                <button @click="minusCartItem(product, $event)">-</button>
                <p>{{ cart[product.id]['inCart'] }}</p>
                <button @click="plusCartItem(product, $event)">+</button>
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
