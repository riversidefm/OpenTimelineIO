import { test, expect, Page } from '@playwright/test';
import { loadOpenTimelineModule } from '../helpers/module-loader';

test.describe('Time Types Test', () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
        await loadOpenTimelineModule(page);
    });

    test('Can construct RationalTime', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const time1 = new OTIO.RationalTime(24, 25);
            const time2 = new OTIO.RationalTime(12, 25);
            const time3 = OTIO.RationalTime.from_seconds(1.5);
            const time4 = OTIO.RationalTime.from_seconds_rate(1.5, 25);

            return {
                time1Value: time1.value,
                time1Rate: time1.rate,
                time2Value: time2.value,
                time2Rate: time2.rate,
                time3Value: time3.value,
                time3Rate: time3.rate,
                time4Value: time4.value,
                time4Rate: time4.rate,
            };
        });

        expect(testResults.time1Value).toBe(24);
        expect(testResults.time1Rate).toBe(25);
        expect(testResults.time2Value).toBe(12);
        expect(testResults.time2Rate).toBe(25);
        expect(testResults.time3Value).toBe(1.5);
        expect(testResults.time3Rate).toBe(1);
        expect(testResults.time4Value).toBe(1.5 * 25);
        expect(testResults.time4Rate).toBe(25);
    });

    test('Can construct TimeRange', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const timeRange1 = new OTIO.TimeRange(new OTIO.RationalTime(1, 25));
            const timeRange2 = new OTIO.TimeRange(new OTIO.RationalTime(2, 25), new OTIO.RationalTime(3, 25));
            const timeRange3 = new OTIO.TimeRange(0, 10, 25);

            return {
                timeRange1Start: timeRange1.start_time.value,
                timeRange1Duration: timeRange1.duration.value,
                timeRange1End: timeRange1.end_time_exclusive.value,
                timeRange2Start: timeRange2.start_time.value,
                timeRange2Duration: timeRange2.duration.value,
                timeRange2End: timeRange2.end_time_exclusive.value,
                timeRange3Start: timeRange3.start_time.value,
                timeRange3Duration: timeRange3.duration.value,
                timeRange3End: timeRange3.end_time_exclusive.value,
            };
        });

        expect(testResults.timeRange1Start).toBe(1);
        expect(testResults.timeRange1Duration).toBe(0);
        expect(testResults.timeRange1End).toBe(1);
        expect(testResults.timeRange2Start).toBe(2);
        expect(testResults.timeRange2Duration).toBe(3);
        expect(testResults.timeRange2End).toBe(5);
        expect(testResults.timeRange3Start).toBe(0);
        expect(testResults.timeRange3Duration).toBe(10);
        expect(testResults.timeRange3End).toBe(10);
    });
});
