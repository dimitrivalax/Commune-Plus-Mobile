import { getCityInfo, getCityIdFromDatabase } from '@/utils/storage'

export const useCommuneId = () => {
  const getCommuneId = async () => {
    const cityInfo = getCityInfo()
    if (cityInfo?.id) return cityInfo.id
    return await getCityIdFromDatabase()
  }

  return {
    getCommuneId
  }
}
