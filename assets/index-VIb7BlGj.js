(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function s(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=s(n);fetch(n.href,a)}})();const M="modulepreload",U=function(e){return"/kiosk/"+e},f={},_=function(t,s,i){let n=Promise.resolve();if(s&&s.length>0){document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),r=o?.nonce||o?.getAttribute("nonce");n=Promise.allSettled(s.map(c=>{if(c=U(c),c in f)return;f[c]=!0;const g=c.endsWith(".css"),E=g?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${E}`))return;const u=document.createElement("link");if(u.rel=g?"stylesheet":M,g||(u.as="script"),u.crossOrigin="",u.href=c,r&&u.setAttribute("nonce",r),document.head.appendChild(u),g)return new Promise((T,N)=>{u.addEventListener("load",T),u.addEventListener("error",()=>N(new Error(`Unable to preload CSS for ${c}`)))})}))}function a(o){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=o,window.dispatchEvent(r),!r.defaultPrevented)throw o}return n.then(o=>{for(const r of o||[])r.status==="rejected"&&a(r.reason);return t().catch(a)})},l={caseSharingUrl:"https://case-sharing-564499947017.europe-west3.run.app",pollInterval:5e3,autoArchiveHours:2,staleGpsMinutes:5,hospitalId:localStorage.getItem("kiosk_hospital_id")||"BY-NS-001",hospitalName:localStorage.getItem("kiosk_hospital_name")||"LMU Klinikum München - Notaufnahme",googleMapsApiKey:"AIzaSyACBndIj8HD1wwZ4Vw8PDDI0bIe6DoBExI",playAudioAlert:!0,audioAlertVolume:.5,showArchivedCases:!1,maxCasesDisplay:20,theme:"dark"},L=[{id:"BY-NS-001",name:"LMU Klinikum München - Großhadern"},{id:"BY-NS-002",name:"Klinikum Rechts der Isar"},{id:"BY-NS-003",name:"Helios Klinikum München West"},{id:"BY-NS-004",name:"Klinikum Bogenhausen"},{id:"BW-NS-001",name:"Universitätsklinikum Tübingen"},{id:"BW-NS-002",name:"Klinikum Stuttgart"},{id:"BW-NS-003",name:"Universitätsklinikum Freiburg"},{id:"ALL",name:"🌐 All Hospitals (Show All Cases)"}];function B(e){const t=L.find(s=>s.id===e);t&&(e==="ALL"?(localStorage.setItem("kiosk_hospital_id",""),localStorage.setItem("kiosk_hospital_name",t.name)):(localStorage.setItem("kiosk_hospital_id",e),localStorage.setItem("kiosk_hospital_name",t.name)),l.hospitalId=e==="ALL"?null:e,l.hospitalName=t.name,window.location.reload())}const m={IMMEDIATE:{color:"#ff4444",icon:"🚨",priority:0},TIME_CRITICAL:{color:"#ff8800",icon:"⏰",priority:1},URGENT:{color:"#ffcc00",icon:"⚠️",priority:2},STANDARD:{color:"#4a90e2",icon:"🏥",priority:3}},P=Object.freeze(Object.defineProperty({__proto__:null,AVAILABLE_HOSPITALS:L,KIOSK_CONFIG:l,URGENCY_CONFIG:m,setHospital:B},Symbol.toStringTag,{value:"Module"}));class R{constructor(){this.baseUrl=l.caseSharingUrl,this.pollInterval=l.pollInterval,this.hospitalId=l.hospitalId,this.intervalId=null,this.cases=new Map,this.onUpdate=null,this.onError=null,this.lastFetchTime=null,this.isConnected=!1}start(t,s){this.onUpdate=t,this.onError=s,this.fetchCases(),this.intervalId=setInterval(()=>{this.fetchCases()},this.pollInterval),console.log("[CaseListener] Started polling every",this.pollInterval,"ms")}stop(){this.intervalId&&(clearInterval(this.intervalId),this.intervalId=null,console.log("[CaseListener] Stopped polling"))}async fetchCases(){try{const t=this.buildFetchUrl(),s=await fetch(t,{method:"GET",headers:{Accept:"application/json"},signal:AbortSignal.timeout(8e3)});if(!s.ok)throw new Error(`HTTP ${s.status}: ${s.statusText}`);const i=await s.json();if(!i.success)throw new Error(i.error||"Failed to fetch cases");this.isConnected=!0,this.lastFetchTime=new Date,this.processCases(i.cases||[]),this.onUpdate&&this.onUpdate({cases:Array.from(this.cases.values()),timestamp:i.timestamp,count:i.count})}catch(t){console.error("[CaseListener] Fetch error:",t),this.isConnected=!1,this.onError&&this.onError(t)}}buildFetchUrl(){let t=`${this.baseUrl}/get-cases`;const s=new URLSearchParams;this.hospitalId&&s.append("hospitalId",this.hospitalId),s.append("status","in_transit");const i=s.toString();return i&&(t+=`?${i}`),t}processCases(t){const s=new Set(this.cases.keys()),i=new Set;t.forEach(n=>{const a=n.id;i.add(a);const o=!this.cases.has(a);this.cases.set(a,{...n,isNew:o,receivedAt:o?new Date:this.cases.get(a).receivedAt}),o&&console.log("[CaseListener] New case:",a,this.getCaseSummary(n))}),s.forEach(n=>{i.has(n)||(console.log("[CaseListener] Case removed:",n),this.cases.delete(n))})}getCaseSummary(t){const s=Math.round((t.results?.ich?.probability||0)*100),i=t.tracking?.duration||"?";return{module:t.moduleType,ich:`${s}%`,eta:`${i} min`,urgency:t.urgency}}getCases(){return Array.from(this.cases.values())}getCase(t){return this.cases.get(t)}markViewed(t){const s=this.cases.get(t);s&&(s.isNew=!1,this.cases.set(t,s))}getStatus(){return{isConnected:this.isConnected,lastFetchTime:this.lastFetchTime,caseCount:this.cases.size,isPolling:this.intervalId!==null}}}const h=new R;function H(e){const t=document.getElementById("casesContainer");if(!t)return;if(!e||e.length===0){t.innerHTML=`
      <div class="no-cases-state">
        <div class="no-cases-icon">✓</div>
        <h2>Keine aktiven Fälle / No Active Cases</h2>
        <p>Das System ist aktiv und überwacht eingehende Fälle</p>
        <p>System is active and monitoring incoming cases</p>
      </div>
    `;return}const i=K(e).map(n=>O(n)).join("");t.innerHTML=`
    <div class="cases-grid">
      ${i}
    </div>
  `}function K(e){return[...e].sort((t,s)=>{const i=m[t.urgency]?.priority??10,n=m[s.urgency]?.priority??10;if(i!==n)return i-n;const a=t.tracking?.duration||9999,o=s.tracking?.duration||9999;return a-o})}function O(e){const t=m[e.urgency]||m.STANDARD,s=Math.round((e.results?.ich?.probability||0)*100),i=e.results?.lvo?Math.round(e.results.lvo.probability*100):null,n=e.tracking?.duration||"?",a=e.tracking?.distance||"?",o=e.tracking?.gpsStale||!1,r=F(e.createdAt);return`
    <div class="case-card ${e.urgency.toLowerCase()} ${e.isNew?"new-case":""}"
         data-case-id="${e.id}"
         style="border-color: ${t.color}">

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
        <div class="eta-main ${o?"stale":""}">
          <span class="eta-value">${n}</span>
          <span class="eta-unit">min</span>
        </div>
        <div class="eta-details">
          <span class="distance">${typeof a=="number"?a.toFixed(1):a} km</span>
          ${o?'<span class="gps-stale-warning">⚠️ GPS stale</span>':""}
        </div>
      </div>

      <div class="case-footer">
        <span class="case-time">${r}</span>
        <span class="view-details">View Details →</span>
      </div>
    </div>
  `}function k(e){return e>70?"#ff4444":e>50?"#ff8800":e>30?"#ffcc00":"#4a90e2"}function F(e){const t=new Date,s=new Date(e),i=Math.floor((t-s)/1e3);if(i<60)return`${i}s ago`;const n=Math.floor(i/60);return n<60?`${n}m ago`:`${Math.floor(n/60)}h ${n%60}m ago`}function D(e){const t=document.getElementById("caseDetailModal");if(!t)return;const s=t.querySelector(".modal-content");s&&(s.innerHTML=V(e),t.style.display="flex")}function V(e){const{results:t,formData:s,moduleType:i,ambulanceId:n,tracking:a,urgency:o}=e,r=Math.round((t?.ich?.probability||0)*100),c=t?.lvo?Math.round(t.lvo.probability*100):null;return`
    <div class="case-detail-container">
      <div class="detail-header">
        <div class="header-left">
          <h2>Case Details</h2>
          <div class="case-badges">
            <span class="badge urgency-badge">${o}</span>
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
              <div class="risk-value-large" style="color: ${y(r)}">${r}%</div>
              <div class="risk-level-large">${b(r)}</div>
            </div>

            ${c!==null?`
              <div class="risk-item-large">
                <div class="risk-label-large">LVO Risk</div>
                <div class="risk-value-large" style="color: ${y(c)}">${c}%</div>
                <div class="risk-level-large">${b(c)}</div>
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
              <div class="tracking-value">${a?.lastUpdated?C(a.lastUpdated):"Unknown"}</div>
            </div>
            <div class="tracking-item">
              <div class="tracking-label">Estimated Arrival</div>
              <div class="tracking-value">${a?.estimatedArrival?C(a.estimatedArrival):"Unknown"}</div>
            </div>
          </div>
        </div>

        <div class="content-section">
          <h3>📋 Assessment Data</h3>
          <div class="data-table">
            ${x(s)}
          </div>
        </div>

        ${t?.ich?.drivers?`
          <div class="content-section">
            <h3>⚡ Risk Factors</h3>
            ${j(t.ich.drivers)}
          </div>
        `:""}
      </div>

      <div class="detail-footer">
        <button class="close-modal secondary-button">Close</button>
      </div>
    </div>
  `}function y(e){return e>70?"#ff4444":e>50?"#ff8800":e>30?"#ffcc00":"#4a90e2"}function b(e){return e>70?"Very High Risk":e>50?"High Risk":e>30?"Moderate Risk":"Low Risk"}function C(e){try{return new Date(e).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}catch{return"Invalid time"}}function x(e){return!e||Object.keys(e).length===0?"<p>No assessment data available</p>":Object.entries(e).filter(([t,s])=>s!=null&&s!=="").map(([t,s])=>`
      <div class="data-row">
        <div class="data-label">${p(t)}</div>
        <div class="data-value">${s}</div>
      </div>
    `).join("")}function p(e){return e.replace(/_/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function j(e){if(!e||!e.positive&&!e.negative)return"<p>No driver data available</p>";const t=e.positive||[],s=e.negative||[];return`
    <div class="drivers-container">
      <div class="drivers-column">
        <h4>⬆ Increasing Risk</h4>
        ${t.length>0?t.map(i=>`
              <div class="driver-item positive">
                <span class="driver-label">${p(i.label)}</span>
                <span class="driver-value">${(Math.abs(i.weight)*100).toFixed(1)}%</span>
              </div>
            `).join(""):'<p class="no-drivers">None</p>'}
      </div>

      <div class="drivers-column">
        <h4>⬇ Decreasing Risk</h4>
        ${s.length>0?s.map(i=>`
              <div class="driver-item negative">
                <span class="driver-label">${p(i.label)}</span>
                <span class="driver-value">${(Math.abs(i.weight)*100).toFixed(1)}%</span>
              </div>
            `).join(""):'<p class="no-drivers">None</p>'}
      </div>
    </div>
  `}let v=[],d=null;async function w(){console.log("[Kiosk] Initializing...",l),q(),$(),setInterval($,1e3),W(),h.start(e=>G(e),e=>z(e)),J(),console.log("[Kiosk] Initialized successfully")}function G(e){const t=v.length;v=e.cases||[],console.log("[Kiosk] Cases updated:",{count:v.length,previous:t}),H(v),Y(e);const s=v.filter(i=>i.isNew);s.length>0&&t>0&&(A(),Z(),setTimeout(()=>{s.forEach(i=>h.markViewed(i.id))},2e3)),S(!0)}function z(e){if(console.error("[Kiosk] Error:",e),S(!1),v.length===0){const t=document.getElementById("casesContainer");t&&(t.innerHTML=`
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h2>Verbindungsfehler / Connection Error</h2>
          <p>${e.message||"Unable to connect to case monitoring system"}</p>
          <p class="error-hint">Checking again in ${l.pollInterval/1e3} seconds...</p>
        </div>
      `)}}function q(){const e=document.getElementById("hospitalSelector");e&&_(async()=>{const{AVAILABLE_HOSPITALS:t,setHospital:s}=await Promise.resolve().then(()=>P);return{AVAILABLE_HOSPITALS:t,setHospital:s}},void 0).then(({AVAILABLE_HOSPITALS:t,setHospital:s})=>{e.innerHTML=t.map(i=>`<option value="${i.id}" ${i.id===l.hospitalId||i.id==="ALL"&&!l.hospitalId?"selected":""}>${i.name}</option>`).join(""),e.addEventListener("change",i=>{const n=i.target.value;confirm(`Switch to ${i.target.options[i.target.selectedIndex].text}?

This will reload the page.`)?s(n):e.value=l.hospitalId||"ALL"})})}function Y(e){const t=document.getElementById("caseCount");if(t){const s=e.count||0;t.textContent=`${s} ${s===1?"Case":"Cases"}`,t.className=`case-count-badge ${s>0?"has-cases":""}`}}function S(e){const t=document.getElementById("connectionStatus");t&&(t.className=`status-indicator ${e?"connected":"disconnected"}`,t.title=e?"Connected":"Disconnected")}function $(){const e=document.getElementById("currentTime");if(e){const t=new Date;e.textContent=t.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}}function W(){document.addEventListener("click",()=>{d||(d=new(window.AudioContext||window.webkitAudioContext),console.log("[Kiosk] Audio initialized"))},{once:!0})}function A(){if(d)try{const e=d.createOscillator(),t=d.createGain();e.connect(t),t.connect(d.destination),e.frequency.value=880,e.type="sine",t.gain.setValueAtTime(l.audioAlertVolume,d.currentTime),t.gain.exponentialRampToValueAtTime(.01,d.currentTime+.5),e.start(d.currentTime),e.stop(d.currentTime+.5),console.log("[Kiosk] Alert sound played")}catch(e){console.warn("[Kiosk] Audio playback failed:",e)}}function Z(){document.body.classList.add("flash-alert"),setTimeout(()=>{document.body.classList.remove("flash-alert")},1e3)}function J(){document.addEventListener("click",e=>{const t=e.target.closest(".case-card");if(t){const s=t.dataset.caseId;if(s){const i=h.getCase(s);i&&(D(i),h.markViewed(s))}}(e.target.classList.contains("modal-overlay")||e.target.classList.contains("close-modal"))&&I()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&I()}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(console.log("[Kiosk] Tab visible - fetching latest cases"),h.fetchCases())})}function I(){const e=document.getElementById("caseDetailModal");e&&(e.style.display="none",e.querySelector(".modal-content").innerHTML="")}window.addEventListener("error",e=>{console.error("[Kiosk] Unhandled error:",e.error)});window.addEventListener("unhandledrejection",e=>{console.error("[Kiosk] Unhandled rejection:",e.reason)});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",w):w();window.kioskApp={getCases:()=>v,getStatus:()=>h.getStatus(),refresh:()=>h.fetchCases(),playAlert:()=>A()};
//# sourceMappingURL=index-VIb7BlGj.js.map
