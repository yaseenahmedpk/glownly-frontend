<script setup>
import { useLanguageStore } from '../stores/languageStore'
import { storeToRefs } from 'pinia'

const languageStore = useLanguageStore()
const { locale } = storeToRefs(languageStore)

const changeLang = (e) => {
    languageStore.setLanguage(e.target.value)
}

</script>

<template>
    <select @change="changeLang($event)" :value="locale">
        <option value="ms">🇲🇾 Bahasa Melayu</option>
        <option value="en">🇺🇸 English</option>
    </select>
</template>