/**
 * Unit tests for InsightsDashboard.
 *
 * Gap #17: Dashboard must fetch live /api/stories data and merge with seeds.
 * Gap #22: Scale-up framing section must be present.
 * Equity:  AAPOR disclaimer must be visible before any charts.
 */
import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

// Stub recharts — renders nothing in jsdom (no SVG engine)
jest.mock("recharts", () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
}));

import { InsightsDashboard } from "@/components/InsightsDashboard";

// ---------------------------------------------------------------------------
// Helper: set up fetch mock before each test
// ---------------------------------------------------------------------------
function mockFetch(stories: object[]) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => stories,
  }) as any;
}

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
describe("InsightsDashboard — disclaimer (Equity / G1)", () => {
  beforeEach(() => mockFetch([]));

  it("renders the non-representative sample disclaimer", async () => {
    render(<InsightsDashboard />);
    await waitFor(() =>
      expect(screen.getByText(/non-representative sample/i)).toBeInTheDocument()
    );
  });

  it("mentions opt-in / nonprobability in the disclaimer", async () => {
    render(<InsightsDashboard />);
    await waitFor(() =>
      expect(screen.getByText(/opt-in, nonprobability sample/i)).toBeInTheDocument()
    );
  });
});

// ---------------------------------------------------------------------------
describe("InsightsDashboard — live data fetch (Gap #17)", () => {
  it("calls /api/stories on mount", async () => {
    mockFetch([]);
    render(<InsightsDashboard />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/stories");
    });
  });

  it("shows +N submitted badge when backend returns stories", async () => {
    mockFetch([
      {
        id: "live-1",
        title: "A live story",
        author: "Test User",
        neighborhood: "Jackson Ward",
        lat: 37.5485,
        lng: -77.4365,
        excerpt: "This is a live story excerpt.",
        type: "text",
        theme: "Community Life",
        date: "2026-03-28",
      },
    ]);
    render(<InsightsDashboard />);
    await waitFor(() =>
      expect(screen.getByText(/1 new submission/i)).toBeInTheDocument()
    );
  });

  it("renders gracefully when the backend is unreachable", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network Error")) as any;
    render(<InsightsDashboard />);
    // Should not crash — seed data still shows
    await waitFor(() =>
      expect(screen.getByText(/story insights dashboard/i)).toBeInTheDocument()
    );
  });
});

// ---------------------------------------------------------------------------
describe("InsightsDashboard — scale-up framing (Gap #22)", () => {
  beforeEach(() => mockFetch([]));

  it("renders the 'What Scales with More Stories' section", async () => {
    render(<InsightsDashboard />);
    await waitFor(() =>
      expect(
        screen.getByText(/what scales with more stories/i)
      ).toBeInTheDocument()
    );
  });

  it("mentions ~200 stories as the meaningful threshold", async () => {
    render(<InsightsDashboard />);
    // "200 stories" appears in both the card stat and the pilot description
    await waitFor(() => {
      const matches = screen.getAllByText(/200 stories/i);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("mentions the proposed 4–6 week pilot next step", async () => {
    render(<InsightsDashboard />);
    await waitFor(() =>
      expect(screen.getByText(/4.6 week pilot/i)).toBeInTheDocument()
    );
  });
});

// ---------------------------------------------------------------------------
describe("InsightsDashboard — oral history resources", () => {
  beforeEach(() => mockFetch([]));

  it("links to StoryCorps", async () => {
    render(<InsightsDashboard />);
    await waitFor(() =>
      expect(screen.getByText(/storycorps richmond/i)).toBeInTheDocument()
    );
  });

  it("links to The Valentine", async () => {
    render(<InsightsDashboard />);
    await waitFor(() =>
      expect(screen.getByText(/the valentine/i)).toBeInTheDocument()
    );
  });

  it("links to VCU Libraries", async () => {
    render(<InsightsDashboard />);
    await waitFor(() =>
      expect(screen.getByText(/vcu libraries/i)).toBeInTheDocument()
    );
  });
});
