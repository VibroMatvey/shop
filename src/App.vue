<script setup>
</script>

<template>
  <section class="wrapper">
    <main class="main">
      <RouterView />
    </main>
  </section>
</template>

<style lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  .main {
    flex-grow: 1;
  }
}
</style>
