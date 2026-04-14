<template>
  <IonPage>
    <AppHeader title="Actualités"></AppHeader>
    <IonContent ref="ionContentRef" class="page-content">
      <div class="ion-padding">
        <IonRefresher slot="fixed" @ionRefresh="onRefresh($event)">
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <template v-if="groupedByDate.length > 0">
          <div
            v-for="group in groupedByDate"
            :key="group.dateKey"
            class="date-group"
          >
            <div class="date-group-header">
              <IonIcon :icon="calendarOutline" class="date-group-icon" />
              <span class="date-group-label">{{ group.label }}</span>
            </div>
            <IonList class="info-list">
              <IonItem
                v-for="item in group.items"
                :key="item.id"
                lines="none"
                button
                class="info-item"
                @click="$router.push(`/actualite/${item.id}`)"
              >
                <IonThumbnail
                  v-if="item.image_url"
                  slot="start"
                  class="info-thumb-wrap"
                >
                  <img
                    :src="item.image_url"
                    :alt="item.title"
                    class="info-thumb"
                  />
                </IonThumbnail>
                <IonIcon
                  v-else
                  :icon="newspaper"
                  slot="start"
                  class="info-icon"
                />
                <IonLabel>
                  <p class="info-item-title">{{ item.title }}</p>
                  <div class="item-meta">
                    <IonBadge v-if="item.category" class="category-badge">
                      {{ item.category }}
                    </IonBadge>
                  </div>
                </IonLabel>
              </IonItem>
            </IonList>
          </div>

          <!-- Infinite scroll vers le bas (charger les plus récentes) -->
          <IonInfiniteScroll
            v-if="hasMoreNewer"
            :disabled="loadingNewer"
            @ionInfinite="loadNewer($event)"
          >
            <IonInfiniteScrollContent
              loading-spinner="crescent"
              loading-text="Chargement..."
            ></IonInfiniteScrollContent>
          </IonInfiniteScroll>
        </template>

        <div v-else-if="!initialLoading" class="empty-state">
          <IonIcon :icon="newspaperOutline" class="empty-icon" />
          <h3>Aucune information</h3>
          <p>Aucune information disponible pour le moment.</p>
        </div>

        <div v-else class="loading-state">
          <IonSpinner name="crescent" class="loading-spinner" />
          <p>Chargement des actualités...</p>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonThumbnail,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
  onIonViewWillEnter
} from '@ionic/vue'
import {
  newspaper,
  newspaperOutline,
  chevronForward,
  calendarOutline
} from 'ionicons/icons'
import AppHeader from '@/components/app-header.vue'
import { InformationService } from '@/services/actualite-service'
import { formatDateGroupLabel } from '@/utils/date'
import { getCityInfo, getCityIdFromDatabase } from '@/utils/storage'

const ionContentRef = ref(null)
const infoItems = ref([])
const hasMoreOlder = ref(true)
const hasMoreNewer = ref(true)
const loadingOlder = ref(false)
const loadingNewer = ref(false)
const initialLoading = ref(true)

const getCommuneId = async () => {
  const cityInfo = getCityInfo()
  if (cityInfo?.id) return cityInfo.id
  return await getCityIdFromDatabase()
}

const getMinEventDate = () => {
  const dates = infoItems.value.map((i) => i.event_date).filter(Boolean)
  return dates.length ? dates.sort()[0] : null
}

const getMaxEventDate = () => {
  const dates = infoItems.value.map((i) => i.event_date).filter(Boolean)
  return dates.length ? dates.sort().pop() : null
}

const getDateKey = (dateString) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return d.toISOString().split('T')[0]
}

const groupedByDate = computed(() => {
  const groups = new Map()
  for (const item of infoItems.value) {
    const dateStr = item.event_date || item.created_at
    const dateKey = getDateKey(dateStr)
    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        dateKey,
        label: formatDateGroupLabel(dateStr),
        items: []
      })
    }
    groups.get(dateKey).items.push(item)
  }
  return Array.from(groups.values())
})

const loadInitial = async () => {
  const communeId = await getCommuneId()
  const today = new Date().toISOString().split('T')[0]
  const {
    data,
    error,
    hasMoreOlder: moreOlder,
    hasMoreNewer: moreNewer
  } = await InformationService.getInitial(communeId, today)
  if (error) throw error
  infoItems.value = data || []
  hasMoreOlder.value = moreOlder
  hasMoreNewer.value = moreNewer
}

const loadOlder = async (event) => {
  console.log('loadOlder', loadingOlder.value, hasMoreOlder.value)
  if (loadingOlder.value || !hasMoreOlder.value) {
    event?.target?.complete()
    return
  }
  const minDate = getMinEventDate()
  if (!minDate) {
    hasMoreOlder.value = false
    event?.target?.complete()
    return
  }
  loadingOlder.value = true
  try {
    const communeId = await getCommuneId()
    const { data, error, hasMore } = await InformationService.getOlderThan(
      communeId,
      minDate
    )
    if (error) throw error
    if (data?.length) {
      infoItems.value = [...(data || []), ...infoItems.value]
    }
    hasMoreOlder.value = hasMore
  } catch (err) {
    console.error('Error loading older info:', err)
    hasMoreOlder.value = false
  } finally {
    loadingOlder.value = false
    event?.target?.complete()
  }
}

const loadNewer = async (event) => {
  if (loadingNewer.value || !hasMoreNewer.value) {
    event?.target?.complete()
    return
  }
  const maxDate = getMaxEventDate()
  if (!maxDate) {
    hasMoreNewer.value = false
    event?.target?.complete()
    return
  }
  loadingNewer.value = true
  try {
    const communeId = await getCommuneId()
    const { data, error, hasMore } = await InformationService.getNewerThan(
      communeId,
      maxDate
    )
    if (error) throw error
    if (data?.length) {
      infoItems.value = [...infoItems.value, ...(data || [])]
    }
    hasMoreNewer.value = hasMore
  } catch (err) {
    console.error('Error loading newer info:', err)
    hasMoreNewer.value = false
  } finally {
    loadingNewer.value = false
    event?.target?.complete()
  }
}

const onRefresh = async (event) => {
  hasMoreOlder.value = true
  hasMoreNewer.value = true
  initialLoading.value = false
  try {
    await loadInitial()
  } catch (err) {
    console.error('Error refreshing info:', err)
  } finally {
    event.target.complete()
    await nextTick()
    setTimeout(() => {
      ionContentRef.value?.$el?.scrollToTop(0)
    }, 50)
  }
}

const initializeActualites = async () => {
  try {
    await loadInitial()
  } catch (err) {
    console.error('Error loading info:', err)
  } finally {
    initialLoading.value = false
    await nextTick()
    setTimeout(() => {
      ionContentRef.value?.$el?.scrollToTop(0)
    }, 50)
  }
}

onIonViewWillEnter(async () => {
  await initializeActualites()
})
</script>

<style lang="scss" scoped>
.date-group {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 16px;
  }
}

.date-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 6px 0;

  .date-group-icon {
    font-size: 18px;
    color: var(--ion-color-primary);
  }

  .date-group-label {
    font-size: 15px;
    font-weight: 600;
    color: var(--ion-color-primary);
    text-transform: capitalize;
  }
}

.info-list {
  background: transparent;
}

.info-item {
  --background: white;
  margin-bottom: 8px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  .info-item-title {
    font-weight: bold;
    font-size: large;
  }

  .info-thumb-wrap {
    --size: 48px;
    margin-right: 12px;
  }

  .info-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .info-icon {
    font-size: 24px;
    color: var(--ion-color-primary);
    margin-right: 12px;
  }

  .chevron-icon {
    font-size: 20px;
    color: var(--ion-color-medium);
  }
}

.item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  gap: 8px;
}

.time-text {
  font-size: 13px;
  color: var(--ion-color-medium);
}

.category-badge {
  flex-shrink: 0;
  --padding-top: 2px;
  --padding-bottom: 2px;
  --padding-start: 6px;
  --padding-end: 6px;
  font-size: 11px;
  line-height: 1.2;
}

.empty-state,
.loading-state {
  text-align: center;
  padding: 48px 24px;

  .empty-icon {
    font-size: 64px;
    color: var(--ion-color-light);
    margin-bottom: 16px;
  }

  .loading-spinner {
    margin-bottom: 16px;
  }

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--ion-color-light);
    margin: 0 0 8px 0;
  }

  p {
    color: var(--ion-color-medium);
  }
}

.page-content::part(scroll) {
  overscroll-behavior-y: contain;
}
</style>
