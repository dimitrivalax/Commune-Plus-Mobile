import { test } from './fixtures/test-fixtures'
import { installSignalementSubmitMocks } from './fixtures/mocks'

test.describe('New signalement form smoke', () => {
  test('loads form and keeps submit disabled without required inputs', async ({
    newSignalementPage
  }) => {
    await newSignalementPage.goto()
    await newSignalementPage.expectBaseUiVisible()
    await newSignalementPage.expectSubmitDisabledWithoutRequiredData()
  })

  test('submits successfully with mocked network dependencies', async ({
    page,
    newSignalementPage
  }) => {
    await installSignalementSubmitMocks(page)
    await newSignalementPage.goto()
    await newSignalementPage.expectBaseUiVisible()
    await newSignalementPage.submit()
    await newSignalementPage.expectSuccessAndRedirect()
  })
})
