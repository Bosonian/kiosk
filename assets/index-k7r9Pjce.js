(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function s(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(n){if(n.ep)return;n.ep=!0;const r=s(n);fetch(n.href,r)}})();const U="modulepreload",P=function(e){return"/kiosk/"+e},C={},B=function(t,s,i){let n=Promise.resolve();if(s&&s.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),o=a?.nonce||a?.getAttribute("nonce");n=Promise.allSettled(s.map(l=>{if(l=P(l),l in C)return;C[l]=!0;const f=l.endsWith(".css"),E=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${E}`))return;const g=document.createElement("link");if(g.rel=f?"stylesheet":U,f||(g.as="script"),g.crossOrigin="",g.href=l,o&&g.setAttribute("nonce",o),document.head.appendChild(g),f)return new Promise((N,R)=>{g.addEventListener("load",N),g.addEventListener("error",()=>R(new Error(`Unable to preload CSS for ${l}`)))})}))}function r(a){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=a,window.dispatchEvent(o),!o.defaultPrevented)throw a}return n.then(a=>{for(const o of a||[])o.status==="rejected"&&r(o.reason);return t().catch(r)})},c={caseSharingUrl:"https://case-sharing-564499947017.europe-west3.run.app",pollInterval:5e3,autoArchiveHours:2,staleGpsMinutes:5,hospitalId:(()=>{const e=localStorage.getItem("kiosk_hospital_id");return e===null?"BY-NS-001":e===""?null:e})(),hospitalName:localStorage.getItem("kiosk_hospital_name")||"LMU Klinikum München - Großhadern",googleMapsApiKey:"AIzaSyACBndIj8HD1wwZ4Vw8PDDI0bIe6DoBExI",playAudioAlert:!0,audioAlertVolume:.5,showArchivedCases:!1,maxCasesDisplay:20,theme:"dark"},$=[{id:"BY-NS-001",name:"LMU Klinikum München - Großhadern"},{id:"BY-NS-002",name:"Klinikum Rechts der Isar"},{id:"BY-NS-003",name:"Helios Klinikum München West"},{id:"BY-NS-004",name:"Klinikum Bogenhausen"},{id:"BW-NS-001",name:"Universitätsklinikum Tübingen"},{id:"BW-NS-005",name:"Klinikum Stuttgart - Katharinenhospital"},{id:"BW-NS-003",name:"Universitätsklinikum Freiburg"},{id:"ALL",name:"🌐 All Hospitals (Show All Cases)"}];function H(e){const t=$.find(s=>s.id===e);t&&(e==="ALL"?(localStorage.setItem("kiosk_hospital_id",""),localStorage.setItem("kiosk_hospital_name",t.name)):(localStorage.setItem("kiosk_hospital_id",e),localStorage.setItem("kiosk_hospital_name",t.name)),c.hospitalId=e==="ALL"?null:e,c.hospitalName=t.name,window.location.reload())}const h={IMMEDIATE:{color:"#ff4444",icon:"🚨",priority:0},TIME_CRITICAL:{color:"#ff8800",icon:"⏰",priority:1},URGENT:{color:"#ffcc00",icon:"⚠️",priority:2},STANDARD:{color:"#4a90e2",icon:"🏥",priority:3}},O=Object.freeze(Object.defineProperty({__proto__:null,AVAILABLE_HOSPITALS:$,KIOSK_CONFIG:c,URGENCY_CONFIG:h,setHospital:H},Symbol.toStringTag,{value:"Module"})),u={NEW_CASE_VIEWED_DELAY_MS:2e3,ALERT_BEEP_DURATION_SEC:.5,ALERT_BEEP_FREQUENCY_HZ:880,ALERT_BEEP_VOLUME:.5,FETCH_TIMEOUT_MS:8e3,MAX_RETRY_ATTEMPTS:3,RETRY_DELAYS_MS:[2e3,4e3,8e3],CASE_STALE_THRESHOLD_MINUTES:30};function k(e){return e>70?"#ff4444":e>50?"#ff8800":e>30?"#ffcc00":"#4a90e2"}function T(e){return e>70?"Very High Risk":e>50?"High Risk":e>30?"Moderate Risk":"Low Risk"}function w(e){try{const t=new Date(e);if(isNaN(t.getTime()))throw new Error("Invalid date");return t.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}catch(t){return console.warn("[Utils] Invalid time:",e,t),"Invalid time"}}function F(e){return e.updatedAt?e.updatedAt:e.receivedAt?e.receivedAt:e.tracking?.lastUpdated?e.tracking.lastUpdated:e.createdAt||new Date}function K(e){const t=new Date,s=e instanceof Date?e:new Date(e);if(isNaN(s.getTime()))return"Unknown";const i=Math.max(0,Math.floor((t-s)/1e3));if(i<60)return`${i}s ago`;const n=Math.floor(i/60);return n<60?`${n}m ago`:`${Math.floor(n/60)}h ${n%60}m ago`}function A(e){return e.replace(/_/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function x(e){if(e==null||e==="?")return"?";const t=typeof e=="string"?parseFloat(e):e;return isNaN(t)?"?":t<=0?"Arrived":t<1?"< 1":Math.round(t).toString()}function D(e,t=5){if(!e)return!0;try{const s=new Date(e);return isNaN(s.getTime())?!0:(new Date-s)/(1e3*60)>t}catch{return!0}}function V(e,t=u.CASE_STALE_THRESHOLD_MINUTES){if(!e)return!1;try{const s=e instanceof Date?e:new Date(e);return isNaN(s.getTime())?!1:(new Date-s)/(1e3*60)>t}catch{return!1}}function Y(e){return!(!e||typeof e!="object"||!e.id||typeof e.id!="string")}function j(e){if(typeof AbortSignal<"u"&&AbortSignal.timeout)return AbortSignal.timeout(e);const t=new AbortController,s=setTimeout(()=>{t.abort(new Error(`Timeout after ${e}ms`))},e);return t.signal.addEventListener("abort",()=>{clearTimeout(s)},{once:!0}),t.signal}function G(e){return new Promise(t=>setTimeout(t,e))}class W{constructor(){this.baseUrl=c.caseSharingUrl,this.pollInterval=c.pollInterval,this.intervalId=null,this.cases=new Map,this.onUpdate=null,this.onError=null,this.lastFetchTime=null,this.isConnected=!1,this.retryCount=0}start(t,s){this.onUpdate=t,this.onError=s,this.fetchCases(),this.intervalId=setInterval(()=>{this.fetchCases()},this.pollInterval),console.log("[CaseListener] Started polling every",this.pollInterval,"ms")}stop(){this.intervalId&&(clearInterval(this.intervalId),this.intervalId=null,console.log("[CaseListener] Stopped polling"))}async fetchCases(){let t=null;for(let s=0;s<=u.MAX_RETRY_ATTEMPTS;s++)try{const i=this.buildFetchUrl(),n=await fetch(i,{method:"GET",headers:{Accept:"application/json"},signal:j(u.FETCH_TIMEOUT_MS)});if(!n.ok)throw new Error(`HTTP ${n.status}: ${n.statusText}`);const r=await n.json();if(!r.success)throw new Error(r.error||"Failed to fetch cases");this.retryCount=0,this.isConnected=!0,this.lastFetchTime=new Date,this.processCases(r.cases||[]),this.onUpdate&&this.onUpdate({cases:Array.from(this.cases.values()),timestamp:r.timestamp,count:r.count});return}catch(i){if(t=i,console.error(`[CaseListener] Fetch error (attempt ${s+1}/${u.MAX_RETRY_ATTEMPTS+1}):`,i),s<u.MAX_RETRY_ATTEMPTS){const n=u.RETRY_DELAYS_MS[s]||8e3;console.log(`[CaseListener] Retrying in ${n}ms...`),await G(n)}}console.error("[CaseListener] All retry attempts failed:",t),this.isConnected=!1,this.retryCount++,this.onError&&this.onError(t)}buildFetchUrl(){let t=`${this.baseUrl}/get-cases`;const s=new URLSearchParams;c.hospitalId&&s.append("hospitalId",c.hospitalId),s.append("status","in_transit");const i=s.toString();return i&&(t+=`?${i}`),t}processCases(t){const s=new Set(this.cases.keys()),i=new Set;t.forEach(n=>{if(!Y(n)){console.warn("[CaseListener] Invalid case data, skipping:",n);return}const r=n.id;i.add(r);const a=!this.cases.has(r),o=D(n.tracking?.lastUpdated,c.staleGpsMinutes),l={...n.tracking||{},gpsStale:o};this.cases.set(r,{...n,tracking:l,isNew:a,receivedAt:a?new Date:this.cases.get(r).receivedAt}),a&&(console.log("[CaseListener] New case:",r,this.getCaseSummary(n)),console.log("[CaseListener] Timestamps:",{createdAt:n.createdAt,updatedAt:n.updatedAt,receivedAt:n.receivedAt,trackingLastUpdated:n.tracking?.lastUpdated}))}),s.forEach(n=>{i.has(n)||(console.log("[CaseListener] Case removed:",n),this.cases.delete(n))})}getCaseSummary(t){const s=Math.round((t.results?.ich?.probability||0)*100),i=t.tracking?.duration||"?";return{module:t.moduleType,ich:`${s}%`,eta:`${i} min`,urgency:t.urgency}}getCases(){return Array.from(this.cases.values())}getCase(t){return this.cases.get(t)}markViewed(t){const s=this.cases.get(t);s&&(s.isNew=!1,this.cases.set(t,s))}getStatus(){return{isConnected:this.isConnected,lastFetchTime:this.lastFetchTime,caseCount:this.cases.size,isPolling:this.intervalId!==null}}}const v=new W;function z(e){const t=document.getElementById("casesContainer");if(!t)return;if(!e||e.length===0){t.innerHTML=`
      <div class="no-cases-state">
        <div class="no-cases-icon">✓</div>
        <h2>Keine aktiven Fälle / No Active Cases</h2>
        <p>Das System ist aktiv und überwacht eingehende Fälle</p>
        <p>System is active and monitoring incoming cases</p>
      </div>
    `;return}const s=q(e),n=s.slice(0,c.maxCasesDisplay).map(a=>X(a)).join(""),r=s.length>c.maxCasesDisplay?`<div class="truncated-warning" role="alert">
         Showing ${c.maxCasesDisplay} of ${s.length} cases
       </div>`:"";t.innerHTML=`
    ${r}
    <div class="cases-grid" role="list" aria-label="Active cases">
      ${n}
    </div>
  `}function q(e){return[...e].sort((t,s)=>{const i=h[t.urgency]?.priority??10,n=h[s.urgency]?.priority??10;if(i!==n)return i-n;const r=t.tracking?.duration||9999,a=s.tracking?.duration||9999;return r-a})}function X(e){const t=h[e.urgency]||h.STANDARD,s=Math.round((e.results?.ich?.probability||0)*100),i=e.results?.lvo?Math.round(e.results.lvo.probability*100):null,n=x(e.tracking?.duration),r=e.tracking?.distance||"?",a=e.tracking?.gpsStale||!1,o=F(e),l=V(o),f=K(o),E=`${e.urgency} case, ${e.ambulanceId}, ICH risk ${s}%, ETA ${n} minutes`;return`
    <div class="case-card ${e.urgency.toLowerCase()} ${e.isNew?"new-case":""} ${l?"stale-case":""}"
         data-case-id="${e.id}"
         style="border-color: ${t.color}"
         role="listitem"
         tabindex="0"
         aria-label="${E}">

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
          <div class="risk-circle ${s>70?"critical":s>50?"high":"medium"}"
               style="background: conic-gradient(${k(s)} ${s}%, rgba(255,255,255,0.1) 0%)">
            <div class="risk-value">${s}%</div>
          </div>
          <div class="risk-label">ICH</div>
        </div>

        ${i!==null?`
          <div class="risk-circle-container">
            <div class="risk-circle ${i>50?"high":"medium"}"
                 style="background: conic-gradient(${k(i)} ${i}%, rgba(255,255,255,0.1) 0%)">
              <div class="risk-value">${i}%</div>
            </div>
            <div class="risk-label">LVO</div>
          </div>
        `:""}
      </div>

      <div class="case-eta">
        <div class="eta-main ${a?"stale":""}">
          <span class="eta-value">${n}</span>
          <span class="eta-unit">${n==="Arrived"||n==="?"?"":"min"}</span>
        </div>
        <div class="eta-details">
          <span class="distance">${typeof r=="number"?r.toFixed(1):r} km</span>
          ${a?'<span class="gps-stale-warning" role="alert">⚠️ GPS stale</span>':""}
        </div>
      </div>

      <div class="case-footer">
        <span class="case-time">${f}</span>
        <span class="view-details">View Details →</span>
      </div>
    </div>
  `}function S(e){const t=document.getElementById("caseDetailModal");if(!t)return;const s=t.querySelector(".modal-content");s&&(s.innerHTML=Z(e),t.style.display="flex")}function Z(e){const{results:t,formData:s,moduleType:i,ambulanceId:n,tracking:r,urgency:a}=e,o=Math.round((t?.ich?.probability||0)*100),l=t?.lvo?Math.round(t.lvo.probability*100):null;return`
    <div class="case-detail-container">
      <div class="detail-header">
        <div class="header-left">
          <h2 id="modalTitle">Case Details</h2>
          <div class="case-badges">
            <span class="badge urgency-badge">${a}</span>
            <span class="badge module-badge">${i}</span>
            <span class="badge ambulance-badge">${n}</span>
          </div>
        </div>
        <button class="close-modal">✕ Close</button>
      </div>

      <div class="detail-content">
        <div class="content-section">
          <h3>🎯 Risk Assessment</h3>
          <div class="risk-display-large">
            <div class="risk-item-large">
              <div class="risk-label-large">ICH Risk</div>
              <div class="risk-value-large" style="color: ${k(o)}">${o}%</div>
              <div class="risk-level-large">${T(o)}</div>
            </div>

            ${l!==null?`
              <div class="risk-item-large">
                <div class="risk-label-large">LVO Risk</div>
                <div class="risk-value-large" style="color: ${k(l)}">${l}%</div>
                <div class="risk-level-large">${T(l)}</div>
              </div>
            `:""}
          </div>
        </div>

        <div class="content-section">
          <h3>📍 Tracking Information</h3>
          <div class="tracking-grid">
            <div class="tracking-item">
              <div class="tracking-label">ETA</div>
              <div class="tracking-value">${r?.duration||"?"} min</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Distance</div>
              <div class="tracking-value">${r?.distance?r.distance.toFixed(1):"?"} km</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Last Update</div>
              <div class="tracking-value">${r?.lastUpdated?w(r.lastUpdated):"Unknown"}</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Estimated Arrival</div>
              <div class="tracking-value">${r?.estimatedArrival?w(r.estimatedArrival):"Unknown"}</div>
            </div>
          </div>
        </div>

        <div class="content-section">
          <h3>📋 Assessment Data</h3>
          <div class="data-table">
            ${Q(s)}
          </div>
        </div>

        ${t?.ich?.drivers?`
          <div class="content-section">
            <h3>⚡ Risk Factors</h3>
            ${J(t.ich.drivers)}
          </div>
        `:""}
      </div>

      <div class="detail-footer">
        <button class="close-modal secondary-button">Close</button>
      </div>
    </div>
  `}function Q(e){return!e||Object.keys(e).length===0?"<p>No assessment data available</p>":Object.entries(e).filter(([t,s])=>s!=null&&s!=="").map(([t,s])=>`
      <div class="data-row">
        <div class="data-label">${A(t)}</div>
        <div class="data-value">${s}</div>
      </div>
    `).join("")}function J(e){if(!e||!e.positive&&!e.negative)return"<p>No driver data available</p>";const t=e.positive||[],s=e.negative||[];return`
    <div class="drivers-container">
      <div class="drivers-column">
        <h4>⬆ Increasing Risk</h4>
        ${t.length>0?t.map(i=>`
              <div class="driver-item positive">
                <span class="driver-label">${A(i.label)}</span>
                <span class="driver-value">${(Math.abs(i.weight)*100).toFixed(1)}%</span>
              </div>
            `).join(""):'<p class="no-drivers">None</p>'}
      </div>

      <div class="drivers-column">
        <h4>⬇ Decreasing Risk</h4>
        ${s.length>0?s.map(i=>`
              <div class="driver-item negative">
                <span class="driver-label">${A(i.label)}</span>
                <span class="driver-value">${(Math.abs(i.weight)*100).toFixed(1)}%</span>
              </div>
            `).join(""):'<p class="no-drivers">None</p>'}
      </div>
    </div>
  `}let m=[],d=null,p=null,y=!0;async function b(){console.log("[Kiosk] Initializing...",c),ne(),L(),p=setInterval(L,1e3),re(),v.start(e=>te(e),e=>se(e)),oe(),window.addEventListener("beforeunload",ee),console.log("[Kiosk] Initialized successfully")}function ee(){console.log("[Kiosk] Cleaning up resources..."),v.stop(),p&&(clearInterval(p),p=null),d&&d.state!=="closed"&&d.close().catch(e=>{console.warn("[Kiosk] Error closing audio context:",e)})}function te(e){const t=m.length;m=e.cases||[],console.log("[Kiosk] Cases updated:",{count:m.length,previous:t}),z(m),ie(e);const s=m.filter(i=>i.isNew);s.length>0&&!y&&(M(),ae(),setTimeout(()=>{s.forEach(i=>v.markViewed(i.id))},u.NEW_CASE_VIEWED_DELAY_MS)),y&&(y=!1),_(!0)}function se(e){if(console.error("[Kiosk] Error:",e),_(!1),m.length===0){const t=document.getElementById("casesContainer");t&&(t.innerHTML=`
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h2>Verbindungsfehler / Connection Error</h2>
          <p>${e.message||"Unable to connect to case monitoring system"}</p>
          <p class="error-hint">Checking again in ${c.pollInterval/1e3} seconds...</p>
        </div>
      `)}}function ne(){const e=document.getElementById("hospitalSelector");e&&B(async()=>{const{AVAILABLE_HOSPITALS:t,setHospital:s}=await Promise.resolve().then(()=>O);return{AVAILABLE_HOSPITALS:t,setHospital:s}},void 0).then(({AVAILABLE_HOSPITALS:t,setHospital:s})=>{e.innerHTML=t.map(i=>{const n=i.id==="ALL"&&c.hospitalId===null||i.id===c.hospitalId;return`<option value="${i.id}" ${n?"selected":""}>${i.name}</option>`}).join(""),e.addEventListener("change",i=>{const n=i.target.value;confirm(`Switch to ${i.target.options[i.target.selectedIndex].text}?

This will reload the page.`)?s(n):e.value=c.hospitalId===null?"ALL":c.hospitalId})})}function ie(e){const t=document.getElementById("caseCount");if(t){const s=e.count||0;t.textContent=`${s} ${s===1?"Case":"Cases"}`,t.className=`case-count-badge ${s>0?"has-cases":""}`}}function _(e){const t=document.getElementById("connectionStatus");t&&(t.className=`status-indicator ${e?"connected":"disconnected"}`,t.title=e?"Connected":"Disconnected",t.setAttribute("aria-label",`Connection status: ${e?"connected":"disconnected"}`))}function L(){const e=document.getElementById("currentTime");if(e){const t=new Date;e.textContent=t.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}}function re(){document.addEventListener("click",()=>{d||(d=new(window.AudioContext||window.webkitAudioContext),console.log("[Kiosk] Audio initialized"))},{once:!0})}async function M(){if(d)try{d.state==="suspended"&&(await d.resume(),console.log("[Kiosk] Audio context resumed"));const e=d.createOscillator(),t=d.createGain();e.connect(t),t.connect(d.destination),e.frequency.value=u.ALERT_BEEP_FREQUENCY_HZ,e.type="sine",t.gain.setValueAtTime(u.ALERT_BEEP_VOLUME,d.currentTime),t.gain.exponentialRampToValueAtTime(.01,d.currentTime+u.ALERT_BEEP_DURATION_SEC),e.start(d.currentTime),e.stop(d.currentTime+u.ALERT_BEEP_DURATION_SEC),console.log("[Kiosk] Alert sound played")}catch(e){console.warn("[Kiosk] Audio playback failed:",e)}}function ae(){document.body.classList.add("flash-alert"),setTimeout(()=>{document.body.classList.remove("flash-alert")},1e3)}function oe(){document.addEventListener("click",e=>{const t=e.target.closest(".case-card");if(t){const s=t.dataset.caseId;if(s){const i=v.getCase(s);i&&(S(i),v.markViewed(s))}}(e.target.classList.contains("modal-overlay")||e.target.classList.contains("close-modal"))&&I()}),document.addEventListener("keydown",e=>{if(e.key==="Escape"){I();return}if(e.key==="Enter"||e.key===" "){const t=e.target.closest(".case-card");if(t){e.preventDefault();const s=t.dataset.caseId;if(s){const i=v.getCase(s);i&&(S(i),v.markViewed(s))}}}}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(console.log("[Kiosk] Tab visible - fetching latest cases"),v.fetchCases())})}function I(){const e=document.getElementById("caseDetailModal");e&&(e.style.display="none",e.querySelector(".modal-content").innerHTML="")}window.addEventListener("error",e=>{console.error("[Kiosk] Unhandled error:",e.error)});window.addEventListener("unhandledrejection",e=>{console.error("[Kiosk] Unhandled rejection:",e.reason)});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",b):b();window.kioskApp={getCases:()=>m,getStatus:()=>v.getStatus(),refresh:()=>v.fetchCases(),playAlert:()=>M()};
//# sourceMappingURL=index-k7r9Pjce.js.map
