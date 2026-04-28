import { test } from './fixtures/test-fixtures'
import { installActualiteMocks } from './fixtures/mocks'

test.describe('Actualites smoke', () => {
  test.beforeEach(async ({ page }) => {
    await installActualiteMocks(page)
  })

  test('loads actualites view and shows list or empty state', async ({
    actualitePage,
    e2eNavigation
  }) => {
    await actualitePage.goto()
    await e2eNavigation.dismissOnboardingIfPresent()
    await actualitePage.expectListOrEmptyState()
  })

  test('opens actualite detail when at least one item exists', async ({
    actualitePage,
    e2eNavigation
  }) => {
    await actualitePage.goto()
    await e2eNavigation.dismissOnboardingIfPresent()
    await actualitePage.expectListOrEmptyState()
    await actualitePage.openFirstItemIfAny()
  })

  test('shows back button on actualite detail when an item exists', async ({
    actualitePage,
    e2eNavigation
  }) => {
    await actualitePage.goto()
    await e2eNavigation.dismissOnboardingIfPresent()
    await actualitePage.expectListOrEmptyState()
    await actualitePage.openFirstItemIfAny()
    await actualitePage.expectBackButtonVisible()
  })
})
