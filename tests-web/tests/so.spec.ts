import { test, expect, Page } from '@playwright/test';
import { loadOpenTimelineModule } from '../helpers/module-loader';

test.describe('SerializableObjectTest', () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
        await loadOpenTimelineModule(page);
    });

    test('Handles bad JSON', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const error = new OTIO.ErrorStatus();
            const so = OTIO.SerializableObject.from_json_string("bad json", error);
            return {
                error_outcome: error.outcome === OTIO.ErrorStatusOutcome.JSON_PARSE_ERROR,
                error_details: error.details,
            };
        });

        expect(testResults.error_outcome).toBe(true);
        expect(testResults.error_details).toContain("JSON parse error");
    });
});