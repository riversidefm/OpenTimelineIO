import { test, expect, Page } from '@playwright/test';
import { loadOpenTimelineModule } from '../helpers/module-loader';

test.describe('Timeline Test', () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
        await loadOpenTimelineModule(page);
    });

    test('Can construct Timeline', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const timeline = new OTIO.Timeline("test");
            return timeline.name;
        });

        expect(testResults).toBe("test");
    });

    test('Can construct empty Timeline from JSON', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const json = `
            {
                "OTIO_SCHEMA" : "Timeline.2",
                "global_start_time" : null,
                "canvas_size" : null,
                "metadata" : {},
                "name" : "Empty Timeline",
                "tracks" : {
                    "OTIO_SCHEMA" : "Stack.1",
                    "children" : [],
                    "composition_kind" : "Stack",
                    "effects" : [],
                    "enabled" : true,
                    "markers" : [],
                    "metadata" : {},
                    "name" : "tracks",
                    "source_range" : null,
                    "visible" : true,
                    "overlapping" : false
                }
            }`;

            const OTIO = window.OpenTimeline;
            const error = new OTIO.ErrorStatus();
            const timeline = OTIO.timeline_from_json_string(json, error);
            return {
                name: timeline?.name,
            };
        });

        expect(testResults.name).toBe("Empty Timeline");
    });

    test('Can add a track to a timeline', async ({ page }: { page: Page }) => {
        const testResults = await page.evaluate(() => {
            const OTIO = window.OpenTimeline;
            const timeline = new OTIO.Timeline("testTimeline");
            timeline.tracks?.append_child(new OTIO.Track("testAudio", "Audio"));
            timeline.tracks?.append_child(new OTIO.Track("testVideo", "Video"));
            return {
                name: timeline.name,
                audio_tracks: timeline.audio_tracks.size(),
                video_tracks: timeline.video_tracks.size()
            };
        });

        expect(testResults.name).toBe("testTimeline");
        expect(testResults.audio_tracks).toBe(1);
        expect(testResults.video_tracks).toBe(1);
    });
});
