import { test, expect, Page } from '@playwright/test';
import { loadOpenTimelineModule } from '../helpers/module-loader';

test.describe('SerializableObjectWithMetadata Test', () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
        await loadOpenTimelineModule(page);
    });

    test('Can construct SerializableObjectWithMetadata', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const so = new OTIO.SerializableObjectWithMetadata("SomeName");
            return {
                name: so.name,
            };
        });

        expect(testResults.name).toBe("SomeName");
    });

    test('Can set and get metadata', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const so = new OTIO.SerializableObjectWithMetadata("ANewObject");

            // Manipulate the metadata
            const metadata = so.metadata();

            metadata.set_string("SomeKey", "SomeValue");
            metadata.set_bool("SomeBool", true);

            // Retrieve the metadata again, to make sure it was updated
            const metadata2 = so.metadata();

            return {
                theString: metadata2.get_string("SomeKey"),
                theBool: metadata2.get_bool("SomeBool"),
                badKey: metadata2.has_key("BadKey"),
                json: so.to_json_string()
            };
        });

        expect(testResults.theString).toBe("SomeValue");
        expect(testResults.theBool).toBe(true);
        expect(testResults.badKey).toBe(false);
        expect(testResults.json).toContain("\"SomeKey\": \"SomeValue\"");
        expect(testResults.json).toContain("\"SomeBool\": true");
    });
});
