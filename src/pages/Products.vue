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

function minusCartItem(product) {
    if (cart.value[product.id]['inCart'] === 1) {
        return delete cart.value[product.id]
    }
    cart.value[product.id]['inCart'] -= 1
}

function plusCartItem(product) {
    cart.value[product.id]['inCart'] += 1
}

async function changePage(page) {
    window.scrollTo(0,0);
    await store.request_products(route.query?.shop_id, page)
}

watch(cart.value, (newVal, oldVal) => {
    if (Object.keys(newVal).length > 0) {
        if (!tg.MainButton.isVisible) {
            tg.MainButton.isVisible = true
        }
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
    <div class="products__grid">
        <article class="products__item" v-for="product in store.products.items" :key="product.id">
            <div>
                <h3 class="product__title">{{ product.title }}</h3>
            </div>
            <p class="product__description">{{ product.description }}</p>
            <span class="product__price">{{ product.price }} руб.</span>
            <div v-if="!cart[product.id]" @click="setCartItem(product)" class="products__cart_action">
                <button>В корзину</button>
            </div>
            <div v-else class="products__cart_action">
                <button @click="minusCartItem(product)">-</button>
                {{ cart[product.id]['inCart'] }}
                <button :disabled="product.count == cart[product.id]['inCart']" @click="plusCartItem(product)">+</button>
            </div>
        </article>
    </div>
    <p v-if="store.products?.items?.length === 0" class="products__empty">
        Продукты не найдены
    </p>
    <div class="products__pagination">
        <button @click="changePage(store.products.page - 1)" :disabled="store.products.page === 1">←</button>
        <button @click="changePage(page)" :disabled="store.products.page === page" v-for="page in Array.from({ length: store.products.pages }, (value, index) => index + 1).slice(store.products.page === 1 ? 0 : store.products.page === store.products.pages ? store.products.page - 3 : store.products.page - 2, store.products.page === 1 ? store.products.page + 2 : store.products.page + 1)" :key="page">{{ page }}</button>
        <button @click="changePage(store.products.page + 1)" :disabled="store.products.pages === store.products.page">→</button>
    </div>
</template>

<style lang="scss">
body {
    background-color: var(--tg-theme-bg-color);
}

a {
    color: var(--tg-theme-link-color);
}

button {
    background-color: var(--tg-theme-button-color);
    color: var(--tg-theme-button-text-color);
}

button:disabled,
button[disabled]{
  background-color: rgb(200, 200, 200);
  color: rgb(100, 100, 100);
}

.prosucts__head {
    display: flex;
    justify-content: center;
    font-weight: 500;
}

.products__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;

    .products__item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .product__price {
            margin-bottom: 1rem;
            color: var(--tg-theme-text-color);
        }

        .product__title {
            color: var(--tg-theme-text-color);
        }

        .product__description {
            color: var(--tg-theme-hint-color);
        }
    }

    .products__cart_action {
        display: flex;
        justify-content: center;
        gap: 1rem;
        align-items: center;
    }
}

.products__empty {
    display: flex;
    justify-content: center;
}

.products__pagination {
    padding: 1rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
}
</style>
