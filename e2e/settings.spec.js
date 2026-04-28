import { test } from './fixtures/test-fixtures'

test.describe('Settings smoke', () => {
  test('loads settings page and displays main sections', async ({
    settingsPage
  }) => {
    await settingsPage.goto()
    await settingsPage.expectBaseUiVisible()
  })
})
