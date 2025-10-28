(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function i(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(s){if(s.ep)return;s.ep=!0;const a=i(s);fetch(s.href,a)}})();const H="modulepreload",O=function(e){return"/kiosk/"+e},C={},x=function(t,i,n){let s=Promise.resolve();if(i&&i.length>0){document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),c=r?.nonce||r?.getAttribute("nonce");s=Promise.allSettled(i.map(l=>{if(l=O(l),l in C)return;C[l]=!0;const h=l.endsWith(".css"),o=h?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${o}`))return;const d=document.createElement("link");if(d.rel=h?"stylesheet":H,h||(d.as="script"),d.crossOrigin="",d.href=l,c&&d.setAttribute("nonce",c),document.head.appendChild(d),h)return new Promise((g,E)=>{d.addEventListener("load",g),d.addEventListener("error",()=>E(new Error(`Unable to preload CSS for ${l}`)))})}))}function a(r){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=r,window.dispatchEvent(c),!c.defaultPrevented)throw r}return s.then(r=>{for(const c of r||[])c.status==="rejected"&&a(c.reason);return t().catch(a)})},u={caseSharingUrl:"https://case-sharing-564499947017.europe-west3.run.app",pollInterval:5e3,autoArchiveHours:2,staleGpsMinutes:5,hospitalId:(()=>{const e=localStorage.getItem("kiosk_hospital_id");return e===null?"BY-NS-001":e===""?null:e})(),hospitalName:localStorage.getItem("kiosk_hospital_name")||"LMU Klinikum München - Großhadern",googleMapsApiKey:"AIzaSyACBndIj8HD1wwZ4Vw8PDDI0bIe6DoBExI",playAudioAlert:!0,audioAlertVolume:.5,showArchivedCases:!1,maxCasesDisplay:20,theme:"dark"},N=[{id:"BY-NS-001",name:"LMU Klinikum München - Großhadern"},{id:"BY-NS-002",name:"Klinikum Rechts der Isar"},{id:"BY-NS-003",name:"Helios Klinikum München West"},{id:"BY-NS-004",name:"Klinikum Bogenhausen"},{id:"BW-NS-001",name:"Universitätsklinikum Tübingen"},{id:"BW-NS-005",name:"Klinikum Stuttgart - Katharinenhospital"},{id:"BW-NS-003",name:"Universitätsklinikum Freiburg"},{id:"ALL",name:"🌐 All Hospitals (Show All Cases)"}];function F(e){const t=N.find(i=>i.id===e);t&&(e==="ALL"?(localStorage.setItem("kiosk_hospital_id",""),localStorage.setItem("kiosk_hospital_name",t.name)):(localStorage.setItem("kiosk_hospital_id",e),localStorage.setItem("kiosk_hospital_name",t.name)),u.hospitalId=e==="ALL"?null:e,u.hospitalName=t.name,window.location.reload())}const k={IMMEDIATE:{color:"#ff4444",icon:"🚨",priority:0},TIME_CRITICAL:{color:"#ff8800",icon:"⏰",priority:1},URGENT:{color:"#ffcc00",icon:"⚠️",priority:2},STANDARD:{color:"#4a90e2",icon:"🏥",priority:3}},K=Object.freeze(Object.defineProperty({__proto__:null,AVAILABLE_HOSPITALS:N,KIOSK_CONFIG:u,URGENCY_CONFIG:k,setHospital:F},Symbol.toStringTag,{value:"Module"})),f={NEW_CASE_VIEWED_DELAY_MS:2e3,ALERT_BEEP_DURATION_SEC:.5,ALERT_BEEP_FREQUENCY_HZ:880,ALERT_BEEP_VOLUME:.5,FETCH_TIMEOUT_MS:8e3,MAX_RETRY_ATTEMPTS:3,RETRY_DELAYS_MS:[2e3,4e3,8e3],CASE_STALE_THRESHOLD_MINUTES:30};function w(e){return e>70?"#ff4444":e>50?"#ff8800":e>30?"#ffcc00":"#4a90e2"}function V(e){return e>70?"Very High Risk":e>50?"High Risk":e>30?"Moderate Risk":"Low Risk"}function b(e){try{const t=new Date(e);if(isNaN(t.getTime()))throw new Error("Invalid date");return t.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}catch(t){return console.warn("[Utils] Invalid time:",e,t),"Invalid time"}}function Y(e){return e.updatedAt?e.updatedAt:e.receivedAt?e.receivedAt:e.tracking?.lastUpdated?e.tracking.lastUpdated:e.createdAt||new Date}function W(e){const t=new Date,i=e instanceof Date?e:new Date(e);if(isNaN(i.getTime()))return"Unknown";const n=Math.max(0,Math.floor((t-i)/1e3));if(n<60)return`${n}s ago`;const s=Math.floor(n/60);return s<60?`${s}m ago`:`${Math.floor(s/60)}h ${s%60}m ago`}function U(e){return e.replace(/_/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function j(e){if(e==null||e==="?")return"?";const t=typeof e=="string"?parseFloat(e):e;return isNaN(t)?"?":t<=0?"Arrived":t<1?"< 1":Math.round(t).toString()}function G(e,t=5){if(!e)return!0;try{const i=new Date(e);return isNaN(i.getTime())?!0:(new Date-i)/(1e3*60)>t}catch{return!0}}function z(e,t=f.CASE_STALE_THRESHOLD_MINUTES){if(!e)return!1;try{const i=e instanceof Date?e:new Date(e);return isNaN(i.getTime())?!1:(new Date-i)/(1e3*60)>t}catch{return!1}}function q(e){return!(!e||typeof e!="object"||!e.id||typeof e.id!="string")}function X(e){if(typeof AbortSignal<"u"&&AbortSignal.timeout)return AbortSignal.timeout(e);const t=new AbortController,i=setTimeout(()=>{t.abort(new Error(`Timeout after ${e}ms`))},e);return t.signal.addEventListener("abort",()=>{clearTimeout(i)},{once:!0}),t.signal}function Z(e){return new Promise(t=>setTimeout(t,e))}class Q{constructor(){this.baseUrl=u.caseSharingUrl,this.pollInterval=u.pollInterval,this.intervalId=null,this.cases=new Map,this.onUpdate=null,this.onError=null,this.lastFetchTime=null,this.isConnected=!1,this.retryCount=0}start(t,i){this.onUpdate=t,this.onError=i,this.fetchCases(),this.intervalId=setInterval(()=>{this.fetchCases()},this.pollInterval),console.log("[CaseListener] Started polling every",this.pollInterval,"ms")}stop(){this.intervalId&&(clearInterval(this.intervalId),this.intervalId=null,console.log("[CaseListener] Stopped polling"))}async fetchCases(){let t=null;for(let i=0;i<=f.MAX_RETRY_ATTEMPTS;i++)try{const n=this.buildFetchUrl(),s=await fetch(n,{method:"GET",headers:{Accept:"application/json"},signal:X(f.FETCH_TIMEOUT_MS)});if(!s.ok)throw new Error(`HTTP ${s.status}: ${s.statusText}`);const a=await s.json();if(!a.success)throw new Error(a.error||"Failed to fetch cases");this.retryCount=0,this.isConnected=!0,this.lastFetchTime=new Date,this.processCases(a.cases||[]),this.onUpdate&&this.onUpdate({cases:Array.from(this.cases.values()),timestamp:a.timestamp,count:a.count});return}catch(n){if(t=n,console.error(`[CaseListener] Fetch error (attempt ${i+1}/${f.MAX_RETRY_ATTEMPTS+1}):`,n),i<f.MAX_RETRY_ATTEMPTS){const s=f.RETRY_DELAYS_MS[i]||8e3;console.log(`[CaseListener] Retrying in ${s}ms...`),await Z(s)}}console.error("[CaseListener] All retry attempts failed:",t),this.isConnected=!1,this.retryCount++,this.onError&&this.onError(t)}buildFetchUrl(){let t=`${this.baseUrl}/get-cases`;const i=new URLSearchParams;u.hospitalId&&i.append("hospitalId",u.hospitalId),i.append("status","in_transit");const n=i.toString();return n&&(t+=`?${n}`),t}processCases(t){const i=new Set(this.cases.keys()),n=new Set;t.forEach(s=>{if(!q(s)){console.warn("[CaseListener] Invalid case data, skipping:",s);return}const a=s.id;n.add(a);const r=!this.cases.has(a),c=G(s.tracking?.lastUpdated,u.staleGpsMinutes),l={...s.tracking||{},gpsStale:c};this.cases.set(a,{...s,tracking:l,isNew:r,receivedAt:r?new Date:this.cases.get(a).receivedAt}),r&&(console.log("[CaseListener] New case:",a,this.getCaseSummary(s)),console.log("[CaseListener] Timestamps:",{createdAt:s.createdAt,updatedAt:s.updatedAt,receivedAt:s.receivedAt,trackingLastUpdated:s.tracking?.lastUpdated}))}),i.forEach(s=>{n.has(s)||(console.log("[CaseListener] Case removed:",s),this.cases.delete(s))})}getCaseSummary(t){const i=Math.round((t.results?.ich?.probability||0)*100),n=t.tracking?.duration||"?";return{module:t.moduleType,ich:`${i}%`,eta:`${n} min`,urgency:t.urgency}}getCases(){return Array.from(this.cases.values())}getCase(t){return this.cases.get(t)}markViewed(t){const i=this.cases.get(t);i&&(i.isNew=!1,this.cases.set(t,i))}getStatus(){return{isConnected:this.isConnected,lastFetchTime:this.lastFetchTime,caseCount:this.cases.size,isPolling:this.intervalId!==null}}}const m=new Q;function J(e){const t=document.getElementById("casesContainer");if(!t)return;if(!e||e.length===0){t.innerHTML=`
      <div class="no-cases-state">
        <div class="no-cases-icon">✓</div>
        <h2>Keine aktiven Fälle / No Active Cases</h2>
        <p>Das System ist aktiv und überwacht eingehende Fälle</p>
        <p>System is active and monitoring incoming cases</p>
      </div>
    `;return}const i=ee(e),s=i.slice(0,u.maxCasesDisplay).map(r=>te(r)).join(""),a=i.length>u.maxCasesDisplay?`<div class="truncated-warning" role="alert">
         Showing ${u.maxCasesDisplay} of ${i.length} cases
       </div>`:"";t.innerHTML=`
    ${a}
    <div class="cases-grid" role="list" aria-label="Active cases">
      ${s}
    </div>
  `}function ee(e){return[...e].sort((t,i)=>{const n=k[t.urgency]?.priority??10,s=k[i.urgency]?.priority??10;if(n!==s)return n-s;const a=t.tracking?.duration||9999,r=i.tracking?.duration||9999;return a-r})}function te(e){const t=k[e.urgency]||k.STANDARD,i=Math.round((e.results?.ich?.probability||0)*100),n=e.results?.lvo?Math.round(e.results.lvo.probability*100):null,s=j(e.tracking?.duration),a=e.tracking?.distance||"?",r=e.tracking?.gpsStale||!1,c=Y(e),l=z(c),h=W(c),o=`${e.urgency} case, ${e.ambulanceId}, ICH risk ${i}%, ETA ${s} minutes`;return`
    <div class="case-card ${e.urgency.toLowerCase()} ${e.isNew?"new-case":""} ${l?"stale-case":""}"
         data-case-id="${e.id}"
         style="border-color: ${t.color}"
         role="listitem"
         tabindex="0"
         aria-label="${o}">

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
               style="background: conic-gradient(${w(i)} ${i}%, rgba(255,255,255,0.1) 0%)">
            <div class="risk-value">${i}%</div>
          </div>
          <div class="risk-label">ICH</div>
        </div>

        ${n!==null?`
          <div class="risk-circle-container">
            <div class="risk-circle ${n>50?"high":"medium"}"
                 style="background: conic-gradient(${w(n)} ${n}%, rgba(255,255,255,0.1) 0%)">
              <div class="risk-value">${n}%</div>
            </div>
            <div class="risk-label">LVO</div>
          </div>
        `:""}
      </div>

      <div class="case-eta">
        <div class="eta-main ${r?"stale":""}">
          <span class="eta-value">${s}</span>
          <span class="eta-unit">${s==="Arrived"||s==="?"?"":"min"}</span>
        </div>
        <div class="eta-details">
          <span class="distance">${typeof a=="number"?a.toFixed(1):a} km</span>
          ${r?'<span class="gps-stale-warning" role="alert">⚠️ GPS stale</span>':""}
        </div>
      </div>

      <div class="case-footer">
        <span class="case-time">${h}</span>
        <span class="view-details">View Details →</span>
      </div>
    </div>
  `}function T(e){return e>70?"critical":e>50?"high":"normal"}function S(e){const t=document.getElementById("caseDetailModal");if(!t)return;const i=t.querySelector(".modal-content");i&&(i.innerHTML=ie(e),t.style.display="flex")}function ie(e){const{results:t,formData:i,moduleType:n,ambulanceId:s,tracking:a,urgency:r,createdAt:c,updatedAt:l}=e,h=Math.round((t?.ich?.probability||0)*100),o=t?.lvo?Math.round(t.lvo.probability*100):null,d=T(h),g=o?T(o):"normal";let E=1;o!==null&&o>0&&E++;const D=E===1?"risk-results-single":"risk-results-dual";return`
    <div class="case-detail-container">
      <div class="detail-header">
        <div class="header-left">
          <h2 id="modalTitle">🩺 Detaillierte Fallanalyse / Case Details</h2>
          <div class="case-badges">
            <span class="badge urgency-badge" style="background: ${ne(r)}">${r}</span>
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
          <div class="${D}">
            ${L("ich",h,d)}
            ${o!==null?L("lvo",o,g):""}
          </div>
        </div>

        <!-- Enhanced Drivers Section -->
        ${se(t)}

        <!-- Tracking Information -->
        <div class="content-section">
          <h3>📍 Standort & Ankunftszeit / Tracking Information</h3>
          <div class="tracking-grid">
            <div class="tracking-item">
              <div class="tracking-label">ETA</div>
              <div class="tracking-value">${a?.duration||"?"} min</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Entfernung / Distance</div>
              <div class="tracking-value">${a?.distance?a.distance.toFixed(1):"?"} km</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Letzte Aktualisierung / Last Update</div>
              <div class="tracking-value">${a?.lastUpdated?b(a.lastUpdated):"Unknown"}</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Voraussichtliche Ankunft / Estimated Arrival</div>
              <div class="tracking-value">${a?.estimatedArrival?b(a.estimatedArrival):"Unknown"}</div>
            </div>
          </div>
        </div>

        <!-- Assessment Data -->
        <div class="content-section">
          <h3>📋 Bewertungsdaten / Assessment Data</h3>
          <div class="data-table">
            ${ae(i)}
          </div>
        </div>
      </div>

      <div class="detail-footer">
        <div class="footer-meta">
          <span class="timestamp">Empfangen / Received: ${b(c||new Date)}</span>
        </div>
        <button class="close-modal secondary-button">Schließen / Close</button>
      </div>
    </div>
  `}function L(e,t,i,n){const s={ich:"🩸",lvo:"🧠"},a={ich:"ICH Risiko / ICH Risk",lvo:"LVO Risiko / LVO Risk"},r=i==="critical"?"#ff4444":i==="high"?"#ff8800":"#0066cc",c=V(t),l=Math.PI*100,h=l*(1-t/100);return`
    <div class="enhanced-risk-card ${e} ${i}">
      <div class="risk-header">
        <div class="risk-icon">${s[e]}</div>
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
                    stroke="${r}"
                    stroke-width="10"
                    stroke-dasharray="${l}"
                    stroke-dashoffset="${h}"
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
          </div>
          <div class="risk-level ${i}">${c}</div>
        </div>
      </div>
    </div>
  `}function se(e){if(!e?.ich?.drivers&&!e?.lvo?.drivers)return"";let t=`
    <div class="content-section">
      <h3>🎯 Risikofaktoren / Risk Factors</h3>
      <div class="enhanced-drivers-grid">
  `;return e?.ich?.drivers&&(t+=$(e.ich.drivers,"ICH","ich",e.ich.probability)),e?.lvo?.drivers&&e.lvo.probability>0&&(t+=$(e.lvo.drivers,"LVO","lvo",e.lvo.probability)),t+=`
      </div>
    </div>
  `,t}function $(e,t,i,n){if(!e||!e.positive&&!e.negative)return"";const s=(e.positive||[]).slice(0,5),a=(e.negative||[]).slice(0,5),r=[...s,...a].map(o=>Math.abs(o.weight)),c=Math.max(...r,.01),l=s.reduce((o,d)=>o+Math.abs(d.weight),0),h=a.reduce((o,d)=>o+Math.abs(d.weight),0);return`
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
            ${s.length>0?s.map(o=>{const d=l>0?Math.abs(o.weight)/l*100:0,g=Math.abs(o.weight)/c*100;return I(o,"positive",d,g)}).join(""):'<div class="no-factors">Keine Faktoren / No factors</div>'}
          </div>
        </div>

        <div class="drivers-column negative-column">
          <div class="column-header">
            <span class="column-icon">⬇</span>
            <span class="column-title">Risiko mindernd / Decreasing Risk</span>
          </div>
          <div class="compact-drivers">
            ${a.length>0?a.map(o=>{const d=h>0?Math.abs(o.weight)/h*100:0,g=Math.abs(o.weight)/c*100;return I(o,"negative",d,g)}).join(""):'<div class="no-factors">Keine Faktoren / No factors</div>'}
          </div>
        </div>
      </div>
    </div>
  `}function I(e,t,i,n){return`
    <div class="compact-driver-item">
      <div class="compact-driver-label">${U(e.label)}</div>
      <div class="compact-driver-bar ${t}" style="width: ${n}%">
        <span class="compact-driver-value">${t==="positive"?"+":"-"}${i.toFixed(0)}%</span>
      </div>
    </div>
  `}function ne(e){return{IMMEDIATE:"#ff4444",TIME_CRITICAL:"#ff8800",URGENT:"#ffcc00",STANDARD:"#4a90e2"}[e]||"#4a90e2"}function ae(e){return!e||Object.keys(e).length===0?"<p>No assessment data available</p>":Object.entries(e).filter(([t,i])=>i!=null&&i!=="").map(([t,i])=>`
      <div class="data-row">
        <div class="data-label">${U(t)}</div>
        <div class="data-value">${i}</div>
      </div>
    `).join("")}let p=[],v=null,y=null,A=!0;async function _(){console.log("[Kiosk] Initializing...",u),le(),M(),y=setInterval(M,1e3),ue(),m.start(e=>oe(e),e=>ce(e)),he(),window.addEventListener("beforeunload",re),console.log("[Kiosk] Initialized successfully")}function re(){console.log("[Kiosk] Cleaning up resources..."),m.stop(),y&&(clearInterval(y),y=null),v&&v.state!=="closed"&&v.close().catch(e=>{console.warn("[Kiosk] Error closing audio context:",e)})}function oe(e){const t=p.length;p=e.cases||[],console.log("[Kiosk] Cases updated:",{count:p.length,previous:t}),J(p),de(e);const i=p.filter(n=>n.isNew);i.length>0&&!A&&(B(),ve(),setTimeout(()=>{i.forEach(n=>m.markViewed(n.id))},f.NEW_CASE_VIEWED_DELAY_MS)),A&&(A=!1),P(!0)}function ce(e){if(console.error("[Kiosk] Error:",e),P(!1),p.length===0){const t=document.getElementById("casesContainer");t&&(t.innerHTML=`
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h2>Verbindungsfehler / Connection Error</h2>
          <p>${e.message||"Unable to connect to case monitoring system"}</p>
          <p class="error-hint">Checking again in ${u.pollInterval/1e3} seconds...</p>
        </div>
      `)}}function le(){const e=document.getElementById("hospitalSelector");e&&x(async()=>{const{AVAILABLE_HOSPITALS:t,setHospital:i}=await Promise.resolve().then(()=>K);return{AVAILABLE_HOSPITALS:t,setHospital:i}},void 0).then(({AVAILABLE_HOSPITALS:t,setHospital:i})=>{e.innerHTML=t.map(n=>{const s=n.id==="ALL"&&u.hospitalId===null||n.id===u.hospitalId;return`<option value="${n.id}" ${s?"selected":""}>${n.name}</option>`}).join(""),e.addEventListener("change",n=>{const s=n.target.value;confirm(`Switch to ${n.target.options[n.target.selectedIndex].text}?

This will reload the page.`)?i(s):e.value=u.hospitalId===null?"ALL":u.hospitalId})})}function de(e){const t=document.getElementById("caseCount");if(t){const i=e.count||0;t.textContent=`${i} ${i===1?"Case":"Cases"}`,t.className=`case-count-badge ${i>0?"has-cases":""}`}}function P(e){const t=document.getElementById("connectionStatus");t&&(t.className=`status-indicator ${e?"connected":"disconnected"}`,t.title=e?"Connected":"Disconnected",t.setAttribute("aria-label",`Connection status: ${e?"connected":"disconnected"}`))}function M(){const e=document.getElementById("currentTime");if(e){const t=new Date;e.textContent=t.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}}function ue(){document.addEventListener("click",()=>{v||(v=new(window.AudioContext||window.webkitAudioContext),console.log("[Kiosk] Audio initialized"))},{once:!0})}async function B(){if(v)try{v.state==="suspended"&&(await v.resume(),console.log("[Kiosk] Audio context resumed"));const e=v.createOscillator(),t=v.createGain();e.connect(t),t.connect(v.destination),e.frequency.value=f.ALERT_BEEP_FREQUENCY_HZ,e.type="sine",t.gain.setValueAtTime(f.ALERT_BEEP_VOLUME,v.currentTime),t.gain.exponentialRampToValueAtTime(.01,v.currentTime+f.ALERT_BEEP_DURATION_SEC),e.start(v.currentTime),e.stop(v.currentTime+f.ALERT_BEEP_DURATION_SEC),console.log("[Kiosk] Alert sound played")}catch(e){console.warn("[Kiosk] Audio playback failed:",e)}}function ve(){document.body.classList.add("flash-alert"),setTimeout(()=>{document.body.classList.remove("flash-alert")},1e3)}function he(){document.addEventListener("click",e=>{const t=e.target.closest(".case-card");if(t){const i=t.dataset.caseId;if(i){const n=m.getCase(i);n&&(S(n),m.markViewed(i))}}(e.target.classList.contains("modal-overlay")||e.target.classList.contains("close-modal"))&&R()}),document.addEventListener("keydown",e=>{if(e.key==="Escape"){R();return}if(e.key==="Enter"||e.key===" "){const t=e.target.closest(".case-card");if(t){e.preventDefault();const i=t.dataset.caseId;if(i){const n=m.getCase(i);n&&(S(n),m.markViewed(i))}}}}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(console.log("[Kiosk] Tab visible - fetching latest cases"),m.fetchCases())})}function R(){const e=document.getElementById("caseDetailModal");e&&(e.style.display="none",e.querySelector(".modal-content").innerHTML="")}window.addEventListener("error",e=>{console.error("[Kiosk] Unhandled error:",e.error)});window.addEventListener("unhandledrejection",e=>{console.error("[Kiosk] Unhandled rejection:",e.reason)});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",_):_();window.kioskApp={getCases:()=>p,getStatus:()=>m.getStatus(),refresh:()=>m.fetchCases(),playAlert:()=>B()};
//# sourceMappingURL=index-NQR6DD-_.js.map
