import { test, expect, Page } from '@playwright/test';
import { loadOpenTimelineModule } from '../helpers/module-loader';

test.describe('Composition Test', () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
        await loadOpenTimelineModule(page);
    });

    test('Can construct Composition', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            return {
                name: composition.name,
            };
        });

        expect(testResults.name).toBe("Composition0");
    });

    test('Can append child to Composition', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const child = new OTIO.Item("Item0");
            const error_status = new OTIO.ErrorStatus();
            composition.append_child(child, error_status);

            return {
                name: composition.name,
                children: composition.children.size(),
            };
        });

        expect(testResults.name).toBe("Composition0");
        expect(testResults.children).toBe(1);
    });

    test('Can clear children from Composition', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const child = new OTIO.Item("Item0");
            const error_status = new OTIO.ErrorStatus();
            composition.append_child(child, error_status);
            composition.clear_children();
            return {
                name: composition.name,
                children: composition.children.size(),
            };
        });

        expect(testResults.name).toBe("Composition0");
        expect(testResults.children).toBe(0);
    });

    test('Can set children from Composition', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");

            const children = new OTIO.VectorComposable();
            children.push_back(new OTIO.Item("Item0"));
            children.push_back(new OTIO.Item("Item1"));
            const error_status = new OTIO.ErrorStatus();
            composition.set_children(children, error_status);
            return {
                name: composition.name,
                children: composition.children.size(),
            };
        });

        expect(testResults.name).toBe("Composition0");
        expect(testResults.children).toBe(2);
    });

    test('Can insert child into Composition', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const error_status = new OTIO.ErrorStatus();


            // Should insert item1 before item0
            composition.append_child(new OTIO.Item("Item0"), error_status);
            composition.insert_child(0, new OTIO.Item("Item1"), error_status);
            return {
                children: composition.children.size(),
                first: composition.children.get(0)?.name,
                second: composition.children.get(1)?.name,
            };
        });

        expect(testResults.children).toBe(2);
        expect(testResults.first).toBe("Item1");
        expect(testResults.second).toBe("Item0");
    });

    test('Can remove child from Composition', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const error_status = new OTIO.ErrorStatus();
            composition.append_child(new OTIO.Item("Item0"), error_status);
            composition.append_child(new OTIO.Item("Item1"), error_status);
            composition.remove_child(0, error_status);
            return {
                children: composition.children.size(),
                first: composition.children.get(0)?.name,
            };
        });

        expect(testResults.children).toBe(1);
        expect(testResults.first).toBe("Item1");
    });

    test('Can set child at index in Composition', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const error_status = new OTIO.ErrorStatus();
            composition.append_child(new OTIO.Item("Item0"), error_status);
            composition.append_child(new OTIO.Item("Item1"), error_status);
            composition.set_child(0, new OTIO.Item("Item2"), error_status);
            return {
                children: composition.children.size(),
                first: composition.children.get(0)?.name,
                second: composition.children.get(1)?.name,
            };
        });

        expect(testResults.children).toBe(2);
        expect(testResults.first).toBe("Item2");
        expect(testResults.second).toBe("Item1");
    });

    test('Can get index of child in Composition', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const error_status = new OTIO.ErrorStatus();
            const item0 = new OTIO.Item("Item0");
            composition.append_child(item0, error_status);
            composition.append_child(new OTIO.Item("Item1"), error_status);
            return {
                index: composition.index_of_child(item0, error_status),
            };
        });

        expect(testResults.index).toBe(0);
    });

    test('Can\'t get index of child in Composition that does not exist', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const error_status = new OTIO.ErrorStatus();
            return {
                index: composition.index_of_child(new OTIO.Item("Item0"), error_status),
                error_status: error_status.outcome == OTIO.ErrorStatusOutcome.NOT_A_CHILD_OF,
                error_details: error_status.details,
            };
        });

        expect(testResults.index).toBe(-1);
        expect(testResults.error_status).toBe(true);
        expect(testResults.error_details).toBe("item is not a child of specified object");
    });

    test('Can check if composition is parent of child', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const error_status = new OTIO.ErrorStatus();
            const child = new OTIO.Item("Item0");
            composition.append_child(child, error_status);
            return {
                is_parent: composition.is_parent_of(child),
            };
        });

        expect(testResults.is_parent).toBe(true);
    });

    test('Can check if composition is not parent of child', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const child = new OTIO.Item("Item0");
            return {
                is_parent: composition.is_parent_of(child),
            };
        });

        expect(testResults.is_parent).toBe(false);
    });

    test('Can get handles of child in Composition', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const error_status = new OTIO.ErrorStatus();
            const child = new OTIO.Item("Item0");
            composition.append_child(child, error_status);
            const handles = composition.handles_of_child(child, error_status);
            return {
                in: handles.in,
                out: handles.out,
                error_status: error_status.outcome === OTIO.ErrorStatusOutcome.OK,
            };
        });

        expect(testResults.in).toBe(undefined);
        expect(testResults.out).toBe(undefined);
        expect(testResults.error_status).toBe(true);
    });

    test('range_of_child_at_index not implemented', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const error_status = new OTIO.ErrorStatus();
            const child = new OTIO.Item("Item0");
            composition.append_child(child, error_status);
            const range = composition.range_of_child_at_index(0, error_status);
            return {
                error_status: error_status.outcome === OTIO.ErrorStatusOutcome.NOT_IMPLEMENTED,
            };
        });

        expect(testResults.error_status).toBe(true);
    });

    test('trimmed_range_of_child_at_index not implemented', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const error_status = new OTIO.ErrorStatus();
            const child = new OTIO.Item("Item0");
            composition.append_child(child, error_status);
            const range = composition.trimmed_range_of_child_at_index(0, error_status);
            return {
                error_status: error_status.outcome === OTIO.ErrorStatusOutcome.NOT_IMPLEMENTED,
            };
        });

        expect(testResults.error_status).toBe(true);
    });

    test('range_of_child not implemented', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const child = new OTIO.Clip("Clip0");
            const error_status = new OTIO.ErrorStatus();
            composition.append_child(child, error_status);
            const range = composition.range_of_child(child, error_status);
            return {
                error_status: error_status.outcome === OTIO.ErrorStatusOutcome.NOT_IMPLEMENTED,
            };
        });

        expect(testResults.error_status).toBe(true);
    });

    test('trimmed_range_of_child not implemented', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const error_status = new OTIO.ErrorStatus();
            const child = new OTIO.Item("Item0");
            composition.append_child(child, error_status);
            const range = composition.trimmed_range_of_child(child, error_status);
            return {
                error_status: error_status.outcome === OTIO.ErrorStatusOutcome.NOT_IMPLEMENTED,
            };
        });

        expect(testResults.error_status).toBe(true);
    });

    test('trim_child_range not implemented', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            composition.source_range = new OTIO.TimeRange(0, 10, 1);
            const child = new OTIO.Item("Item0");
            child.source_range = new OTIO.TimeRange(0, 10, 1);
            const error_status = new OTIO.ErrorStatus();
            composition.append_child(child, error_status);
            const range = composition.trim_child_range(new OTIO.TimeRange(3, 4, 1));

            return {
                start: range?.start_time.value,
                duration: range?.duration.value,
            };
        });

        expect(testResults.start).toBe(3);
        expect(testResults.duration).toBe(4);
    });

    test('has_child when child is in composition', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const child = new OTIO.Item("Item0");
            const error_status = new OTIO.ErrorStatus();
            composition.append_child(child, error_status);
            return {
                has_child: composition.has_child(child),
            };
        });

        expect(testResults.has_child).toBe(true);
    });

    test('has_child when child is not in composition', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            return {
                has_child: composition.has_child(new OTIO.Item("Item0")),
            };
        });

        expect(testResults.has_child).toBe(false);
    });

    test('has_clips when composition has clips', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const clip = new OTIO.Clip("Clip0");
            const error_status = new OTIO.ErrorStatus();
            composition.append_child(clip, error_status);
            return {
                has_clips: composition.has_clips(),
            };
        });

        expect(testResults.has_clips).toBe(true);
    });

    test('has_clips when composition has no clips', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            return {
                has_clips: composition.has_clips(),
            };
        });

        expect(testResults.has_clips).toBe(false);
    });

    test('child_at_time not implemented', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const error_status = new OTIO.ErrorStatus();
            const child = new OTIO.Clip("Item0");
            child.source_range = new OTIO.TimeRange(1, 10, 1);
            composition.append_child(child, error_status);
            const found = composition.child_at_time(new OTIO.RationalTime(0, 1), error_status, false);
            return {
                error_status: error_status.outcome === OTIO.ErrorStatusOutcome.NOT_IMPLEMENTED,
            };
        });
        expect(testResults.error_status).toBe(true);
    });

    test('children_in_range not implemented', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const composition = new OTIO.Composition("Composition0");
            const error_status = new OTIO.ErrorStatus();
            const range = composition.children_in_range(new OTIO.TimeRange(0, 10, 1), error_status);
            return {
                error_status: error_status.outcome === OTIO.ErrorStatusOutcome.NOT_IMPLEMENTED,
            };
        });

        expect(testResults.error_status).toBe(true);
    });
});