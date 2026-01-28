(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();const D="modulepreload",V=function(e){return"/kiosk/"+e},S={},z=function(t,n,r){let s=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),c=o?.nonce||o?.getAttribute("nonce");s=Promise.allSettled(n.map(a=>{if(a=V(a),a in S)return;S[a]=!0;const u=a.endsWith(".css"),v=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${a}"]${v}`))return;const g=document.createElement("link");if(g.rel=u?"stylesheet":D,u||(g.as="script"),g.crossOrigin="",g.href=a,c&&g.setAttribute("nonce",c),document.head.appendChild(g),u)return new Promise((C,K)=>{g.addEventListener("load",C),g.addEventListener("error",()=>K(new Error(`Unable to preload CSS for ${a}`)))})}))}function i(o){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=o,window.dispatchEvent(c),!c.defaultPrevented)throw o}return s.then(o=>{for(const c of o||[])c.status==="rejected"&&i(c.reason);return t().catch(i)})},I={en:{incomingCase:"Incoming Cases",noActiveCases:"No Active Cases",activeSystemMessage:"System is active and monitoring incoming cases"},de:{incomingCase:"Eingehende Fälle",noActiveCases:"Keine aktiven Fälle",activeSystemMessage:"Das System ist aktiv und überwacht eingehende Fälle"}};class F{constructor(){this.supportedLanguages=["en","de"],this.currentLanguage=this.detectLanguage()}detectLanguage(){const t=localStorage.getItem("language");return t&&this.supportedLanguages.includes(t)?t:(navigator.language||navigator.userLanguage).substring(0,2).toLowerCase()==="de"?"de":"en"}getCurrentLanguage(){return this.currentLanguage}setLanguage(t){return this.supportedLanguages.includes(t)?(this.currentLanguage=t,localStorage.setItem("language",t),window.dispatchEvent(new CustomEvent("languageChanged",{detail:{language:t}})),!0):!1}getSupportedLanguages(){return[...this.supportedLanguages]}t(t){return(I[this.currentLanguage]||I.en)[t]||t}toggleLanguage(){const t=this.currentLanguage==="en"?"de":"en";return this.setLanguage(t)}getLanguageDisplayName(t=null){const n=t||this.currentLanguage;return{en:"English",de:"Deutsch"}[n]||n}formatDateTime(t){const n=this.currentLanguage==="de"?"de-DE":"en-US";return new Intl.DateTimeFormat(n,{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(t)}formatTime(t){const n=this.currentLanguage==="de"?"de-DE":"en-US";return new Intl.DateTimeFormat(n,{hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(t)}}const E=new F,p=e=>E.t(e),l={caseSharingUrl:"https://case-sharing-564499947017.europe-west3.run.app",pwaUrl:"https://igfap.eu/0925/",pollInterval:5e3,autoArchiveHours:2,staleGpsMinutes:5,hospitalId:(()=>{const e=localStorage.getItem("kiosk_hospital_id");return e===null||e===""?null:e})(),hospitalName:localStorage.getItem("kiosk_hospital_name")||"LMU Klinikum München - Großhadern",googleMapsApiKey:"AIzaSyACBndIj8HD1wwZ4Vw8PDDI0bIe6DoBExI",playAudioAlert:!0,audioAlertVolume:.5,showArchivedCases:!1,maxCasesDisplay:20,theme:"dark"},R=[{id:"BY-NS-001",name:"LMU Klinikum München - Großhadern"},{id:"BY-NS-002",name:"Klinikum Rechts der Isar"},{id:"BY-NS-003",name:"Helios Klinikum München West"},{id:"BY-NS-004",name:"Klinikum Bogenhausen"},{id:"BW-NS-001",name:"Universitätsklinikum Tübingen"},{id:"BW-NS-005",name:"Klinikum Stuttgart - Katharinenhospital"},{id:"BW-NS-003",name:"Universitätsklinikum Freiburg"},{id:"ALL",name:"🌐 All Hospitals (Show All Cases)"}];function j(e){const t=R.find(n=>n.id===e);t&&(e==="ALL"?(localStorage.setItem("kiosk_hospital_id",""),localStorage.setItem("kiosk_hospital_name",t.name)):(localStorage.setItem("kiosk_hospital_id",e),localStorage.setItem("kiosk_hospital_name",t.name)),l.hospitalId=e==="ALL"?null:e,l.hospitalName=t.name,window.location.reload())}const L={IMMEDIATE:{color:"#ff4444",icon:"🚨",priority:0},TIME_CRITICAL:{color:"#ff8800",icon:"⏰",priority:1},URGENT:{color:"#ffcc00",icon:"⚠️",priority:2},STANDARD:{color:"#4a90e2",icon:"🏥",priority:3}},G=Object.freeze(Object.defineProperty({__proto__:null,AVAILABLE_HOSPITALS:R,KIOSK_CONFIG:l,URGENCY_CONFIG:L,setHospital:j},Symbol.toStringTag,{value:"Module"})),m={NEW_CASE_VIEWED_DELAY_MS:2e3,ALERT_BEEP_DURATION_SEC:.5,ALERT_BEEP_FREQUENCY_HZ:880,ALERT_BEEP_VOLUME:.5,FETCH_TIMEOUT_MS:8e3,MAX_RETRY_ATTEMPTS:3,RETRY_DELAYS_MS:[2e3,4e3,8e3],CASE_STALE_THRESHOLD_MINUTES:30};function Y(e){return e>70?"#ff4444":e>50?"#ff8800":e>30?"#ffcc00":"#4a90e2"}function W(e){return e.updatedAt?e.updatedAt:e.lastUpdated?e.lastUpdated:e.tracking?.lastUpdated?e.tracking.lastUpdated:e.createdAt||new Date}function Q(e){const t=new Date;let n=e instanceof Date?e.toISOString():String(e);typeof e=="string"&&!/Z$/.test(n)&&!/[+-]\d{2}:\d{2}$/.test(n)&&(n+="Z");const r=new Date(n);if(isNaN(r.getTime()))return"Unknown";const s=Math.max(0,Math.floor((t-r)/1e3));if(s<60)return`${s}s ago`;const i=Math.floor(s/60);return i<60?`${i}m ago`:`${Math.floor(i/60)}h ${i%60}m ago`}function q(e){if(e==null||e==="?")return"?";const t=typeof e=="string"?parseFloat(e):e;return isNaN(t)?"?":t<=0?"Arrived":t<1?"< 1":Math.round(t).toString()}function X(e,t=5){if(!e)return!0;try{const n=new Date(e);return isNaN(n.getTime())?!0:(new Date-n)/(1e3*60)>t}catch{return!0}}function Z(e,t=m.CASE_STALE_THRESHOLD_MINUTES){if(!e)return!1;try{const n=e instanceof Date?e:new Date(e);return isNaN(n.getTime())?!1:(new Date-n)/(1e3*60)>t}catch{return!1}}function J(e){return!(!e||typeof e!="object"||!e.id||typeof e.id!="string")}function ee(e){if(typeof AbortSignal<"u"&&AbortSignal.timeout)return AbortSignal.timeout(e);const t=new AbortController,n=setTimeout(()=>{t.abort(new Error(`Timeout after ${e}ms`))},e);return t.signal.addEventListener("abort",()=>{clearTimeout(n)},{once:!0}),t.signal}function te(e){return new Promise(t=>setTimeout(t,e))}class ne{constructor(){this.baseUrl=l.caseSharingUrl,this.pollInterval=l.pollInterval,this.intervalId=null,this.cases=new Map,this.onUpdate=null,this.onError=null,this.lastFetchTime=null,this.isConnected=!1,this.retryCount=0}start(t,n){this.onUpdate=t,this.onError=n,this.fetchCases(),this.intervalId=setInterval(()=>{this.fetchCases()},this.pollInterval),console.log("[CaseListener] Started polling every",this.pollInterval,"ms")}stop(){this.intervalId&&(clearInterval(this.intervalId),this.intervalId=null,console.log("[CaseListener] Stopped polling"))}async fetchCases(){let t=null;for(let n=0;n<=m.MAX_RETRY_ATTEMPTS;n++)try{const r=this.buildFetchUrl(),s=await fetch(r,{method:"GET",headers:{Accept:"application/json"},signal:ee(m.FETCH_TIMEOUT_MS)});if(!s.ok)throw new Error(`HTTP ${s.status}: ${s.statusText}`);const i=await s.json();if(!i.success)throw new Error(i.error||"Failed to fetch cases");this.retryCount=0,this.isConnected=!0,this.lastFetchTime=new Date,this.processCases(i.cases||[]),this.onUpdate&&this.onUpdate({cases:Array.from(this.cases.values()),timestamp:i.timestamp,count:i.count});return}catch(r){if(t=r,console.error(`[CaseListener] Fetch error (attempt ${n+1}/${m.MAX_RETRY_ATTEMPTS+1}):`,r),n<m.MAX_RETRY_ATTEMPTS){const s=m.RETRY_DELAYS_MS[n]||8e3;console.log(`[CaseListener] Retrying in ${s}ms...`),await te(s)}}console.error("[CaseListener] All retry attempts failed:",t),this.isConnected=!1,this.retryCount++,this.onError&&this.onError(t)}buildFetchUrl(){let t=`${this.baseUrl}/get-cases`;const n=new URLSearchParams;l.hospitalId&&l.hospitalId!=="ALL"&&n.append("hospitalId",l.hospitalId),n.append("status","in_transit");const r=n.toString();return r&&(t+=`?${r}`),t}processCases(t){const n=new Set(this.cases.keys()),r=new Set;t.forEach(s=>{if(!J(s)){console.warn("[CaseListener] Invalid case data, skipping:",s);return}const i=s.id;r.add(i);const o=!this.cases.has(i),c=X(s.tracking?.lastUpdated,l.staleGpsMinutes),a={...s.tracking||{},gpsStale:c};this.cases.set(i,{...s,tracking:a,isNew:o,receivedAt:o?new Date:this.cases.get(i).receivedAt}),o&&(console.log("[CaseListener] New case:",i,this.getCaseSummary(s)),console.log("[CaseListener] Timestamps:",{createdAt:s.createdAt,updatedAt:s.updatedAt,receivedAt:s.receivedAt,trackingLastUpdated:s.tracking?.lastUpdated}))}),n.forEach(s=>{r.has(s)||(console.log("[CaseListener] Case removed:",s),this.cases.delete(s))})}getCaseSummary(t){const n=Math.round((t.results?.ich?.probability||0)*100),r=t.tracking?.duration||"?";return{module:t.moduleType,ich:`${n}%`,eta:`${r} min`,urgency:t.urgency}}getCases(){return Array.from(this.cases.values())}getCase(t){return this.cases.get(t)}markViewed(t){const n=this.cases.get(t);n&&(n.isNew=!1,this.cases.set(t,n))}async dismissCase(t){try{const n=`${this.baseUrl}/archive-case`,r=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({caseId:t,reason:"dismissed_by_kiosk"}),signal:AbortSignal.timeout(8e3)});if(!r.ok)throw new Error(`HTTP ${r.status}: ${r.statusText}`);const s=await r.json();if(!s.success)throw new Error(s.error||"Failed to dismiss case");return this.cases.delete(t),console.log("[CaseListener] Case dismissed:",t),this.onUpdate&&this.onUpdate({cases:Array.from(this.cases.values()),timestamp:new Date().toISOString(),count:this.cases.size}),s}catch(n){throw console.error("[CaseListener] Dismiss error:",n),n}}getStatus(){return{isConnected:this.isConnected,lastFetchTime:this.lastFetchTime,caseCount:this.cases.size,isPolling:this.intervalId!==null}}}const f=new ne;function se(e){const t=document.getElementById("casesContainer");if(!t)return;if(!e||e.length===0){t.innerHTML=`
      <div class="flex flex-col items-center justify-center text-center py-16 text-gray-500 dark:text-gray-300">
        <div class="text-6xl mb-4">✓</div>
        <h2 class="text-xl font-semibold mb-2">${p("noActiveCases")}</h2>
        <p class="text-sm">${p("activeSystemMessage")}</p>
      </div>
    `;return}const n=re(e),s=n.slice(0,l.maxCasesDisplay).map(oe).join(""),i=n.length>l.maxCasesDisplay?`
        <div class="text-center text-amber-600 dark:text-amber-400 text-sm mb-4" role="alert">
          Showing ${l.maxCasesDisplay} of ${n.length} cases
        </div>`:"";t.innerHTML=`
    ${i}
    <div class="grid gap-6 px-6 sm:px-3 pb-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      ${s}
    </div>
  `}function re(e){return[...e].sort((t,n)=>{const r=L[t.urgency]?.priority??10,s=L[n.urgency]?.priority??10;if(r!==s)return r-s;const i=t.tracking?.duration||9999,o=n.tracking?.duration||9999;return i-o})}function ie(e){if(!e)return"PAT-0000";let t=0;for(let r=0;r<e.length;r++)t=(t<<5)-t+e.charCodeAt(r),t|=0;return`PAT-${Math.abs(t%1e4).toString().padStart(4,"0")}`}function oe(e){const t=L[e.urgency]||L.STANDARD,n=Math.round((e.results?.ich?.probability||0)*100),r=e.results?.lvo?Math.round(e.results.lvo.probability*100):null,s=q(e.tracking?.duration),i=e.tracking?.distance??"?",o=e.tracking?.gpsStale||!1,c=W(e);Z(c);const a=Q(c),u=e.cityCode||ie(e.id),v=`${e.urgency} case, ${u}, ICH risk ${n}%, ETA ${s} minutes`;function g(C){switch(C.toLowerCase()){case"coma":return"bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100";case"full":return"bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-100";default:return"bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"}}return`
    <div
      class="case-card relative flex flex-col border-2 rounded-xl shadow-md overflow-hidden 
             transition-all duration-300 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none 
             bg-gray-500 dark:bg-gray-800 hover:scale-[1.02] hover:shadow-lg
             ${e.urgency.toLowerCase()==="critical"?"border-red-500":""}
             ${e.urgency.toLowerCase()==="high"?"border-orange-500":""}
             ${e.urgency.toLowerCase()==="moderate"?"border-yellow-400":""}
             ${e.urgency.toLowerCase()==="low"?"border-green-500":""}
             ${e.isNew?"ring-2 ring-blue-400 animate-pulse":""}
             "
      data-case-id="${e.id}"
      style="border-color: ${t.color};"
      role="listitem"
      tabindex="0"
      aria-label="${v}"
    >

      <!-- Header -->
      <div class="bg-gray-900 text-white flex items-center justify-between px-4 py-2">
        <div class="flex items-center gap-2 font-semibold text-sm tracking-wide">
          ${t.icon} ${e.urgency}
        </div>
        <div class="text-xs flex items-center gap-3 opacity-90">
          <span class="font-mono ${e.cityCode?"text-sm font-bold tracking-wider":""}">${u}</span>
       <span class="px-2 py-0.5 text-[11px] font-semibold rounded-full uppercase tracking-wide ${g(e.moduleType)}">
  ${e.moduleType}
</span>

        </div>
      </div>

      <!-- City Code Banner -->
      ${e.cityCode?`
      <div class="flex flex-col items-center justify-center py-3 bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <span class="text-[10px] uppercase tracking-[0.2em] opacity-60">Patient-Code</span>
        <span class="text-2xl font-black tracking-wider leading-tight">${e.cityCode}</span>
      </div>
      `:""}

      <!-- Risk Section -->
      <div class="flex items-center justify-center gap-6 py-4 bg-blue-200 dark:bg-gray-800">
        <div class="flex justify-center items-center">
          ${M(n,"ICH")}
        </div>
        ${r!==null?`<div class="flex justify-center items-center">${M(r,"LVO")}</div>`:""}
      </div>

      <!-- ETA Section -->
      <div class="flex flex-col items-center justify-center py-3 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div class="flex items-end gap-1 text-2xl font-bold ${o?"text-yellow-500":"text-blue-600 dark:text-blue-400"}">
          <span>${s}</span>
          <span class="text-sm font-medium">
            ${s==="Arrived"||s==="?"?"":"min"}
          </span>
        </div>
        <div class="text-xs mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <span>${typeof i=="number"?i.toFixed(1):i} km</span>
          ${o?'<span class="text-yellow-600 dark:text-yellow-400 font-semibold" role="alert">⚠️ GPS stale</span>':""}
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between text-xs px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
        <span>${a}</span>
        <span class="text-blue-600 dark:text-blue-400 font-semibold hover:underline">View Details →</span>
      </div>
    </div>
  `}function M(e,t){const n=Y(e),r=Math.PI*100,s=r*(1-e/100);return`
    <div class="flex flex-col items-center">
      <svg class="w-20 h-20 ${e>70?"text-red-500":e>50?"text-orange-500":e>30?"text-yellow-400":"text-green-500"}" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="8"/>
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="${n}"
          stroke-width="8"
          stroke-dasharray="${r}"
          stroke-dashoffset="${s}"
          stroke-linecap="round"
          transform="rotate(-90 60 60)"/>
        <text x="60" y="65" text-anchor="middle" class="font-bold text-lg fill-black dark:fill-white">
          ${e}%
        </text>
      </svg>
      <div class="text-xs mt-1 uppercase tracking-wide text-gray-600 dark:text-gray-300">${t}</div>
    </div>
  `}const y={MEDIUM:"medium",HIGH:"high",CRITICAL:"critical"},h={NETWORK:"network",VALIDATION:"validation",AUTHENTICATION:"authentication",CALCULATION:"calculation",RENDERING:"rendering",MEDICAL:"medical"};class ae extends Error{constructor(t,n,r=h.MEDICAL,s=y.MEDIUM){super(t),this.name="MedicalError",this.code=n,this.category=r,this.severity=s,this.timestamp=new Date().toISOString(),this.context={}}withContext(t){return this.context={...this.context,...t},this}getUserMessage(){switch(this.category){case h.NETWORK:return"Network connection issue. Please check your internet connection and try again.";case h.VALIDATION:return"Please check your input data and try again.";case h.AUTHENTICATION:return"Authentication failed. Please log in again.";case h.CALCULATION:return"Unable to complete calculation. Please verify your input data.";case h.MEDICAL:return"Medical calculation could not be completed. Please verify all clinical data.";default:return"An unexpected error occurred. Please try again."}}}class le{constructor(){this.errorQueue=[],this.maxQueueSize=100,this.setupGlobalHandlers()}setupGlobalHandlers(){window.addEventListener("unhandledrejection",t=>{this.handleError(t.reason,h.NETWORK,y.HIGH),t.preventDefault()}),window.addEventListener("error",t=>{this.handleError(t.error,h.RENDERING,y.MEDIUM)})}handleError(t,n=h.NETWORK,r=y.MEDIUM){const s={error:t instanceof Error?t:new Error(String(t)),category:n,severity:r,timestamp:new Date().toISOString(),userAgent:navigator.userAgent.substring(0,100),url:window.location.href};this.errorQueue.push(s),this.errorQueue.length>this.maxQueueSize&&this.errorQueue.shift(),r===y.CRITICAL&&this.handleCriticalError(s)}handleCriticalError(t){t.category===h.MEDICAL&&this.showMedicalAlert(t.error.message)}showMedicalAlert(t){const n=document.createElement("div");n.className="critical-medical-alert",n.style.cssText=`
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff4444;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 90%;
      text-align: center;
    `,n.textContent=`⚠️ Medical Error: ${t}`,document.body.appendChild(n),setTimeout(()=>{document.body.contains(n)&&document.body.removeChild(n)},1e4)}getErrorSummary(){return{totalErrors:this.errorQueue.length,criticalErrors:this.errorQueue.filter(t=>t.severity===y.CRITICAL).length,recentErrors:this.errorQueue.slice(-10)}}}const ce=new le;async function de(e,t={}){const{category:n=h.NETWORK,severity:r=y.MEDIUM,fallback:s=null,timeout:i=3e4,retries:o=0,context:c={}}=t;for(let a=0;a<=o;a++)try{const u=new Promise((g,C)=>{setTimeout(()=>C(new Error("Operation timeout")),i)});return await Promise.race([e(),u])}catch(u){if(ce.handleError(u,n,r),a<o){await new Promise(g=>setTimeout(g,1e3*(a+1)));continue}if(s!==null)return typeof s=="function"?s(u):s;throw new ae(u.message||"Operation failed",u.code||"UNKNOWN",n,r).withContext(c)}}let w=[],d=null,k=null,T=!0;async function _(){console.log("[Kiosk] Initializing...",l),ye(),we(),$(),k=setInterval($,1e3),Ce(),f.start(e=>fe(e),e=>pe(e)),ke(),window.addEventListener("beforeunload",me),console.log("[Kiosk] Initialized successfully"),ue()}function ue(){setTimeout(()=>{const e=localStorage.getItem("language")||"en",t=document.getElementById("languageToggle");t&&(t.innerHTML=e==="en"?U():H(),t.addEventListener("click",ge),console.log("[Kiosk] Language toggle ready"))},200)}function ge(){de(async()=>{E.toggleLanguage(),he()},e=>console.warn("[Kiosk] Language toggle failed",e))}function A(e,t){const n=document.getElementById(e);n&&(n.title=t,n.setAttribute("aria-label",t))}function he(){document.documentElement.lang=E.getCurrentLanguage(),x(".app-header h1",p("appTitle")),x(".emergency-badge",p("emergencyBadge")),A("languageToggle",p("languageToggle")),A("helpButton",p("helpButton")),A("darkModeToggle",p("darkModeButton")),x("#modalTitle",p("helpTitle")),E.updateUI&&E.updateUI();const e=document.getElementById("languageToggle");if(e){const t=E.getCurrentLanguage();e.innerHTML=t==="en"?U():H()}}function U(){return` <svg
              width="20px"
              height="20px"
              viewBox="0 0 36 36"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              aria-hidden="true"
              role="img"
              class="iconify iconify--twemoji"
              preserveAspectRatio="xMidYMid meet"
            >
              <path fill="#FFCD05" d="M0 27a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4v-4H0v4z"></path>
              <path fill="#ED1F24" d="M0 14h36v9H0z"></path>
              <path fill="#141414" d="M32 5H4a4 4 0 0 0-4 4v5h36V9a4 4 0 0 0-4-4z"></path>
            </svg>`}function H(){return'<svg width="20px" height="20px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#00247D" d="M0 9.059V13h5.628zM4.664 31H13v-5.837zM23 25.164V31h8.335zM0 23v3.941L5.63 23zM31.337 5H23v5.837zM36 26.942V23h-5.631zM36 13V9.059L30.371 13zM13 5H4.664L13 10.837z"></path><path fill="#CF1B2B" d="M25.14 23l9.712 6.801a3.977 3.977 0 0 0 .99-1.749L28.627 23H25.14zM13 23h-2.141l-9.711 6.8c.521.53 1.189.909 1.938 1.085L13 23.943V23zm10-10h2.141l9.711-6.8a3.988 3.988 0 0 0-1.937-1.085L23 12.057V13zm-12.141 0L1.148 6.2a3.994 3.994 0 0 0-.991 1.749L7.372 13h3.487z"></path><path fill="#EEE" d="M36 21H21v10h2v-5.836L31.335 31H32a3.99 3.99 0 0 0 2.852-1.199L25.14 23h3.487l7.215 5.052c.093-.337.158-.686.158-1.052v-.058L30.369 23H36v-2zM0 21v2h5.63L0 26.941V27c0 1.091.439 2.078 1.148 2.8l9.711-6.8H13v.943l-9.914 6.941c.294.07.598.116.914.116h.664L13 25.163V31h2V21H0zM36 9a3.983 3.983 0 0 0-1.148-2.8L25.141 13H23v-.943l9.915-6.942A4.001 4.001 0 0 0 32 5h-.663L23 10.837V5h-2v10h15v-2h-5.629L36 9.059V9zM13 5v5.837L4.664 5H4a3.985 3.985 0 0 0-2.852 1.2l9.711 6.8H7.372L.157 7.949A3.968 3.968 0 0 0 0 9v.059L5.628 13H0v2h15V5h-2z"></path><path fill="#CF1B2B" d="M21 15V5h-6v10H0v6h15v10h6V21h15v-6z"></path></svg>'}function x(e,t){const n=document.querySelector(e);n&&(n.textContent=t)}function me(){console.log("[Kiosk] Cleaning up resources..."),f.stop(),k&&(clearInterval(k),k=null),d&&d.state!=="closed"&&d.close().catch(e=>{console.warn("[Kiosk] Error closing audio context:",e)})}function fe(e){const t=w.length;w=e.cases||[],console.log("[Kiosk] Cases updated:",{count:w.length,previous:t}),se(w),ve(e);const n=w.filter(r=>r.isNew);n.length>0&&!T&&(O(),Le(),setTimeout(()=>{n.forEach(r=>f.markViewed(r.id))},m.NEW_CASE_VIEWED_DELAY_MS)),T&&(T=!1),B(!0)}function pe(e){if(console.error("[Kiosk] Error:",e),B(!1),w.length===0){const t=document.getElementById("casesContainer");t&&(t.innerHTML=`
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h2>Verbindungsfehler / Connection Error</h2>
          <p>${e.message||"Unable to connect to case monitoring system"}</p>
          <p class="error-hint">Checking again in ${l.pollInterval/1e3} seconds...</p>
        </div>
      `)}}function ye(){const e=document.getElementById("hospitalSelector");e&&z(async()=>{const{AVAILABLE_HOSPITALS:t,setHospital:n}=await Promise.resolve().then(()=>G);return{AVAILABLE_HOSPITALS:t,setHospital:n}},void 0).then(({AVAILABLE_HOSPITALS:t,setHospital:n})=>{const r=l.hospitalId||"ALL",s=[{id:"ALL",name:"🌐 All Hospitals (Show All Cases)"},...t.filter(i=>i.id!=="ALL")];e.innerHTML=s.map(i=>`
      <option value="${i.id}">
        ${i.name}
      </option>
    `).join(""),e.value=r,e.value||(e.value="ALL"),e.addEventListener("change",i=>{const o=i.target.value;confirm(`Switch to ${i.target.options[i.target.selectedIndex].text}?

This will reload the page.`)?n(o):e.value=r})})}function we(){const e=localStorage.getItem("kiosk_theme")||l.theme;P(e);const t=document.getElementById("themeToggle");t&&t.addEventListener("click",Ee),console.log("[Kiosk] Theme initialized:",e)}function Ee(){const n=document.documentElement.classList.toggle("dark")?"dark":"light";localStorage.setItem("kiosk_theme",n),P(n),console.log("[Kiosk] Theme switched to:",n)}function P(e){const t=document.documentElement;e==="dark"?t.classList.add("dark"):t.classList.remove("dark");const n=document.querySelector(".theme-icon");n&&(n.textContent=e==="dark"?"☀️":"🌙")}function ve(e){const t=document.getElementById("caseCount");if(t){const n=e.count||0;t.textContent=`${n} ${n===1?"Case":"Cases"}`,t.className=`case-count-badge ${n>0?"has-cases":""}`}}function B(e){const t=document.getElementById("connectionStatus");t&&(t.className=`status-indicator ${e?"connected":"disconnected"}`,t.title=e?"Connected":"Disconnected",t.setAttribute("aria-label",`Connection status: ${e?"connected":"disconnected"}`))}function $(){const e=document.getElementById("currentTime");if(e){const t=new Date;e.textContent=t.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}}function Ce(){document.addEventListener("click",()=>{d||(d=new(window.AudioContext||window.webkitAudioContext),console.log("[Kiosk] Audio initialized"))},{once:!0})}async function O(){if(d)try{d.state==="suspended"&&(await d.resume(),console.log("[Kiosk] Audio context resumed"));const e=d.createOscillator(),t=d.createGain();e.connect(t),t.connect(d.destination),e.frequency.value=m.ALERT_BEEP_FREQUENCY_HZ,e.type="sine",t.gain.setValueAtTime(m.ALERT_BEEP_VOLUME,d.currentTime),t.gain.exponentialRampToValueAtTime(.01,d.currentTime+m.ALERT_BEEP_DURATION_SEC),e.start(d.currentTime),e.stop(d.currentTime+m.ALERT_BEEP_DURATION_SEC),console.log("[Kiosk] Alert sound played")}catch(e){console.warn("[Kiosk] Audio playback failed:",e)}}function Le(){document.body.classList.add("flash-alert"),setTimeout(()=>{document.body.classList.remove("flash-alert")},1e3)}function ke(){document.addEventListener("click",e=>{const t=e.target.closest(".case-card");if(t){const r=t.dataset.caseId;if(r){const s=`${l.pwaUrl}#results?display=kiosk&caseId=${r}`;window.location.href=s,f.markViewed(r)}}const n=e.target.closest(".dismiss-case-button");if(n){const r=n.dataset.caseId;r&&N(r)}(e.target.classList.contains("modal-overlay")||e.target.classList.contains("close-modal"))&&b()}),document.addEventListener("keydown",e=>{if(e.key==="Escape"){b();return}if(e.key==="Enter"||e.key===" "){const t=e.target.closest(".case-card");if(t){e.preventDefault();const n=t.dataset.caseId;if(n){const r=`https://igfap.eu/0825/#results?display=kiosk&caseId=${n}`;window.location.href=r,f.markViewed(n)}}}}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&(console.log("[Kiosk] Tab visible - fetching latest cases"),f.fetchCases())}),window.addEventListener("dismissCase",e=>{const t=e.detail?.caseId;t?(console.log("[Kiosk] Received dismissCase event for:",t),N(t)):console.error("[Kiosk] dismissCase event missing caseId")})}async function N(e){const t=f.getCase(e);if(!t){console.warn("[Kiosk] Case not found:",e);return}const n=`Are you sure you want to dismiss this case?

Ambulance: ${t.ambulanceId}
Module: ${t.moduleType}
ICH Risk: ${Math.round((t.results?.ich?.probability||0)*100)}%

This action will archive the case.`;if(!confirm(n)){console.log("[Kiosk] Case dismissal cancelled");return}try{const s=document.querySelector(`[data-case-id="${e}"]`);s&&(s.disabled=!0,s.textContent="Dismissing..."),await f.dismissCase(e),console.log("[Kiosk] Case dismissed successfully:",e),b(),document.body.classList.add("flash-success"),setTimeout(()=>{document.body.classList.remove("flash-success")},500)}catch(s){console.error("[Kiosk] Failed to dismiss case:",s),alert(`Failed to dismiss case:
${s.message}

Please try again or contact support.`);const i=document.querySelector(`[data-case-id="${e}"]`);i&&(i.disabled=!1,i.textContent="🗑️ Dismiss Case")}}function b(){const e=document.getElementById("caseDetailModal");e&&(e.style.display="none",e.querySelector(".modal-content").innerHTML="")}window.addEventListener("error",e=>{console.error("[Kiosk] Unhandled error:",e.error)});window.addEventListener("unhandledrejection",e=>{console.error("[Kiosk] Unhandled rejection:",e.reason)});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",_):_();window.kioskApp={getCases:()=>w,getStatus:()=>f.getStatus(),refresh:()=>f.fetchCases(),playAlert:()=>O()};
//# sourceMappingURL=index-BRbcMSm8.js.map
