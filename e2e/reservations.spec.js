import { test } from './fixtures/test-fixtures'

test.describe('Reservations smoke', () => {
  test('loads reservations view and shows list or empty state', async ({
    reservationsPage,
    e2eNavigation
  }) => {
    await reservationsPage.goto()
    await e2eNavigation.dismissOnboardingIfPresent()
    await reservationsPage.expectListOrEmptyState()
  })

  test('opens reservation detail when at least one item exists', async ({
    reservationsPage,
    e2eNavigation
  }) => {
    await reservationsPage.goto()
    await e2eNavigation.dismissOnboardingIfPresent()
    await reservationsPage.expectListOrEmptyState()
    await reservationsPage.openFirstItemIfAny()
  })
})
