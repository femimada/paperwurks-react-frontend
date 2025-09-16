// src/tests/e2e/property-workflow.e2e.test.ts
import { test, expect, type Page } from '@playwright/test';

// Test configuration
const TEST_USER = {
  email: 'test.owner@paperwurks.com',
  password: 'TestPassword123!',
  role: 'owner',
};

const TEST_PROPERTY = {
  title: 'E2E Test Property',
  address: {
    line1: '123 Test Street',
    city: 'Test City',
    postcode: 'TE5 1ST',
  },
  propertyType: 'detached',
  bedrooms: 3,
  bathrooms: 2,
  askingPrice: 350000,
};

/**
 * Helper function to log in as a test user
 */
async function loginAsUser(page: Page, user = TEST_USER): Promise<void> {
  await page.goto('/login');

  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);

  await page.click('[data-testid="login-button"]');

  // Wait for successful login and redirect
  await expect(page).toHaveURL('/dashboard');
}

/**
 * Helper function to fill property form
 */
async function fillPropertyForm(
  page: Page,
  property = TEST_PROPERTY
): Promise<void> {
  // Step 1: Basic Details
  await page.fill('[data-testid="title-input"]', property.title);
  await page.fill(
    '[data-testid="description-input"]',
    'A beautiful test property for E2E testing'
  );

  await page.click('[data-testid="next-step-button"]');

  // Step 2: Address
  await page.fill(
    '[data-testid="address-line1-input"]',
    property.address.line1
  );
  await page.fill('[data-testid="city-input"]', property.address.city);
  await page.fill('[data-testid="postcode-input"]', property.address.postcode);

  await page.click('[data-testid="next-step-button"]');

  // Step 3: Features
  await page.selectOption(
    '[data-testid="property-type-select"]',
    property.propertyType
  );
  await page.fill(
    '[data-testid="bedrooms-input"]',
    property.bedrooms.toString()
  );
  await page.fill(
    '[data-testid="bathrooms-input"]',
    property.bathrooms.toString()
  );

  await page.click('[data-testid="next-step-button"]');

  // Step 4: Financial
  await page.fill(
    '[data-testid="asking-price-input"]',
    property.askingPrice.toString()
  );
}

test.describe('Property Management E2E Workflow', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Set up test data or reset state if needed
    await page.goto('/');
  });

  test('Complete property creation and management workflow', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Step 1: Login
    await test.step('User can log in successfully', async () => {
      await loginAsUser(page);

      // Verify user is on dashboard
      await expect(
        page.locator('[data-testid="dashboard-page"]')
      ).toBeVisible();
      await expect(page.locator('text=Welcome back')).toBeVisible();
    });

    // Step 2: Navigate to properties
    await test.step('User can navigate to properties list', async () => {
      await page.click('[data-testid="nav-properties"]');
      await expect(page).toHaveURL('/properties');

      // Verify properties page loaded
      await expect(
        page.locator('[data-testid="property-list-page"]')
      ).toBeVisible();
      await expect(page.locator('text=My Properties')).toBeVisible();
    });

    // Step 3: Create a new property
    let createdPropertyId: string;
    await test.step('User can create a new property', async () => {
      // Click create property button
      await page.click('[data-testid="create-property-button"]');
      await expect(page).toHaveURL('/properties/create');

      // Fill out the property form
      await fillPropertyForm(page);

      // Submit the form
      await page.click('[data-testid="submit-button"]');

      // Wait for success message
      await expect(page.locator('text=Property Created!')).toBeVisible();

      // Extract property ID from success page or URL
      await page.click('[data-testid="view-property-button"]');

      // Get the property ID from the URL
      const url = page.url();
      const matches = url.match(/\/properties\/([^/]+)$/);
      createdPropertyId = matches ? matches[1] : '';
      expect(createdPropertyId).toBeTruthy();
    });

    // Step 4: View property details
    await test.step('User can view property details', async () => {
      // Should already be on property details page
      await expect(
        page.locator('[data-testid="property-details-page"]')
      ).toBeVisible();

      // Verify property information is displayed
      await expect(page.locator(`text=${TEST_PROPERTY.title}`)).toBeVisible();
      await expect(
        page.locator(`text=${TEST_PROPERTY.address.line1}`)
      ).toBeVisible();
      await expect(
        page.locator(`text=${TEST_PROPERTY.address.postcode}`)
      ).toBeVisible();

      // Check that tabs are present
      await expect(page.locator('text=Overview')).toBeVisible();
      await expect(page.locator('text=Documents')).toBeVisible();
      await expect(page.locator('text=Activity')).toBeVisible();
    });

    // Step 5: Edit the property
    await test.step('User can edit property information', async () => {
      // Click edit button
      await page.click('[data-testid="edit-button"]');
      await expect(page).toHaveURL(`/properties/${createdPropertyId}/edit`);

      // Verify edit form is pre-populated
      await expect(
        page.locator(`[value="${TEST_PROPERTY.title}"]`)
      ).toBeVisible();

      // Make a change
      const updatedTitle = 'Updated E2E Test Property';
      await page.fill('[data-testid="title-input"]', updatedTitle);

      // Submit the changes
      await page.click('[data-testid="submit-button"]');

      // Wait for success message
      await expect(page.locator('text=Property Updated!')).toBeVisible();

      // Verify redirect back to property details
      await expect(page).toHaveURL(`/properties/${createdPropertyId}`);

      // Verify the change was saved
      await expect(page.locator(`text=${updatedTitle}`)).toBeVisible();
    });

    // Step 6: Navigate back to properties list
    await test.step('User can navigate back to properties list and see their property', async () => {
      await page.click('[data-testid="back-button"]');
      await expect(page).toHaveURL('/properties');

      // Verify the updated property appears in the list
      await expect(
        page.locator('[data-testid="properties-grid"]')
      ).toBeVisible();
      await expect(
        page.locator('text=Updated E2E Test Property')
      ).toBeVisible();
    });

    // Step 7: Test search functionality
    await test.step('User can search for properties', async () => {
      // Search for the created property
      await page.fill('[data-testid="search-input"]', 'Updated E2E');
      await page.press('[data-testid="search-input"]', 'Enter');

      // Wait for search results
      await expect(
        page.locator('text=Updated E2E Test Property')
      ).toBeVisible();

      // Clear search to show all properties
      await page.fill('[data-testid="search-input"]', '');
      await page.press('[data-testid="search-input"]', 'Enter');
    });

    // Step 8: Test view modes
    await test.step('User can switch between grid and list view modes', async () => {
      // Test view mode toggle if available
      const gridButton = page.locator('[data-testid="view-mode-grid"]');
      const listButton = page.locator('[data-testid="view-mode-list"]');

      if (await listButton.isVisible()) {
        await listButton.click();
        await expect(
          page.locator('[data-testid="properties-grid"]')
        ).toHaveClass(/list/);

        await gridButton.click();
        await expect(
          page.locator('[data-testid="properties-grid"]')
        ).not.toHaveClass(/list/);
      }
    });
  });

  test('Property creation form validation', async ({
    page,
  }: {
    page: Page;
  }) => {
    await loginAsUser(page);

    await test.step('Form shows validation errors for empty required fields', async () => {
      // Navigate to create page
      await page.goto('/properties/create');

      // Try to submit empty form
      await page.click('[data-testid="submit-button"]');

      // Check for validation errors
      await expect(
        page.locator('text=Property title is required')
      ).toBeVisible();
      await expect(
        page.locator('text=Address line 1 is required')
      ).toBeVisible();
      await expect(page.locator('text=City is required')).toBeVisible();
      await expect(page.locator('text=Postcode is required')).toBeVisible();
    });

    await test.step('Form validates postcode format', async () => {
      // Fill most fields but use invalid postcode
      await page.fill('[data-testid="title-input"]', 'Test Property');
      await page.click('[data-testid="next-step-button"]');

      await page.fill('[data-testid="address-line1-input"]', '123 Test St');
      await page.fill('[data-testid="city-input"]', 'Test City');
      await page.fill('[data-testid="postcode-input"]', 'INVALID');

      await page.click('[data-testid="next-step-button"]');

      // Should show postcode validation error
      await expect(
        page.locator('text=Invalid UK postcode format')
      ).toBeVisible();
    });
  });

  test('Access control and permissions', async ({ page }: { page: Page }) => {
    // Test that buyers cannot create properties
    await test.step('Buyer role cannot access property creation', async () => {
      await loginAsUser(page, {
        email: 'test.buyer@paperwurks.com',
        password: 'TestPassword123!',
        role: 'buyer',
      });

      // Try to navigate directly to create page
      await page.goto('/properties/create');

      // Should be redirected or show access denied
      await expect(page.locator('text=Access Denied')).toBeVisible();
    });

    // Test that users can only edit their own properties
    await test.step('Users cannot edit properties they do not own', async () => {
      await loginAsUser(page, {
        email: 'test.buyer@paperwurks.com',
        password: 'TestPassword123!',
        role: 'buyer',
      });

      // Try to access edit page for a property they don't own
      await page.goto('/properties/1/edit');

      // Should show access denied or redirect
      await expect(page.locator('text=Access Denied')).toBeVisible();
    });
  });

  test('Error handling and edge cases', async ({ page }: { page: Page }) => {
    await loginAsUser(page);

    await test.step('Handles non-existent property gracefully', async () => {
      // Try to access a property that doesn't exist
      await page.goto('/properties/non-existent-id');

      // Should show appropriate error message
      await expect(page.locator('text=Property Not Found')).toBeVisible();

      // Should have option to go back
      await expect(
        page.locator('[data-testid="back-to-properties-button"]')
      ).toBeVisible();
    });

    await test.step('Handles network errors gracefully', async () => {
      // Navigate to properties page
      await page.goto('/properties');

      // Simulate network error by intercepting API calls
      await page.route('**/api/properties', (route) => {
        route.abort('failed');
      });

      // Refresh to trigger error
      await page.reload();

      // Should show error state with retry option
      await expect(page.locator('text=Error Loading Properties')).toBeVisible();
      await expect(page.locator('text=Try Again')).toBeVisible();
    });
  });
});

// Test configuration and cleanup
test.afterEach(async () => {
  // Clean up any test data if needed
  // This would typically involve API calls to delete test properties
  console.log('Test completed, cleanup would happen here');
});

export { TEST_USER, TEST_PROPERTY };
