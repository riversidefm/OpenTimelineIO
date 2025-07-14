import { test, expect, Page } from '@playwright/test';
import { loadOpenTimelineModule } from '../helpers/module-loader';


test.describe('AnyDictionary Tests', () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
        await loadOpenTimelineModule(page);
    });

    // Currently no way to construct an AnyDictionary directly, so we use
    // SerializableObjectWithMetadata to test the AnyDictionaryProxy.

    test('Can set and get string value', async ({ page }: { page: Page }) => {
        const result = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const SO = new OTIO.SerializableObjectWithMetadata("dummy");
            const dict = SO.metadata();
            dict.set_string("foo", "bar");

            // Because the proxy is constructed using the internal mutation stamp
            // of the AnyDictionary type, modifying the proxy will modify the
            // dictionary inside the SerializableObjectWithMetadata.

            return SO.metadata().get_string("foo");
        });
        expect(result).toBe("bar");
    });

    test('Can set and get boolean value', async ({ page }: { page: Page }) => {
        const result = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const SO = new OTIO.SerializableObjectWithMetadata("dummy");
            const dict = SO.metadata();
            dict.set_bool("foo", true);

            return SO.metadata().get_bool("foo");
        });
        expect(result).toBe(true);
    });

    test('Can check if key exists with has_key', async ({ page }: { page: Page }) => {
        const result = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const SO = new OTIO.SerializableObjectWithMetadata("dummy");
            const dict = SO.metadata();
            dict.set_string("foo", "bar");
            return {
                hasFoo: dict.has_key("foo"),
                hasBar: dict.has_key("bar"),
            };
        });
        expect(result.hasFoo).toBe(true);
        expect(result.hasBar).toBe(false);
    });

    test('get_string throws error for missing key', async ({ page }: { page: Page }) => {
        const result = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const SO = new OTIO.SerializableObjectWithMetadata("dummy");
            const dict = SO.metadata();
            var error = "Missing error"
            try {
                dict.get_string("missing");
            } catch (e) {
                error = OTIO.getExceptionMessage(e).toString()
            }
            return error;
        });
        expect(result).toContain("key not found");
    });


    test('bad cast throws error', async ({ page }: { page: Page }) => {
        const result = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const SO = new OTIO.SerializableObjectWithMetadata("dummy");
            const dict = SO.metadata();
            dict.set_string("foo", "bar");
            try {
                const badCast = dict.get_bool("foo") as number;
                return "no error:"
            } catch (e) {
                return OTIO.getExceptionMessage(e).toString();
            }
        });
        expect(result).toContain("bad any cast");
    });

    test('Can set and get number value', async ({ page }: { page: Page }) => {
        const result = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const SO = new OTIO.SerializableObjectWithMetadata("dummy");
            const dict = SO.metadata();
            dict.set_number("foo", 1.23);
            return dict.get_number("foo");
        });
        expect(result).toBe(1.23);
    });

    test('Can set and get integer value', async ({ page }: { page: Page }) => {
        const result = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const SO = new OTIO.SerializableObjectWithMetadata("dummy");
            const dict = SO.metadata();
            dict.set_integer("foo", 123n);
            return dict.get_integer("foo");
        });
        expect(result).toBe(123n);
    });

    test('Dictionary can be serialized', async ({ page }: { page: Page }) => {
        const result = await page.evaluate(() => {
            const OTIO = (window as any).OpenTimeline;
            const SO = new OTIO.SerializableObjectWithMetadata("dummy");
            const dict = SO.metadata();
            dict.set_string("aString", "bar");
            dict.set_bool("aBool", true);
            dict.set_number("aNumber", 1.23);
            dict.set_integer("anInteger", 123n);
            const error = new OTIO.ErrorStatus();
            const serialized = SO.to_json_string(error);
            return serialized;
        });

        const expected = `{
    "OTIO_SCHEMA": "SerializableObjectWithMetadata.1",
    "metadata": {
        "aBool": true,
        "aNumber": 1.23,
        "aString": "bar",
        "anInteger": 123
    },
    "name": "dummy"
}`
        expect(result).toBe(expected);
    });
});
