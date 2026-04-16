import { test } from './fixtures/test-fixtures'

test.describe('Signalements smoke', () => {
  test('loads signalements view and shows usable UI', async ({
    signalementsPage,
    e2eNavigation
  }) => {
    await signalementsPage.goto()
    await e2eNavigation.dismissOnboardingIfPresent()
    await signalementsPage.expectBaseUiVisible()
    await signalementsPage.expectListOrEmptyState()
  })
})
