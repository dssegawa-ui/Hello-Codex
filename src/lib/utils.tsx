import * as React from "react";
import { ColumnDef } from "./types";

export function Panel(props: React.PropsWithChildren<{ title?: string; className?: string }>) {
  const { title, className = "", children } = props;
  return (
    <div className={`rounded-2xl border bg-white p-4 shadow-sm ${className}`}>
      {title ? <div className="mb-3 text-sm font-semibold text-gray-700">{title}</div> : null}
      {children}
    </div>
  );
}

export function Metric({ label, value, hint }:{label:string; value:React.ReactNode; hint?:string}){
  return (
    <div className="rounded-xl border p-3 text-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-base font-semibold">{value}</div>
      {hint ? <div className="text-xs text-gray-500">{hint}</div> : null}
    </div>
  );
}

export function Badge({ ok, warn }:{ok?:boolean; warn?:boolean}){
  const text = ok ? "OK" : warn ? "WARN" : "DOWN";
  const color = ok ? "bg-emerald-100 text-emerald-700" : warn ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700";
  return <span className={`rounded-full px-2 py-0.5 text-xs ${color}`}>{text}</span>;
}

export function LabeledField({ label, children }:{label:string; children:React.ReactNode}){
  return (
    <div className="rounded-xl border p-3">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

export function DataTable<T>({ columns, data, getRowKey }:{columns:ColumnDef<T>[]; data:T[]; getRowKey:(row:T)=>string}){
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500">
          {columns.map(c => (<th key={String(c.key)} className={`py-2 ${c.className || ""}`}>{c.header}</th>))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr className="border-t"><td className="py-4 text-center text-xs text-gray-500" colSpan={columns.length}>No rows</td></tr>
        ) : data.map(row => (
          <tr key={getRowKey(row)} className="border-t">
            {columns.map(c => (
              <td key={String(c.key)} className={`py-2 ${c.className || ""}`}>
                {c.render ? c.render(row) : (row as any)[c.key as any]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Pager({ page, pageSize, total, onPage }:{page:number; pageSize:number; total:number; onPage:(p:number)=>void}){
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
      <div>Page {page} of {pages} • {total} rows</div>
      <div className="flex gap-2">
        <button className="rounded border px-2 py-1" onClick={()=>onPage(Math.max(1,page-1))} disabled={page<=1}>Prev</button>
        <button className="rounded border px-2 py-1" onClick={()=>onPage(Math.min(pages,page+1))} disabled={page>=pages}>Next</button>
      </div>
    </div>
  );
}

export const DEFAULT_RPP = { min: 8, max: 50 };
export function calcRowsForHeight(h:number, { min, max } = DEFAULT_RPP){
  if (!Number.isFinite(h)) return min;
  if (h < 700) return min;
  if (h < 900) return Math.min(max, Math.max(min, 12));
  if (h < 1080) return Math.min(max, 16);
  if (h < 1400) return Math.min(max, 20);
  return Math.min(max, 24);
}
export function useRowsPerPage(opts = DEFAULT_RPP){
  const start = typeof window === "undefined" ? opts.min : calcRowsForHeight(window.innerHeight, opts);
  const [rows, setRows] = React.useState(start);
  React.useEffect(()=>{
    const on = ()=> setRows(calcRowsForHeight(window.innerHeight, opts));
    window.addEventListener("resize", on);
    return ()=> window.removeEventListener("resize", on);
  }, [opts.min, opts.max]);
  return rows;
}
