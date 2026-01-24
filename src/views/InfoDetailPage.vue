<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/info"></ion-back-button>
        </ion-buttons>
        <ion-title>Détail de l'information</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="loading" class="ion-padding ion-text-center">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Chargement...</p>
      </div>

      <swiper
        v-else-if="infoItems.length > 0"
        :initial-slide="initialSlide"
        :modules="[Pagination]"
        :pagination="{
          dynamicBullets: true,
          clickable: true
        }"
        class="info-swiper"
        @slideChange="onSlideChange"
      >
        <swiper-slide v-for="item in infoItems" :key="item.id">
          <div class="ion-padding info-content">
            <h1>{{ item.title }}</h1>
            <p class="meta-info">
              <ion-badge v-if="item.category">{{ item.category }}</ion-badge>
              <span>{{ formatDate(item.created_at) }}</span>
            </p>
            <div class="content-body" v-html="item.content"></div>
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.title"
              class="info-image"
            />
          </div>
        </swiper-slide>
      </swiper>

      <div v-else class="ion-padding ion-text-center">
        <p>Aucune information trouvée.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonBadge,
  IonSpinner
} from '@ionic/vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { supabase } from '@/services/supabase'
import { formatDate } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const infoItems = ref([])
const loading = ref(true)
const initialSlide = ref(0)

const loadInfoItems = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('municipal_info')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    infoItems.value = data || []

    // Find the initial slide index based on the route parameter
    if (route.params.id) {
      const index = infoItems.value.findIndex(
        (item) => item.id === route.params.id
      )
      if (index !== -1) {
        initialSlide.value = index
      }
    }
  } catch (error) {
    console.error('Error loading info items:', error)
  } finally {
    loading.value = false
  }
}

const onSlideChange = (swiper) => {
  const currentItem = infoItems.value[swiper.activeIndex]
  if (currentItem) {
    // Update the URL without reloading the page or triggering a navigation that would reset the swiper
    // This allows the back button to behave correctly if needed, though often for swipers we just keep the active state
    router.replace({ params: { id: currentItem.id } })
  }
}

onMounted(() => {
  loadInfoItems()
})
</script>

<style scoped>
.info-swiper {
  height: 100%;
}

.info-content {
  height: 100%;
  overflow-y: auto;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--ion-color-medium);
}

.content-body {
  line-height: 1.6;
}

.info-image {
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
  margin-top: 16px;
}
</style>
