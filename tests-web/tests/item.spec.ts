import { test, expect, Page } from '@playwright/test';
import { loadOpenTimelineModule } from '../helpers/module-loader';

test.describe('Item Test', () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
        await loadOpenTimelineModule(page);
    });

    test('Can construct Item', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const item = new OTIO.Item("AnItem");
            return {
                name: item.name,
            };
        });

        expect(testResults.name).toBe("AnItem");
    });

    test('Can set and get source range', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const item = new OTIO.Item("AnItem");
            const empty_range = item.source_range;
            item.source_range = new OTIO.TimeRange(5, 10, 1);

            return {
                empty_range: empty_range,
                source_range_start: item.source_range.start_time.value,
                source_range_duration: item.source_range.duration.value,
                available_image_bounds: item.available_image_bounds(),
            };
        });

        expect(testResults.empty_range).toBeUndefined();
        expect(testResults.source_range_start).toBe(5);
        expect(testResults.source_range_duration).toBe(10);
        expect(testResults.available_image_bounds).toBeUndefined();
    });
});