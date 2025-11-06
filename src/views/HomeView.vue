<template>
  <div class="home">
    <BookmarkDisplay :selected-group-id="props.selectedGroupId" />
  </div>
</template>

<script setup lang="ts">
import BookmarkDisplay from '@/components/BookmarkDisplay.vue'

const props = defineProps<{
  selectedGroupId: number | null
}>()
</script>

<style scoped>
.home {
  height: 100%;
}
</style>