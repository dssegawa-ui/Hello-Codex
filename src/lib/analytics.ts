declare global {
  interface Window {
    __choptopAnalytics?: {
      cms: { published: number; scheduled: number; drafts: number };
      journeys: { activated: number; tested: number; sends: number };
      disputes: { evidence: number };
    }
  }
}

const G: any = (typeof window !== "undefined" ? window : globalThis);
G.__choptopAnalytics = G.__choptopAnalytics || {
  cms: { published: 0, scheduled: 0, drafts: 0 },
  journeys: { activated: 0, tested: 0, sends: 0 },
  disputes: { evidence: 0 },
};

export function recordEvent(type: string, payload?: any){
  try {
    const a = G.__choptopAnalytics;
    if(type==='cms_publish') a.cms.published += 1;
    else if(type==='cms_schedule') a.cms.scheduled += 1;
    else if(type==='cms_draft') a.cms.drafts += 1;
    else if(type==='journeys_activate') a.journeys.activated += 1;
    else if(type==='journeys_test') a.journeys.tested += 1;
    else if(type==='journeys_sends') a.journeys.sends += (payload && payload.count ? payload.count : 1);
    else if(type==='disputes_evidence') a.disputes.evidence += 1;
  } catch {}
}

export function useLiveMetricsTick(){
  // simple 1s ticker to re-render components that read window analytics
  // (call inside a React component)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, force] = require("react").useReducer((x:number)=>x+1, 0);
  require("react").useEffect(()=>{
    const id = setInterval(()=>force(), 1000);
    return ()=> clearInterval(id);
  },[]);
}
