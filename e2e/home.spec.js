import { test } from './fixtures/test-fixtures'

test.describe('Home smoke', () => {
  test('loads home page and displays cards or state message', async ({
    homePage,
    e2eNavigation
  }) => {
    await homePage.goto()
    await e2eNavigation.dismissOnboardingIfPresent()
    await homePage.expectCardsOrStateMessage()
  })
})
