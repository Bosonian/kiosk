(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function i(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=i(s);fetch(s.href,r)}})();const O="modulepreload",V=function(e){return"/kiosk/"+e},w={},D=function(t,i,n){let s=Promise.resolve();if(i&&i.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),o=a?.nonce||a?.getAttribute("nonce");s=Promise.allSettled(i.map(c=>{if(c=V(c),c in w)return;w[c]=!0;const u=c.endsWith(".css"),l=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${l}`))return;const d=document.createElement("link");if(d.rel=u?"stylesheet":O,u||(d.as="script"),d.crossOrigin="",d.href=c,o&&d.setAttribute("nonce",o),document.head.appendChild(d),u)return new Promise((v,k)=>{d.addEventListener("load",v),d.addEventListener("error",()=>k(new Error(`Unable to preload CSS for ${c}`)))})}))}function r(a){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=a,window.dispatchEvent(o),!o.defaultPrevented)throw a}return s.then(a=>{for(const o of a||[])o.status==="rejected"&&r(o.reason);return t().catch(r)})},f={caseSharingUrl:"https://case-sharing-564499947017.europe-west3.run.app",pollInterval:5e3,autoArchiveHours:2,staleGpsMinutes:5,hospitalId:(()=>{const e=localStorage.getItem("kiosk_hospital_id");return e===null?"BY-NS-001":e===""?null:e})(),hospitalName:localStorage.getItem("kiosk_hospital_name")||"LMU Klinikum München - Großhadern",googleMapsApiKey:"AIzaSyACBndIj8HD1wwZ4Vw8PDDI0bIe6DoBExI",playAudioAlert:!0,audioAlertVolume:.5,showArchivedCases:!1,maxCasesDisplay:20,theme:"dark"},R=[{id:"BY-NS-001",name:"LMU Klinikum München - Großhadern"},{id:"BY-NS-002",name:"Klinikum Rechts der Isar"},{id:"BY-NS-003",name:"Helios Klinikum München West"},{id:"BY-NS-004",name:"Klinikum Bogenhausen"},{id:"BW-NS-001",name:"Universitätsklinikum Tübingen"},{id:"BW-NS-005",name:"Klinikum Stuttgart - Katharinenhospital"},{id:"BW-NS-003",name:"Universitätsklinikum Freiburg"},{id:"ALL",name:"🌐 All Hospitals (Show All Cases)"}];function K(e){const t=R.find(i=>i.id===e);t&&(e==="ALL"?(localStorage.setItem("kiosk_hospital_id",""),localStorage.setItem("kiosk_hospital_name",t.name)):(localStorage.setItem("kiosk_hospital_id",e),localStorage.setItem("kiosk_hospital_name",t.name)),f.hospitalId=e==="ALL"?null:e,f.hospitalName=t.name,window.location.reload())}const y={IMMEDIATE:{color:"#ff4444",icon:"🚨",priority:0},TIME_CRITICAL:{color:"#ff8800",icon:"⏰",priority:1},URGENT:{color:"#ffcc00",icon:"⚠️",priority:2},STANDARD:{color:"#4a90e2",icon:"🏥",priority:3}},z=Object.freeze(Object.defineProperty({__proto__:null,AVAILABLE_HOSPITALS:R,KIOSK_CONFIG:f,URGENCY_CONFIG:y,setHospital:K},Symbol.toStringTag,{value:"Module"})),h={NEW_CASE_VIEWED_DELAY_MS:2e3,ALERT_BEEP_DURATION_SEC:.5,ALERT_BEEP_FREQUENCY_HZ:880,ALERT_BEEP_VOLUME:.5,FETCH_TIMEOUT_MS:8e3,MAX_RETRY_ATTEMPTS:3,RETRY_DELAYS_MS:[2e3,4e3,8e3],CASE_STALE_THRESHOLD_MINUTES:30};function C(e){return e>70?"#ff4444":e>50?"#ff8800":e>30?"#ffcc00":"#4a90e2"}function W(e){return e>70?"Very High Risk":e>50?"High Risk":e>30?"Moderate Risk":"Low Risk"}function A(e){try{const t=new Date(e);if(isNaN(t.getTime()))throw new Error("Invalid date");return t.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}catch(t){return console.warn("[Utils] Invalid time:",e,t),"Invalid time"}}function G(e){return e.updatedAt?e.updatedAt:e.receivedAt?e.receivedAt:e.tracking?.lastUpdated?e.tracking.lastUpdated:e.createdAt||new Date}function j(e){const t=new Date,i=e instanceof Date?e:new Date(e);if(isNaN(i.getTime()))return"Unknown";const n=Math.max(0,Math.floor((t-i)/1e3));if(n<60)return`${n}s ago`;const s=Math.floor(n/60);return s<60?`${s}m ago`:`${Math.floor(s/60)}h ${s%60}m ago`}function Y(e){if(e==null||e==="?")return"?";const t=typeof e=="string"?parseFloat(e):e;return isNaN(t)?"?":t<=0?"Arrived":t<1?"< 1":Math.round(t).toString()}function q(e,t=5){if(!e)return!0;try{const i=new Date(e);return isNaN(i.getTime())?!0:(new Date-i)/(1e3*60)>t}catch{return!0}}function X(e,t=h.CASE_STALE_THRESHOLD_MINUTES){if(!e)return!1;try{const i=e instanceof Date?e:new Date(e);return isNaN(i.getTime())?!1:(new Date-i)/(1e3*60)>t}catch{return!1}}function Z(e){return!(!e||typeof e!="object"||!e.id||typeof e.id!="string")}function J(e){if(typeof AbortSignal<"u"&&AbortSignal.timeout)return AbortSignal.timeout(e);const t=new AbortController,i=setTimeout(()=>{t.abort(new Error(`Timeout after ${e}ms`))},e);return t.signal.addEventListener("abort",()=>{clearTimeout(i)},{once:!0}),t.signal}function Q(e){return new Promise(t=>setTimeout(t,e))}const ee={age_years:"Alter / Age",age:"Alter / Age",systolic_bp:"Systolischer Blutdruck / Systolic BP",diastolic_bp:"Diastolischer Blutdruck / Diastolic BP",systolic_blood_pressure:"Systolischer Blutdruck / Systolic BP",diastolic_blood_pressure:"Diastolischer Blutdruck / Diastolic BP",blood_pressure_systolic:"Systolischer Blutdruck / Systolic BP",blood_pressure_diastolic:"Diastolischer Blutdruck / Diastolic BP",gfap_value:"GFAP-Wert / GFAP Level",gfap:"GFAP-Wert / GFAP Level",gfap_level:"GFAP-Wert / GFAP Level",fast_ed_score:"FAST-ED Score",fast_ed:"FAST-ED Score",fast_ed_total:"FAST-ED Score",nihss:"NIHSS Score",nihss_score:"NIHSS Score",vigilanzminderung:"Vigilanzminderung / Reduced Consciousness",vigilance_reduction:"Vigilanzminderung / Reduced Consciousness",reduced_consciousness:"Vigilanzminderung / Reduced Consciousness",armparese:"Armparese / Arm Weakness",arm_paresis:"Armparese / Arm Weakness",arm_weakness:"Armparese / Arm Weakness",beinparese:"Beinparese / Leg Weakness",leg_paresis:"Beinparese / Leg Weakness",leg_weakness:"Beinparese / Leg Weakness",eye_deviation:"Blickdeviation / Eye Deviation",blickdeviation:"Blickdeviation / Eye Deviation",headache:"Kopfschmerzen / Headache",kopfschmerzen:"Kopfschmerzen / Headache",nausea:"Übelkeit / Nausea",vomiting:"Erbrechen / Vomiting",aphasia:"Aphasie / Aphasia",dysarthria:"Dysarthrie / Dysarthria",ataxia:"Ataxie / Ataxia",facial_paresis:"Gesichtsparese / Facial Weakness",atrial_fibrillation:"Vorhofflimmern / Atrial Fibrillation",vorhofflimmern:"Vorhofflimmern / Atrial Fibrillation",anticoagulated_noak:"Antikoagulation (NOAK) / Anticoagulation (NOAC)",anticoagulation:"Antikoagulation / Anticoagulation",antiplatelets:"Thrombozytenaggregationshemmer / Antiplatelets",thrombozytenaggregationshemmer:"Thrombozytenaggregationshemmer / Antiplatelets",diabetes:"Diabetes Mellitus",hypertension:"Arterielle Hypertonie / Hypertension",prior_stroke:"Schlaganfall (Anamnese) / Prior Stroke",prior_tia:"TIA (Anamnese) / Prior TIA",symptom_onset:"Symptombeginn / Symptom Onset",onset_time:"Symptombeginn / Symptom Onset",time_since_onset:"Zeit seit Symptombeginn / Time Since Onset"},te=[{pattern:/_score$/i,replacement:" Score"},{pattern:/_value$/i,replacement:" Wert"},{pattern:/_bp$/i,replacement:" Blutdruck"},{pattern:/_years?$/i,replacement:""},{pattern:/^ich_/i,replacement:"ICH "},{pattern:/^lvo_/i,replacement:"LVO "},{pattern:/parese$/i,replacement:"parese / Weakness"},{pattern:/deviation$/i,replacement:"deviation / Deviation"}];function x(e){if(!e)return"";const t=ee[e.toLowerCase()];if(t)return t;let i=e;return te.forEach(({pattern:n,replacement:s})=>{i=i.replace(n,s)}),i=i.replace(/_/g," ").replace(/\b\w/g,n=>n.toUpperCase()).trim(),i}function B(e){return x(e).replace(/\s*\([^)]*\)\s*/g,"").trim()}function P(e,t=""){if(e==null||e==="")return"—";if(typeof e=="boolean")return e?"✓ Ja / Yes":"✗ Nein / No";if(typeof e=="number"){const i=t.toLowerCase();return i.includes("bp")||i.includes("blood_pressure")?`${e} mmHg`:i.includes("gfap")?`${e} pg/mL`:i.includes("age")?`${e} Jahre / years`:i.includes("score")?e.toString():i.includes("time")||i.includes("duration")?`${e} min`:Number.isInteger(e)?e.toString():e.toFixed(1)}return e.toString()}class ie{constructor(){this.baseUrl=f.caseSharingUrl,this.pollInterval=f.pollInterval,this.intervalId=null,this.cases=new Map,this.onUpdate=null,this.onError=null,this.lastFetchTime=null,this.isConnected=!1,this.retryCount=0}start(t,i){this.onUpdate=t,this.onError=i,this.fetchCases(),this.intervalId=setInterval(()=>{this.fetchCases()},this.pollInterval),console.log("[CaseListener] Started polling every",this.pollInterval,"ms")}stop(){this.intervalId&&(clearInterval(this.intervalId),this.intervalId=null,console.log("[CaseListener] Stopped polling"))}async fetchCases(){let t=null;for(let i=0;i<=h.MAX_RETRY_ATTEMPTS;i++)try{const n=this.buildFetchUrl(),s=await fetch(n,{method:"GET",headers:{Accept:"application/json"},signal:J(h.FETCH_TIMEOUT_MS)});if(!s.ok)throw new Error(`HTTP ${s.status}: ${s.statusText}`);const r=await s.json();if(!r.success)throw new Error(r.error||"Failed to fetch cases");this.retryCount=0,this.isConnected=!0,this.lastFetchTime=new Date,this.processCases(r.cases||[]),this.onUpdate&&this.onUpdate({cases:Array.from(this.cases.values()),timestamp:r.timestamp,count:r.count});return}catch(n){if(t=n,console.error(`[CaseListener] Fetch error (attempt ${i+1}/${h.MAX_RETRY_ATTEMPTS+1}):`,n),i<h.MAX_RETRY_ATTEMPTS){const s=h.RETRY_DELAYS_MS[i]||8e3;console.log(`[CaseListener] Retrying in ${s}ms...`),await Q(s)}}console.error("[CaseListener] All retry attempts failed:",t),this.isConnected=!1,this.retryCount++,this.onError&&this.onError(t)}buildFetchUrl(){let t=`${this.baseUrl}/get-cases`;const i=new URLSearchParams;f.hospitalId&&i.append("hospitalId",f.hospitalId),i.append("status","in_transit");const n=i.toString();return n&&(t+=`?${n}`),t}processCases(t){const i=new Set(this.cases.keys()),n=new Set;t.forEach(s=>{if(!Z(s)){console.warn("[CaseListener] Invalid case data, skipping:",s);return}const r=s.id;n.add(r);const a=!this.cases.has(r),o=q(s.tracking?.lastUpdated,f.staleGpsMinutes),c={...s.tracking||{},gpsStale:o};this.cases.set(r,{...s,tracking:c,isNew:a,receivedAt:a?new Date:this.cases.get(r).receivedAt}),a&&(console.log("[CaseListener] New case:",r,this.getCaseSummary(s)),console.log("[CaseListener] Timestamps:",{createdAt:s.createdAt,updatedAt:s.updatedAt,receivedAt:s.receivedAt,trackingLastUpdated:s.tracking?.lastUpdated}))}),i.forEach(s=>{n.has(s)||(console.log("[CaseListener] Case removed:",s),this.cases.delete(s))})}getCaseSummary(t){const i=Math.round((t.results?.ich?.probability||0)*100),n=t.tracking?.duration||"?";return{module:t.moduleType,ich:`${i}%`,eta:`${n} min`,urgency:t.urgency}}getCases(){return Array.from(this.cases.values())}getCase(t){return this.cases.get(t)}markViewed(t){const i=this.cases.get(t);i&&(i.isNew=!1,this.cases.set(t,i))}getStatus(){return{isConnected:this.isConnected,lastFetchTime:this.lastFetchTime,caseCount:this.cases.size,isPolling:this.intervalId!==null}}}const p=new ie;function se(e){const t=document.getElementById("casesContainer");if(!t)return;if(!e||e.length===0){t.innerHTML=`
      <div class="no-cases-state">
        <div class="no-cases-icon">✓</div>
        <h2>Keine aktiven Fälle / No Active Cases</h2>
        <p>Das System ist aktiv und überwacht eingehende Fälle</p>
        <p>System is active and monitoring incoming cases</p>
      </div>
    `;return}const i=ne(e),s=i.slice(0,f.maxCasesDisplay).map(a=>re(a)).join(""),r=i.length>f.maxCasesDisplay?`<div class="truncated-warning" role="alert">
         Showing ${f.maxCasesDisplay} of ${i.length} cases
       </div>`:"";t.innerHTML=`
    ${r}
    <div class="cases-grid" role="list" aria-label="Active cases">
      ${s}
    </div>
  `}function ne(e){return[...e].sort((t,i)=>{const n=y[t.urgency]?.priority??10,s=y[i.urgency]?.priority??10;if(n!==s)return n-s;const r=t.tracking?.duration||9999,a=i.tracking?.duration||9999;return r-a})}function re(e){const t=y[e.urgency]||y.STANDARD,i=Math.round((e.results?.ich?.probability||0)*100),n=e.results?.lvo?Math.round(e.results.lvo.probability*100):null,s=Y(e.tracking?.duration),r=e.tracking?.distance||"?",a=e.tracking?.gpsStale||!1,o=G(e),c=X(o),u=j(o),l=`${e.urgency} case, ${e.ambulanceId}, ICH risk ${i}%, ETA ${s} minutes`;return`
    <div class="case-card ${e.urgency.toLowerCase()} ${e.isNew?"new-case":""} ${c?"stale-case":""}"
         data-case-id="${e.id}"
         style="border-color: ${t.color}"
         role="listitem"
         tabindex="0"
         aria-label="${l}">

      <div class="case-header">
        <div class="urgency-badge" style="background: ${t.color}">
          ${t.icon} ${e.urgency}
        </div>
        <div class="case-meta">
          <span class="ambulance-id">${e.ambulanceId}</span>
          <span class="module-type">${e.moduleType}</span>
        </div>
      </div>

      <div class="case-risks">
        <div class="risk-circle-container">
          <div class="risk-circle ${i>70?"critical":i>50?"high":"medium"}"
               style="background: conic-gradient(${C(i)} ${i}%, rgba(255,255,255,0.1) 0%)">
            <div class="risk-value">${i}%</div>
          </div>
          <div class="risk-label">ICH</div>
        </div>

        ${n!==null?`
          <div class="risk-circle-container">
            <div class="risk-circle ${n>50?"high":"medium"}"
                 style="background: conic-gradient(${C(n)} ${n}%, rgba(255,255,255,0.1) 0%)">
              <div class="risk-value">${n}%</div>
            </div>
            <div class="risk-label">LVO</div>
          </div>
        `:""}
      </div>

      <div class="case-eta">
        <div class="eta-main ${a?"stale":""}">
          <span class="eta-value">${s}</span>
          <span class="eta-unit">${s==="Arrived"||s==="?"?"":"min"}</span>
        </div>
        <div class="eta-details">
          <span class="distance">${typeof r=="number"?r.toFixed(1):r} km</span>
          ${a?'<span class="gps-stale-warning" role="alert">⚠️ GPS stale</span>':""}
        </div>
      </div>

      <div class="case-footer">
        <span class="case-time">${u}</span>
        <span class="view-details">View Details →</span>
      </div>
    </div>
  `}function S(e){return e>70?"critical":e>50?"high":"normal"}function _(e){const t=document.getElementById("caseDetailModal");if(!t)return;const i=t.querySelector(".modal-content");i&&(i.innerHTML=ae(e),t.style.display="flex")}function ae(e){const{results:t,formData:i,moduleType:n,ambulanceId:s,tracking:r,urgency:a,createdAt:o,updatedAt:c}=e,u=Math.round((t?.ich?.probability||0)*100),l=t?.lvo?Math.round(t.lvo.probability*100):null,d=S(u),v=l?S(l):"normal";let k=1;l!==null&&l>0&&k++;const H=k===1?"risk-results-single":"risk-results-dual";return`
    <div class="case-detail-container">
      <div class="detail-header">
        <div class="header-left">
          <h2 id="modalTitle">🩺 Detaillierte Fallanalyse / Case Details</h2>
          <div class="case-badges">
            <span class="badge urgency-badge" style="background: ${le(a)}">${a}</span>
            <span class="badge module-badge">${n}</span>
            <span class="badge ambulance-badge">🚑 ${s}</span>
          </div>
        </div>
        <button class="close-modal" aria-label="Close modal">✕</button>
      </div>

      <div class="detail-content">
        <!-- Enhanced Risk Assessment Cards -->
        <div class="content-section">
          <h3>🎯 Risikobewertung / Risk Assessment</h3>
          <div class="${H}">
            ${$("ich",u,d,t,i)}
            ${l!==null?$("lvo",l,v,t,i):""}
          </div>
        </div>

        <!-- Entscheidungshilfe Speedometer (shown if meaningful signal) -->
        ${ve(u,l)}

        <!-- Enhanced Drivers Section -->
        ${oe(t)}

        <!-- Tracking Information -->
        <div class="content-section">
          <h3>📍 Standort & Ankunftszeit / Tracking Information</h3>
          <div class="tracking-grid">
            <div class="tracking-item">
              <div class="tracking-label">ETA</div>
              <div class="tracking-value">${r?.duration||"?"} min</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Entfernung / Distance</div>
              <div class="tracking-value">${r?.distance?r.distance.toFixed(1):"?"} km</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Letzte Aktualisierung / Last Update</div>
              <div class="tracking-value">${r?.lastUpdated?A(r.lastUpdated):"Unknown"}</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Voraussichtliche Ankunft / Estimated Arrival</div>
              <div class="tracking-value">${r?.estimatedArrival?A(r.estimatedArrival):"Unknown"}</div>
            </div>
          </div>
        </div>

        <!-- Assessment Data -->
        <div class="content-section">
          <h3>📋 Bewertungsdaten / Assessment Data</h3>
          <div class="data-table">
            ${ce(i)}
          </div>
        </div>
      </div>

      <div class="detail-footer">
        <div class="footer-meta">
          <span class="timestamp">Empfangen / Received: ${A(o||new Date)}</span>
        </div>
        <button class="close-modal secondary-button">Schließen / Close</button>
      </div>
    </div>
  `}function $(e,t,i,n,s=null){const r={ich:"🩸",lvo:"🧠"},a={ich:"ICH Risiko / ICH Risk",lvo:"LVO Risiko / LVO Risk"},o=i==="critical"?"#ff4444":i==="high"?"#ff8800":"#0066cc",c=W(t),u=Math.PI*100,l=u*(1-t/100),d=e==="ich"&&s?pe(s):"";return`
    <div class="enhanced-risk-card ${e} ${i}">
      <div class="risk-header">
        <div class="risk-icon">${r[e]}</div>
        <div class="risk-title">
          <h3>${a[e]}</h3>
          <span class="risk-module">${e==="ich"?"Blutungsrisiko":"Verschlussrisiko"}</span>
        </div>
      </div>

      <div class="risk-probability">
        <div class="circles-container">
          <div class="rings-row">
            <div class="circle-item">
              <div class="probability-circle">
                <svg viewBox="0 0 120 120" width="120" height="120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="8"/>
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke="${o}"
                    stroke-width="10"
                    stroke-dasharray="${u}"
                    stroke-dashoffset="${l}"
                    stroke-linecap="round"
                    transform="rotate(-90 60 60)"
                    class="probability-progress"/>
                  <text x="60" y="70"
                    text-anchor="middle"
                    font-family="system-ui, -apple-system, sans-serif"
                    font-size="32"
                    font-weight="bold"
                    fill="#ffffff">
                    ${t}%
                  </text>
                </svg>
              </div>
              <div class="circle-label">${e.toUpperCase()} Wahrscheinlichkeit</div>
            </div>
            ${d}
          </div>
          <div class="risk-level ${i}">${c}</div>
        </div>
      </div>
    </div>
  `}function oe(e){if(!e?.ich?.drivers&&!e?.lvo?.drivers)return"";let t=`
    <div class="content-section">
      <h3>🎯 Risikofaktoren / Risk Factors</h3>
      <div class="enhanced-drivers-grid">
  `;return e?.ich?.drivers&&(t+=T(e.ich.drivers,"ICH","ich",e.ich.probability)),e?.lvo?.drivers&&e.lvo.probability>0&&(t+=T(e.lvo.drivers,"LVO","lvo",e.lvo.probability)),t+=`
      </div>
    </div>
  `,t}function T(e,t,i,n){if(!e||!e.positive&&!e.negative)return"";const s=(e.positive||[]).slice(0,5),r=(e.negative||[]).slice(0,5),a=[...s,...r].map(l=>Math.abs(l.weight)),o=Math.max(...a,.01),c=s.reduce((l,d)=>l+Math.abs(d.weight),0),u=r.reduce((l,d)=>l+Math.abs(d.weight),0);return`
    <div class="enhanced-drivers-panel ${i}">
      <div class="panel-header">
        <div class="panel-icon ${i}">${i==="ich"?"🩸":"🧠"}</div>
        <div class="panel-title">
          <h4>${t} Faktoren / Factors</h4>
          <span class="panel-subtitle">Beitrag zum Gesamtrisiko / Contributing to overall risk</span>
        </div>
      </div>

      <div class="drivers-split-view">
        <div class="drivers-column positive-column">
          <div class="column-header">
            <span class="column-icon">⬆</span>
            <span class="column-title">Risiko erhöhend / Increasing Risk</span>
          </div>
          <div class="compact-drivers">
            ${s.length>0?s.map(l=>{const d=c>0?Math.abs(l.weight)/c*100:0,v=Math.abs(l.weight)/o*100;return L(l,"positive",d,v)}).join(""):'<div class="no-factors">Keine Faktoren / No factors</div>'}
          </div>
        </div>

        <div class="drivers-column negative-column">
          <div class="column-header">
            <span class="column-icon">⬇</span>
            <span class="column-title">Risiko mindernd / Decreasing Risk</span>
          </div>
          <div class="compact-drivers">
            ${r.length>0?r.map(l=>{const d=u>0?Math.abs(l.weight)/u*100:0,v=Math.abs(l.weight)/o*100;return L(l,"negative",d,v)}).join(""):'<div class="no-factors">Keine Faktoren / No factors</div>'}
          </div>
        </div>
      </div>
    </div>
  `}function L(e,t,i,n){return`
    <div class="compact-driver-item">
      <div class="compact-driver-label">${x(e.label)}</div>
      <div class="compact-driver-bar ${t}" style="width: ${n}%">
        <span class="compact-driver-value">${t==="positive"?"+":"-"}${i.toFixed(0)}%</span>
      </div>
    </div>
  `}function le(e){return{IMMEDIATE:"#ff4444",TIME_CRITICAL:"#ff8800",URGENT:"#ffcc00",STANDARD:"#4a90e2"}[e]||"#4a90e2"}function ce(e){return!e||Object.keys(e).length===0?'<p class="no-data">Keine Bewertungsdaten verfügbar / No assessment data available</p>':typeof Object.values(e)[0]=="object"&&!Array.isArray(Object.values(e)[0])&&Object.values(e)[0]!==null?de(e):ue(e)}function de(e){let t="";return Object.entries(e).forEach(([i,n])=>{if(n&&typeof n=="object"&&Object.keys(n).length>0){const s=i.charAt(0).toUpperCase()+i.slice(1)+" Modul / Module";let r="";Object.entries(n).forEach(([a,o])=>{if(o===""||o===null||o===void 0)return;const c=B(a),u=P(o,a);r+=`
          <div class="summary-item">
            <span class="summary-label">${c}:</span>
            <span class="summary-value">${u}</span>
          </div>
        `}),r&&(t+=`
          <div class="summary-module">
            <h4 class="module-title">${s}</h4>
            <div class="summary-items">
              ${r}
            </div>
          </div>
        `)}}),t||'<p class="no-data">Keine Bewertungsdaten verfügbar / No assessment data available</p>'}function ue(e){let t="";return Object.entries(e).forEach(([i,n])=>{if(n===""||n===null||n===void 0||i.startsWith("_"))return;const s=B(i),r=P(n,i);t+=`
      <div class="summary-item">
        <span class="summary-label">${s}:</span>
        <span class="summary-value">${r}</span>
      </div>
    `}),t?`
    <div class="summary-module">
      <div class="summary-items">
        ${t}
      </div>
    </div>
  `:'<p class="no-data">Keine Bewertungsdaten verfügbar / No assessment data available</p>'}function fe(e){if(!e)return 0;for(const t of["coma","limited","full"]){if(e[t]?.gfap_value)return parseFloat(e[t].gfap_value);if(e[t]?.gfap)return parseFloat(e[t].gfap)}return e.gfap_value?parseFloat(e.gfap_value):e.gfap?parseFloat(e.gfap):0}function me(e){if(!e||e<=0)return 0;const t=Math.log10(e),i=Math.pow(10,(t-1.5)*1.2);return Math.max(0,Math.min(150,i))}function he(e){return e>=30?"#ff4444":e>=15?"#ff8800":e>=5?"#ffcc00":"#0066cc"}function pe(e){const t=fe(e);if(!t||t<=0)return"";const i=me(t),n=he(i),s=Math.min(i/100*100,100),r=Math.PI*100,a=r*(1-s/100),o=i<1?"<1":i.toFixed(1);return`
    <div class="circle-item">
      <div class="probability-circle">
        <svg viewBox="0 0 120 120" width="120" height="120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="8"/>
          <circle cx="60" cy="60" r="50" fill="none"
            stroke="${n}"
            stroke-width="10"
            stroke-dasharray="${r}"
            stroke-dashoffset="${a}"
            stroke-linecap="round"
            transform="rotate(-90 60 60)"
            class="probability-progress volume-ring"/>
          <text x="60" y="60"
            text-anchor="middle"
            font-family="system-ui, -apple-system, sans-serif"
            font-size="24"
            font-weight="bold"
            fill="#ffffff">
            ${o}
          </text>
          <text x="60" y="78"
            text-anchor="middle"
            font-family="system-ui, -apple-system, sans-serif"
            font-size="14"
            fill="rgba(255,255,255,0.7)">
            ml
          </text>
        </svg>
      </div>
      <div class="circle-label">Blutungsvolumen / Bleed Volume</div>
      <div class="volume-note">Geschätzt von GFAP / Estimated from GFAP</div>
    </div>
  `}function ve(e,t){if(!t||t<20||e<20)return"";const i=t/Math.max(e,1),n=Math.abs(t-e);if(n<15)return"";let s=0;i<.5?s=-75:i<.8?s=-45:i<1.2?s=0:i<2?s=45:s=75;const r=i<.8?"ICH wahrscheinlicher / ICH more likely":i>1.2?"LVO wahrscheinlicher / LVO more likely":"Unsicher - beide möglich / Uncertain - both possible",a=n>30?"Hoch / High":n>20?"Mittel / Medium":"Niedrig / Low";return`
    <div class="content-section entscheidungshilfe-section">
      <h3>🎯 Entscheidungshilfe / Decision Support</h3>
      <div class="speedometer-card">
        <div class="speedometer-gauge">
          <svg viewBox="0 0 200 120" width="300" height="180">
            <!-- Arc background -->
            <path d="M 30 100 A 70 70 0 0 1 170 100" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="20" stroke-linecap="round"/>

            <!-- ICH zone (red) -->
            <path d="M 30 100 A 70 70 0 0 1 80 45" fill="none" stroke="#ff4444" stroke-width="20" stroke-linecap="round" opacity="0.6"/>

            <!-- Uncertain zone (yellow) -->
            <path d="M 80 45 A 70 70 0 0 1 120 45" fill="none" stroke="#ffcc00" stroke-width="20" stroke-linecap="round" opacity="0.6"/>

            <!-- LVO zone (blue) -->
            <path d="M 120 45 A 70 70 0 0 1 170 100" fill="none" stroke="#0066cc" stroke-width="20" stroke-linecap="round" opacity="0.6"/>

            <!-- Needle -->
            <line x1="100" y1="100" x2="100" y2="40"
                  stroke="#ffffff" stroke-width="3" stroke-linecap="round"
                  transform="rotate(${s} 100 100)"/>
            <circle cx="100" cy="100" r="6" fill="#ffffff"/>

            <!-- Labels -->
            <text x="40" y="115" font-size="12" fill="#ff4444" font-weight="bold">ICH</text>
            <text x="150" y="115" font-size="12" fill="#0066cc" font-weight="bold">LVO</text>
          </svg>
        </div>

        <div class="speedometer-info">
          <div class="recommendation">${r}</div>
          <div class="speedometer-metrics">
            <div class="metric">
              <span class="metric-label">LVO/ICH Verhältnis / Ratio:</span>
              <span class="metric-value">${i.toFixed(2)}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Differenz / Difference:</span>
              <span class="metric-value">${n.toFixed(0)}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Konfidenz / Confidence:</span>
              <span class="metric-value">${a}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}let g=[],m=null,b=null,E=!0;async function I(){console.log("[Kiosk] Initializing...",f),be(),M(),b=setInterval(M,1e3),Ee(),p.start(e=>ye(e),e=>ke(e)),Ce(),window.addEventListener("beforeunload",ge),console.log("[Kiosk] Initialized successfully")}function ge(){console.log("[Kiosk] Cleaning up resources..."),p.stop(),b&&(clearInterval(b),b=null),m&&m.state!=="closed"&&m.close().catch(e=>{console.warn("[Kiosk] Error closing audio context:",e)})}function ye(e){const t=g.length;g=e.cases||[],console.log("[Kiosk] Cases updated:",{count:g.length,previous:t}),se(g),Ae(e);const i=g.filter(n=>n.isNew);i.length>0&&!E&&(U(),we(),setTimeout(()=>{i.forEach(n=>p.markViewed(n.id))},h.NEW_CASE_VIEWED_DELAY_MS)),E&&(E=!1),F(!0)}function ke(e){if(console.error("[Kiosk] Error:",e),F(!1),g.length===0){const t=document.getElementById("casesContainer");t&&(t.innerHTML=`
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h2>Verbindungsfehler / Connection Error</h2>
          <p>${e.message||"Unable to connect to case monitoring system"}</p>
          <p class="error-hint">Checking again in ${f.pollInterval/1e3} seconds...</p>
        </div>
      `)}}function be(){const e=document.getElementById("hospitalSelector");e&&D(async()=>{const{AVAILABLE_HOSPITALS:t,setHospital:i}=await Promise.resolve().then(()=>z);return{AVAILABLE_HOSPITALS:t,setHospital:i}},void 0).then(({AVAILABLE_HOSPITALS:t,setHospital:i})=>{e.innerHTML=t.map(n=>{const s=n.id==="ALL"&&f.hospitalId===null||n.id===f.hospitalId;return`<option value="${n.id}" ${s?"selected":""}>${n.name}</option>`}).join(""),e.addEventListener("change",n=>{const s=n.target.value;confirm(`Switch to ${n.target.options[n.target.selectedIndex].text}?

This will reload the page.`)?i(s):e.value=f.hospitalId===null?"ALL":f.hospitalId})})}function Ae(e){const t=document.getElementById("caseCount");if(t){const i=e.count||0;t.textContent=`${i} ${i===1?"Case":"Cases"}`,t.className=`case-count-badge ${i>0?"has-cases":""}`}}function F(e){const t=document.getElementById("connectionStatus");t&&(t.className=`status-indicator ${e?"connected":"disconnected"}`,t.title=e?"Connected":"Disconnected",t.setAttribute("aria-label",`Connection status: ${e?"connected":"disconnected"}`))}function M(){const e=document.getElementById("currentTime");if(e){const t=new Date;e.textContent=t.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}}function Ee(){document.addEventListener("click",()=>{m||(m=new(window.AudioContext||window.webkitAudioContext),console.log("[Kiosk] Audio initialized"))},{once:!0})}async function U(){if(m)try{m.state==="suspended"&&(await m.resume(),console.log("[Kiosk] Audio context resumed"));const e=m.createOscillator(),t=m.createGain();e.connect(t),t.connect(m.destination),e.frequency.value=h.ALERT_BEEP_FREQUENCY_HZ,e.type="sine",t.gain.setValueAtTime(h.ALERT_BEEP_VOLUME,m.currentTime),t.gain.exponentialRampToValueAtTime(.01,m.currentTime+h.ALERT_BEEP_DURATION_SEC),e.start(m.currentTime),e.stop(m.currentTime+h.ALERT_BEEP_DURATION_SEC),console.log("[Kiosk] Alert sound played")}catch(e){console.warn("[Kiosk] Audio playback failed:",e)}}function we(){document.body.classList.add("flash-alert"),setTimeout(()=>{document.body.classList.remove("flash-alert")},1e3)}function Ce(){document.addEventListener("click",e=>{const t=e.target.closest(".case-card");if(t){const i=t.dataset.caseId;if(i){const n=p.getCase(i);n&&(_(n),p.markViewed(i))}}(e.target.classList.contains("modal-overlay")||e.target.classList.contains("close-modal"))&&N()}),document.addEventListener("keydown",e=>{if(e.key==="Escape"){N();return}if(e.key==="Enter"||e.key===" "){const t=e.target.closest(".case-card");if(t){e.preventDefault();const i=t.dataset.caseId;if(i){const n=p.getCase(i);n&&(_(n),p.markViewed(i))}}}}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(console.log("[Kiosk] Tab visible - fetching latest cases"),p.fetchCases())})}function N(){const e=document.getElementById("caseDetailModal");e&&(e.style.display="none",e.querySelector(".modal-content").innerHTML="")}window.addEventListener("error",e=>{console.error("[Kiosk] Unhandled error:",e.error)});window.addEventListener("unhandledrejection",e=>{console.error("[Kiosk] Unhandled rejection:",e.reason)});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",I):I();window.kioskApp={getCases:()=>g,getStatus:()=>p.getStatus(),refresh:()=>p.fetchCases(),playAlert:()=>U()};
//# sourceMappingURL=index-8Vr71J35.js.map
