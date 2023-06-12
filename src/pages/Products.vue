<script setup>
let tg = window.Telegram.WebApp;
console.log(tg.initDataUnsafe);
console.log(tg.ThemeParams?.bg_color);
</script>

<template>
    <p>
        {{ tg.initData }}
    </p>
    <p>
        Products
    </p>
</template>

<style scoped>
</style>
