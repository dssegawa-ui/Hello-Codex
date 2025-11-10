import * as React from "react";
import { Panel, DataTable, useRowsPerPage } from "../lib/utils";
import { ColumnDef } from "../lib/types";
import { getEffectiveScope, setRoleScopes } from "../lib/scopes";

const ROLES = ["Super Admin","Admin","Finance","Support","Organizer","Read-only"] as const;
const CITIES = ["All","Kampala","Nairobi","Entebbe","Mombasa"] as const;
const PERMS = [
  "events.read","events.write","orders.read","orders.refund","payouts.view","payouts.execute",
  "users.read","users.block","flags.queue","flags.action","cms.publish","journeys.activate"
] as const;

type Row = { perm: typeof PERMS[number]; global: boolean|undefined; city: boolean|undefined; effective: boolean|undefined };

export function Part3B(){
  const [role, setRole] = React.useState<typeof ROLES[number]>("Admin");
  const [city, setCity] = React.useState<typeof CITIES[number]>("All");
  const [q, setQ] = React.useState("");

  // seed a sane default once
  React.useEffect(()=>{
    setRoleScopes("Admin", "All", { "events.read": true, "orders.read": true, "payouts.view": true, "cms.publish": true });
  },[]);

  const rows: Row[] = PERMS.filter(p => p.includes(q)).map(p => {
    const eff = getEffectiveScope(role, city);
    const g = getEffectiveScope(role, "All");
    return { perm: p, global: g[p], city: city==="All" ? undefined : eff[p], effective: eff[p] };
  });

  const cols: ColumnDef<Row>[] = [
    { key: "perm", header: "Permission" },
    { key: "global", header: "Global", className: "w-28", render: r => <BoolCell v={r.global}/> },
    { key: "city", header: "City", className: "w-28", render: r => <BoolCell v={r.city}/> },
    { key: "effective", header: "Effective", className: "w-28", render: r => <BoolCell v={r.effective}/> },
  ];

  function setVal(p:string, v:boolean){
    setRoleScopes(role, city, { [p]: v });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16">
      <Panel title="Access Scopes">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <select value={role} onChange={(e)=>setRole(e.target.value as any)} className="rounded-xl border px-3 py-2">
            {ROLES.map(r=> <option key={r}>{r}</option>)}
          </select>
          <select value={city} onChange={(e)=>setCity(e.target.value as any)} className="rounded-xl border px-3 py-2">
            {CITIES.map(c=> <option key={c}>{c}</option>)}
          </select>
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search permission (e.g., events.read)" className="w-72 rounded-xl border px-3 py-2"/>
          <button className="rounded-xl border px-3 py-2" onClick={()=>{ setRoleScopes(role, city, Object.fromEntries(PERMS.map(p=>[p,true]))); }}>Enable all</button>
          <button className="rounded-xl border px-3 py-2" onClick={()=>{ setRoleScopes(role, city, Object.fromEntries(PERMS.map(p=>[p,false]))); }}>Disable all</button>
        </div>
        <DataTable columns={cols} data={rows} getRowKey={(r)=>`${r.perm}`} />
        <div className="mt-3 text-xs text-gray-600">City overrides global (explicit false at city turns off a global true).</div>
      </Panel>
    </div>
  );
}

function BoolCell({ v }:{v:boolean|undefined}){
  return <span className={`rounded-full px-2 py-0.5 text-xs ${v===true?"bg-emerald-100 text-emerald-700":v===false?"bg-rose-100 text-rose-700":"bg-gray-100 text-gray-600"}`}>{v===undefined?"inherit":String(v)}</span>;
}
