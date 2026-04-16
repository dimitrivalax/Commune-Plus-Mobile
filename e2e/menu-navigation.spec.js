import { test } from './fixtures/test-fixtures'

test.describe('Menu navigation smoke', () => {
  test.beforeEach(async ({ tabsPage }) => {
    await tabsPage.gotoHome()
  })

  test('opens the side menu from the burger button', async ({ tabsPage }) => {
    await tabsPage.openMenuWithBurger()
  })

  test('opens the side menu from the menu tab', async ({ tabsPage }) => {
    await tabsPage.openMenuWithTab()
  })
})
