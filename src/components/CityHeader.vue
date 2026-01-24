<template>
  <div class="city-header">
    <ion-row
      class="ion-justify-content-center ion-align-content-center ion-align-items-center gap-8"
    >
      <img v-if="showLogo" :src="logoUrl" alt="Logo" class="city-logo" />
      <h1 class="city-name">{{ cityName }}</h1>
    </ion-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { cityConfig } from '@/config/city'
import { getCityInfo } from '@/utils/storage'

const cityInfo = getCityInfo()

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

const cityName = computed(() => cityInfo?.name || cityConfig.name)
const logoUrl = computed(() => cityInfo?.logo || cityConfig.logo)
</script>

<style scoped>
.city-header {
  background: linear-gradient(
    135deg,
    var(--ion-color-primary) 0%,
    var(--ion-color-primary-shade) 100%
  );
  padding: 20px 16px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.city-header-content {
  align-items: center;
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
  margin: 0 0 0 16px;
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
