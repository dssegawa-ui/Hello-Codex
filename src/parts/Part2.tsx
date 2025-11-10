import * as React from "react";
import { Panel, DataTable, Pager, Metric, useRowsPerPage } from "../lib/utils";
import { ColumnDef } from "../lib/types";

const range = (n:number)=> Array.from({length:n}, (_,i)=>i);
const currency = (n:number)=> `$${n.toLocaleString()}`;

const PAYMENT_METHODS = ["Card","M‑Pesa","Airtel Money","MTN MoMo"] as const;

type Payment = {
  id:string; type:"sale"|"refund"|"fee"; method: typeof PAYMENT_METHODS[number];
  status:"succeeded"|"pending"|"failed"; amount:number; event:string; created:string
};
type Payout = { id:string; org:string; amount:number; method:string; status:"Pending"|"Processing"|"Paid"; scheduled:string };
type Dispute = { id:string; payment:string; reason:string; amount:number; status:"open"|"won"|"lost"; created:string };

const PAYMENTS: Payment[] = range(44).map(i => ({
  id: `PM-${80000+i}`, type: ["sale","refund","fee"][i%3] as Payment["type"],
  method: PAYMENT_METHODS[i%PAYMENT_METHODS.length],
  status: ["succeeded","pending","failed"][i%3] as Payment["status"],
  amount: 900 + (i%12)*175,
  event: ["Afro Night Jam","City Lights","Sunset Sessions","Food Carnival"][i%4],
  created: `2025-11-${(i%28+1).toString().padStart(2,'0')} 1${i%10}:3${i%6}`
}));

const PAYOUTS: Payout[] = range(26).map(i => ({
  id: `PO-${9000+i}`,
  org: ["NightPulse Events","Safari Sounds","Kampala Live","Nairobi Nights"][i%4],
  amount: 50000 + (i%7)*8500,
  method: ["Bank","M‑Pesa","Airtel Money","MTN MoMo"][i%4],
  status: ["Pending","Processing","Paid"][i%3] as Payout["status"],
  scheduled: `2025-12-${(i%28+1).toString().padStart(2,'0')}`
}));

const DISPUTES: Dispute[] = range(28).map(i => ({
  id: `DP-${6000+i}`,
  payment: `PM-${80000+i}`,
  reason: ["fraudulent","duplicate","product_not_received"][i%3],
  amount: 1000 + (i%10)*250,
  status: ["open","won","lost"][i%3] as Dispute["status"],
  created: `2025-11-${(i%28+1).toString().padStart(2,'0')}`,
}));

export function Part2(){
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16">
      <PaymentsScreen/>
    </div>
  );
}

/* ==================== PAYMENTS & PAYOUTS ==================== */
function PaymentsScreen(){
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"All"|Payment["status"]>("All");
  const [method, setMethod] = React.useState<"All"|Payment["method"]>("All");
  const [groupBy, setGroupBy] = React.useState<"event"|"organizer">("event");
  const [pageTx, setPageTx] = React.useState(1);
  const [pagePo, setPagePo] = React.useState(1);
  const rpp = useRowsPerPage({ min: 8, max: 40 });

  const filteredTx = React.useMemo(()=> PAYMENTS.filter(p => {
    const s = (p.id+p.type+p.method+p.status+p.event).toLowerCase();
    const passQ = s.includes(q.toLowerCase());
    const passS = status==='All' || p.status===status;
    const passM = method==='All' || p.method===method;
    return passQ && passS && passM;
  }), [q, status, method]);
  const txView = filteredTx.slice((pageTx-1)*rpp, pageTx*rpp);
  React.useEffect(()=>{ setPageTx(1); }, [q, status, method, rpp]);

  const payoutsByEvent = React.useMemo(() => {
    const map = new Map<string, number>();
    PAYMENTS.filter(p=>p.type==='sale' && p.status!=='failed').forEach(p=>{
      const key = p.event;
      map.set(key, (map.get(key)||0) + p.amount);
    });
    return Array.from(map.entries()).map(([evt, amt], i)=>({
      id: `POE-${i+1}`, event: evt, amount: amt, method: 'Mixed',
      status: 'Pending' as const, scheduled: `2025-12-${String((i%28)+1).padStart(2,'0')}`
    }));
  }, []);

  const filteredPo = groupBy==='event' ? payoutsByEvent : PAYOUTS;
  const poPageSize = Math.max(8, Math.floor(rpp/2));
  const poView = filteredPo.slice((pagePo-1)*poPageSize, pagePo*poPageSize);
  React.useEffect(()=>{ setPagePo(1); }, [groupBy, rpp]);

  const totalGMV = currency(PAYMENTS.filter(p=>p.type==='sale' && p.status==='succeeded').reduce((a,b)=>a+b.amount,0));
  const refunds = currency(PAYMENTS.filter(p=>p.type==='refund').reduce((a,b)=>a+b.amount,0));
  const successRate = (()=>{
    const all = PAYMENTS.length; const ok = PAYMENTS.filter(p=>p.status==='succeeded').length; return `${Math.round((ok/all)*100)}%`;
  })();

  const txCols: ColumnDef<typeof PAYMENTS[number]>[] = [
    { key: 'id', header: 'Txn ID', className: 'w-28' },
    { key: 'type', header: 'Type', className: 'w-20' },
    { key: 'method', header: 'Method', className: 'w-32' },
    { key: 'status', header: 'Status', className: 'w-28' },
    { key: 'amount', header: 'Amount', className: 'w-24', render: r => currency(r.amount) },
    { key: 'event', header: 'Event' },
    { key: 'created', header: 'Created', className: 'w-36' },
  ];

  const poColsEvent: ColumnDef<{id:string,event:string,amount:number,method:string,status:string,scheduled:string}>[] = [
    { key: 'id', header: 'Payout ID', className: 'w-28' },
    { key: 'event', header: 'Event' },
    { key: 'amount', header: 'Amount', className: 'w-24', render: r => currency(r.amount) },
    { key: 'method', header: 'Method', className: 'w-28' },
    { key: 'status', header: 'Status', className: 'w-28' },
    { key: 'scheduled', header: 'Scheduled', className: 'w-28' },
  ];

  const poColsOrg: ColumnDef<typeof PAYOUTS[number]>[] = [
    { key: 'id', header: 'Payout ID', className: 'w-28' },
    { key: 'org', header: 'Organizer' },
    { key: 'amount', header: 'Amount', className: 'w-24', render: r => currency(r.amount) },
    { key: 'method', header: 'Method', className: 'w-28' },
    { key: 'status', header: 'Status', className: 'w-28' },
    { key: 'scheduled', header: 'Scheduled', className: 'w-28' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <Panel title="Balances & Health" className="md:col-span-12">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 text-sm">
          <Metric label="Total GMV (sales)" value={totalGMV}/>
          <Metric label="Refunds (gross)" value={refunds}/>
          <Metric label="Success rate" value={successRate} hint="all methods"/>
          <Metric label="Next scheduled payout" value={(filteredPo[0] as any)?.scheduled || '—'} hint={(filteredPo[0] as any)?.id || ''} />
        </div>
      </Panel>
      <Panel title="Payments" className="md:col-span-8">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
          <input value={q} onChange={(e)=>setQ(e.target.value)} className="w-64 rounded-xl border px-3 py-2" placeholder="Search id, event, method…" />
          <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="rounded-xl border px-3 py-2"><option>All</option><option>succeeded</option><option>pending</option><option>failed</option></select>
          <select value={method} onChange={(e)=>setMethod(e.target.value as any)} className="rounded-xl border px-3 py-2">
            <option>All</option>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button className="rounded-xl border px-3 py-2">Export CSV</button>
        </div>
        <DataTable columns={txCols} data={txView} getRowKey={(r)=>r.id} />
        <Pager page={pageTx} pageSize={rpp} total={filteredTx.length} onPage={setPageTx} />
      </Panel>
      <Panel title="Payouts" className="md:col-span-4">
        <div className="mb-2 flex items-center gap-2 text-xs">
          <span className="text-gray-500">Group by:</span>
          <select value={groupBy} onChange={(e)=>setGroupBy(e.target.value as any)} className="rounded-xl border px-2 py-1">
            <option value="event">Event</option>
            <option value="organizer">Organizer</option>
          </select>
        </div>
        <DataTable columns={groupBy==='event'? poColsEvent : poColsOrg} data={groupBy==='event'? payoutsByEvent : PAYOUTS} getRowKey={(r)=>r.id} />
        <Pager page={pagePo} pageSize={poPageSize} total={filteredPo.length} onPage={setPagePo} />
      </Panel>
    </div>
  );
}
