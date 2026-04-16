import { test } from './fixtures/test-fixtures'

test.describe('Actualites smoke', () => {
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
})
