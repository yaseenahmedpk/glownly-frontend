<script setup>
import { ref } from 'vue'
import viteLogo from '../assets/vite.svg'
import heroImg from '../assets/hero.png'
import vueLogo from '../assets/vue.svg'

const count = ref(0)
</script>

<template>
  <div>
    <h1>Hello World</h1>
    <p>Count: {{ count }}</p>
    <button @click="count++">Increment</button>
  </div>

</template>
