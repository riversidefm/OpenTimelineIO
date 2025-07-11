import { test, expect, Page } from '@playwright/test';
import { loadOpenTimelineModule } from '../helpers/module-loader';

test.describe('Composable Test', () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
        await loadOpenTimelineModule(page);
    });

    test('Can construct Composable', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const composable = new OTIO.Composable("Composable0");
            return {
                name: composable.name,
            };
        });

        expect(testResults.name).toBe("Composable0");
    });

    test('available_image_bounds(): Returns undefined for empty composable', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const composable = new OTIO.Composable("Composable0");
            return {
                bounds: composable.available_image_bounds,
            };
        });

        expect(testResults.bounds).toBe(undefined);
    });

    test('duration(): Returns undefined for empty composable', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const composable = new OTIO.Composable("Composable0");
            return {
                duration: composable.duration,
            };
        });

        expect(testResults.duration).toBe(undefined);
    });
});