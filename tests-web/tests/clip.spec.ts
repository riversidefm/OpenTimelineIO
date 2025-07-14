import { test, expect, Page } from '@playwright/test';
import { loadOpenTimelineModule } from '../helpers/module-loader';

test.describe('Clip Tests', () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
        await loadOpenTimelineModule(page);
    });

    test('Can construct Clip', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const clip = new OTIO.Clip("Clip0");
            return {
                name: clip.name,
            };
        });

        expect(testResults.name).toBe("Clip0");
    });

    test('Can set and get media_reference', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const clip = new OTIO.Clip("Clip0");
            const media_reference = new OTIO.MediaReference("MediaReference0");
            clip.media_reference = media_reference;

            return {
                media_reference: clip.media_reference.name,
                active_media_reference_key: clip.active_media_reference_key
            };
        });

        expect(testResults.media_reference).toBe("MediaReference0");
        expect(testResults.active_media_reference_key).toBe("DEFAULT_MEDIA");
    });

    test('Clip inherits available_range from MediaReference', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const clip = new OTIO.Clip("Clip0");
            const media_reference = new OTIO.MediaReference("MediaReference0");
            media_reference.available_range = new OTIO.TimeRange(0, 100, 1);
            clip.media_reference = media_reference;
            return {
                av_start_time: clip.available_range?.start_time.to_time_string(),
                av_duration: clip.available_range?.duration.to_time_string(),
            };
        });

        expect(testResults.av_start_time).toBe("00:00:00.0");
        expect(testResults.av_duration).toBe("00:01:40.0");
    });

    test('Clip inherits available_image_bounds from MediaReference', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const clip = new OTIO.Clip("Clip0");
            const media_reference = new OTIO.MediaReference("MediaReference0");
            media_reference.available_image_bounds = new OTIO.Box2d(new OTIO.V2d(0, 1), new OTIO.V2d(100, 102));
            clip.media_reference = media_reference;
            return {
                av_image_bounds_min_x: clip.available_image_bounds?.min.x,
                av_image_bounds_min_y: clip.available_image_bounds?.min.y,
                av_image_bounds_max_x: clip.available_image_bounds?.max.x,
                av_image_bounds_max_y: clip.available_image_bounds?.max.y,
            };
        });

        expect(testResults.av_image_bounds_min_x).toBe(0);
        expect(testResults.av_image_bounds_min_y).toBe(1);
        expect(testResults.av_image_bounds_max_x).toBe(100);
        expect(testResults.av_image_bounds_max_y).toBe(102);
    });
});