import { describe, it, expect } from "vitest";
import { calcRowsForHeight } from "./utils";

describe("rows per page", () => {
  it("is nondecreasing with height", () => {
    const r1 = calcRowsForHeight(640);
    const r2 = calcRowsForHeight(900);
    expect(r2).toBeGreaterThanOrEqual(r1);
  });

  it("caps at 24 for large monitors", () => {
    const r = calcRowsForHeight(2000);
    expect(r).toBe(24);
  });
});
