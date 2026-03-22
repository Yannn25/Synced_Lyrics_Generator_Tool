import "@testing-library/jest-dom";
import { vi } from "vitest";

Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

Object.defineProperty(window.HTMLMediaElement.prototype, "pause", {
  configurable: true,
  value: vi.fn(),
});

Object.defineProperty(window.HTMLMediaElement.prototype, "load", {
  configurable: true,
  value: vi.fn(),
});

global.URL.createObjectURL = vi.fn(() => "blob:mock-audio");
global.URL.revokeObjectURL = vi.fn();

Object.defineProperty(window.HTMLAnchorElement.prototype, "click", {
  configurable: true,
  value: vi.fn(),
});

class MockBlob {
  parts: unknown[];

  constructor(parts: unknown[]) {
    this.parts = parts;
  }

  async text() {
    return this.parts.map((part) => String(part)).join("");
  }
}

// Blob minimal lisible dans les assertions
(globalThis as unknown as { Blob: typeof MockBlob }).Blob = MockBlob;


