import { describe, it, expect } from "vitest";
import { getEffectiveScope, setRoleScopes } from "./scopes";

describe("scope inheritance", () => {
  it("city overrides global when false", () => {
    setRoleScopes("Finance", "All", { "events.read": true, "payouts.view": true });
    setRoleScopes("Finance", "Kampala", { "events.read": false });
    const eff = getEffectiveScope("Finance", "Kampala");
    expect(eff["events.read"]).toBe(false);
    expect(eff["payouts.view"]).toBe(true);
  });

  it("returns global when city is All", () => {
    setRoleScopes("Support", "All", { "tickets.read": true });
    const eff = getEffectiveScope("Support", "All");
    expect(eff["tickets.read"]).toBe(true);
  });
});
