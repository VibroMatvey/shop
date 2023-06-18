<script setup>
import { ref, onBeforeMount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProductsStore } from '@/stores/products';
import { useCategoryStore } from '@/stores/category';
import { useShopsStore } from '@/stores/shop';
import { CheckCircleIcon, ListBulletIcon, XMarkIcon, ShoppingCartIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const productsStore = useProductsStore()
const categoryStore = useCategoryStore()
const shopStore = useShopsStore()
let tg = window.Telegram.WebApp
const cart = ref(new Object())
const selectedCategory = ref(null)
const categories = ref([])
const categoryDialog = ref(false)
const cartDialog = ref(false)
const list = ref([])

onBeforeMount(async () => {
    if (route.query?.shop_id) {
        await shopStore.request_shop(route?.query.shop_id)
        await productsStore.request_products(route.query?.shop_id)
    }
    await categoryStore.request_categories()
    categories.value = categoryStore.categories
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
    if (selectedCategory.value) {
        return await productsStore.request_products_by_category(route.query?.shop_id, selectedCategory.value.id, page)
    }
    return await productsStore.request_products(route.query?.shop_id, page)
}

watch(cart.value, (newVal, oldVal) => {
    if (Object.keys(newVal).length > 0) {
        if (!tg.MainButton.isVisible) {
            tg.MainButton.isVisible = true
        }
        let total = 0
        Object.keys(newVal).forEach(item => {
            total += cart.value[item].price * cart.value[item].inCart
        })
        const text = `Оформить заказ. Итого: ${total}`
        tg.MainButton.setText(text)
    } else {
        tg.MainButton.isVisible = false
    }
}, {
    deep: true
})

function getParent(parentId, children = categoryStore.categories) {
    children?.forEach(category => {
        if (category.id == parentId) {
            return categories.value = children
        }
        getParent(parentId, category.children)
    })
}

function getParents(parentId, children = categoryStore.categories) {
    children?.forEach(category => {
        if (category.id == parentId) {
            list.value.unshift(category)
            return getParents(category.parent_id)
        }
        getParents(parentId, category.children)
    })
}

function selectCategory(category) {
    selectedCategory.value = category
    if (category.children.length > 0) {
        categories.value = category.children
    }
}

async function getProductsByCategory(category) {
    selectedCategory.value = category
    list.value = []
    await productsStore.request_products_by_category(route.query?.shop_id, category.id)
    getParents(category.parent_id)
    list.value.push(selectedCategory.value)
    categoryDialog.value = false
}

async function reset() {
    await productsStore.request_products(route.query?.shop_id)
    await categoryStore.request_categories()
    categories.value = categoryStore.categories
    list.value = []
    selectedCategory.value = null
}

function clearCart() {
    cart.value = new Object()
    tg.MainButton.isVisible = false
}

Telegram.WebApp.onEvent('mainButtonClicked', () => {
	tg.sendData(JSON.stringify(cart.value)); 
});
</script>

<template>
    <div class="products__header">
        <v-dialog
            v-model="categoryDialog"
            fullscreen
            :scrim="false"
            transition="dialog-top-transition"
            >
            <template v-slot:activator="{ props }">
                <ListBulletIcon v-bind="props" style="width: 25px; cursor: pointer;  color: var(--tg-theme-button-color);" />
            </template>
            <v-card>
                <v-toolbar>
                <div class="category__header">
                    <XMarkIcon @click="categoryDialog = false" style="width: 25px; cursor: pointer; color: var(--tg-theme-button-text-color);" />
                    <div v-if="selectedCategory">
                        {{ selectedCategory.title }}
                    </div>
                    <div v-else>
                        Категории
                    </div>
                    <CheckCircleIcon v-if="selectedCategory" @click="getProductsByCategory(selectedCategory)" style="width: 25px; cursor: pointer; color: var(--tg-theme-button-text-color);" />
                    <div v-else></div>
                </div>
                </v-toolbar>
                <div class="categories__back">
                    <router-link :to="route.fullPath" v-if="categories[0]?.parent_id" @click="getParent(categories[0]?.parent_id)">Назад</router-link>
                </div>
                <div class="categories__list">
                    <router-link v-for="category in categories" :key="category.id" :to="route.fullPath" @click="selectCategory(category)">{{ category.title }}</router-link>
                </div>
            </v-card>
        </v-dialog>
        <div class="products__header_select" v-if="shopStore.shop">
            <p>{{ shopStore.shop?.city?.title }}</p>
            <p>|</p>
            <p>{{ shopStore.shop?.title }}</p>
        </div>
        <v-dialog
            v-model="cartDialog"
            fullscreen
            :scrim="false"
            transition="dialog-top-transition"
            >
            <template v-slot:activator="{ props }">
                <ShoppingCartIcon  v-bind="props" style="width: 25px; cursor: pointer;  color: var(--tg-theme-button-color);"/>
            </template>
            <v-card>
                <v-toolbar>
                <div class="category__header">
                    <XMarkIcon @click="cartDialog = false" style="width: 25px; cursor: pointer; color: var(--tg-theme-button-text-color);" />
                    <p>
                       Корзина
                    </p>
                    <ArrowPathIcon @click="clearCart()" style="width: 25px; cursor: pointer; color: var(--tg-theme-button-text-color);" />
                </div>
                </v-toolbar>
                <div class="products__grid" style="padding-top: 1rem;">
                    <article class="products__item" v-for="product in cart" :key="product.id">
                        <h3 class="product__title">{{ product.title }}</h3>
                        <p class="product__description">{{ product.description }}</p>
                        <span class="product__price">{{ product.price }} руб.</span>
                        <div class="products__cart_action">
                            <button @click="minusCartItem(product)">-</button>
                            {{ cart[product.id]['inCart'] }}
                            <button :disabled="product.count == cart[product.id]['inCart']" @click="plusCartItem(product)">+</button>
                        </div>
                    </article>
                    <p v-if="Object.keys(cart).length === 0" class="products__empty">Корзина пуста</p>
                </div>
            </v-card>
        </v-dialog>
    </div>
    <div v-if="list.length > 0" class="categories__line">
        <router-link :to="route.fullPath" @click="reset()">Все</router-link>
        <router-link :to="route.fullPath" v-for="category in list" :key="category.id" class="categories__line_item" @click="getProductsByCategory(category)">{{ category.title }}</router-link>
    </div>
    <div class="products__grid">
        <article class="products__item" v-for="product in productsStore.products.items" :key="product.id">
            <h3 class="product__title">{{ product.title }}</h3>
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
    <p v-if="productsStore.products?.items?.length === 0" class="products__empty">
        Продукты не найдены
    </p>
    <div class="products__pagination" v-if="productsStore.products.pages > 1">
        <button @click="changePage(productsStore.products.page - 1)" :disabled="productsStore.products.page === 1">←</button>
        <button @click="changePage(page)" :disabled="productsStore.products.page === page" v-for="page in Array.from({ length: productsStore.products.pages }, (value, index) => index + 1).slice(productsStore.products.page === 1 ? 0 : productsStore.products.page === productsStore.products.pages ? productsStore.products.page - 3 : productsStore.products.page - 2, productsStore.products.page === 1 ? productsStore.products.page + 2 : productsStore.products.page + 1)" :key="page">{{ page }}</button>
        <button @click="changePage(productsStore.products.page + 1)" :disabled="productsStore.products.pages === productsStore.products.page">→</button>
    </div>
</template>

<style lang="scss">

.products__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1rem;

    &_select {
        display: flex;
        gap: 1rem;
    }
}

.categories__line {
    display: flex;
    width: 100%;
    gap: 2rem;
    padding: 1rem;
    overflow-x: auto;
    white-space: nowrap;

    &_item:nth-last-child(1) {
        font-weight: bolder;
    }
}

.category__header {
    background-color: var(--tg-theme-button-color);
    color: var(--tg-theme-button-text-color);
    display: flex;
    justify-content: space-between;
    height: 100%;
    width: 100%;
    padding: 1rem;
    align-items: center;
}

.categories__list {
    display: flex;
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
}

.categories__back {
    padding: 1rem 1rem 0.2rem 1rem;
}

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
    gap: 1rem;

    .products__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        justify-content: space-between;

        .product__price {
            margin-bottom: 1rem;
            color: var(--tg-theme-text-color);
        }

        .product__title {
            color: var(--tg-theme-text-color);
            text-align: center;
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
    padding-top: 2rem;
    padding-right: 1rem;
    padding-left: 1rem;
    padding-bottom: 2rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
}
</style>
