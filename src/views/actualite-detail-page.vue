<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <template v-slot:start>
          <ion-buttons>
            <ion-back-button default-href="/tabs/actualite"></ion-back-button>
          </ion-buttons>
        </template>
        <ion-title>Détail de l'actualité</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="page-content">
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
              <span>{{ formatDate(item.event_date) }}</span>
            </p>
            <div class="content-body" v-html="item.content"></div>
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.title"
              class="info-image info-image-clickable"
              @click="openFullscreenImage(item.image_url)"
            />

            <ion-modal
              :is-open="!!fullscreenImageUrl"
              :initial-breakpoint="1"
              :breakpoints="[1]"
              class="fullscreen-image-modal"
              backdrop-dismiss
              @didDismiss="fullscreenImageUrl = null"
            >
              <ion-header>
                <ion-toolbar>
                  <template v-slot:end>
                    <ion-buttons>
                      <ion-button @click="fullscreenImageUrl = null">
                        <ion-icon :icon="closeOutline" />
                      </ion-button>
                    </ion-buttons>
                  </template>
                </ion-toolbar>
              </ion-header>
              <ion-content class="ion-padding fullscreen-image-content">
                <img
                  v-if="fullscreenImageUrl"
                  :src="fullscreenImageUrl"
                  alt="Image plein écran"
                  class="fullscreen-image"
                  @click="fullscreenImageUrl = null"
                />
              </ion-content>
            </ion-modal>
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
import { closeOutline } from 'ionicons/icons'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonBadge,
  IonSpinner,
  IonModal,
  IonButton,
  IonIcon
} from '@ionic/vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { InformationService } from '@/services/actualite-service'
import { formatDate } from '@/utils/date'
import { useCommuneId } from '@/composables/useCommuneId'
import { trackEvent } from '@/services/posthog'

const route = useRoute()
const router = useRouter()
const infoItems = ref([])
const loading = ref(true)
const initialSlide = ref(0)
const fullscreenImageUrl = ref(null)
const { getCommuneId } = useCommuneId()

const trackActualiteView = (item, source) => {
  if (!item?.id) return
  trackEvent('actualite_viewed', {
    actualite_id: String(item.id),
    source
  })
}

const openFullscreenImage = (url) => {
  fullscreenImageUrl.value = url
}

const loadInfoItems = async () => {
  loading.value = true
  try {
    const communeId = await getCommuneId()
    const { data, error } = await InformationService.getAll(communeId)

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

    const initialItem = infoItems.value[initialSlide.value]
    if (initialItem) {
      trackActualiteView(initialItem, 'detail_page_initial')
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
    // Update the URL without reloading the page
    router.replace({ params: { id: currentItem.id } })
    trackActualiteView(currentItem, 'detail_page_swipe')
  }
}

onMounted(() => {
  loadInfoItems()
})
</script>

<style lang="scss" scoped>
.info-swiper {
  height: 100%;
}

.info-content {
  height: 100%;
  overflow-y: auto;

  h1 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--ion-color-dark);
  }
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
  color: var(--ion-color-dark);

  // Headings
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: 700;
    margin-top: 16px;
    margin-bottom: 8px;
    color: var(--ion-color-dark);
  }

  h1 {
    font-size: 24px;
  }

  h2 {
    font-size: 20px;
  }

  h3 {
    font-size: 18px;
  }

  // Paragraphs
  p {
    margin-bottom: 12px;
  }

  // Text formatting
  strong {
    font-weight: 700;
  }

  em {
    font-style: italic;
  }

  u {
    text-decoration: underline;
  }

  s {
    text-decoration: line-through;
  }

  // Links
  a {
    color: var(--ion-color-primary);
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  // Lists
  ul,
  ol {
    margin: 12px 0;
    padding-left: 24px;
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  li {
    margin-bottom: 6px;
  }

  // Nested lists
  ul ul,
  ol ul {
    list-style-type: circle;
  }

  ol ol,
  ul ol {
    list-style-type: lower-alpha;
  }

  // Colors (from Quill editor)
  .ql-align-center {
    text-align: center;
  }

  .ql-align-right {
    text-align: right;
  }

  .ql-align-justify {
    text-align: justify;
  }
}

.info-image {
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
  margin-top: 16px;
}

.info-image-clickable {
  cursor: pointer;
}

.fullscreen-image-modal {
  --width: 100%;
  --height: 100%;
  --max-width: 100%;
  --max-height: 100%;
  --border-radius: 0;

  &::part(content) {
    --background: #000;
  }
}

.fullscreen-image-content {
  --background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

.fullscreen-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.page-content::part(scroll) {
  overscroll-behavior-y: contain;
}
</style>
