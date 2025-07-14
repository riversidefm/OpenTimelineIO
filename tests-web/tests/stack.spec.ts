import { test, expect, Page } from '@playwright/test';
import { loadOpenTimelineModule } from '../helpers/module-loader';

test.describe('Stack Tests', () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
        await loadOpenTimelineModule(page);
    });

    test('Can construct Stack', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const stack = new OTIO.Stack("Stack0");
            return {
                name: stack.name,
            };
        });

        expect(testResults.name).toBe("Stack0");
    });

    test('range_of_child_at_index(): Errors with bad index', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const stack = new OTIO.Stack("Stack0");
            const error_status = new OTIO.ErrorStatus();
            const range = stack.range_of_child_at_index(1, error_status);
            return {
                outcome: error_status.outcome === OTIO.ErrorStatusOutcome.ILLEGAL_INDEX,
                details: error_status.details,
            };
        });

        expect(testResults.outcome).toBe(true);
        expect(testResults.details).toBe("illegal index");
    });

    test('trimmed_range_of_child_at_index(): Errors with bad index', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const stack = new OTIO.Stack("Stack0");
            const error_status = new OTIO.ErrorStatus();
            const range = stack.trimmed_range_of_child_at_index(1, error_status);
            return {
                outcome: error_status.outcome === OTIO.ErrorStatusOutcome.ILLEGAL_INDEX,
                details: error_status.details,
            };
        });

        expect(testResults.outcome).toBe(true);
        expect(testResults.details).toBe("illegal index");
    });

    test('available_range(): Returns empty time range for empty stack', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const stack = new OTIO.Stack("Stack0");
            return {
                name: stack.name,
                range: stack.available_range?.start_time.to_time_string(),
                duration: stack.available_range?.duration.to_time_string(),
            };
        });

        expect(testResults.name).toBe("Stack0");
        expect(testResults.range).toBe("00:00:00.0");
        expect(testResults.duration).toBe("00:00:00.0");
    });

});