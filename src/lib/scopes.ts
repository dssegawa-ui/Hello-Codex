export type ScopeMap = Record<string, boolean>;
export type CityScopes = Record<string, ScopeMap>; // city -> permission -> bool
export type RoleScopes = Record<string, CityScopes>; // role -> city -> permission -> bool

declare global {
  interface Window {
    __choptopCustomScopes?: RoleScopes;
  }
}

const G: any = (typeof window !== "undefined" ? window : globalThis);
G.__choptopCustomScopes = G.__choptopCustomScopes || {} as RoleScopes;

export function getEffectiveScope(roleKey: string, cityKey: string): ScopeMap {
  const r = G.__choptopCustomScopes[roleKey] || {};
  const g = r["All"] || {};
  if (cityKey === "All") return { ...g };
  const c = r[cityKey] || {};
  return { ...g, ...c }; // city overrides global, including explicit false
}

export function setRoleScopes(roleKey: string, cityKey: string, scopes: ScopeMap){
  const r = G.__choptopCustomScopes[roleKey] || (G.__choptopCustomScopes[roleKey] = {});
  r[cityKey] = { ...(r[cityKey]||{}), ...scopes };
}
