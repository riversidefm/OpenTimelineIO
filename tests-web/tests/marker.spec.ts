import { test, expect, Page } from '@playwright/test';
import { loadOpenTimelineModule } from '../helpers/module-loader';

test.describe('Marker Test', () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
        await loadOpenTimelineModule(page);
    });

    test('Can construct Marker', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const marker = new OTIO.Marker("Marker0", "green", "A green comment");
            return {
                name: marker.name,
                color: marker.color,
                comment: marker.comment,
            };
        });

        expect(testResults.name).toBe("Marker0");
        expect(testResults.color).toBe("green");
        expect(testResults.comment).toBe("A green comment");
    });

    test('Can set and get marker color', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const marker = new OTIO.Marker("Marker0", "green", "A green comment");
            marker.color = "red";
            return {
                color: marker.color,
            };
        });

        expect(testResults.color).toBe("red");
    });

    test('Can set and get marker comment', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const marker = new OTIO.Marker("Marker0", "green", "A green comment");
            marker.comment = "A red comment";
            return {
                comment: marker.comment,
            };
        });

        expect(testResults.comment).toBe("A red comment");
    });

    test('Can set and get marker range', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const marker = new OTIO.Marker("Marker0", "green", "A green comment");
            marker.range = new OTIO.TimeRange(10, 20, 1);
            return {
                range_start: marker.range.start_time.value,
                range_duration: marker.range.duration.value,
            };
        });

        expect(testResults.range_start).toBe(10);
        expect(testResults.range_duration).toBe(20);
    });

    test('Can access markers vector in item', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const item = new OTIO.Item("AnItem");
            return {
                markers_size: item.markers().size(),
            };
        });

        expect(testResults.markers_size).toBe(0);
    });

    test('Can add markers to an item', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const item = new OTIO.Item("AnItem");
            const marker0 = new OTIO.Marker("Marker0", "green", "A green comment");
            const marker1 = new OTIO.Marker("Marker1", "red", "A red comment");

            marker0.marked_range = new OTIO.TimeRange(10, 20, 1);
            marker1.marked_range = new OTIO.TimeRange(30, 40, 1);

            item.markers().push_back(marker0);
            item.markers().push_back(marker1);

            const error = new OTIO.ErrorStatus
            const reconstructedItem = OTIO.SerializableObject.from_json_string(item.to_json_string(), error);

            return {
                markers_size: item.markers().size(),
                marker0_name: item.markers().get(0).name,
                marker1_name: item.markers().get(1).name,
                reconstructed_markers_size: reconstructedItem.markers().size(),
                reconstructed_marker0_name: reconstructedItem.markers().get(0).name,
                reconstructed_marker1_name: reconstructedItem.markers().get(1).name,
            };
        });

        expect(testResults.markers_size).toBe(2);
        expect(testResults.marker0_name).toBe("Marker0");
        expect(testResults.marker1_name).toBe("Marker1");
        expect(testResults.reconstructed_markers_size).toBe(2);
        expect(testResults.reconstructed_marker0_name).toBe("Marker0");
        expect(testResults.reconstructed_marker1_name).toBe("Marker1");
    });

});
