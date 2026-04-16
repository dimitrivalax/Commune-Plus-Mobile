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
