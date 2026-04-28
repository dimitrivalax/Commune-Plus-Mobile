import { test } from './fixtures/test-fixtures'
import { installHomeMocks } from './fixtures/mocks'

test.describe('Home smoke', () => {
  test('loads home page and displays cards or state message', async ({
    page,
    homePage,
    e2eNavigation
  }) => {
    await installHomeMocks(page)
    await homePage.goto()
    await e2eNavigation.dismissOnboardingIfPresent()
    await homePage.expectCardsOrStateMessage()
  })
})
