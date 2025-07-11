import { test, expect, Page } from '@playwright/test';
import { loadOpenTimelineModule } from '../helpers/module-loader';

test.describe('MediaReference Tests', () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
        await loadOpenTimelineModule(page);
    });

    test('Can create MediaReference', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const media_reference = new OTIO.MediaReference("MediaReference0");
            return {
                name: media_reference.name,
            };
        });

        expect(testResults.name).toBe("MediaReference0");
    });

    test('Can set timerange', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const media_reference = new OTIO.MediaReference("MediaReference0");
            media_reference.available_range = new OTIO.TimeRange(0, 100, 1);
            return {
                av_start_time: media_reference.available_range.start_time.to_time_string(),
                av_duration: media_reference.available_range.duration.to_time_string(),
            };
        });

        expect(testResults.av_start_time).toBe("00:00:00.0");
        expect(testResults.av_duration).toBe("00:01:40.0");
    });

    test('Can set available_image_bounds', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const media_reference = new OTIO.MediaReference("MediaReference0");
            media_reference.available_image_bounds = new OTIO.Box2d(new OTIO.V2d(0, 1), new OTIO.V2d(100, 102));
            return {
                av_image_bounds_min_x: media_reference.available_image_bounds.min.x,
                av_image_bounds_min_y: media_reference.available_image_bounds.min.y,
                av_image_bounds_max_x: media_reference.available_image_bounds.max.x,
                av_image_bounds_max_y: media_reference.available_image_bounds.max.y,
            };
        });

        expect(testResults.av_image_bounds_min_x).toBe(0);
        expect(testResults.av_image_bounds_min_y).toBe(1);
        expect(testResults.av_image_bounds_max_x).toBe(100);
        expect(testResults.av_image_bounds_max_y).toBe(102);
    });
});