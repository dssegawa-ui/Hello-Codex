import * as React from "react";
import { Panel, Metric, Badge, LabeledField, DataTable, Pager, useRowsPerPage, calcRowsForHeight } from "../lib/utils";
import { ColumnDef } from "../lib/types";

type User = { id:string; name:string; email:string; orders:number; flags:number };
type Organizer = { id:string; name:string; country:string; kyc:"Pending"|"Verified"|"Rejected" };
type EventRec = { id:string; name:string; city:string; status:"Live"|"Draft"|"On sale"|"Paused"; private:boolean; start:string };
type TicketRec = { id:string; type:string; owner:string; status:"issued"|"voided"|"transferred"|"checked-in"; gate:string };
type QueueItem = { id:string; org:string; age:string; risk:"High"|"Med"|"Low"; sla:string };
type PricingTier = { tier:string; price:string; capacity:string; fees:string; status:string };

const range = (n:number)=> Array.from({length:n}, (_,i)=>i);

const HOME_KPI_TILES:[string,string][] = [
  ["Events Live Today","42"],
  ["Tickets Sold Today","1,284"],
  ["GMV Today","$18,420"],
  ["Check‑in Rate (live)","78%"],
  ["Refund Rate (7d)","2.1%"],
  ["Dispute Rate (30d)","0.38%"],
];

const USERS: User[] = range(24).map((i) => ({
  id: `U-${1001 + i}`,
  name: ["Aisha", "Brian", "Cynthia", "Derrick", "Esther", "Faith", "George", "Helen"][i % 8] + " " + ["K","O","M","S"][i % 4],
  email: `user${i}@example.com`,
  orders: (i * 3) % 27,
  flags: i % 5 === 0 ? 1 : 0,
}));

const ORGANIZERS: Organizer[] = range(23).map((i) => ({
  id: `ORG-${500 + i}`,
  name: ["NightPulse Events","Safari Sounds","Kampala Live","Nairobi Nights","Afro Vibes","CityBeat","Moonlight Co","Groove Hub"][i % 8],
  country: ["UG","KE","TZ","RW"][i % 4],
  kyc: ["Pending","Verified","Rejected"][i % 3],
}));

const EVENTS: EventRec[] = range(26).map((i) => ({
  id: `EVT-${500 + i}`,
  name: ["Afro Night Jam","Jazz & Java","Food Carnival","City Lights","Sunset Sessions"][i % 5],
  city: ["Kampala","Nairobi","Entebbe","Mombasa","Kisumu"][i % 5],
  status: ["Live","Draft","On sale","Paused"][i % 4],
  private: i % 4 === 0,
  start: `2025-12-${String((i%28)+1).padStart(2,"0")} 20:00`,
}));

const TICKETS: TicketRec[] = range(40).map((i) => ({
  id: `TCK-${12000 + i}`,
  type: ["General","VIP","Student","Staff"][i % 4],
  owner: `user${i % 24}@example.com`,
  status: ["issued","checked-in","transferred","voided"][i % 4] as TicketRec["status"],
  gate: ["A","B","C"][i % 3],
}));

const QUEUE_ITEMS: QueueItem[] = range(25).map((i) => ({
  id: `Q-${700 + i}`,
  org: ORGANIZERS[i % ORGANIZERS.length].name,
  age: `${(i % 6) + 1}h`,
  risk: ["High","Med","Low"][i % 3] as QueueItem["risk"],
  sla: `${(i % 5) + 1}h`,
}));

const PRICING_TIERS: PricingTier[] = [
  { tier: "Early Bird", price: "$8.00", capacity: "500", fees: "Buyer", status: "Sold out" },
  { tier: "General", price: "$12.00", capacity: "1,500", fees: "Buyer", status: "On sale" },
  { tier: "VIP", price: "$25.00", capacity: "500", fees: "Organizer", status: "On sale" },
];

// Self checks
function runSelfChecks(){
  const checks: {name:string; pass:boolean}[] = [];
  const r1 = calcRowsForHeight(640, { min: 6, max: 50 });
  const r2 = calcRowsForHeight(900, { min: 6, max: 50 });
  checks.push({ name:"Rows/page nondecreasing", pass: r2>=r1 });
  checks.push({ name:">= 20 users", pass: USERS.length>=20 });
  checks.push({ name:">= 20 events", pass: EVENTS.length>=20 });
  return checks;
}

export function Part1(){
  const checks = React.useMemo(()=> runSelfChecks(), []);
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          {HOME_KPI_TILES.map(([k,v]) => (
            <div key={k} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-xs text-gray-500">{k}</div><div className="mt-2 text-2xl font-semibold">{v}</div>
              <div className="mt-3 h-8 w-full rounded bg-gray-100" />
            </div>
          ))}
        </div>
        <Panel title="Incidents & Provider Health" className="md:col-span-4">
          <div className="flex items-center justify-between text-sm border-b py-2"><span>Stripe</span><Badge ok/></div>
          <div className="flex items-center justify-between text-sm border-b py-2"><span>M‑Pesa</span><Badge warn/></div>
          <div className="flex items-center justify-between text-sm border-b py-2"><span>Airtel Money</span><Badge ok/></div>
          <div className="flex items-center justify-between text-sm border-b py-2"><span>MTN MoMo</span><Badge ok/></div>
          <div className="mt-3 rounded-xl bg-yellow-50 p-3 text-xs text-yellow-800"><b>Partial outage:</b> M‑Pesa webhooks delayed ~14 min.</div>
        </Panel>
        <Panel title="Dev Self‑Checks (runtime tests)" className="md:col-span-12">
          <ul className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2 lg:grid-cols-3">
            {checks.map((t,i)=>(<li key={i} className="flex items-center justify-between rounded-xl border p-2"><span>{t.name}</span><span className={`rounded-full px-2 py-0.5 text-xs ${t.pass?"bg-emerald-100 text-emerald-700":"bg-rose-100 text-rose-700"}`}>{t.pass?"PASS":"FAIL"}</span></li>))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
