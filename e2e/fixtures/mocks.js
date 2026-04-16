/**
 * Injects deterministic E2E mocks consumed by `window.__CP_E2E_MOCKS`.
 * This keeps submit-flow tests isolated from external services.
 *
 * @param {import('@playwright/test').Page} page
 */
export async function installSignalementSubmitMocks(page) {
  await page.addInitScript(() => {
    window.__CP_E2E_MOCKS = {
      initialPhotoDataUrl:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9oNn6sUAAAAASUVORK5CYII=',
      uploadImageToCloudinary: async () => 'https://example.com/mock-photo.jpg',
      createSignalement: async () => ({ data: [{ id: 'sig-e2e-001' }], error: null }),
      updatePushTokenEmail: async () => {},
      sendSignalementEmail: async () => {},
      getOrCreateUserId: () => 'user-e2e-001'
    }
  })
}

/**
 * Injects deterministic actualite data for detail-navigation tests.
 *
 * @param {import('@playwright/test').Page} page
 */
export async function installActualiteMocks(page) {
  await page.addInitScript(() => {
    const actualiteItems = [
      {
        id: 'actu-e2e-001',
        title: 'Alerte E2E',
        category: 'Test',
        content: '<p>Contenu E2E</p>',
        image_url: null,
        commune_id: 'e2e-commune-id',
        publication_status: 'published',
        event_date: '2099-01-15'
      }
    ]

    window.__CP_E2E_MOCKS = {
      ...(window.__CP_E2E_MOCKS || {}),
      actualiteGetInitial: async () => ({
        data: actualiteItems,
        error: null,
        hasMoreOlder: false,
        hasMoreNewer: false
      }),
      actualiteGetAll: async () => ({ data: actualiteItems, error: null }),
      actualiteGetById: async (id) => ({
        data: actualiteItems.find((item) => item.id === id) || null,
        error: null
      })
    }
  })
}
