import { expect, test, type Page } from '@playwright/test';

/** Runs against the mock backend (VITE_DATA_SOURCE=mock) with its test-mode payment provider. */

async function addTeeToBag(page: Page) {
  await page.goto('/product/heavyweight-crew-tee');
  await expect(page.getByRole('heading', { level: 1, name: 'Heavyweight Crew Tee' })).toBeVisible();
  await page.getByTestId('add-to-cart').click();
  await expect(page.getByText('Please select a size.')).toBeVisible();
  await page.getByRole('radio', { name: /^Size L/ }).check({ force: true });
  await page.getByTestId('add-to-cart').click();
  await expect(page.getByRole('dialog', { name: /your bag/i })).toContainText(
    'Heavyweight Crew Tee',
  );
}

async function fillCard(page: Page, number: string) {
  await page.getByLabel('Card number').fill(number);
  await page.getByLabel('Name on card').fill('Test Shopper');
  await page.getByLabel('Expiry (MM/YY)').fill('12/34');
  await page.getByLabel('Security code').fill('123');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    // the sign-in popup is covered by its own test below; keep it out of the purchase flow
    sessionStorage.setItem('atelier-signin-prompt-dismissed', '1');
  });
});

test('browse, filter and search the catalogue', async ({ page }) => {
  await page.goto('/women');
  await expect(page.getByRole('heading', { level: 1, name: 'Women' })).toBeVisible();
  const count = page.getByTestId('result-count');
  await expect(count).toContainText('product');

  await page.getByRole('combobox', { name: 'Sort by' }).selectOption('price_asc');
  await expect(page).toHaveURL(/sort=price_asc/);

  await page.goto('/search?q=linen');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('linen');
  await expect(page.getByTestId('product-card').first()).toBeVisible();

  await page.goto('/search?q=zzzz');
  await expect(page.getByText('No results for “zzzz”')).toBeVisible();
});

test('sign up, buy with a declined then a valid card, see the order, sign out', async ({
  page,
  isMobile,
}) => {
  await addTeeToBag(page);
  await page.getByRole('dialog').getByRole('button', { name: 'Checkout' }).click();

  // checkout is protected → login → create account
  await expect(page).toHaveURL(/\/sign-in/);
  await page.getByRole('tab', { name: 'Create account' }).click();
  const email = `e2e-${Date.now()}@example.com`;
  await page.getByLabel('Full name').fill('E2E Shopper');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('Secret123');
  await page.getByLabel('Confirm password').fill('Secret123');
  await page.getByRole('tabpanel').getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/checkout/);

  // address validation
  await page.getByRole('button', { name: 'Continue to delivery' }).click();
  await expect(page.getByText('Enter the recipient name')).toBeVisible();
  await page.getByLabel('Full name').fill('E2E Shopper');
  await page.getByLabel('Phone').fill('+1 415 555 0100');
  await page.getByLabel('Address line 1').fill('1 Market Street');
  await page.getByLabel('State / region').fill('CA');
  await page.getByLabel('City').fill('San Francisco');
  await page.getByLabel('Postal code').fill('94105');
  await page.getByRole('button', { name: 'Continue to delivery' }).click();

  await expect(page.getByRole('heading', { name: 'Delivery method' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to payment' }).click();

  // coupon (the summary sidebar is desktop-only; mobile collapses it)
  if (!isMobile) {
    const aside = page.getByRole('complementary', { name: 'Order summary' });
    await aside.getByLabel('Coupon code').fill('WELCOME10');
    await aside.getByRole('button', { name: 'Apply' }).click();
    await expect(aside.getByTestId('discount')).toHaveText('−₹129.90');
  }

  await fillCard(page, '4000 0000 0000 0002');
  await page.getByTestId('pay-button').click();
  await expect(page.getByText(/your card was declined/i)).toBeVisible();

  await page.getByLabel('Card number').fill('4242 4242 4242 4242');
  await page.getByTestId('pay-button').click();
  await expect(page.getByRole('heading', { name: 'Your order is confirmed' })).toBeVisible({
    timeout: 15_000,
  });
  const orderNumber = await page.getByTestId('order-number').innerText();

  // bag is empty after purchase
  await expect(page.getByTestId('cart-button')).toHaveAccessibleName(/0 items/);

  // order history + tracking
  await page.goto('/account/orders');
  await expect(page.getByText(`Order ${orderNumber}`)).toBeVisible();
  await page.getByText(`Order ${orderNumber}`).click();
  await page.getByRole('link', { name: 'Track shipment' }).click();
  await expect(page.getByRole('heading', { name: 'Track your order' })).toBeVisible();

  // logout
  await page.goto('/account');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL('/');
  await page.goto('/account');
  await expect(page).toHaveURL(/\/sign-in/);
});

test('wishlist persists across reloads', async ({ page }) => {
  await page.goto('/product/wrap-midi-dress');
  await page.getByRole('button', { name: /add wrap midi dress to wishlist/i }).click();
  await page.reload();
  await page.goto('/wishlist');
  await expect(page.getByTestId('product-card')).toHaveCount(1);
});

test('keyboard users can skip to content and close dialogs with Escape', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'keyboard flow is desktop-only');
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.getByRole('button', { name: 'Search' }).first().click();
  await expect(page.getByRole('combobox')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('signed-out shoppers see a sign-in popup that opens the sign-in page', async ({ page }) => {
  await page.evaluate(() => sessionStorage.clear());
  await page.goto('/women');
  const prompt = page.getByTestId('signin-prompt');
  await expect(prompt).toBeVisible();
  await prompt.getByRole('link', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/sign-in\?mode=signup/);
  await expect(page.getByRole('tab', { name: 'Create account' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByTestId('signin-prompt')).toHaveCount(0);
});

test('switches the whole site between English and Tamil', async ({ page }) => {
  await page.goto('/product/heavyweight-crew-tee');
  await expect(page.getByTestId('add-to-cart')).toHaveText(/add to bag/i);
  await page.getByTestId('lang-ta').first().click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ta');
  await expect(page.getByTestId('add-to-cart')).toHaveText('பையில் சேர்');
  await page.reload();
  await expect(page.getByTestId('add-to-cart')).toHaveText('பையில் சேர்');
  await page.getByTestId('lang-en').first().click();
  await expect(page.getByTestId('add-to-cart')).toHaveText(/add to bag/i);
});
