<script setup>
import { ref, onBeforeMount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProductsStore } from '@/stores/products';
import { useCategoryStore } from '@/stores/category';

const route = useRoute()
const productsStore = useProductsStore()
const categoryStore = useCategoryStore()
let tg = window.Telegram.WebApp
const cart = ref(new Object())
const selectedCategory = ref(null)
const categories = ref([])
const dialog = ref(false)

onBeforeMount(async () => {
    await productsStore.request_products(route.query?.shop_id)
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
    await productsStore.request_products(route.query?.shop_id, page)
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

function getParent(parentId, children = categoryStore.categories) {
    children?.forEach(category => {
        if (category.id == parentId) {
            categories.value = children
        }
        getParent(parentId, category.children)
    })
}

function selectCategory(category) {
    selectedCategory.value = category
    if (category.children.length > 0) {
        categories.value = category.children
    }
}

async function getProductsByCategory(category) {
    await productsStore.request_products_by_category(route.query?.shop_id, category.id)
    dialog.value = false
}

Telegram.WebApp.onEvent('mainButtonClicked', () => {
	tg.sendData(JSON.stringify(cart.value)); 
});
</script>

<template>
    <v-dialog
      v-model="dialog"
      fullscreen
      :scrim="false"
      transition="dialog-top-transition"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          color="primary"
          dark
          v-bind="props"
        >
          Категории
        </v-btn>
      </template>
      <v-card>
        <v-toolbar
          dark
          color="primary"
        >
          <v-btn
            @click="dialog = false"
          >
            X
          </v-btn>
          <div v-if="selectedCategory">
            {{ selectedCategory.title }}
          </div>
          <v-btn v-if="selectedCategory" @click="getProductsByCategory(selectedCategory)">
            Продолжить
          </v-btn>
        </v-toolbar>
        <div>
            <button v-if="categories[0]?.parent_id" @click="getParent(categories[0]?.parent_id)">Назад</button>
        </div>
        <div v-for="category in categories" :key="category.id">
            <button @click="selectCategory(category)">{{ category.title }}</button>
        </div>
      </v-card>
    </v-dialog>
    <div class="products__grid">
        <article class="products__item" v-for="product in productsStore.products.items" :key="product.id">
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
    <p v-if="productsStore.products?.items?.length === 0" class="products__empty">
        Продукты не найдены
    </p>
    <div class="products__pagination">
        <button @click="changePage(productsStore.products.page - 1)" :disabled="productsStore.products.page === 1">←</button>
        <button @click="changePage(page)" :disabled="productsStore.products.page === page" v-for="page in Array.from({ length: productsStore.products.pages }, (value, index) => index + 1).slice(productsStore.products.page === 1 ? 0 : productsStore.products.page === productsStore.products.pages ? productsStore.products.page - 3 : productsStore.products.page - 2, productsStore.products.page === 1 ? productsStore.products.page + 2 : productsStore.products.page + 1)" :key="page">{{ page }}</button>
        <button @click="changePage(productsStore.products.page + 1)" :disabled="productsStore.products.pages === productsStore.products.page">→</button>
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
    padding-top: 2rem;
    padding-right: 1rem;
    padding-left: 1rem;
    padding-bottom: 2rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
}
</style>
