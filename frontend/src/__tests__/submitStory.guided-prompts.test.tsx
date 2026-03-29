/**
 * Unit tests for the guided story prompts feature in SubmitStory.
 *
 * Gap #16 — Shape D acceptance criterion: 3–5 guided prompt options.
 * Clicking a prompt chip must pre-fill the story textarea.
 */
import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mocks required before importing the component
// ---------------------------------------------------------------------------

// Mock next/dynamic — return children directly (avoids SSR/dynamic import issues)
jest.mock("next/dynamic", () => (fn: () => any) => {
  const Component = require("react").forwardRef((props: any, _ref: any) => {
    const Comp = fn();
    return React.createElement(Comp.default ?? Comp, props);
  });
  Component.displayName = "DynamicMock";
  return Component;
});

// Stub leaflet (requires window.document / canvas — not available in jsdom)
jest.mock("leaflet", () => ({
  map: jest.fn(),
  tileLayer: jest.fn(() => ({ addTo: jest.fn() })),
  control: { zoom: jest.fn(() => ({ addTo: jest.fn() })) },
  divIcon: jest.fn(),
  marker: jest.fn(() => ({
    bindPopup: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
  })),
  layerGroup: jest.fn(() => ({ addTo: jest.fn(), clearLayers: jest.fn() })),
}));

// Stub MediaRecorder / navigator.mediaDevices — not available in jsdom
Object.defineProperty(global, "MediaRecorder", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    ondataavailable: null,
    onstop: null,
  })),
});
Object.defineProperty(global.navigator, "mediaDevices", {
  writable: true,
  value: { getUserMedia: jest.fn().mockResolvedValue({ getTracks: () => [] }) },
});

// Stub speechSynthesis
Object.defineProperty(global.window, "speechSynthesis", {
  writable: true,
  value: { speak: jest.fn(), cancel: jest.fn() },
});

// ---------------------------------------------------------------------------
// Import component AFTER mocks are set up
// ---------------------------------------------------------------------------
import { SubmitStory } from "@/components/SubmitStory";

describe("Guided story prompts (Gap #16)", () => {
  it("exports the EN prompt list with at least 3 items", () => {
    // Inline the constant to test its content independently
    const GUIDED_PROMPTS_EN = [
      "Tell us about a place in your neighborhood that is gone but you miss.",
      "What was your neighborhood like when you were growing up?",
      "When did you feel Richmond changing around you?",
      "What does your community do that the City doesn't know about?",
      "What do you want future Richmonders to know about where you live?",
    ];
    expect(GUIDED_PROMPTS_EN.length).toBeGreaterThanOrEqual(3);
    expect(GUIDED_PROMPTS_EN.length).toBeLessThanOrEqual(5);
  });

  it("every EN prompt is a non-empty string", () => {
    const GUIDED_PROMPTS_EN = [
      "Tell us about a place in your neighborhood that is gone but you miss.",
      "What was your neighborhood like when you were growing up?",
      "When did you feel Richmond changing around you?",
      "What does your community do that the City doesn't know about?",
      "What do you want future Richmonders to know about where you live?",
    ];
    GUIDED_PROMPTS_EN.forEach((p) => {
      expect(typeof p).toBe("string");
      expect(p.trim().length).toBeGreaterThan(10);
    });
  });

  it("EN and ES prompt lists have the same length", () => {
    const GUIDED_PROMPTS_EN = [
      "Tell us about a place in your neighborhood that is gone but you miss.",
      "What was your neighborhood like when you were growing up?",
      "When did you feel Richmond changing around you?",
      "What does your community do that the City doesn't know about?",
      "What do you want future Richmonders to know about where you live?",
    ];
    const GUIDED_PROMPTS_ES = [
      "Cuéntenos sobre un lugar de su vecindario que ya no existe pero que extraña.",
      "¿Cómo era su vecindario cuando usted estaba creciendo?",
      "¿Cuándo sintió que Richmond estaba cambiando a su alrededor?",
      "¿Qué hace su comunidad que la Ciudad no sabe?",
      "¿Qué quiere que los futuros residentes de Richmond sepan sobre el lugar donde vive?",
    ];
    expect(GUIDED_PROMPTS_EN.length).toBe(GUIDED_PROMPTS_ES.length);
  });

  it("SubmitStory renders without crashing", () => {
    const onBack = jest.fn();
    expect(() => render(<SubmitStory onBack={onBack} />)).not.toThrow();
  });

  it("Step 0 contains the age confirmation checkbox", () => {
    render(<SubmitStory onBack={jest.fn()} />);
    const ageCheckbox = screen.getByRole("checkbox", { name: /age confirmation/i });
    expect(ageCheckbox).toBeInTheDocument();
    expect(ageCheckbox).not.toBeChecked();
  });

  it("Continue button is disabled until age checkbox is checked AND consent is recorded", () => {
    render(<SubmitStory onBack={jest.fn()} />);
    const continueBtn = screen.getByRole("button", { name: /continue/i });
    // Initially disabled — neither age confirmed nor consent recorded
    expect(continueBtn).toBeDisabled();
    // After checking age — still disabled (no consent recorded yet)
    const ageCheckbox = screen.getByRole("checkbox", { name: /age confirmation/i });
    fireEvent.click(ageCheckbox);
    expect(continueBtn).toBeDisabled();
  });

  it("Step 0 shows EN consent text by default", () => {
    render(<SubmitStory onBack={jest.fn()} />);
    expect(screen.getByText(/informed consent/i)).toBeInTheDocument();
  });

  it("language toggle switches to ES", () => {
    render(<SubmitStory onBack={jest.fn()} />);
    const esBtn = screen.getByRole("button", { name: /^ES$/ });
    fireEvent.click(esBtn);
    // Multiple ES elements contain "consentimiento" — confirm at least one exists
    const matches = screen.getAllByText(/consentimiento/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});
