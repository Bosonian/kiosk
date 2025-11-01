(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function n(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(s){if(s.ep)return;s.ep=!0;const o=n(s);fetch(s.href,o)}})();const N="modulepreload",U=function(e){return"/kiosk/"+e},k={},P=function(t,n,i){let s=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),l=r?.nonce||r?.getAttribute("nonce");s=Promise.allSettled(n.map(d=>{if(d=U(d),d in k)return;k[d]=!0;const g=d.endsWith(".css"),v=g?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${v}`))return;const f=document.createElement("link");if(f.rel=g?"stylesheet":N,g||(f.as="script"),f.crossOrigin="",f.href=d,l&&f.setAttribute("nonce",l),document.head.appendChild(f),g)return new Promise((b,M)=>{f.addEventListener("load",b),f.addEventListener("error",()=>M(new Error(`Unable to preload CSS for ${d}`)))})}))}function o(r){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=r,window.dispatchEvent(l),!l.defaultPrevented)throw r}return s.then(r=>{for(const l of r||[])l.status==="rejected"&&o(l.reason);return t().catch(o)})},a={caseSharingUrl:"https://case-sharing-564499947017.europe-west3.run.app",pwaUrl:"https://igfap.eu/0825/",pollInterval:5e3,autoArchiveHours:2,staleGpsMinutes:5,hospitalId:(()=>{const e=localStorage.getItem("kiosk_hospital_id");return e===null?"BY-NS-001":e===""?null:e})(),hospitalName:localStorage.getItem("kiosk_hospital_name")||"LMU Klinikum München - Großhadern",googleMapsApiKey:"AIzaSyACBndIj8HD1wwZ4Vw8PDDI0bIe6DoBExI",playAudioAlert:!0,audioAlertVolume:.5,showArchivedCases:!1,maxCasesDisplay:20,theme:"dark"},L=[{id:"BY-NS-001",name:"LMU Klinikum München - Großhadern"},{id:"BY-NS-002",name:"Klinikum Rechts der Isar"},{id:"BY-NS-003",name:"Helios Klinikum München West"},{id:"BY-NS-004",name:"Klinikum Bogenhausen"},{id:"BW-NS-001",name:"Universitätsklinikum Tübingen"},{id:"BW-NS-005",name:"Klinikum Stuttgart - Katharinenhospital"},{id:"BW-NS-003",name:"Universitätsklinikum Freiburg"},{id:"ALL",name:"🌐 All Hospitals (Show All Cases)"}];function R(e){const t=L.find(n=>n.id===e);t&&(e==="ALL"?(localStorage.setItem("kiosk_hospital_id",""),localStorage.setItem("kiosk_hospital_name",t.name)):(localStorage.setItem("kiosk_hospital_id",e),localStorage.setItem("kiosk_hospital_name",t.name)),a.hospitalId=e==="ALL"?null:e,a.hospitalName=t.name,window.location.reload())}const p={IMMEDIATE:{color:"#ff4444",icon:"🚨",priority:0},TIME_CRITICAL:{color:"#ff8800",icon:"⏰",priority:1},URGENT:{color:"#ffcc00",icon:"⚠️",priority:2},STANDARD:{color:"#4a90e2",icon:"🏥",priority:3}},B=Object.freeze(Object.defineProperty({__proto__:null,AVAILABLE_HOSPITALS:L,KIOSK_CONFIG:a,URGENCY_CONFIG:p,setHospital:R},Symbol.toStringTag,{value:"Module"})),u={NEW_CASE_VIEWED_DELAY_MS:2e3,ALERT_BEEP_DURATION_SEC:.5,ALERT_BEEP_FREQUENCY_HZ:880,ALERT_BEEP_VOLUME:.5,FETCH_TIMEOUT_MS:8e3,MAX_RETRY_ATTEMPTS:3,RETRY_DELAYS_MS:[2e3,4e3,8e3],CASE_STALE_THRESHOLD_MINUTES:30};function K(e){return e>70?"#ff4444":e>50?"#ff8800":e>30?"#ffcc00":"#4a90e2"}function x(e){return e.updatedAt?e.updatedAt:e.receivedAt?e.receivedAt:e.tracking?.lastUpdated?e.tracking.lastUpdated:e.createdAt||new Date}function O(e){const t=new Date,n=e instanceof Date?e:new Date(e);if(isNaN(n.getTime()))return"Unknown";const i=Math.max(0,Math.floor((t-n)/1e3));if(i<60)return`${i}s ago`;const s=Math.floor(i/60);return s<60?`${s}m ago`:`${Math.floor(s/60)}h ${s%60}m ago`}function H(e){if(e==null||e==="?")return"?";const t=typeof e=="string"?parseFloat(e):e;return isNaN(t)?"?":t<=0?"Arrived":t<1?"< 1":Math.round(t).toString()}function F(e,t=5){if(!e)return!0;try{const n=new Date(e);return isNaN(n.getTime())?!0:(new Date-n)/(1e3*60)>t}catch{return!0}}function V(e,t=u.CASE_STALE_THRESHOLD_MINUTES){if(!e)return!1;try{const n=e instanceof Date?e:new Date(e);return isNaN(n.getTime())?!1:(new Date-n)/(1e3*60)>t}catch{return!1}}function Y(e){return!(!e||typeof e!="object"||!e.id||typeof e.id!="string")}function D(e){if(typeof AbortSignal<"u"&&AbortSignal.timeout)return AbortSignal.timeout(e);const t=new AbortController,n=setTimeout(()=>{t.abort(new Error(`Timeout after ${e}ms`))},e);return t.signal.addEventListener("abort",()=>{clearTimeout(n)},{once:!0}),t.signal}function j(e){return new Promise(t=>setTimeout(t,e))}class G{constructor(){this.baseUrl=a.caseSharingUrl,this.pollInterval=a.pollInterval,this.intervalId=null,this.cases=new Map,this.onUpdate=null,this.onError=null,this.lastFetchTime=null,this.isConnected=!1,this.retryCount=0}start(t,n){this.onUpdate=t,this.onError=n,this.fetchCases(),this.intervalId=setInterval(()=>{this.fetchCases()},this.pollInterval),console.log("[CaseListener] Started polling every",this.pollInterval,"ms")}stop(){this.intervalId&&(clearInterval(this.intervalId),this.intervalId=null,console.log("[CaseListener] Stopped polling"))}async fetchCases(){let t=null;for(let n=0;n<=u.MAX_RETRY_ATTEMPTS;n++)try{const i=this.buildFetchUrl(),s=await fetch(i,{method:"GET",headers:{Accept:"application/json"},signal:D(u.FETCH_TIMEOUT_MS)});if(!s.ok)throw new Error(`HTTP ${s.status}: ${s.statusText}`);const o=await s.json();if(!o.success)throw new Error(o.error||"Failed to fetch cases");this.retryCount=0,this.isConnected=!0,this.lastFetchTime=new Date,this.processCases(o.cases||[]),this.onUpdate&&this.onUpdate({cases:Array.from(this.cases.values()),timestamp:o.timestamp,count:o.count});return}catch(i){if(t=i,console.error(`[CaseListener] Fetch error (attempt ${n+1}/${u.MAX_RETRY_ATTEMPTS+1}):`,i),n<u.MAX_RETRY_ATTEMPTS){const s=u.RETRY_DELAYS_MS[n]||8e3;console.log(`[CaseListener] Retrying in ${s}ms...`),await j(s)}}console.error("[CaseListener] All retry attempts failed:",t),this.isConnected=!1,this.retryCount++,this.onError&&this.onError(t)}buildFetchUrl(){let t=`${this.baseUrl}/get-cases`;const n=new URLSearchParams;a.hospitalId&&n.append("hospitalId",a.hospitalId),n.append("status","in_transit");const i=n.toString();return i&&(t+=`?${i}`),t}processCases(t){const n=new Set(this.cases.keys()),i=new Set;t.forEach(s=>{if(!Y(s)){console.warn("[CaseListener] Invalid case data, skipping:",s);return}const o=s.id;i.add(o);const r=!this.cases.has(o),l=F(s.tracking?.lastUpdated,a.staleGpsMinutes),d={...s.tracking||{},gpsStale:l};this.cases.set(o,{...s,tracking:d,isNew:r,receivedAt:r?new Date:this.cases.get(o).receivedAt}),r&&(console.log("[CaseListener] New case:",o,this.getCaseSummary(s)),console.log("[CaseListener] Timestamps:",{createdAt:s.createdAt,updatedAt:s.updatedAt,receivedAt:s.receivedAt,trackingLastUpdated:s.tracking?.lastUpdated}))}),n.forEach(s=>{i.has(s)||(console.log("[CaseListener] Case removed:",s),this.cases.delete(s))})}getCaseSummary(t){const n=Math.round((t.results?.ich?.probability||0)*100),i=t.tracking?.duration||"?";return{module:t.moduleType,ich:`${n}%`,eta:`${i} min`,urgency:t.urgency}}getCases(){return Array.from(this.cases.values())}getCase(t){return this.cases.get(t)}markViewed(t){const n=this.cases.get(t);n&&(n.isNew=!1,this.cases.set(t,n))}async dismissCase(t){try{const n=`${this.baseUrl}/archive-case`,i=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({caseId:t,reason:"dismissed_by_kiosk"}),signal:AbortSignal.timeout(8e3)});if(!i.ok)throw new Error(`HTTP ${i.status}: ${i.statusText}`);const s=await i.json();if(!s.success)throw new Error(s.error||"Failed to dismiss case");return this.cases.delete(t),console.log("[CaseListener] Case dismissed:",t),this.onUpdate&&this.onUpdate({cases:Array.from(this.cases.values()),timestamp:new Date().toISOString(),count:this.cases.size}),s}catch(n){throw console.error("[CaseListener] Dismiss error:",n),n}}getStatus(){return{isConnected:this.isConnected,lastFetchTime:this.lastFetchTime,caseCount:this.cases.size,isPolling:this.intervalId!==null}}}const m=new G;function z(e){const t=document.getElementById("casesContainer");if(!t)return;if(!e||e.length===0){t.innerHTML=`
      <div class="no-cases-state">
        <div class="no-cases-icon">✓</div>
        <h2>Keine aktiven Fälle / No Active Cases</h2>
        <p>Das System ist aktiv und überwacht eingehende Fälle</p>
        <p>System is active and monitoring incoming cases</p>
      </div>
    `;return}const n=W(e),s=n.slice(0,a.maxCasesDisplay).map(r=>X(r)).join(""),o=n.length>a.maxCasesDisplay?`<div class="truncated-warning" role="alert">
         Showing ${a.maxCasesDisplay} of ${n.length} cases
       </div>`:"";t.innerHTML=`
    ${o}
    <div class="cases-grid" role="list" aria-label="Active cases">
      ${s}
    </div>
  `}function W(e){return[...e].sort((t,n)=>{const i=p[t.urgency]?.priority??10,s=p[n.urgency]?.priority??10;if(i!==s)return i-s;const o=t.tracking?.duration||9999,r=n.tracking?.duration||9999;return o-r})}function q(e){if(!e)return"PAT-0000";let t=0;for(let i=0;i<e.length;i++)t=(t<<5)-t+e.charCodeAt(i),t=t&t;return`PAT-${Math.abs(t%1e4).toString().padStart(4,"0")}`}function X(e){const t=p[e.urgency]||p.STANDARD,n=Math.round((e.results?.ich?.probability||0)*100),i=e.results?.lvo?Math.round(e.results.lvo.probability*100):null,s=H(e.tracking?.duration),o=e.tracking?.distance||"?",r=q(e.id),l=e.tracking?.gpsStale||!1,d=x(e),g=V(d),v=O(d),f=`${e.urgency} case, ${r}, ICH risk ${n}%, ETA ${s} minutes`;return`
    <div class="case-card ${e.urgency.toLowerCase()} ${e.isNew?"new-case":""} ${g?"stale-case":""}"
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
          <span class="patient-code">${r}</span>
          <span class="module-type">${e.moduleType}</span>
        </div>
      </div>

      <div class="case-risks">
        <div class="risk-circle-container">
          ${A(n,"ICH")}
        </div>

        ${i!==null?`
          <div class="risk-circle-container">
            ${A(i,"LVO")}
          </div>
        `:""}
      </div>

      <div class="case-eta">
        <div class="eta-main ${l?"stale":""}">
          <span class="eta-value">${s}</span>
          <span class="eta-unit">${s==="Arrived"||s==="?"?"":"min"}</span>
        </div>
        <div class="eta-details">
          <span class="distance">${typeof o=="number"?o.toFixed(1):o} km</span>
          ${l?'<span class="gps-stale-warning" role="alert">⚠️ GPS stale</span>':""}
        </div>
      </div>

      <div class="case-footer">
        <span class="case-time">${v}</span>
        <span class="view-details">View Details →</span>
      </div>
    </div>
  `}function A(e,t){const n=K(e),i=Math.PI*100,s=i*(1-e/100);return`
    <svg class="risk-ring-svg ${e>70?"critical":e>50?"high":e>30?"medium":"low"}" viewBox="0 0 120 120" width="80" height="80">
      <!-- Background circle -->
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        stroke-width="8"/>

      <!-- Progress circle -->
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="none"
        stroke="${n}"
        stroke-width="8"
        stroke-dasharray="${i}"
        stroke-dashoffset="${s}"
        stroke-linecap="round"
        transform="rotate(-90 60 60)"/>

      <!-- Percentage text -->
      <text
        x="60"
        y="65"
        text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="20"
        font-weight="bold"
        fill="#ffffff"
        style="pointer-events: none;">
        ${e}%
      </text>
    </svg>
    <div class="risk-label">${t}</div>
  `}let h=[],c=null,y=null,E=!0;async function T(){console.log("[Kiosk] Initializing...",a),ee(),te(),w(),y=setInterval(w,1e3),ie(),m.start(e=>Q(e),e=>J(e)),re(),window.addEventListener("beforeunload",Z),console.log("[Kiosk] Initialized successfully")}function Z(){console.log("[Kiosk] Cleaning up resources..."),m.stop(),y&&(clearInterval(y),y=null),c&&c.state!=="closed"&&c.close().catch(e=>{console.warn("[Kiosk] Error closing audio context:",e)})}function Q(e){const t=h.length;h=e.cases||[],console.log("[Kiosk] Cases updated:",{count:h.length,previous:t}),z(h),ne(e);const n=h.filter(i=>i.isNew);n.length>0&&!E&&($(),oe(),setTimeout(()=>{n.forEach(i=>m.markViewed(i.id))},u.NEW_CASE_VIEWED_DELAY_MS)),E&&(E=!1),_(!0)}function J(e){if(console.error("[Kiosk] Error:",e),_(!1),h.length===0){const t=document.getElementById("casesContainer");t&&(t.innerHTML=`
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h2>Verbindungsfehler / Connection Error</h2>
          <p>${e.message||"Unable to connect to case monitoring system"}</p>
          <p class="error-hint">Checking again in ${a.pollInterval/1e3} seconds...</p>
        </div>
      `)}}function ee(){const e=document.getElementById("hospitalSelector");e&&P(async()=>{const{AVAILABLE_HOSPITALS:t,setHospital:n}=await Promise.resolve().then(()=>B);return{AVAILABLE_HOSPITALS:t,setHospital:n}},void 0).then(({AVAILABLE_HOSPITALS:t,setHospital:n})=>{e.innerHTML=t.map(i=>{const s=i.id==="ALL"&&a.hospitalId===null||i.id===a.hospitalId;return`<option value="${i.id}" ${s?"selected":""}>${i.name}</option>`}).join(""),e.addEventListener("change",i=>{const s=i.target.value;confirm(`Switch to ${i.target.options[i.target.selectedIndex].text}?

This will reload the page.`)?n(s):e.value=a.hospitalId===null?"ALL":a.hospitalId})})}function te(){const e=localStorage.getItem("kiosk_theme")||a.theme;I(e);const t=document.getElementById("themeToggle");t&&t.addEventListener("click",se),console.log("[Kiosk] Theme initialized:",e)}function se(){const t=(document.documentElement.getAttribute("data-theme")||"dark")==="dark"?"light":"dark";I(t),localStorage.setItem("kiosk_theme",t),console.log("[Kiosk] Theme switched to:",t)}function I(e){document.documentElement.setAttribute("data-theme",e);const t=document.querySelector(".theme-icon");t&&(t.textContent=e==="dark"?"☀️":"🌙")}function ne(e){const t=document.getElementById("caseCount");if(t){const n=e.count||0;t.textContent=`${n} ${n===1?"Case":"Cases"}`,t.className=`case-count-badge ${n>0?"has-cases":""}`}}function _(e){const t=document.getElementById("connectionStatus");t&&(t.className=`status-indicator ${e?"connected":"disconnected"}`,t.title=e?"Connected":"Disconnected",t.setAttribute("aria-label",`Connection status: ${e?"connected":"disconnected"}`))}function w(){const e=document.getElementById("currentTime");if(e){const t=new Date;e.textContent=t.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}}function ie(){document.addEventListener("click",()=>{c||(c=new(window.AudioContext||window.webkitAudioContext),console.log("[Kiosk] Audio initialized"))},{once:!0})}async function $(){if(c)try{c.state==="suspended"&&(await c.resume(),console.log("[Kiosk] Audio context resumed"));const e=c.createOscillator(),t=c.createGain();e.connect(t),t.connect(c.destination),e.frequency.value=u.ALERT_BEEP_FREQUENCY_HZ,e.type="sine",t.gain.setValueAtTime(u.ALERT_BEEP_VOLUME,c.currentTime),t.gain.exponentialRampToValueAtTime(.01,c.currentTime+u.ALERT_BEEP_DURATION_SEC),e.start(c.currentTime),e.stop(c.currentTime+u.ALERT_BEEP_DURATION_SEC),console.log("[Kiosk] Alert sound played")}catch(e){console.warn("[Kiosk] Audio playback failed:",e)}}function oe(){document.body.classList.add("flash-alert"),setTimeout(()=>{document.body.classList.remove("flash-alert")},1e3)}function re(){document.addEventListener("click",e=>{const t=e.target.closest(".case-card");if(t){const i=t.dataset.caseId;if(i){const s=`${a.pwaUrl}#results?display=kiosk&caseId=${i}`;window.location.href=s,m.markViewed(i)}}const n=e.target.closest(".dismiss-case-button");if(n){const i=n.dataset.caseId;i&&S(i)}(e.target.classList.contains("modal-overlay")||e.target.classList.contains("close-modal"))&&C()}),document.addEventListener("keydown",e=>{if(e.key==="Escape"){C();return}if(e.key==="Enter"||e.key===" "){const t=e.target.closest(".case-card");if(t){e.preventDefault();const n=t.dataset.caseId;if(n){const i=`https://igfap.eu/0825/#results?display=kiosk&caseId=${n}`;window.location.href=i,m.markViewed(n)}}}}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(console.log("[Kiosk] Tab visible - fetching latest cases"),m.fetchCases())}),window.addEventListener("dismissCase",e=>{const t=e.detail?.caseId;t?(console.log("[Kiosk] Received dismissCase event for:",t),S(t)):console.error("[Kiosk] dismissCase event missing caseId")})}async function S(e){const t=m.getCase(e);if(!t){console.warn("[Kiosk] Case not found:",e);return}const n=`Are you sure you want to dismiss this case?

Ambulance: ${t.ambulanceId}
Module: ${t.moduleType}
ICH Risk: ${Math.round((t.results?.ich?.probability||0)*100)}%

This action will archive the case.`;if(!confirm(n)){console.log("[Kiosk] Case dismissal cancelled");return}try{const s=document.querySelector(`[data-case-id="${e}"]`);s&&(s.disabled=!0,s.textContent="Dismissing..."),await m.dismissCase(e),console.log("[Kiosk] Case dismissed successfully:",e),C(),document.body.classList.add("flash-success"),setTimeout(()=>{document.body.classList.remove("flash-success")},500)}catch(s){console.error("[Kiosk] Failed to dismiss case:",s),alert(`Failed to dismiss case:
${s.message}

Please try again or contact support.`);const o=document.querySelector(`[data-case-id="${e}"]`);o&&(o.disabled=!1,o.textContent="🗑️ Dismiss Case")}}function C(){const e=document.getElementById("caseDetailModal");e&&(e.style.display="none",e.querySelector(".modal-content").innerHTML="")}window.addEventListener("error",e=>{console.error("[Kiosk] Unhandled error:",e.error)});window.addEventListener("unhandledrejection",e=>{console.error("[Kiosk] Unhandled rejection:",e.reason)});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",T):T();window.kioskApp={getCases:()=>h,getStatus:()=>m.getStatus(),refresh:()=>m.fetchCases(),playAlert:()=>$()};
//# sourceMappingURL=index-CGthO8TG.js.map
