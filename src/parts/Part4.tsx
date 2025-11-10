import * as React from "react";
import { Panel, DataTable, Metric } from "../lib/utils";
import { ColumnDef } from "../lib/types";

type Role = { key:string; name:string; users:number; scopes:number; lastChange:string };
type User = { id:string; email:string; role:string; city:string };
const ROLES: Role[] = [
  { key:"super", name:"Super Admin", users:1, scopes:120, lastChange:"2025-11-01" },
  { key:"admin", name:"Admin", users:4, scopes:80, lastChange:"2025-11-05" },
  { key:"finance", name:"Finance", users:3, scopes:45, lastChange:"2025-11-08" },
  { key:"support", name:"Support", users:6, scopes:40, lastChange:"2025-11-07" },
  { key:"organizer", name:"Organizer", users:12, scopes:18, lastChange:"2025-10-29" },
  { key:"readonly", name:"Read-only", users:2, scopes:8, lastChange:"2025-10-20" },
];

const USERS: User[] = Array.from({length:24}, (_,i)=> ({
  id:`U-${1000+i}`, email:`user${i}@example.com`,
  role: ["Admin","Finance","Support","Organizer","Read-only"][i%5],
  city: ["Kampala","Nairobi","Entebbe","Mombasa"][i%4]
}));

export function Part4(){
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16">
      <RolesAccess/>
      <div className="mt-4"/>
      <AnalyticsCMSDisputes/>
    </div>
  );
}

function RolesAccess(){
  const roleCols: ColumnDef<Role>[] = [
    { key:"name", header:"Role" },
    { key:"users", header:"Users", className:"w-24" },
    { key:"scopes", header:"Scopes", className:"w-24" },
    { key:"lastChange", header:"Last change", className:"w-36" },
  ];
  const userCols: ColumnDef<User>[] = [
    { key:"id", header:"ID", className:"w-24" },
    { key:"email", header:"Email" },
    { key:"role", header:"Role", className:"w-28" },
    { key:"city", header:"City", className:"w-28" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <Panel title="Roles" className="md:col-span-5">
        <DataTable columns={roleCols} data={ROLES} getRowKey={(r)=>r.key}/>
        <div className="mt-3 flex gap-2 text-sm"><button className="rounded-xl border px-3 py-2">New role</button><button className="rounded-xl border px-3 py-2">Edit scopes</button></div>
      </Panel>
      <Panel title="Users" className="md:col-span-7">
        <div className="mb-2 flex items-center gap-2 text-sm">
          <input className="w-72 rounded-xl border px-3 py-2" placeholder="Search email, id…"/>
          <select className="rounded-xl border px-3 py-2"><option>All roles</option><option>Admin</option><option>Finance</option><option>Support</option><option>Organizer</option><option>Read-only</option></select>
          <select className="rounded-xl border px-3 py-2"><option>All cities</option><option>Kampala</option><option>Nairobi</option><option>Entebbe</option><option>Mombasa</option></select>
          <button className="rounded-xl border px-3 py-2">Invite user</button>
        </div>
        <DataTable columns={userCols} data={USERS} getRowKey={(r)=>r.id}/>
      </Panel>
    </div>
  );
}

function AnalyticsCMSDisputes(){
  const CMS = { published: 182, scheduled: 22, drafts: 41 };
  const Journeys = { activated: 12, tested: 38, sends: 14200 };
  const Disputes = { evidenceUploaded: 64, open: 12, won: 8, lost: 4 };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <Panel title="CMS Analytics" className="md:col-span-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Metric label="Published" value={CMS.published}/>
          <Metric label="Scheduled" value={CMS.scheduled}/>
          <Metric label="Drafts" value={CMS.drafts}/>
        </div>
      </Panel>
      <Panel title="Journeys" className="md:col-span-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Metric label="Activated" value={Journeys.activated}/>
          <Metric label="Test sends" value={Journeys.tested}/>
          <Metric label="Total sends" value={Journeys.sends}/>
        </div>
      </Panel>
      <Panel title="Disputes" className="md:col-span-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Metric label="Evidence uploaded" value={Disputes.evidenceUploaded}/>
          <Metric label="Open" value={Disputes.open}/>
          <Metric label="Won" value={Disputes.won}/>
          <Metric label="Lost" value={Disputes.lost}/>
        </div>
      </Panel>
    </div>
  );
}
