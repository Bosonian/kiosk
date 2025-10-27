(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function t(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=t(n);fetch(n.href,a)}})();const l={caseSharingUrl:"https://case-sharing-564499947017.europe-west3.run.app",pollInterval:5e3,autoArchiveHours:2,staleGpsMinutes:5,hospitalId:"BY-NS-001",hospitalName:"LMU Klinikum München - Notaufnahme",googleMapsApiKey:"AIzaSyACBndIj8HD1wwZ4Vw8PDDI0bIe6DoBExI",playAudioAlert:!0,audioAlertVolume:.5,showArchivedCases:!1,maxCasesDisplay:20,theme:"dark"},h={IMMEDIATE:{color:"#ff4444",icon:"🚨",priority:0},TIME_CRITICAL:{color:"#ff8800",icon:"⏰",priority:1},URGENT:{color:"#ffcc00",icon:"⚠️",priority:2},STANDARD:{color:"#4a90e2",icon:"🏥",priority:3}};class I{constructor(){this.baseUrl=l.caseSharingUrl,this.pollInterval=l.pollInterval,this.hospitalId=l.hospitalId,this.intervalId=null,this.cases=new Map,this.onUpdate=null,this.onError=null,this.lastFetchTime=null,this.isConnected=!1}start(s,t){this.onUpdate=s,this.onError=t,this.fetchCases(),this.intervalId=setInterval(()=>{this.fetchCases()},this.pollInterval),console.log("[CaseListener] Started polling every",this.pollInterval,"ms")}stop(){this.intervalId&&(clearInterval(this.intervalId),this.intervalId=null,console.log("[CaseListener] Stopped polling"))}async fetchCases(){try{const s=this.buildFetchUrl(),t=await fetch(s,{method:"GET",headers:{Accept:"application/json"},signal:AbortSignal.timeout(8e3)});if(!t.ok)throw new Error(`HTTP ${t.status}: ${t.statusText}`);const i=await t.json();if(!i.success)throw new Error(i.error||"Failed to fetch cases");this.isConnected=!0,this.lastFetchTime=new Date,this.processCases(i.cases||[]),this.onUpdate&&this.onUpdate({cases:Array.from(this.cases.values()),timestamp:i.timestamp,count:i.count})}catch(s){console.error("[CaseListener] Fetch error:",s),this.isConnected=!1,this.onError&&this.onError(s)}}buildFetchUrl(){let s=`${this.baseUrl}/get-cases`;const t=new URLSearchParams;this.hospitalId&&t.append("hospitalId",this.hospitalId),t.append("status","in_transit");const i=t.toString();return i&&(s+=`?${i}`),s}processCases(s){const t=new Set(this.cases.keys()),i=new Set;s.forEach(n=>{const a=n.id;i.add(a);const r=!this.cases.has(a);this.cases.set(a,{...n,isNew:r,receivedAt:r?new Date:this.cases.get(a).receivedAt}),r&&console.log("[CaseListener] New case:",a,this.getCaseSummary(n))}),t.forEach(n=>{i.has(n)||(console.log("[CaseListener] Case removed:",n),this.cases.delete(n))})}getCaseSummary(s){const t=Math.round((s.results?.ich?.probability||0)*100),i=s.tracking?.duration||"?";return{module:s.moduleType,ich:`${t}%`,eta:`${i} min`,urgency:s.urgency}}getCases(){return Array.from(this.cases.values())}getCase(s){return this.cases.get(s)}markViewed(s){const t=this.cases.get(s);t&&(t.isNew=!1,this.cases.set(s,t))}getStatus(){return{isConnected:this.isConnected,lastFetchTime:this.lastFetchTime,caseCount:this.cases.size,isPolling:this.intervalId!==null}}}const d=new I;function A(e){const s=document.getElementById("casesContainer");if(!s)return;if(!e||e.length===0){s.innerHTML=`
      <div class="no-cases-state">
        <div class="no-cases-icon">✓</div>
        <h2>Keine aktiven Fälle / No Active Cases</h2>
        <p>Das System ist aktiv und überwacht eingehende Fälle</p>
        <p>System is active and monitoring incoming cases</p>
      </div>
    `;return}const i=L(e).map(n=>E(n)).join("");s.innerHTML=`
    <div class="cases-grid">
      ${i}
    </div>
  `}function L(e){return[...e].sort((s,t)=>{const i=h[s.urgency]?.priority??10,n=h[t.urgency]?.priority??10;if(i!==n)return i-n;const a=s.tracking?.duration||9999,r=t.tracking?.duration||9999;return a-r})}function E(e){const s=h[e.urgency]||h.STANDARD,t=Math.round((e.results?.ich?.probability||0)*100),i=e.results?.lvo?Math.round(e.results.lvo.probability*100):null,n=e.tracking?.duration||"?",a=e.tracking?.distance||"?",r=e.tracking?.gpsStale||!1,u=T(e.createdAt);return`
    <div class="case-card ${e.urgency.toLowerCase()} ${e.isNew?"new-case":""}"
         data-case-id="${e.id}"
         style="border-color: ${s.color}">

      <div class="case-header">
        <div class="urgency-badge" style="background: ${s.color}">
          ${s.icon} ${e.urgency}
        </div>
        <div class="case-meta">
          <span class="ambulance-id">${e.ambulanceId}</span>
          <span class="module-type">${e.moduleType}</span>
        </div>
      </div>

      <div class="case-risks">
        <div class="risk-circle-container">
          <div class="risk-circle ${t>70?"critical":t>50?"high":"medium"}"
               style="background: conic-gradient(${p(t)} ${t}%, rgba(255,255,255,0.1) 0%)">
            <div class="risk-value">${t}%</div>
          </div>
          <div class="risk-label">ICH</div>
        </div>

        ${i!==null?`
          <div class="risk-circle-container">
            <div class="risk-circle ${i>50?"high":"medium"}"
                 style="background: conic-gradient(${p(i)} ${i}%, rgba(255,255,255,0.1) 0%)">
              <div class="risk-value">${i}%</div>
            </div>
            <div class="risk-label">LVO</div>
          </div>
        `:""}
      </div>

      <div class="case-eta">
        <div class="eta-main ${r?"stale":""}">
          <span class="eta-value">${n}</span>
          <span class="eta-unit">min</span>
        </div>
        <div class="eta-details">
          <span class="distance">${typeof a=="number"?a.toFixed(1):a} km</span>
          ${r?'<span class="gps-stale-warning">⚠️ GPS stale</span>':""}
        </div>
      </div>

      <div class="case-footer">
        <span class="case-time">${u}</span>
        <span class="view-details">View Details →</span>
      </div>
    </div>
  `}function p(e){return e>70?"#ff4444":e>50?"#ff8800":e>30?"#ffcc00":"#4a90e2"}function T(e){const s=new Date,t=new Date(e),i=Math.floor((s-t)/1e3);if(i<60)return`${i}s ago`;const n=Math.floor(i/60);return n<60?`${n}m ago`:`${Math.floor(n/60)}h ${n%60}m ago`}function S(e){const s=document.getElementById("caseDetailModal");if(!s)return;const t=s.querySelector(".modal-content");t&&(t.innerHTML=M(e),s.style.display="flex")}function M(e){const{results:s,formData:t,moduleType:i,ambulanceId:n,tracking:a,urgency:r}=e,u=Math.round((s?.ich?.probability||0)*100),v=s?.lvo?Math.round(s.lvo.probability*100):null;return`
    <div class="case-detail-container">
      <div class="detail-header">
        <div class="header-left">
          <h2>Case Details</h2>
          <div class="case-badges">
            <span class="badge urgency-badge">${r}</span>
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
              <div class="risk-value-large" style="color: ${m(u)}">${u}%</div>
              <div class="risk-level-large">${f(u)}</div>
            </div>

            ${v!==null?`
              <div class="risk-item-large">
                <div class="risk-label-large">LVO Risk</div>
                <div class="risk-value-large" style="color: ${m(v)}">${v}%</div>
                <div class="risk-level-large">${f(v)}</div>
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
              <div class="tracking-value">${a?.lastUpdated?y(a.lastUpdated):"Unknown"}</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Estimated Arrival</div>
              <div class="tracking-value">${a?.estimatedArrival?y(a.estimatedArrival):"Unknown"}</div>
            </div>
          </div>
        </div>

        <div class="content-section">
          <h3>📋 Assessment Data</h3>
          <div class="data-table">
            ${N(t)}
          </div>
        </div>

        ${s?.ich?.drivers?`
          <div class="content-section">
            <h3>⚡ Risk Factors</h3>
            ${U(s.ich.drivers)}
          </div>
        `:""}
      </div>

      <div class="detail-footer">
        <button class="close-modal secondary-button">Close</button>
      </div>
    </div>
  `}function m(e){return e>70?"#ff4444":e>50?"#ff8800":e>30?"#ffcc00":"#4a90e2"}function f(e){return e>70?"Very High Risk":e>50?"High Risk":e>30?"Moderate Risk":"Low Risk"}function y(e){try{return new Date(e).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}catch{return"Invalid time"}}function N(e){return!e||Object.keys(e).length===0?"<p>No assessment data available</p>":Object.entries(e).filter(([s,t])=>t!=null&&t!=="").map(([s,t])=>`
      <div class="data-row">
        <div class="data-label">${g(s)}</div>
        <div class="data-value">${t}</div>
      </div>
    `).join("")}function g(e){return e.replace(/_/g," ").replace(/\b\w/g,s=>s.toUpperCase())}function U(e){if(!e||!e.positive&&!e.negative)return"<p>No driver data available</p>";const s=e.positive||[],t=e.negative||[];return`
    <div class="drivers-container">
      <div class="drivers-column">
        <h4>⬆ Increasing Risk</h4>
        ${s.length>0?s.map(i=>`
              <div class="driver-item positive">
                <span class="driver-label">${g(i.label)}</span>
                <span class="driver-value">${(Math.abs(i.weight)*100).toFixed(1)}%</span>
              </div>
            `).join(""):'<p class="no-drivers">None</p>'}
      </div>

      <div class="drivers-column">
        <h4>⬇ Decreasing Risk</h4>
        ${t.length>0?t.map(i=>`
              <div class="driver-item negative">
                <span class="driver-label">${g(i.label)}</span>
                <span class="driver-value">${(Math.abs(i.weight)*100).toFixed(1)}%</span>
              </div>
            `).join(""):'<p class="no-drivers">None</p>'}
      </div>
    </div>
  `}let c=[],o=null;async function k(){console.log("[Kiosk] Initializing...",l),document.getElementById("hospitalName").textContent=l.hospitalName,b(),setInterval(b,1e3),D(),d.start(e=>R(e),e=>F(e)),O(),console.log("[Kiosk] Initialized successfully")}function R(e){const s=c.length;c=e.cases||[],console.log("[Kiosk] Cases updated:",{count:c.length,previous:s}),A(c),K(e);const t=c.filter(i=>i.isNew);t.length>0&&s>0&&(w(),x(),setTimeout(()=>{t.forEach(i=>d.markViewed(i.id))},2e3)),$(!0)}function F(e){if(console.error("[Kiosk] Error:",e),$(!1),c.length===0){const s=document.getElementById("casesContainer");s&&(s.innerHTML=`
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h2>Verbindungsfehler / Connection Error</h2>
          <p>${e.message||"Unable to connect to case monitoring system"}</p>
          <p class="error-hint">Checking again in ${l.pollInterval/1e3} seconds...</p>
        </div>
      `)}}function K(e){const s=document.getElementById("caseCount");if(s){const t=e.count||0;s.textContent=`${t} ${t===1?"Case":"Cases"}`,s.className=`case-count-badge ${t>0?"has-cases":""}`}}function $(e){const s=document.getElementById("connectionStatus");s&&(s.className=`status-indicator ${e?"connected":"disconnected"}`,s.title=e?"Connected":"Disconnected")}function b(){const e=document.getElementById("currentTime");if(e){const s=new Date;e.textContent=s.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}}function D(){document.addEventListener("click",()=>{o||(o=new(window.AudioContext||window.webkitAudioContext),console.log("[Kiosk] Audio initialized"))},{once:!0})}function w(){if(o)try{const e=o.createOscillator(),s=o.createGain();e.connect(s),s.connect(o.destination),e.frequency.value=880,e.type="sine",s.gain.setValueAtTime(l.audioAlertVolume,o.currentTime),s.gain.exponentialRampToValueAtTime(.01,o.currentTime+.5),e.start(o.currentTime),e.stop(o.currentTime+.5),console.log("[Kiosk] Alert sound played")}catch(e){console.warn("[Kiosk] Audio playback failed:",e)}}function x(){document.body.classList.add("flash-alert"),setTimeout(()=>{document.body.classList.remove("flash-alert")},1e3)}function O(){document.addEventListener("click",e=>{const s=e.target.closest(".case-card");if(s){const t=s.dataset.caseId;if(t){const i=d.getCase(t);i&&(S(i),d.markViewed(t))}}(e.target.classList.contains("modal-overlay")||e.target.classList.contains("close-modal"))&&C()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&C()}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(console.log("[Kiosk] Tab visible - fetching latest cases"),d.fetchCases())})}function C(){const e=document.getElementById("caseDetailModal");e&&(e.style.display="none",e.querySelector(".modal-content").innerHTML="")}window.addEventListener("error",e=>{console.error("[Kiosk] Unhandled error:",e.error)});window.addEventListener("unhandledrejection",e=>{console.error("[Kiosk] Unhandled rejection:",e.reason)});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",k):k();window.kioskApp={getCases:()=>c,getStatus:()=>d.getStatus(),refresh:()=>d.fetchCases(),playAlert:()=>w()};
//# sourceMappingURL=index-DNCO7RZm.js.map
