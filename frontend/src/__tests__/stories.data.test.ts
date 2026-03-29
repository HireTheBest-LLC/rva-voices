/**
 * Unit tests for src/data/stories.ts
 *
 * Validates that seed story data meets the minimum structural requirements
 * needed for the RVA Legacy Map to function correctly.
 */
import { sampleStories, neighborhoods, themes, Story } from "@/data/stories";

describe("sampleStories", () => {
  it("contains at least one story", () => {
    expect(sampleStories.length).toBeGreaterThan(0);
  });

  it("every story has required fields", () => {
    const requiredFields: (keyof Story)[] = [
      "id", "title", "author", "neighborhood",
      "lat", "lng", "excerpt", "type", "theme", "date", "consentGiven",
    ];
    sampleStories.forEach((story) => {
      requiredFields.forEach((field) => {
        expect(story).toHaveProperty(field);
      });
    });
  });

  it("every story has a valid type", () => {
    const validTypes = ["photo", "video", "voice", "text"];
    sampleStories.forEach((story) => {
      expect(validTypes).toContain(story.type);
    });
  });

  it("every story has valid Richmond-area coordinates", () => {
    // Rough bounding box for Greater Richmond, VA
    sampleStories.forEach((story) => {
      expect(story.lat).toBeGreaterThan(37.3);
      expect(story.lat).toBeLessThan(37.8);
      expect(story.lng).toBeGreaterThan(-77.7);
      expect(story.lng).toBeLessThan(-77.2);
    });
  });

  it("every story ID is unique", () => {
    const ids = sampleStories.map((s) => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("all stories with consentGiven=true have the field set", () => {
    sampleStories.forEach((story) => {
      expect(typeof story.consentGiven).toBe("boolean");
    });
  });

  it("featured story has youtubeUrl when type is video", () => {
    const featured = sampleStories.find((s) => s.featured);
    expect(featured).toBeDefined();
    if (featured) {
      expect(featured.type).toBe("video");
      expect(featured.youtubeUrl).toBeDefined();
      expect(featured.youtubeUrl).toMatch(/youtube\.com\/embed\//);
    }
  });

  it("stories with imageUrl use clean Unsplash URLs (no Figma tracking params)", () => {
    sampleStories
      .filter((s) => s.imageUrl)
      .forEach((story) => {
        expect(story.imageUrl).not.toContain("utm_source=figma");
        expect(story.imageUrl).not.toContain("ixid=");
        expect(story.imageUrl).not.toContain("crop=entropy");
      });
  });

  it("photo-type stories have an imageUrl", () => {
    const photoStories = sampleStories.filter((s) => s.type === "photo");
    photoStories.forEach((story) => {
      expect(story.imageUrl).toBeDefined();
    });
  });

  it("stories with sourceAttribution are non-empty strings", () => {
    sampleStories
      .filter((s) => s.sourceAttribution)
      .forEach((story) => {
        expect(typeof story.sourceAttribution).toBe("string");
        expect(story.sourceAttribution!.length).toBeGreaterThan(0);
      });
  });
});

describe("neighborhoods", () => {
  it("contains at least 5 Richmond neighborhoods", () => {
    expect(neighborhoods.length).toBeGreaterThanOrEqual(5);
  });

  it("every neighborhood has a name, lat, lng, and description", () => {
    neighborhoods.forEach((n) => {
      expect(n.name).toBeTruthy();
      expect(typeof n.lat).toBe("number");
      expect(typeof n.lng).toBe("number");
      expect(n.description).toBeTruthy();
    });
  });

  it("every story neighborhood appears in the neighborhoods list", () => {
    const neighborhoodNames = new Set(neighborhoods.map((n) => n.name));
    sampleStories.forEach((story) => {
      expect(neighborhoodNames.has(story.neighborhood)).toBe(true);
    });
  });
});

describe("themes", () => {
  it("contains at least 5 themes", () => {
    expect(themes.length).toBeGreaterThanOrEqual(5);
  });

  it("every story theme appears in the themes list", () => {
    sampleStories.forEach((story) => {
      expect(themes).toContain(story.theme);
    });
  });
});
