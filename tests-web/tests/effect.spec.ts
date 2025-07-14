import { test, expect, Page } from '@playwright/test';
import { loadOpenTimelineModule } from '../helpers/module-loader';

test.describe('Effect Test', () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
        await loadOpenTimelineModule(page);
    });

    test('Can construct Effect', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const effect = new OTIO.Effect("Effect0", "Blur", true);
            return {
                name: effect.name,
                effect_name: effect.effect_name,
                enabled: effect.enabled,
            };
        });

        expect(testResults.name).toBe("Effect0");
        expect(testResults.effect_name).toBe("Blur");
        expect(testResults.enabled).toBe(true);
    });

    test('Can set and get effect_name', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const effect = new OTIO.Effect("Effect0", "Blur", true);
            effect.effect_name = "ColorCorrection";
            return {
                effect_name: effect.effect_name,
            };
        });

        expect(testResults.effect_name).toBe("ColorCorrection");
    });

    test('Can set and get enabled', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const effect = new OTIO.Effect("Effect0", "Blur", true);
            effect.enabled = false;
            return {
                enabled: effect.enabled,
            };
        });

        expect(testResults.enabled).toBe(false);
    });

    test('Can add effects to an item', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const item = new OTIO.Item("Item0");
            const effect = new OTIO.Effect("Effect0", "Blur", true);
            item.effects().push_back(effect);
            return {
                effects_size: item.effects().size(),
                effect0_name: item.effects().get(0)?.name,
            };
        });

        expect(testResults.effects_size).toBe(1);
        expect(testResults.effect0_name).toBe("Effect0");
    });
});