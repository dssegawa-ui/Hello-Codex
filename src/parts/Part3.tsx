import * as React from "react";
import { Panel, DataTable, Pager } from "../lib/utils";
import { ColumnDef } from "../lib/types";
import { recordEvent, useLiveMetricsTick } from "../lib/analytics";

const LOCALES = ["en-UG","en-KE","sw-KE"] as const;
const CITIES = ["Kampala","Nairobi","Entebbe","Mombasa"] as const;
const CONTENT_TYPES = ["article","banner","category","guide","page"] as const;

type Content = {
  id:string; type: typeof CONTENT_TYPES[number]; title:string; slug:string;
  status: "Draft"|"In Review"|"Scheduled"|"Published"; locale: typeof LOCALES[number]; city: typeof CITIES[number];
  scheduledAt: string; author: string;
};

const range = (n:number)=> Array.from({length:n}, (_,i)=>i);
const nowISO = ()=> new Date().toISOString().slice(0,16);

const CONTENT: Content[] = range(22).map(i=>({
  id: `CMS-${100+i}`,
  type: CONTENT_TYPES[i%CONTENT_TYPES.length],
  title: ["Holiday Deals","Live Music Week","Comedy Night","Foodie Trail"][i%4],
  slug: ["holiday-deals","live-music","comedy-night","foodie-trail"][i%4],
  status: ["Draft","In Review","Scheduled","Published"][i%4] as Content["status"],
  locale: LOCALES[i%LOCALES.length],
  city: CITIES[i%CITIES.length],
  scheduledAt: `2025-12-${String((i%28)+1).padStart(2,'0')}T10:00`,
  author: ["Aisha","Brian","Cynthia","Derrick"][i%4],
}));

export function Part3(){
  useLiveMetricsTick();
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20">
      <CMSScreen/>
      <div className="mt-4"/>
      <JourneysScreen/>
    </div>
  );
}

function CMSScreen(){
  const rpp = 10;
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"All"|Content["status"]>("All");
  const [ctype, setCtype] = React.useState<"All"|Content["type"]>("All");
  const [locale, setLocale] = React.useState<"All"|typeof LOCALES[number]>("All");
  const [rows, setRows] = React.useState<Content[]>(CONTENT);
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Content|null>(null);

  const filtered = React.useMemo(()=> rows.filter(r=>{
    const hits = (r.id+r.title+r.slug+r.city+r.locale+r.type+r.status).toLowerCase().includes(q.toLowerCase());
    return hits && (status==='All'||r.status===status) && (ctype==='All'||r.type===ctype) && (locale==='All'||r.locale===locale);
  }), [q,status,ctype,locale,rows]);
  const view = filtered.slice((page-1)*rpp, page*rpp);
  React.useEffect(()=>{ setPage(1); }, [q,status,ctype,locale,rpp]);

  const cols: ColumnDef<Content>[] = [
    { key:'id', header:'ID', className:'w-28' },
    { key:'type', header:'Type', className:'w-24' },
    { key:'title', header:'Title' },
    { key:'locale', header:'Locale', className:'w-24' },
    { key:'city', header:'City', className:'w-24' },
    { key:'status', header:'Status', className:'w-28' },
  ];

  function newItem(){
    const id = `CMS-${Math.floor(1000+Math.random()*9000)}`;
    const item: Content = { id, type:'article', title:'Untitled', slug:'untitled', status:'Draft', locale:'en-UG', city:'Kampala', scheduledAt: nowISO(), author:'You' };
    setRows([item, ...rows]); setSelected(item);
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <Panel title="CMS — Filters" className="md:col-span-12">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input className="w-72 rounded-xl border px-3 py-2" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search title, slug, city…"/>
          <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="rounded-xl border px-3 py-2"><option>All</option><option>Draft</option><option>In Review</option><option>Scheduled</option><option>Published</option></select>
          <select value={ctype} onChange={(e)=>setCtype(e.target.value as any)} className="rounded-xl border px-3 py-2"><option>All</option>{CONTENT_TYPES.map(t=> <option key={t} value={t}>{t}</option>)}</select>
          <select value={locale} onChange={(e)=>setLocale(e.target.value as any)} className="rounded-xl border px-3 py-2"><option>All</option>{LOCALES.map(l=> <option key={l}>{l}</option>)}</select>
          <button className="ml-auto rounded-xl border px-3 py-2" onClick={newItem}>New</button>
        </div>
      </Panel>

      <Panel title={`Items (${filtered.length})`} className="md:col-span-7">
        <DataTable columns={cols} data={view} getRowKey={(r)=>r.id} />
        <Pager page={page} pageSize={rpp} total={filtered.length} onPage={setPage} />
      </Panel>

      <Panel title={selected? `Editor — ${selected.id}` : "Editor"} className="md:col-span-5">
        {selected? <EditorForm item={selected} onChange={(it)=>setSelected(it)} onReplace={(it)=>setRows(rows.map(r=> r.id===it.id? it : r))} /> : <div className="text-xs text-gray-500">Select a row to edit. Use New to create one.</div>}
      </Panel>
    </div>
  );
}

type EditorProps = {
  item: Content;
  onChange: (c:Content)=>void;
  onReplace: (c:Content)=>void;
};

function EditorForm({ item, onChange, onReplace }:EditorProps){
  const set = (patch: Partial<Content>)=> onChange({...item, ...patch});
  const [showPreview, setShowPreview] = React.useState(false);

  function toSlug(s:string){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
  function saveDraft(){ onReplace({...item, status:'Draft'}); recordEvent('cms_draft'); alert('Saved draft'); }
  function submitForReview(){ onReplace({...item, status:'In Review'}); alert('Submitted for review'); }
  function schedule(){ onReplace({...item, status:'Scheduled'}); recordEvent('cms_schedule'); alert('Scheduled'); }
  function publish(){ onReplace({...item, status:'Published'}); recordEvent('cms_publish'); alert('Published'); }

  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-gray-500">Type<select value={item.type} onChange={(e)=>set({type:e.target.value as any})} className="mt-1 w-full rounded-lg border px-2 py-1">{Array.from(CONTENT_TYPES).map(k=> <option key={k}>{k}</option>)}</select></label>
        <label className="text-xs text-gray-500">Locale<select value={item.locale} onChange={(e)=>set({locale:e.target.value as any})} className="mt-1 w-full rounded-lg border px-2 py-1">{Array.from(LOCALES).map(l=> <option key={l}>{l}</option>)}</select></label>
      </div>
      <label className="text-xs text-gray-500">Title<input value={item.title} onChange={(e)=>set({title:e.target.value, slug: item.slug==='untitled'? toSlug(e.target.value): item.slug})} className="mt-1 w-full rounded-lg border px-3 py-2"/></label>
      <label className="text-xs text-gray-500">Slug<input value={item.slug} onChange={(e)=>set({slug:e.target.value})} className="mt-1 w-full rounded-lg border px-3 py-2"/></label>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-gray-500">City<select value={item.city} onChange={(e)=>set({city:e.target.value as any})} className="mt-1 w-full rounded-lg border px-2 py-1">{Array.from(CITIES).map(c=> <option key={c}>{c}</option>)}</select></label>
        <label className="text-xs text-gray-500">Schedule at<input type="datetime-local" value={item.scheduledAt} onChange={(e)=>set({scheduledAt:e.target.value})} className="mt-1 w-full rounded-lg border px-2 py-1"/></label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border p-3">
          <div className="mb-2 text-xs font-semibold">Relations</div>
          <div className="text-xs text-gray-500">Attach Events / Organizers (mock)</div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="mb-2 text-xs font-semibold">Preview</div>
          <div className={`rounded-lg border ${showPreview? 'p-3' : 'p-2'} text-xs`}>
            <div className="text-gray-400">/cms/{item.locale}/{item.slug}</div>
            <div className="mt-2 text-base font-semibold">{item.title}</div>
            <div className="mt-1 text-gray-500">Target: {item.city || '—'}</div>
          </div>
          <label className="mt-2 text-xs"><input type="checkbox" checked={showPreview} onChange={(e)=>setShowPreview(e.target.checked)} /> Phone</label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="rounded-xl border px-3 py-2" onClick={saveDraft}>Save draft</button>
        <button className="rounded-xl border px-3 py-2" onClick={submitForReview}>Submit for review</button>
        <button className="rounded-xl border px-3 py-2" onClick={schedule}>Schedule</button>
        <button className="rounded-xl bg-gray-900 px-3 py-2 text-white" onClick={publish}>Publish</button>
      </div>
      <div className="text-[11px] text-gray-500">Status flow: Draft → In Review → Scheduled/Published • Versioning mock</div>
    </div>
  );
}

function JourneysScreen(){
  const [name, setName] = React.useState("Post‑purchase flow");
  const [trigger, setTrigger] = React.useState("ticket_purchased");
  const [channel, setChannel] = React.useState("Email");
  const [segment, setSegment] = React.useState("All users");

  function doSave(){ alert('Saved'); }
  function doTest(){ recordEvent('journeys_test'); alert('Test sent'); }
  function doActivate(){ recordEvent('journeys_activate'); recordEvent('journeys_sends', {count: 100}); alert('Journey activated'); }

  const nodes = [
    { id:"N1", type:"trigger", label:"Ticket Purchased" },
    { id:"N2", type:"delay", label:"Wait 2 hours" },
    { id:"N3", type:"branch", label:"IF open rate < 15%" },
    { id:"N4", type:"message", label:"SMS: Reminder & venue details" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <Panel title="Journey" className="md:col-span-5">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <label className="text-xs text-gray-500">Name<input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full rounded-lg border px-2 py-1"/></label>
          <label className="text-xs text-gray-500">Trigger<select value={trigger} onChange={(e)=>setTrigger(e.target.value)} className="mt-1 w-full rounded-lg border px-2 py-1"><option value="ticket_purchased">Ticket purchased</option><option value="event_published">Event published</option><option value="abandoned_checkout">Abandoned checkout</option></select></label>
          <label className="text-xs text-gray-500">Primary channel<select value={channel} onChange={(e)=>setChannel(e.target.value)} className="mt-1 w-full rounded-lg border px-2 py-1"><option>Email</option><option>SMS</option><option>Push</option></select></label>
          <label className="text-xs text-gray-500">Segment<select value={segment} onChange={(e)=>setSegment(e.target.value)} className="mt-1 w-full rounded-lg border px-2 py-1"><option>All users</option><option>Kampala</option><option>Nairobi</option><option>First‑time buyers</option><option>Organizers</option></select></label>
        </div>
        <div className="mt-3 flex gap-2 text-sm"><button className="rounded-xl border px-3 py-2" onClick={doSave}>Save</button><button className="rounded-xl border px-3 py-2" onClick={doTest}>Test</button><button className="rounded-xl bg-gray-900 px-3 py-2 text-white" onClick={doActivate}>Activate</button></div>
      </Panel>
      <Panel title="Flow (visual)" className="md:col-span-7">
        <div className="grid grid-cols-4 gap-3 text-xs">
          {nodes.map(n=> (
            <div key={n.id} className="rounded-xl border p-3">
              <div className="text-gray-500">{n.type.toUpperCase()}</div>
              <div className="mt-1 font-semibold">{n.label}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
