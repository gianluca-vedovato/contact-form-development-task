import { test, expect } from '@playwright/test';

test('should send a message', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Fill all required fields
  await page.getByLabel('First name *').fill('John');
  await page.getByLabel('Last name *').fill('Doe');
  await page.getByLabel('Work Email *').fill('john@doe.com');
  await page.getByLabel('Message *').fill('Here is my awesome message for you');

  await page.getByRole('button', { name: 'Send Message' }).click();

  // Wait for the success message with the correct text
  await expect(page.getByText('Your message has been sent. We will get back to you as soon as possible.')).toBeVisible();
  await page.waitForTimeout(6000);
  await expect(page.getByText('Your message has been sent. We will get back to you as soon as possible.')).toBeHidden();
});


test('error message should be display correctly', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByLabel('First name *').focus();
  await page.getByLabel('First name *').blur();

  await expect(page.getByText('First name is required')).toBeVisible();

  await page.getByLabel('Work Email *').focus();
  await page.getByLabel('Work Email *').blur();
  await expect(page.getByText('Email is required')).toBeVisible();

  await page.getByLabel('Work Email *').fill('test@email');
  await page.getByLabel('Work Email *').blur();
  await expect(page.getByText('Please enter a valid email address')).toBeVisible();

  await expect(page.getByRole('button', { name: 'Send Message' })).toBeDisabled();
});

test('should fill the form with tab and enter', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('First name *')).toBeFocused();
  await page.keyboard.type('John');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Last name *')).toBeFocused();
  await page.keyboard.type('Doe');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Work Email *')).toBeFocused();
  await page.keyboard.type('john@doe.com');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Message *')).toBeFocused();
  await page.keyboard.type('Here is my awesome message for you');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('paragraph').filter({ hasText: 'For information about our' }).getByRole('link')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Send Message' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Your message has been sent. We will get back to you as soon as possible.')).toBeVisible();
});

test('should handle backend unavailability', async ({ page }) => {
  // Intercept the Supabase function call and return an error
  await page.route('**/functions/v1/form-submission', async route => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal server error' })
    });
  });

  await page.goto('http://localhost:5173/');
  await page.getByLabel('First name *').fill('John');
  await page.getByLabel('Last name *').fill('Doe');
  await page.getByLabel('Work Email *').fill('john@doe.com');
  await page.getByLabel('Message *').fill('Here is my awesome message for you');
  await page.getByRole('button', { name: 'Send Message' }).click();

  // Should show error message
  await expect(page.getByText('An error occurred while sending your message. Please try again.')).toBeVisible();
});
