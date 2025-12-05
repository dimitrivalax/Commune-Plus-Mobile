<template>
  <div class="city-header">
    <div class="city-header-content">
      <img v-if="showLogo" :src="logoUrl" alt="Logo" class="city-logo" />
      <div class="city-info">
        <h1 class="city-name">{{ cityName }}</h1>
        <p class="city-subtitle" v-if="subtitle">{{ subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { cityConfig } from '@/config/city'

const props = defineProps({
  subtitle: {
    type: String,
    default: ''
  },
  showLogo: {
    type: Boolean,
    default: true
  }
})

const cityName = computed(() => cityConfig.name)
const logoUrl = computed(() => cityConfig.logo)
</script>

<style scoped>
.city-header {
  background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
  padding: 20px 16px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.city-header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.city-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  background: white;
  border-radius: 8px;
  padding: 4px;
}

.city-info {
  flex: 1;
}

.city-name {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: white;
  letter-spacing: -0.5px;
}

.city-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  opacity: 0.9;
  color: white;
}

@media (max-width: 768px) {
  .city-name {
    font-size: 20px;
  }
  
  .city-logo {
    width: 40px;
    height: 40px;
  }
}
</style>


