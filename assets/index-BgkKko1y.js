(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function s(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(i){if(i.ep)return;i.ep=!0;const a=s(i);fetch(i.href,a)}})();const U="modulepreload",P=function(e){return"/kiosk/"+e},C={},B=function(t,s,n){let i=Promise.resolve();if(s&&s.length>0){document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),o=r?.nonce||r?.getAttribute("nonce");i=Promise.allSettled(s.map(l=>{if(l=P(l),l in C)return;C[l]=!0;const f=l.endsWith(".css"),M=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${M}`))return;const m=document.createElement("link");if(m.rel=f?"stylesheet":U,f||(m.as="script"),m.crossOrigin="",m.href=l,o&&m.setAttribute("nonce",o),document.head.appendChild(m),f)return new Promise((N,R)=>{m.addEventListener("load",N),m.addEventListener("error",()=>R(new Error(`Unable to preload CSS for ${l}`)))})}))}function a(r){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=r,window.dispatchEvent(o),!o.defaultPrevented)throw r}return i.then(r=>{for(const o of r||[])o.status==="rejected"&&a(o.reason);return t().catch(a)})},c={caseSharingUrl:"https://case-sharing-564499947017.europe-west3.run.app",pollInterval:5e3,autoArchiveHours:2,staleGpsMinutes:5,hospitalId:(()=>{const e=localStorage.getItem("kiosk_hospital_id");return e===null?"BY-NS-001":e===""?null:e})(),hospitalName:localStorage.getItem("kiosk_hospital_name")||"LMU Klinikum München - Großhadern",googleMapsApiKey:"AIzaSyACBndIj8HD1wwZ4Vw8PDDI0bIe6DoBExI",playAudioAlert:!0,audioAlertVolume:.5,showArchivedCases:!1,maxCasesDisplay:20,theme:"dark"},I=[{id:"BY-NS-001",name:"LMU Klinikum München - Großhadern"},{id:"BY-NS-002",name:"Klinikum Rechts der Isar"},{id:"BY-NS-003",name:"Helios Klinikum München West"},{id:"BY-NS-004",name:"Klinikum Bogenhausen"},{id:"BW-NS-001",name:"Universitätsklinikum Tübingen"},{id:"BW-NS-005",name:"Klinikum Stuttgart - Katharinenhospital"},{id:"BW-NS-003",name:"Universitätsklinikum Freiburg"},{id:"ALL",name:"🌐 All Hospitals (Show All Cases)"}];function H(e){const t=I.find(s=>s.id===e);t&&(e==="ALL"?(localStorage.setItem("kiosk_hospital_id",""),localStorage.setItem("kiosk_hospital_name",t.name)):(localStorage.setItem("kiosk_hospital_id",e),localStorage.setItem("kiosk_hospital_name",t.name)),c.hospitalId=e==="ALL"?null:e,c.hospitalName=t.name,window.location.reload())}const h={IMMEDIATE:{color:"#ff4444",icon:"🚨",priority:0},TIME_CRITICAL:{color:"#ff8800",icon:"⏰",priority:1},URGENT:{color:"#ffcc00",icon:"⚠️",priority:2},STANDARD:{color:"#4a90e2",icon:"🏥",priority:3}},O=Object.freeze(Object.defineProperty({__proto__:null,AVAILABLE_HOSPITALS:I,KIOSK_CONFIG:c,URGENCY_CONFIG:h,setHospital:H},Symbol.toStringTag,{value:"Module"})),u={NEW_CASE_VIEWED_DELAY_MS:2e3,ALERT_BEEP_DURATION_SEC:.5,ALERT_BEEP_FREQUENCY_HZ:880,ALERT_BEEP_VOLUME:.5,FETCH_TIMEOUT_MS:8e3,MAX_RETRY_ATTEMPTS:3,RETRY_DELAYS_MS:[2e3,4e3,8e3],CASE_STALE_THRESHOLD_MINUTES:30};function E(e){return e>70?"#ff4444":e>50?"#ff8800":e>30?"#ffcc00":"#4a90e2"}function A(e){return e>70?"Very High Risk":e>50?"High Risk":e>30?"Moderate Risk":"Low Risk"}function T(e){try{const t=new Date(e);if(isNaN(t.getTime()))throw new Error("Invalid date");return t.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}catch(t){return console.warn("[Utils] Invalid time:",e,t),"Invalid time"}}function D(e){const t=new Date,s=new Date(e);if(isNaN(s.getTime()))return"Unknown";const n=Math.max(0,Math.floor((t-s)/1e3));if(n<60)return`${n}s ago`;const i=Math.floor(n/60);return i<60?`${i}m ago`:`${Math.floor(i/60)}h ${i%60}m ago`}function k(e){return e.replace(/_/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function F(e){if(e==null||e==="?")return"?";const t=typeof e=="string"?parseFloat(e):e;return isNaN(t)?"?":t<=0?"Arrived":t<1?"< 1":Math.round(t).toString()}function K(e,t=5){if(!e)return!0;try{const s=new Date(e);return isNaN(s.getTime())?!0:(new Date-s)/(1e3*60)>t}catch{return!0}}function x(e,t=u.CASE_STALE_THRESHOLD_MINUTES){if(!e)return!1;try{const s=new Date(e);return isNaN(s.getTime())?!1:(new Date-s)/(1e3*60)>t}catch{return!1}}function V(e){return!(!e||typeof e!="object"||!e.id||typeof e.id!="string")}function Y(e){if(typeof AbortSignal<"u"&&AbortSignal.timeout)return AbortSignal.timeout(e);const t=new AbortController,s=setTimeout(()=>{t.abort(new Error(`Timeout after ${e}ms`))},e);return t.signal.addEventListener("abort",()=>{clearTimeout(s)},{once:!0}),t.signal}function j(e){return new Promise(t=>setTimeout(t,e))}class G{constructor(){this.baseUrl=c.caseSharingUrl,this.pollInterval=c.pollInterval,this.intervalId=null,this.cases=new Map,this.onUpdate=null,this.onError=null,this.lastFetchTime=null,this.isConnected=!1,this.retryCount=0}start(t,s){this.onUpdate=t,this.onError=s,this.fetchCases(),this.intervalId=setInterval(()=>{this.fetchCases()},this.pollInterval),console.log("[CaseListener] Started polling every",this.pollInterval,"ms")}stop(){this.intervalId&&(clearInterval(this.intervalId),this.intervalId=null,console.log("[CaseListener] Stopped polling"))}async fetchCases(){let t=null;for(let s=0;s<=u.MAX_RETRY_ATTEMPTS;s++)try{const n=this.buildFetchUrl(),i=await fetch(n,{method:"GET",headers:{Accept:"application/json"},signal:Y(u.FETCH_TIMEOUT_MS)});if(!i.ok)throw new Error(`HTTP ${i.status}: ${i.statusText}`);const a=await i.json();if(!a.success)throw new Error(a.error||"Failed to fetch cases");this.retryCount=0,this.isConnected=!0,this.lastFetchTime=new Date,this.processCases(a.cases||[]),this.onUpdate&&this.onUpdate({cases:Array.from(this.cases.values()),timestamp:a.timestamp,count:a.count});return}catch(n){if(t=n,console.error(`[CaseListener] Fetch error (attempt ${s+1}/${u.MAX_RETRY_ATTEMPTS+1}):`,n),s<u.MAX_RETRY_ATTEMPTS){const i=u.RETRY_DELAYS_MS[s]||8e3;console.log(`[CaseListener] Retrying in ${i}ms...`),await j(i)}}console.error("[CaseListener] All retry attempts failed:",t),this.isConnected=!1,this.retryCount++,this.onError&&this.onError(t)}buildFetchUrl(){let t=`${this.baseUrl}/get-cases`;const s=new URLSearchParams;c.hospitalId&&s.append("hospitalId",c.hospitalId),s.append("status","in_transit");const n=s.toString();return n&&(t+=`?${n}`),t}processCases(t){const s=new Set(this.cases.keys()),n=new Set;t.forEach(i=>{if(!V(i)){console.warn("[CaseListener] Invalid case data, skipping:",i);return}const a=i.id;n.add(a);const r=!this.cases.has(a),o=K(i.tracking?.lastUpdated,c.staleGpsMinutes),l={...i.tracking||{},gpsStale:o};this.cases.set(a,{...i,tracking:l,isNew:r,receivedAt:r?new Date:this.cases.get(a).receivedAt}),r&&console.log("[CaseListener] New case:",a,this.getCaseSummary(i))}),s.forEach(i=>{n.has(i)||(console.log("[CaseListener] Case removed:",i),this.cases.delete(i))})}getCaseSummary(t){const s=Math.round((t.results?.ich?.probability||0)*100),n=t.tracking?.duration||"?";return{module:t.moduleType,ich:`${s}%`,eta:`${n} min`,urgency:t.urgency}}getCases(){return Array.from(this.cases.values())}getCase(t){return this.cases.get(t)}markViewed(t){const s=this.cases.get(t);s&&(s.isNew=!1,this.cases.set(t,s))}getStatus(){return{isConnected:this.isConnected,lastFetchTime:this.lastFetchTime,caseCount:this.cases.size,isPolling:this.intervalId!==null}}}const v=new G;function W(e){const t=document.getElementById("casesContainer");if(!t)return;if(!e||e.length===0){t.innerHTML=`
      <div class="no-cases-state">
        <div class="no-cases-icon">✓</div>
        <h2>Keine aktiven Fälle / No Active Cases</h2>
        <p>Das System ist aktiv und überwacht eingehende Fälle</p>
        <p>System is active and monitoring incoming cases</p>
      </div>
    `;return}const s=z(e),i=s.slice(0,c.maxCasesDisplay).map(r=>q(r)).join(""),a=s.length>c.maxCasesDisplay?`<div class="truncated-warning" role="alert">
         Showing ${c.maxCasesDisplay} of ${s.length} cases
       </div>`:"";t.innerHTML=`
    ${a}
    <div class="cases-grid" role="list" aria-label="Active cases">
      ${i}
    </div>
  `}function z(e){return[...e].sort((t,s)=>{const n=h[t.urgency]?.priority??10,i=h[s.urgency]?.priority??10;if(n!==i)return n-i;const a=t.tracking?.duration||9999,r=s.tracking?.duration||9999;return a-r})}function q(e){const t=h[e.urgency]||h.STANDARD,s=Math.round((e.results?.ich?.probability||0)*100),n=e.results?.lvo?Math.round(e.results.lvo.probability*100):null,i=F(e.tracking?.duration),a=e.tracking?.distance||"?",r=e.tracking?.gpsStale||!1,o=x(e.createdAt),l=D(e.createdAt),f=`${e.urgency} case, ${e.ambulanceId}, ICH risk ${s}%, ETA ${i} minutes`;return`
    <div class="case-card ${e.urgency.toLowerCase()} ${e.isNew?"new-case":""} ${o?"stale-case":""}"
         data-case-id="${e.id}"
         style="border-color: ${t.color}"
         role="listitem"
         tabindex="0"
         aria-label="${f}">

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
               style="background: conic-gradient(${E(s)} ${s}%, rgba(255,255,255,0.1) 0%)">
            <div class="risk-value">${s}%</div>
          </div>
          <div class="risk-label">ICH</div>
        </div>

        ${n!==null?`
          <div class="risk-circle-container">
            <div class="risk-circle ${n>50?"high":"medium"}"
                 style="background: conic-gradient(${E(n)} ${n}%, rgba(255,255,255,0.1) 0%)">
              <div class="risk-value">${n}%</div>
            </div>
            <div class="risk-label">LVO</div>
          </div>
        `:""}
      </div>

      <div class="case-eta">
        <div class="eta-main ${r?"stale":""}">
          <span class="eta-value">${i}</span>
          <span class="eta-unit">${i==="Arrived"||i==="?"?"":"min"}</span>
        </div>
        <div class="eta-details">
          <span class="distance">${typeof a=="number"?a.toFixed(1):a} km</span>
          ${r?'<span class="gps-stale-warning" role="alert">⚠️ GPS stale</span>':""}
        </div>
      </div>

      <div class="case-footer">
        <span class="case-time">${l}</span>
        <span class="view-details">View Details →</span>
      </div>
    </div>
  `}function S(e){const t=document.getElementById("caseDetailModal");if(!t)return;const s=t.querySelector(".modal-content");s&&(s.innerHTML=X(e),t.style.display="flex")}function X(e){const{results:t,formData:s,moduleType:n,ambulanceId:i,tracking:a,urgency:r}=e,o=Math.round((t?.ich?.probability||0)*100),l=t?.lvo?Math.round(t.lvo.probability*100):null;return`
    <div class="case-detail-container">
      <div class="detail-header">
        <div class="header-left">
          <h2 id="modalTitle">Case Details</h2>
          <div class="case-badges">
            <span class="badge urgency-badge">${r}</span>
            <span class="badge module-badge">${n}</span>
            <span class="badge ambulance-badge">${i}</span>
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
              <div class="risk-value-large" style="color: ${E(o)}">${o}%</div>
              <div class="risk-level-large">${A(o)}</div>
            </div>

            ${l!==null?`
              <div class="risk-item-large">
                <div class="risk-label-large">LVO Risk</div>
                <div class="risk-value-large" style="color: ${E(l)}">${l}%</div>
                <div class="risk-level-large">${A(l)}</div>
              </div>
            `:""}
          </div>
        </div>

        <div class="content-section">
          <h3>📍 Tracking Information</h3>
          <div class="tracking-grid">
            <div class="tracking-item">
              <div class="tracking-label">ETA</div>
              <div class="tracking-value">${a?.duration||"?"} min</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Distance</div>
              <div class="tracking-value">${a?.distance?a.distance.toFixed(1):"?"} km</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Last Update</div>
              <div class="tracking-value">${a?.lastUpdated?T(a.lastUpdated):"Unknown"}</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Estimated Arrival</div>
              <div class="tracking-value">${a?.estimatedArrival?T(a.estimatedArrival):"Unknown"}</div>
            </div>
          </div>
        </div>

        <div class="content-section">
          <h3>📋 Assessment Data</h3>
          <div class="data-table">
            ${Z(s)}
          </div>
        </div>

        ${t?.ich?.drivers?`
          <div class="content-section">
            <h3>⚡ Risk Factors</h3>
            ${Q(t.ich.drivers)}
          </div>
        `:""}
      </div>

      <div class="detail-footer">
        <button class="close-modal secondary-button">Close</button>
      </div>
    </div>
  `}function Z(e){return!e||Object.keys(e).length===0?"<p>No assessment data available</p>":Object.entries(e).filter(([t,s])=>s!=null&&s!=="").map(([t,s])=>`
      <div class="data-row">
        <div class="data-label">${k(t)}</div>
        <div class="data-value">${s}</div>
      </div>
    `).join("")}function Q(e){if(!e||!e.positive&&!e.negative)return"<p>No driver data available</p>";const t=e.positive||[],s=e.negative||[];return`
    <div class="drivers-container">
      <div class="drivers-column">
        <h4>⬆ Increasing Risk</h4>
        ${t.length>0?t.map(n=>`
              <div class="driver-item positive">
                <span class="driver-label">${k(n.label)}</span>
                <span class="driver-value">${(Math.abs(n.weight)*100).toFixed(1)}%</span>
              </div>
            `).join(""):'<p class="no-drivers">None</p>'}
      </div>

      <div class="drivers-column">
        <h4>⬇ Decreasing Risk</h4>
        ${s.length>0?s.map(n=>`
              <div class="driver-item negative">
                <span class="driver-label">${k(n.label)}</span>
                <span class="driver-value">${(Math.abs(n.weight)*100).toFixed(1)}%</span>
              </div>
            `).join(""):'<p class="no-drivers">None</p>'}
      </div>
    </div>
  `}let g=[],d=null,p=null,y=!0;async function b(){console.log("[Kiosk] Initializing...",c),se(),w(),p=setInterval(w,1e3),ne(),v.start(e=>ee(e),e=>te(e)),re(),window.addEventListener("beforeunload",J),console.log("[Kiosk] Initialized successfully")}function J(){console.log("[Kiosk] Cleaning up resources..."),v.stop(),p&&(clearInterval(p),p=null),d&&d.state!=="closed"&&d.close().catch(e=>{console.warn("[Kiosk] Error closing audio context:",e)})}function ee(e){const t=g.length;g=e.cases||[],console.log("[Kiosk] Cases updated:",{count:g.length,previous:t}),W(g),ie(e);const s=g.filter(n=>n.isNew);s.length>0&&!y&&(_(),ae(),setTimeout(()=>{s.forEach(n=>v.markViewed(n.id))},u.NEW_CASE_VIEWED_DELAY_MS)),y&&(y=!1),$(!0)}function te(e){if(console.error("[Kiosk] Error:",e),$(!1),g.length===0){const t=document.getElementById("casesContainer");t&&(t.innerHTML=`
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h2>Verbindungsfehler / Connection Error</h2>
          <p>${e.message||"Unable to connect to case monitoring system"}</p>
          <p class="error-hint">Checking again in ${c.pollInterval/1e3} seconds...</p>
        </div>
      `)}}function se(){const e=document.getElementById("hospitalSelector");e&&B(async()=>{const{AVAILABLE_HOSPITALS:t,setHospital:s}=await Promise.resolve().then(()=>O);return{AVAILABLE_HOSPITALS:t,setHospital:s}},void 0).then(({AVAILABLE_HOSPITALS:t,setHospital:s})=>{e.innerHTML=t.map(n=>{const i=n.id==="ALL"&&c.hospitalId===null||n.id===c.hospitalId;return`<option value="${n.id}" ${i?"selected":""}>${n.name}</option>`}).join(""),e.addEventListener("change",n=>{const i=n.target.value;confirm(`Switch to ${n.target.options[n.target.selectedIndex].text}?

This will reload the page.`)?s(i):e.value=c.hospitalId===null?"ALL":c.hospitalId})})}function ie(e){const t=document.getElementById("caseCount");if(t){const s=e.count||0;t.textContent=`${s} ${s===1?"Case":"Cases"}`,t.className=`case-count-badge ${s>0?"has-cases":""}`}}function $(e){const t=document.getElementById("connectionStatus");t&&(t.className=`status-indicator ${e?"connected":"disconnected"}`,t.title=e?"Connected":"Disconnected",t.setAttribute("aria-label",`Connection status: ${e?"connected":"disconnected"}`))}function w(){const e=document.getElementById("currentTime");if(e){const t=new Date;e.textContent=t.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}}function ne(){document.addEventListener("click",()=>{d||(d=new(window.AudioContext||window.webkitAudioContext),console.log("[Kiosk] Audio initialized"))},{once:!0})}async function _(){if(d)try{d.state==="suspended"&&(await d.resume(),console.log("[Kiosk] Audio context resumed"));const e=d.createOscillator(),t=d.createGain();e.connect(t),t.connect(d.destination),e.frequency.value=u.ALERT_BEEP_FREQUENCY_HZ,e.type="sine",t.gain.setValueAtTime(u.ALERT_BEEP_VOLUME,d.currentTime),t.gain.exponentialRampToValueAtTime(.01,d.currentTime+u.ALERT_BEEP_DURATION_SEC),e.start(d.currentTime),e.stop(d.currentTime+u.ALERT_BEEP_DURATION_SEC),console.log("[Kiosk] Alert sound played")}catch(e){console.warn("[Kiosk] Audio playback failed:",e)}}function ae(){document.body.classList.add("flash-alert"),setTimeout(()=>{document.body.classList.remove("flash-alert")},1e3)}function re(){document.addEventListener("click",e=>{const t=e.target.closest(".case-card");if(t){const s=t.dataset.caseId;if(s){const n=v.getCase(s);n&&(S(n),v.markViewed(s))}}(e.target.classList.contains("modal-overlay")||e.target.classList.contains("close-modal"))&&L()}),document.addEventListener("keydown",e=>{if(e.key==="Escape"){L();return}if(e.key==="Enter"||e.key===" "){const t=e.target.closest(".case-card");if(t){e.preventDefault();const s=t.dataset.caseId;if(s){const n=v.getCase(s);n&&(S(n),v.markViewed(s))}}}}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(console.log("[Kiosk] Tab visible - fetching latest cases"),v.fetchCases())})}function L(){const e=document.getElementById("caseDetailModal");e&&(e.style.display="none",e.querySelector(".modal-content").innerHTML="")}window.addEventListener("error",e=>{console.error("[Kiosk] Unhandled error:",e.error)});window.addEventListener("unhandledrejection",e=>{console.error("[Kiosk] Unhandled rejection:",e.reason)});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",b):b();window.kioskApp={getCases:()=>g,getStatus:()=>v.getStatus(),refresh:()=>v.fetchCases(),playAlert:()=>_()};
//# sourceMappingURL=index-BgkKko1y.js.map
