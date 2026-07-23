(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function t(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(a){if(a.ep)return;a.ep=!0;const r=t(a);fetch(a.href,r)}})();const Js=Number.MAX_SAFE_INTEGER;let vu=0;function mf(){return vu+=1,`PAL-${vu.toString().padStart(5,"0")}`}function gf(n,e){return e<=0?{ok:!1,cantidadAjustada:0,mensaje:"Cantidad solicitada debe ser mayor que 0"}:e>=n.loteMinimo?{ok:!0,cantidadAjustada:e}:{ok:!1,cantidadAjustada:n.loteMinimo,mensaje:`${n.sku}: la cantidad pedida (${e}) es inferior al lote mínimo de entrega (${n.loteMinimo}). Se ajusta a ${n.loteMinimo} unidades.`}}function _f(n,e){const t=[],{unidadesPorPalet:i}=n,a=Math.floor(e/i),r=e%i;for(let s=0;s<a;s++)t.push(Mu(n,i,!0));return r>0&&t.push(Mu(n,r,!1)),t}function Mu(n,e,t){const i=e/n.unidadesPorPalet,a=n.alturaPaletCompletoMm-n.palletType.alturaBaseMm,r=t||n.alturaFija?n.alturaPaletCompletoMm:Math.round(n.palletType.alturaBaseMm+a*i);return{id:mf(),referenceId:n.id,unidades:e,esCompleto:t,pesoKg:Math.round(n.palletType.pesoTaraKg+e*n.pesoUnitarioKg),alturaMm:r,apilable:n.apilable,palletType:n.palletType,altoUnidadMm:t?n.altoUnidadMm:void 0}}function xf(n,e){const t=[],i=[];for(const a of n){const r=e.get(a.referenceId);if(!r){i.push(`Referencia desconocida: ${a.referenceId} (línea omitida)`);continue}const s=gf(r,a.cantidadSolicitada);!s.ok&&s.mensaje&&i.push(s.mensaje),t.push(..._f(r,s.cantidadAjustada))}return{palets:t,avisos:i}}function vf(n,e,t,i=!0){const r=(i?[{anchoOcupado:n,largoOcupado:e},{anchoOcupado:e,largoOcupado:n}]:[{anchoOcupado:n,largoOcupado:e}]).filter(o=>o.anchoOcupado<=t.anchoInteriorMm&&o.largoOcupado<=t.largoInteriorMm);if(r.length===0)return null;if(r.length===1)return r[0];const s=o=>Math.floor(t.anchoInteriorMm/o.anchoOcupado),l=s(r[0]),c=s(r[1]);return l!==c?l>c?r[0]:r[1]:r[0].largoOcupado<=r[1].largoOcupado?r[0]:r[1]}function Mf(n,e,t,i){const a=[],r=t.capiculado&&e.alturaGanadaCapiculadoMm?e.alturaGanadaCapiculadoMm:0,s=t.capiculado&&e.alturaGanadaCapiculadoAltMm?e.alturaGanadaCapiculadoAltMm:0,l=M=>M%2===0?r:s,c=(M,R)=>Math.max(M-l(R),1),o=r>0||s>0?e.desplazamientoCapiculadoMm??0:0,d=i.largoOcupado!==e.palletType.largoMm,h=(e.desplazamientoCapiculadoEjeAncho??!1)!==d,u=M=>M.altoUnidadMm?Math.max(1,M.unidades):1,p=M=>M.altoUnidadMm??M.alturaMm,g=M=>{const R=[];let E=0,A=0,y=0;for(const T of M){const f=u(T),b=p(T),w=y;let P=E;for(let V=0;V<f;V++)y>0&&(E+=c(b,y-1)),V===0&&(P=E),y++;A=b;const L=E+b-P;R.push({zBase:P,subunidadGlobalInicial:w,alturaComprimidaMm:L})}return{porPalet:R,alturaTotalMm:M.length===0?0:E+A}},v=M=>{const{porPalet:R,alturaTotalMm:E}=g(M),A=M.reduce((y,T)=>y+u(T),0);return{referenceId:e.id,pallets:M.map((y,T)=>({...y,alturaMm:R[T].alturaComprimidaMm})),anchoMm:i.anchoOcupado+(A>=2&&h?o:0),largoMm:i.largoOcupado+(A>=2&&!h?o:0),alturaTotalMm:E,pesoTotalKg:M.reduce((y,T)=>y+T.pesoKg,0),alturasRelativas:R.map(y=>y.zBase),subunidadesGlobalesIniciales:R.map(y=>y.subunidadGlobalInicial)}};if(!e.apilable)return n.map(M=>v([M]));let _=[],m=0;for(const M of n){const R=_.length===0,E=g([..._,M]).alturaTotalMm,A=m+M.pesoKg;(R?E<=t.altoInteriorMm:E<=t.altoInteriorMm&&A<=e.palletType.pesoMaxKg)?(_.push(M),m=A):(_.length>0&&a.push(v(_)),_=[M],m=M.pesoKg)}return _.length>0&&a.push(v(_)),a}function yf(n,e,t){let i=null,a=1/0,r=1/0;for(const s of t){if(n>s.ancho||e>s.largo)continue;const l=s.ancho-n,c=s.largo-e,o=Math.min(l,c),d=Math.max(l,c);(o<a||o===a&&d<r)&&(a=o,r=d,i={rect:s,anchoOcupado:n,largoOcupado:e})}return i}function is(n,e){if(!(e.x<n.x+n.ancho&&e.x+e.ancho>n.x&&e.y<n.y+n.largo&&e.y+e.largo>n.y))return[n];const i=[];return e.x>n.x&&i.push({x:n.x,y:n.y,ancho:e.x-n.x,largo:n.largo}),e.x+e.ancho<n.x+n.ancho&&i.push({x:e.x+e.ancho,y:n.y,ancho:n.x+n.ancho-(e.x+e.ancho),largo:n.largo}),e.y>n.y&&i.push({x:n.x,y:n.y,ancho:n.ancho,largo:e.y-n.y}),e.y+e.largo<n.y+n.largo&&i.push({x:n.x,y:e.y+e.largo,ancho:n.ancho,largo:n.y+n.largo-(e.y+e.largo)}),i}function Sf(n,e){return n.x>=e.x&&n.y>=e.y&&n.x+n.ancho<=e.x+e.ancho&&n.y+n.largo<=e.y+e.largo}function as(n){const e=[];for(const t of n)e.some(a=>a.x===t.x&&a.y===t.y&&a.ancho===t.ancho&&a.largo===t.largo)||e.push(t);return e.filter((t,i)=>!e.some((a,r)=>r!==i&&Sf(t,a)))}const bf=12,Ef=2e4;function Id(n,e){let t=0;const i=[];function a(s,l){if(s>=n.length)return l;const c=n[s],o=[];for(const d of l){const h=c.anchoMm===c.largoMm?[{ancho:c.anchoMm,largo:c.largoMm}]:[{ancho:c.anchoMm,largo:c.largoMm},{ancho:c.largoMm,largo:c.anchoMm}];for(const u of h)u.ancho<=d.ancho&&u.largo<=d.largo&&o.push({rect:d,anchoOcupado:u.ancho,largoOcupado:u.largo})}o.sort((d,h)=>{const u=d.rect.ancho*d.rect.largo-d.anchoOcupado*d.largoOcupado,p=h.rect.ancho*h.rect.largo-h.anchoOcupado*h.largoOcupado;return u-p});for(const d of o){if(t++,t>Ef)return null;const h=d.rect.x,u=d.rect.y,p={x:h,y:u,ancho:d.anchoOcupado,largo:d.largoOcupado},g=[];for(const m of l)g.push(...is(m,p));const v=as(g);i.push({pila:c,x:h,y:u,anchoOcupado:d.anchoOcupado,largoOcupado:d.largoOcupado});const _=a(s+1,v);if(_)return _;i.pop()}return null}const r=a(0,e);return r?{colocaciones:i,libresFinal:r}:null}function Tf(n,e,t,i=[]){const a=[],r=[];let s=[{x:0,y:0,ancho:e.anchoInteriorMm,largo:e.largoInteriorMm}],l=0;for(const o of i){const d={x:o.x,y:o.y,ancho:o.anchoMm,largo:o.largoMm},h=[];for(const u of s)h.push(...is(u,d));s=as(h)}for(const o of n){if(l+o.pesoTotalKg>e.pesoMaxKg){r.push(o);continue}const d=yf(o.anchoMm,o.largoMm,s);if(!d){r.push(o);continue}const{rect:h,anchoOcupado:u,largoOcupado:p}=d,g=h.x,v=h.y,_={x:g,y:v,ancho:u,largo:p},m=[];for(const M of s)m.push(...is(M,_));s=as(m),l+=o.pesoTotalKg,o.pallets.forEach((M,R)=>{a.push({...M,x:g,y:v,z:o.alturasRelativas[R],nivel:R,largoOcupadoMm:p,anchoOcupadoMm:u,subunidadGlobalInicial:o.subunidadesGlobalesIniciales[R]})})}if(r.length>0&&r.length<=bf){const o=e.pesoMaxKg-l,d=r.reduce((h,u)=>h+u.pesoTotalKg,0);if(d<=o){const h=Id(r,s);if(h){for(const u of h.colocaciones)u.pila.pallets.forEach((p,g)=>{a.push({...p,x:u.x,y:u.y,z:u.pila.alturasRelativas[g],nivel:g,largoOcupadoMm:u.largoOcupado,anchoOcupadoMm:u.anchoOcupado,subunidadGlobalInicial:u.pila.subunidadesGlobalesIniciales[g]})});l+=d,s=h.libresFinal,r.length=0}}}return{plan:wc(e,t,a,l),pendientes:r}}function wc(n,e,t,i){const a=i??t.reduce((d,h)=>d+h.pesoKg,0),r=n.largoInteriorMm/1e3*(n.anchoInteriorMm/1e3)*(n.altoInteriorMm/1e3),s=new Map;for(const d of t){const h=`${d.x}-${d.y}`,u=s.get(h);u?u.push(d):s.set(h,[d])}let l=0;for(const d of s.values()){const h=Math.max(...d.map(v=>v.largoOcupadoMm))/1e3,u=Math.max(...d.map(v=>v.anchoOcupadoMm))/1e3,p=Math.min(...d.map(v=>v.z)),g=Math.max(...d.map(v=>v.z+v.alturaMm));l+=h*u*((g-p)/1e3)}const c=n.largoInteriorMm/1e3*(n.anchoInteriorMm/1e3),o=t.filter(d=>d.nivel===0).reduce((d,h)=>d+h.largoOcupadoMm/1e3*(h.anchoOcupadoMm/1e3),0);return{numero:e,truckProfile:n,pallets:t,pesoTotalKg:a,volumenUtilizadoM3:Math.round(l*1e3)/1e3,volumenTotalM3:Math.round(r*1e3)/1e3,ocupacionVolumen:Math.round(l/r*1e3)/10,ocupacionPeso:Math.round(a/n.pesoMaxKg*1e3)/10,ocupacionSuelo:Math.round(o/c*1e3)/10,posicionesSueloUsadas:t.filter(d=>d.nivel===0).length}}function Af(n,e,t=[]){let i=[{x:0,y:0,ancho:n.anchoInteriorMm,largo:n.largoInteriorMm}];for(const a of e){if(a.nivel!==0)continue;const r={x:a.x,y:a.y,ancho:a.anchoOcupadoMm,largo:a.largoOcupadoMm},s=[];for(const l of i)s.push(...is(l,r));i=as(s)}for(const a of t){const r={x:a.x,y:a.y,ancho:a.anchoMm,largo:a.largoMm},s=[];for(const l of i)s.push(...is(l,r));i=as(s)}return i}const wf=6,Cf=25;function Rf(n,e,t,i=[]){if(e.length===0||e.length>wf)return null;for(let a=0;a<n.length;a++){const r=n[a],s=new Map;for(const c of r.pallets){const o=`${c.x}-${c.y}`,d=s.get(o)??[];d.push(c),s.set(o,d)}const l=Array.from(s.values()).sort((c,o)=>o[0].anchoOcupadoMm*o[0].largoOcupadoMm-c[0].anchoOcupadoMm*c[0].largoOcupadoMm).slice(0,Cf);for(const c of l){const o=c[0],d=c.map(y=>y.z-o.z),h=c.map(y=>y.subunidadGlobalInicial??0),u=c[c.length-1],p={referenceId:o.referenceId,pallets:c,anchoMm:o.anchoOcupadoMm,largoMm:o.largoOcupadoMm,alturaTotalMm:u.z+u.alturaMm-o.z,pesoTotalKg:c.reduce((y,T)=>y+T.pesoKg,0),alturasRelativas:d,subunidadesGlobalesIniciales:h},g=r.pallets.filter(y=>y.x!==o.x||y.y!==o.y),v=t.pesoMaxKg-(r.pesoTotalKg-p.pesoTotalKg),_=[...e,p];if(_.reduce((y,T)=>y+T.pesoTotalKg,0)>v)continue;const M=Af(t,g,i),R=Id(_,M);if(!R)continue;const E=g.slice();for(const y of R.colocaciones)y.pila.pallets.forEach((T,f)=>{E.push({...T,x:y.x,y:y.y,z:y.pila.alturasRelativas[f],nivel:f,largoOcupadoMm:y.largoOcupado,anchoOcupadoMm:y.anchoOcupado,subunidadGlobalInicial:y.pila.subunidadesGlobalesIniciales[f]})});const A=n.slice();return A[a]=wc(t,r.numero,E),{camiones:A,restantes:[]}}}return null}function Pf(n,e,t,i=[]){const a=[];let r=n,s=1,l=!1;for(;r.length>0&&s<=t;){const c=s===1?i:[],{plan:o,pendientes:d}=Tf(r,e,s,c);if(o.pallets.length>0&&a.push(o),d.length===r.length){l=!0;break}r=d,s+=1}return{camiones:a,restantes:r,imposibles:l}}function Lf(n){return[[...n].sort((e,t)=>t.anchoMm*t.largoMm-e.anchoMm*e.largoMm),[...n].sort((e,t)=>Math.max(t.anchoMm,t.largoMm)-Math.max(e.anchoMm,e.largoMm)),[...n].sort((e,t)=>t.anchoMm+t.largoMm-(e.anchoMm+e.largoMm)),[...n].sort((e,t)=>e.anchoMm*e.largoMm-t.anchoMm*t.largoMm),[...n].sort((e,t)=>t.alturaTotalMm-e.alturaTotalMm)]}function yu(n){return n.reduce((e,t)=>e+t.pallets.reduce((i,a)=>i+a.unidades,0),0)}function If(n,e){const t=yu(n.restantes),i=yu(e.restantes);if(t!==i)return t-i;if(n.camiones.length!==e.camiones.length)return n.camiones.length-e.camiones.length;const a=r=>r.length?r.reduce((s,l)=>s+l.ocupacionSuelo,0)/r.length:0;return a(e.camiones)-a(n.camiones)}function Df(n,e,t,i=1,a=[]){var p;const r=[],s=[],l=new Map;for(const g of n){const v=l.get(g.referenceId)??[];v.push(g),l.set(g.referenceId,v)}let c=[];for(const[g,v]of l){const _=e.get(g);if(!_)continue;const m=vf(_.palletType.anchoMm,_.palletType.largoMm,t,t.cargaLateral?!0:_.rotable);if(!m){s.push({referenceId:g,unidadesPendientes:v.reduce((M,R)=>M+R.unidades,0),motivo:`El palet de ${_.sku} (${_.palletType.largoMm}x${_.palletType.anchoMm} mm) no cabe en ningún sentido en el camión "${t.nombre}" (${t.largoInteriorMm}x${t.anchoInteriorMm} mm).`});continue}if(_.alturaPaletCompletoMm>t.altoInteriorMm){s.push({referenceId:g,unidadesPendientes:v.reduce((M,R)=>M+R.unidades,0),motivo:`El palet completo de ${_.sku} mide ${_.alturaPaletCompletoMm} mm de alto y supera el interior del camión (${t.altoInteriorMm} mm).`});continue}c.push(...Mf(v,_,t,m))}let o={camiones:[],restantes:c,imposibles:!1};if(c.length>0){let g=!0;for(const v of Lf(c)){const _=Pf(v,t,i,a);(g||If(_,o)<0)&&(o=_,g=!1)}}let{camiones:d,restantes:h,imposibles:u}=o;if(h.length>0&&!u){const g=Rf(d,h,t,a);g&&(d=g.camiones,h=g.restantes)}if(h.length>0)if(u)for(const g of h)s.push({referenceId:g.referenceId,unidadesPendientes:g.pallets.reduce((v,_)=>v+_.unidades,0),motivo:"La pila no cabe en ningún camión disponible incluso en vacío (revisa el peso máximo del camión o el peso/medidas de la referencia)."});else{const g=new Map;for(const _ of h){const m=_.pallets.reduce((M,R)=>M+R.unidades,0);g.set(_.referenceId,(g.get(_.referenceId)??0)+m)}for(const[_,m]of g){const M=((p=e.get(_))==null?void 0:p.sku)??_;s.push({referenceId:_,unidadesPendientes:m,motivo:i===1?`El camión ya está completo: quedan ${m} unidades de ${M} sin sitio. Activa "permitir varios camiones" si quieres repartir el pedido en más de uno.`:`Se alcanzó el límite de ${i} camiones permitidos en esta planificación: quedan ${m} unidades de ${M} sin sitio.`})}const v=Array.from(g.values()).reduce((_,m)=>_+m,0);r.push(i===1?`El camión se ha llenado y no caben ${v} unidades más del pedido. El modo "varios camiones" está desactivado.`:`Se alcanzó el máximo de ${i} camiones permitidos en una misma planificación; quedan ${v} unidades sin asignar.`)}return{camiones:d,noAsignados:s,avisos:r}}const Dd={id:"semirremolque-estandar",nombre:"Semirremolque estándar",largoInteriorMm:13600,anchoInteriorMm:2480,altoInteriorMm:2700,pesoMaxKg:24e3};function Uf(n,e,t=Dd,i){const a=new Map(e.map(h=>[h.id,h])),{palets:r,avisos:s}=xf(n,a),l=i!=null&&i.permitirVariosCamiones?(i==null?void 0:i.maxCamiones)??25:1,{camiones:c,noAsignados:o,avisos:d}=Df(r,a,t,l,(i==null?void 0:i.posicionesBloqueadas)??[]);return{camiones:c,referenciasNoAsignadas:o,avisos:[...s,...d]}}function pn(n,e,t,i){const a=i||0,r=t+a/2,l=n-t-a/2-r;if(l<=0)return 2;const c=e+a;return l<=c?2:Math.ceil(l/c)+1}function mn(n,e,t,i){const a=i||0,r=t+a/2,s=n-t-a/2;if(e<=1)return[r];if(e===2)return[r,s];const l=[r],o=(s-r)/(e-1);for(let d=1;d<e-1;d++)l.push(r+o*d);return l.push(s),l}const Mr=n=>n==="largo"?"ancho":"largo",Su=(n,e,t)=>{if(n<=0||e<=0||t<=0)return{L:0,a:0};let i=.001,a=Math.PI/2-.001,r=0,s=0;for(let l=0;l<60;l++)r=(i+a)/2,s=(n-t*Math.cos(r))/Math.sin(r),s*Math.cos(r)+t*Math.sin(r)>e?i=r:a=r;return{L:Math.max(0,s),a:r}};function Cc(n){const e=(Le,nt)=>Le===void 0?nt:Le,t=e(n.largo,200),i=e(n.ancho,120),a=e(n.alto,50),r=e(n.dimMode,"interior"),s=e(n.apoyoType,"dobleBase"),l=e(n.dbOrient,"ancho"),c=e(n.tablonOrientUser,"largo"),o=e(n.rastrelOrient,"largo"),d=e(n.recuadroMode,"none"),h=e(n.useTablones,!0),u=e(n.useRastreles,!1),p=e(n.useIntermedias,!1),g=e(n.useOrillas,!1),v=e(n.orillaOrient,"ancho"),_=e(n.orillaAncho,10),m=e(n.useLados,!1),M=e(n.useTesteros,!1),R=e(n.useTapa,!1),E=e(n.ladoCubrirType,"contrachapado"),A=e(n.testeroCubrirType,"contrachapado"),y=e(n.ladoGrosor,.9),T=e(n.testeroGrosor,.9),f=e(n.useLlapasasLado,!1),b=e(n.llapLadoOrient,"largo"),w=e(n.llapLadoGrosor,1.8),P=e(n.llapLadoPosicion,"exterior"),L=e(n.useLlapInclinadaLado,!1),V=e(n.useRecuadrosLado,!1),j=e(n.llapInclinadaLadoClavada,!1),I=e(n.useLlapasasTestero,!1),X=e(n.llapTesteroOrient,"largo"),k=e(n.llapTesteroGrosor,1.8),K=e(n.llapTesteroPosicion,"exterior"),oe=e(n.useLlapInclinadaTestero,!1),he=e(n.useRecuadrosTestero,!1),Ie=e(n.llapInclinadaTesteroClavada,!1),ve=e(n.useLlapasasTapa,!1),_t=e(n.llapTapaPosicion,"exterior"),Ft=e(n.llapTapaGrosor,1.8),Qe=e(n.useRecuadrosTapa,!1),ee=e(n.splitApoyoLado,!1),de=e(n.splitApoyoTestero,!1),le=e(n.apoyoLado,"cubrir"),ze=e(n.apoyoTestero,"cubrir"),it=e(n.apoyoLadoLlap,"cubrir"),je=e(n.apoyoTesteroLlap,"cubrir"),wt=e(n.apoyoLadoLlapIncl,"cubrir"),lt=e(n.apoyoTesteroLlapIncl,"cubrir"),Dt=e(n.useTacosArrastre,!1),Rt=e(n.useTapabocaFrontal,!1),yt=e(n.useTapabocaTrasero,!1),Kt=e(n.useTapabocaIzquierda,!1),zt=e(n.useTapabocaDerecha,!1),Et=e(n.tapabocaGrosor,1.8),Zt=e(n.usePuntales,!1),Bt=e(n.useBarrotesRef,!1),Ht=e(n.useCuadradillos,!1),U=s==="dobleBase"?Mr(l):c,sn=s==="dobleBase"?l:null,Ut=h?Mr(U):sn?Mr(sn):"largo",C=h?d:"none",x=s==="tacos"&&h&&p,F=s==="dobleBase"?Mr(l):o,N=m&&f&&L&&j&&P==="exterior"?w:0,z=M&&I&&oe&&Ie&&K==="exterior"?k:0,pe=(m&&f&&P==="exterior"?w:0)+N,se=(M&&I&&K==="exterior"?k:0)+z,q=g&&h&&le==="cubrir"?"tablon":le==="tablon"&&!h||le==="intermedia"&&!x||le==="rastrel"&&!u?"cubrir":le,Q=g&&h&&ze==="cubrir"?"tablon":ze==="tablon"&&!h||ze==="intermedia"&&!x||ze==="rastrel"&&!u?"cubrir":ze,Ee=m&&f&&b==="alto"&&E!=="contrachapado",De=M&&I&&X==="alto"&&A!=="contrachapado",Te=Ee&&ee?it==="tablon"&&!h||it==="intermedia"&&!x||it==="rastrel"&&!u?"cubrir":it:q,re=De&&de?je==="tablon"&&!h||je==="intermedia"&&!x||je==="rastrel"&&!u?"cubrir":je:Q,Re=L?wt==="tablon"&&!h||wt==="intermedia"&&!x||wt==="rastrel"&&!u?"cubrir":wt:q,tt=oe?lt==="tablon"&&!h||lt==="intermedia"&&!x||lt==="rastrel"&&!u?"cubrir":lt:Q,Ve=m?2*(y+pe):0,D=M?2*(T+se):0,Se=m&&f&&P==="interior"?2*w:0,Z=M&&I&&K==="interior"?2*k:0,xe=R&&ve&&_t==="interior"?Ft:0,Pe=g&&v==="ancho"?2*_:0,te=g&&v==="largo"?2*_:0,Be=s==="tacos"&&u,We=Be?(Kt?Et:0)+(zt?Et:0):0,W=Be?(Rt?Et:0)+(yt?Et:0):0,J=D+Pe+We,Ge=Ve+te+W;let Me,ge;return r==="interior"?(Me=t,ge=i):(Me=t-Z-J,ge=i-Se-Ge),{largo:Me+Z,ancho:ge+Se,alto:a+xe,apoyoType:s,cubrirType:e(n.cubrirType,"caja"),cubrirGrosor:e(n.cubrirGrosor,2),tablaAnchoCubrir:e(n.tablaAnchoCubrir,10),separacionTablas:e(n.separacionTablas,15),dobleBaseAncho:e(n.dobleBaseAncho,10),dobleBaseAlto:e(n.dobleBaseAlto,7),distOrillas:e(n.distOrillas,40),dbOrient:l,claroMax:e(n.claroMax,125),tacoLargo:e(n.tacoLargo,10),tacoAncho:e(n.tacoAncho,10),tacoAlto:e(n.tacoAlto,10),tacoClaroMaxLargo:e(n.tacoClaroMaxLargo,65),tacoArrastreAncho:e(n.tacoArrastreAncho,0),useTablones:h,tablonAncho:e(n.tablonAncho,10),tablonAlto:e(n.tablonAlto,4.5),tablonOrient:U,tablonClaroMax:e(n.tablonClaroMax,60),cubrirOrient:Ut,useIntermedias:x,intermediaAncho:e(n.intermediaAncho,10),intermediaAlto:e(n.intermediaAlto,2),useRastreles:u,rastrelAncho:e(n.rastrelAncho,10),rastrelAlto:e(n.rastrelAlto,2),rastrelOrient:F,useOrillas:g,orillaAncho:_,orillaAlto:e(n.orillaAlto,10),orillaOrient:v,useTapabocaFrontal:Rt,useTapabocaTrasero:yt,useTapabocaIzquierda:Kt,useTapabocaDerecha:zt,tapabocaGrosor:Et,tapabocaMargen:e(n.tapabocaMargen,2),recuadroMode:C,useTacosArrastre:h&&Dt,tacoArrastreLargo:e(n.tacoArrastreLargo,40),tacoArrastreChaflan:e(n.tacoArrastreChaflan,5),useLados:m,ladoCubrirType:E,ladoGrosor:y,ladoTablaAncho:e(n.ladoTablaAncho,10),ladoSeparacion:e(n.ladoSeparacion,15),useTesteros:M,testeroCubrirType:A,testeroGrosor:T,testeroTablaAncho:e(n.testeroTablaAncho,10),testeroSeparacion:e(n.testeroSeparacion,15),useTapa:R,tapaCubrirType:e(n.tapaCubrirType,"contrachapado"),tapaGrosor:e(n.tapaGrosor,.9),tapaTablaAncho:e(n.tapaTablaAncho,10),tapaSeparacion:e(n.tapaSeparacion,15),tapaCubrirOrient:e(n.tapaCubrirOrient,"largo"),useSolapaTapa:e(n.useSolapaTapa,!1),solapaTapaCm:e(n.solapaTapaCm,15),caraDominante:e(n.caraDominante,"lado"),...(()=>{if(n.cargamentoCubrir!==void 0||n.cargamentoLlap!==void 0)return{cargamentoCubrir:e(n.cargamentoCubrir,"none"),cargamentoLlap:e(n.cargamentoLlap,"none")};const Le={none:["none","none"],espiga:["espiga","none"],cargamento:["cargamento","none"],"llap-espiga":["none","espiga"],"llap-cargamento":["none","cargamento"]},[nt,Xe]=Le[n.cargamento]??["none","none"];return{cargamentoCubrir:nt,cargamentoLlap:Xe}})(),apoyoLado:q,apoyoTestero:Q,apoyoLadoLlap:Te,apoyoTesteroLlap:re,apoyoLadoLlapIncl:Re,apoyoTesteroLlapIncl:tt,useLlapasasLado:m&&f,llapLadoOrient:b,llapLadoAncho:e(n.llapLadoAncho,8),llapLadoGrosor:w,llapLadoClaro:e(n.llapLadoClaro,65),llapLadoPosicion:P,useLlapInclinadaLado:m&&f&&L&&!V,useRecuadrosLado:m&&f&&V&&!L,recuadroLadoClaro:e(n.recuadroLadoClaro,65),useLlapasasTestero:M&&I,llapTesteroOrient:X,llapTesteroAncho:e(n.llapTesteroAncho,8),llapTesteroGrosor:k,llapTesteroClaro:e(n.llapTesteroClaro,65),llapTesteroPosicion:K,useLlapInclinadaTestero:M&&I&&oe&&!he,useRecuadrosTestero:M&&I&&he&&!oe,recuadroTesteroClaro:e(n.recuadroTesteroClaro,65),useLlapasasTapa:R&&ve,useRecuadrosTapa:R&&ve&&Qe,recuadroTapaClaro:e(n.recuadroTapaClaro,65),llapTapaOrient:e(n.llapTapaOrient,"largo"),llapTapaAncho:e(n.llapTapaAncho,8),llapTapaGrosor:Ft,llapTapaClaro:e(n.llapTapaClaro,65),llapTapaPosicion:_t,llapIntLargo:Z,llapIntAncho:Se,llapIntAlto:xe,llapInclinadaLadoCount:e(n.llapInclinadaLadoCount,2),llapInclinadaTesteroCount:e(n.llapInclinadaTesteroCount,2),llapInclinadaLadoClavada:j,llapInclinadaTesteroClavada:Ie,barrotes:e(n.barrotes,[]),llapInclinadaLadoIgual:e(n.llapInclinadaLadoIgual,!1),llapInclinadaTesteroIgual:e(n.llapInclinadaTesteroIgual,!1),llapLadoAltura:e(n.llapLadoAltura,"estandar"),llapTesteroAltura:e(n.llapTesteroAltura,"estandar"),overrides:e(n.overrides,{}),hiddenPieces:e(n.hiddenPieces,{}),useCuadradillos:Ht,cuadradilloAncho:e(n.cuadradilloAncho,10),cuadradilloGrosor:e(n.cuadradilloGrosor,10),cuadradilloClaro:e(n.cuadradilloClaro,65),usePuntales:Zt&&m&&s==="dobleBase"&&l==="ancho",puntalAncho:e(n.puntalAncho,10),puntalGrosor:e(n.puntalGrosor,4.5),useBarrotesRef:Bt&&M&&f&&b==="largo",barroteRefAncho:e(n.barroteRefAncho,10),barroteRefGrosor:e(n.barroteRefGrosor,4.5)}}function Rc(n){const{largo:e,ancho:t,alto:i,apoyoType:a,cubrirType:r,cubrirGrosor:s,tablaAnchoCubrir:l,separacionTablas:c,dobleBaseAncho:o,dobleBaseAlto:d,distOrillas:h,dbOrient:u,claroMax:p,tacoLargo:g,tacoAncho:v,tacoAlto:_,tacoClaroMaxLargo:m,useTablones:M,tablonAncho:R,tablonAlto:E,tablonOrient:A,tablonClaroMax:y,cubrirOrient:T,useIntermedias:f,intermediaAncho:b,intermediaAlto:w,useRastreles:P,rastrelAncho:L,rastrelAlto:V,rastrelOrient:j,useOrillas:I,orillaAncho:X,orillaAlto:k,orillaOrient:K,recuadroMode:oe,useLados:he,ladoCubrirType:Ie,ladoGrosor:ve,ladoTablaAncho:_t,ladoSeparacion:Ft,useTesteros:Qe,testeroCubrirType:ee,testeroGrosor:de,testeroTablaAncho:le,testeroSeparacion:ze,useTapa:it,tapaCubrirType:je,tapaGrosor:wt,tapaTablaAncho:lt,tapaSeparacion:Dt,tapaCubrirOrient:Rt,useSolapaTapa:yt,solapaTapaCm:Kt,caraDominante:zt,cargamentoCubrir:Et,cargamentoLlap:Zt,apoyoLado:Bt,apoyoTestero:Ht,apoyoLadoLlap:U,apoyoTesteroLlap:sn,apoyoLadoLlapIncl:Ut,apoyoTesteroLlapIncl:C,useLlapasasLado:x,llapLadoOrient:F,llapLadoAncho:N,llapLadoGrosor:z,llapLadoClaro:pe,llapLadoPosicion:se,useLlapInclinadaLado:q,useRecuadrosLado:Q,recuadroLadoClaro:Ee,useLlapasasTestero:De,llapTesteroOrient:Te,llapTesteroAncho:re,llapTesteroGrosor:Re,llapTesteroClaro:tt,llapTesteroPosicion:Ve,useLlapInclinadaTestero:D,useRecuadrosTestero:Se,recuadroTesteroClaro:Z,useLlapasasTapa:xe,llapTapaOrient:Pe,llapTapaAncho:te,llapTapaGrosor:Be,llapTapaClaro:We,llapTapaPosicion:W,useRecuadrosTapa:J,recuadroTapaClaro:Ge,llapIntLargo:Me=0,llapIntAncho:ge=0,llapIntAlto:Le=0,llapInclinadaLadoCount:nt=2,llapInclinadaTesteroCount:Xe=2,llapLadoAltura:bt="estandar",llapTesteroAltura:qe="estandar",llapInclinadaLadoIgual:kt=!1,llapInclinadaTesteroIgual:Wt=!1,llapInclinadaLadoClavada:Je=!1,llapInclinadaTesteroClavada:xn=!1,barrotes:en=[],overrides:dt={},useTacosArrastre:Cn=!1,tacoArrastreLargo:Rn=40,tacoArrastreChaflan:zn=5,tacoArrastreAncho:li=0,useCuadradillos:gi=!1,cuadradilloAncho:Pn=10,cuadradilloGrosor:ca=10,cuadradilloClaro:er=65,useTapabocaFrontal:S=!1,useTapabocaTrasero:O=!1,useTapabocaIzquierda:Y=!1,useTapabocaDerecha:G=!1,tapabocaGrosor:H=1.8,tapabocaMargen:Ue=2,usePuntales:ke=!1,puntalAncho:Ae=10,puntalGrosor:Ye=4.5,useBarrotesRef:$e=!1,barroteRefAncho:gt=10,barroteRefGrosor:St=4.5}=n,ie=[];let ct=0;const Gt=$=>$==="cubrir"?4:$==="tablon"?3:$==="intermedia"?2:$==="apoyo"?1:$==="rastrel"?0:$==="suelo"?-1:4,Mt=he?Gt(Bt):-1,Ct=Qe?Gt(Ht):-1,on=he?Gt(U||Bt):-1,Ne=Qe?Gt(sn||Ht):-1,dn=x&&q&&Je&&se==="exterior"?z:0,ht=De&&D&&xn&&Ve==="exterior"?Re:0,gn=x&&se==="exterior"?z:0,_n=De&&Ve==="exterior"?Re:0,Jt=gn+dn,hn=_n+ht,Nt=x?z:0,jt=De?Re:0,kn=I&&K==="ancho"?2*X:0,pt=I&&K==="largo"?2*X:0,ln=M?3:4,at=e+kn,Ke=t+pt,ci=$=>{const fe=Mt>=0&&$<=Mt,be=on>=0&&$<=on;let ye=0;return fe&&be?ye=2*(ve+Jt):fe?ye=2*ve:be&&(ye=2*Nt),I&&M&&$===4&&(ye=0),t+($<=ln?pt:0)+ye},ui=$=>{const fe=Ct>=0&&$<=Ct,be=Ne>=0&&$<=Ne;let ye=0;return fe&&be?ye=2*(de+hn):fe?ye=2*de:be&&(ye=2*jt),I&&M&&$===4&&(ye=0),e+($<=ln?kn:0)+ye};if(P){const $=ui(0),fe=ci(0),be=j==="largo"?fe:$;let ye,_e;if(a==="dobleBase"){const ue=ui(1),ne=ci(1);ye=(u==="ancho"?ue:ne)-2*h,_e=h}else ye=j==="largo"?$:fe,_e=0;let Oe;a==="dobleBase"?Oe=j==="largo"?y:u==="ancho"?p:y:j==="largo"?Oe=A==="ancho"?m:y:Oe=A==="ancho"?y:m;const me=pn(be,Oe,0,L),ae=mn(be,me,0,L);for(let ue=0;ue<ae.length;ue++){const ne=`rastrel-${ue}`,ce=dt[ne]||{};ie.push({id:ne,layer:"rastrel",index:ue,center:ce.center??ae[ue],ancho:ce.ancho??L,alto:ce.alto??V,largoPieza:ce.largo??ye,runStart:ce.runStart??_e,orient:j,distDim:be,layerLargo:$,layerAncho:fe,y:ct,total:ae.length})}ct+=Math.max(...ie.filter(ue=>ue.layer==="rastrel").map(ue=>ue.alto))}const _i=ct,Un=ui(1),Ln=ci(1);if(a==="dobleBase"){const $=u==="ancho"?Ln:Un,fe=u==="ancho"?Un:Ln,be=pn(fe,p,h,o),ye=mn(fe,be,h,o);for(let _e=0;_e<ye.length;_e++){const Oe=`db-${_e}`,me=dt[Oe]||{},ae=me.center??ye[_e],ue=me.ancho??o,ne=me.alto??d,ce=me.largo??$;ie.push({id:Oe,layer:"db",index:_e,center:ae,ancho:ue,alto:ne,largoPieza:ce,orient:u,distDim:fe,layerLargo:Un,layerAncho:Ln,y:ct,total:ye.length})}ct+=Math.max(...ie.filter(_e=>_e.layer==="db").map(_e=>_e.alto))}else{const $=A==="ancho"?y:m,fe=A==="ancho"?m:y,be=pn(Un,$,0,g),ye=pn(Ln,fe,0,v),_e=mn(Un,be,0,g),Oe=mn(Ln,ye,0,v);for(let me=0;me<_e.length;me++)for(let ae=0;ae<Oe.length;ae++){const ue=`taco-${me}-${ae}`,ne=dt[ue]||{};ie.push({id:ue,layer:"taco",i:me,j:ae,centerX:ne.centerX??_e[me],centerZ:ne.centerZ??Oe[ae],largoPieza:ne.largo??g,ancho:ne.ancho??v,alto:ne.alto??_,layerLargo:Un,layerAncho:Ln,y:ct})}ct+=Math.max(...ie.filter(me=>me.layer==="taco").map(me=>me.alto))}const ei=ct;if(P&&a==="tacos"&&(S||O||Y||G)){const $=ie.filter(fe=>fe.layer==="taco");if($.length){const fe=Math.min(...$.map(et=>et.centerX)),be=Math.max(...$.map(et=>et.centerX)),ye=Math.min(...$.map(et=>et.centerZ)),_e=Math.max(...$.map(et=>et.centerZ)),Oe=g,me=v,ae=Ue,ue=H,ne=_i,ce=_,we=fe-Oe/2,Ce=be+Oe/2,rt=ye-me/2,ft=_e+me/2,Ze=Ce-we-2*ae,xt=ft-rt-2*ae,st=(we+Ce)/2,He=(rt+ft)/2;if(S&&Ze>.5){const et="tapaboca-frontal",mt=dt[et]||{};ie.push({id:et,layer:"tapaboca",cara:"frontal",center:mt.center??st,largoPieza:mt.largo??Ze,ancho:mt.ancho??ue,alto:mt.alto??ce,orient:"largo",edgePos:ft,layerLargo:$[0].layerLargo,layerAncho:$[0].layerAncho,y:ne})}if(O&&Ze>.5){const et="tapaboca-trasero",mt=dt[et]||{};ie.push({id:et,layer:"tapaboca",cara:"trasero",center:mt.center??st,largoPieza:mt.largo??Ze,ancho:mt.ancho??ue,alto:mt.alto??ce,orient:"largo",edgePos:rt-ue,layerLargo:$[0].layerLargo,layerAncho:$[0].layerAncho,y:ne})}if(Y&&xt>.5){const et="tapaboca-izquierda",mt=dt[et]||{};ie.push({id:et,layer:"tapaboca",cara:"izquierda",center:mt.center??He,largoPieza:mt.largo??xt,ancho:mt.ancho??ue,alto:mt.alto??ce,orient:"ancho",edgePos:we-ue,layerLargo:$[0].layerLargo,layerAncho:$[0].layerAncho,y:ne})}if(G&&xt>.5){const et="tapaboca-derecha",mt=dt[et]||{};ie.push({id:et,layer:"tapaboca",cara:"derecha",center:mt.center??He,largoPieza:mt.largo??xt,ancho:mt.ancho??ue,alto:mt.alto??ce,orient:"ancho",edgePos:Ce,layerLargo:$[0].layerLargo,layerAncho:$[0].layerAncho,y:ne})}}}if(a==="tacos"&&M&&f){const $=ui(2),fe=ci(2),be=Mr(A),ye=be==="ancho"?$:fe,_e=be==="ancho"?fe:$,me=pn(ye,be==="ancho"?m:y,0,b),ae=mn(ye,me,0,b);for(let ue=0;ue<ae.length;ue++){const ne=`intermedia-${ue}`,ce=dt[ne]||{};ie.push({id:ne,layer:"intermedia",index:ue,center:ce.center??ae[ue],ancho:ce.ancho??b,alto:ce.alto??w,largoPieza:ce.largo??_e,orient:be,distDim:ye,layerLargo:$,layerAncho:fe,y:ct,total:ae.length})}ct+=Math.max(...ie.filter(ue=>ue.layer==="intermedia").map(ue=>ue.alto))}const ua=ct;if(M){const $=ui(3),fe=ci(3),be=A==="largo"?$:fe,ye=A==="largo"?fe:$,_e=pn(ye,y,0,R),Oe=mn(ye,_e,0,R);for(let ae=0;ae<Oe.length;ae++){const ue=`tablon-${ae}`,ne=dt[ue]||{};ie.push({id:ue,layer:"tablon",index:ae,center:ne.center??Oe[ae],ancho:ne.ancho??R,alto:ne.alto??E,largoPieza:ne.largo??be,orient:A,distDim:ye,layerLargo:$,layerAncho:fe,y:ct,total:Oe.length})}const me=ct;if(ct+=Math.max(...ie.filter(ae=>ae.layer==="tablon").map(ae=>ae.alto)),oe&&oe!=="none"){const ue=[...ie.filter(Ze=>Ze.layer==="tablon")].sort((Ze,xt)=>Ze.center-xt.center),ne=Mr(A),ce=ne==="ancho"?$:fe;let we=[];const Ce=ie.filter(Ze=>Ze.layer==="db");if(Ce.length){const Ze=Ce[0].distDim,xt=(ce-Ze)/2,st=R/2;we=[...Ce].sort((He,et)=>He.center-et.center).map(He=>He.center+xt).filter(He=>He>=st-.5&&He<=ce-st+.5)}else{const Ze=ie.filter(xt=>xt.layer==="taco");if(ne==="ancho"){const xt=new Set;for(const st of Ze)xt.add(st.centerX);we=[...xt].sort((st,He)=>st-He)}else{const xt=new Set;for(const st of Ze)xt.add(st.centerZ);we=[...xt].sort((st,He)=>st-He)}}let rt=[];const ft=R;(oe==="extremos"||oe==="all")&&(rt=[...rt,ft/2,ce-ft/2]),(oe==="centrales"||oe==="all")&&(a==="dobleBase"?rt=[...rt,...we]:we.length>2&&(rt=[...rt,...we.slice(1,-1)])),rt=[...new Set(rt)];for(let Ze=0;Ze<rt.length;Ze++){const st=rt[Ze];for(let He=0;He<ue.length-1;He++){const et=ue[He],mt=ue[He+1],Xt=et.center+et.ancho/2,an=mt.center-mt.ancho/2,fn=an-Xt,Oa=(Xt+an)/2;if(fn<=.5)continue;const fa=`recuadro-${Ze}-${He}`,xi=dt[fa]||{};ie.push({id:fa,layer:"recuadro",anchorIdx:Ze,gapIdx:He,centerDist:xi.centerDist??st,centerRun:xi.centerRun??Oa,ancho:xi.ancho??R,alto:xi.alto??E,largoPieza:xi.largo??fn,orient:ne,distDim:ce,runDim:A==="largo"?fe:$,layerLargo:$,layerAncho:fe,y:me})}}}}if(Cn&&M){const $=ie.filter(fe=>fe.layer==="tablon");if($.length){const fe=$[0].layerLargo,be=$[0].layerAncho,ye=A==="largo",_e=ye?fe:be;let Oe=0;for(const me of $)for(let ae=0;ae<2;ae++){const ue=`taco-arrastre-${Oe++}`,ne=dt[ue]||{},ce=ne.largo??Math.min(Rn,_e/2),we=ne.ancho??(li>0?li:me.ancho),Ce=ae===0?0:_e-ce,rt=me.center-we/2;ie.push({id:ue,layer:"taco-arrastre",index:Oe-1,runAlongX:ye,x:ye?Ce:rt,z:ye?rt:Ce,largoPieza:ce,ancho:we,alto:ne.alto??d,chaflan:ne.chaflan??Math.min(zn,ce),edge:ae,layerLargo:fe,layerAncho:be,y:ne.y??0})}}}const Nn=ui(4),$n=ci(4),Na=T==="largo",Pi=Na?$n:Nn,Wi=ct;if(r==="contrachapado"){const $="cubrir",fe=dt[$]||{};ie.push({id:$,layer:"cubrir-plancha",largoPieza:fe.largoPieza??Nn,anchoPieza:fe.anchoPieza??$n,alto:fe.alto??s,layerLargo:Nn,layerAncho:$n,y:Wi})}else if(r==="jaula"){const $=pn(Pi,c,0,l),fe=mn(Pi,$,0,l);for(let be=0;be<fe.length;be++){const ye=`cubrir-${be}`,_e=dt[ye]||{};ie.push({id:ye,layer:"cubrir-tabla",index:be,layerLargo:Nn,layerAncho:$n,center:_e.center??fe[be],ancho:_e.ancho??l,alto:_e.alto??s,largoPieza:_e.largo??(Na?Nn:$n),orient:T,distDim:Pi,y:Wi})}}else{const $=Math.max(1,Math.floor(Pi/l)),fe=Pi-$*l,be=Math.max(2,l*.5),ye=fe>=be?0:$>1?fe/($-1):0,_e=fe>=be,Oe=l+ye;for(let me=0;me<$;me++){const ae=`cubrir-${me}`,ue=dt[ae]||{};ie.push({id:ae,layer:"cubrir-tabla",index:me,layerLargo:Nn,layerAncho:$n,center:ue.center??me*Oe+l/2,ancho:ue.ancho??l,alto:ue.alto??s,largoPieza:ue.largo??(Na?Nn:$n),orient:T,distDim:Pi,y:Wi})}if(_e){const me=`cubrir-${$}`,ae=dt[me]||{};ie.push({id:me,layer:"cubrir-tabla",index:$,layerLargo:Nn,layerAncho:$n,center:ae.center??$*l+fe/2,ancho:ae.ancho??fe,alto:ae.alto??s,largoPieza:ae.largo??(Na?Nn:$n),orient:T,distDim:Pi,y:Wi})}}if(I){const $=M?Wi:Wi+s,fe=K==="ancho"?Ke-ge:at-Me,be=K==="ancho"?at:Ke,ye=[X/2,be-X/2];for(let _e=0;_e<2;_e++){const Oe=`orilla-${_e}`,me=dt[Oe]||{};ie.push({id:Oe,layer:"orilla",index:_e,center:me.center??ye[_e],ancho:me.ancho??X,alto:me.alto??k,largoPieza:me.largo??fe,orient:K,distDim:be,layerLargo:at,layerAncho:Ke,y:$,total:2})}}const tr=$=>$==="suelo"?.5:$==="rastrel"?_i:$==="apoyo"?ei:$==="intermedia"?ua:$==="tablon"?Wi:Wi+s,ms=he?tr(Bt):0,gs=Qe?tr(Ht):0,hu=he?tr(U||Bt):0,fu=Qe?tr(sn||Ht):0,rf=he?tr(Ut||Bt):0,sf=Qe?tr(C||Ht):0,of=Qe?de+_n:0,lf=he?ve+gn:0;let tn,cn,da,nn,un,ha,Xi=0,Yi=0;const pu=at+2*of,mu=Ke+2*lf;zt==="lado"?(Et==="none"?tn=pu:Et==="espiga"?(tn=at+2*(Qe?de:0),Xi=2*ve):(tn=at,Xi=2*ve),Zt==="none"?cn=pu:Zt==="espiga"?cn=at+2*(Qe?de:0):cn=at,da=-(Math.max(tn,cn)-at)/2,nn=Ke+(Et==="cargamento"?Xi:0),un=Ke,ha=-(nn-Ke)/2):(Et==="none"?nn=mu:Et==="espiga"?(nn=Ke+2*(he?ve:0),Yi=2*de):(nn=Ke,Yi=2*de),Zt==="none"?un=mu:Zt==="espiga"?un=Ke+2*(he?ve:0):un=Ke,ha=-(Math.max(nn,un)-Ke)/2,tn=at+(Et==="cargamento"?Yi:0),cn=at,da=-(tn-at)/2);let Ir=Math.max(tn,cn),Dr=Math.max(nn,un);if(zt==="lado"){if(he&&x&&se==="interior"){const $=tn;tn=cn,cn=$-(Et==="espiga"?Me:0),da=-(Math.max(tn,cn)-at)/2}Qe&&De&&Ve==="interior"&&(nn-=ge,un-=ge,ha=-(Math.max(nn,un)-Ke)/2)}else{if(Qe&&De&&Ve==="interior"){const $=nn;nn=un,un=$-(Et==="espiga"?ge:0),ha=-(Math.max(nn,un)-Ke)/2}he&&x&&se==="interior"&&(tn-=Me,cn-=Me,da=-(Math.max(tn,cn)-at)/2)}Ir=Math.max(tn,cn),Dr=Math.max(nn,un),zt==="lado"&&Qe&&De&&Ve==="interior"&&Et==="espiga"&&(nn+=Xi,Xi=0,ha=-(Math.max(nn,un)-Ke)/2,Dr=Math.max(nn,un)),zt==="testero"&&he&&x&&se==="interior"&&Et==="espiga"&&(tn+=Yi,Yi=0,da=-(Math.max(tn,cn)-at)/2,Ir=Math.max(tn,cn)),Et==="cargamento"&&(zt==="lado"&&x&&se==="interior"&&De&&Ve==="interior"&&(cn-=2*Re,un+=2*z,Xi=0,da=-(Math.max(tn,cn)-at)/2,ha=-(Math.max(nn,un)-Ke)/2,Ir=Math.max(tn,cn),Dr=Math.max(nn,un)),zt==="testero"&&De&&Ve==="interior"&&x&&se==="interior"&&(un-=2*z,cn+=2*Re,Yi=0,ha=-(Math.max(nn,un)-Ke)/2,da=-(Math.max(tn,cn)-at)/2,Dr=Math.max(nn,un),Ir=Math.max(tn,cn)));const cf=-ve,uf=Ke,yn=Wi+s,Ml=yn+i-ms,gu=it&&xe?Be:0,df=x&&F!=="largo",hf=De&&Te!=="largo",yl=it&&df&&se==="exterior"?bt==="cubrir"?wt:bt==="llapasa"?wt+gu:0:0,Sl=it&&hf&&Ve==="exterior"?qe==="cubrir"?wt:qe==="llapasa"?wt+gu:0:0;if(he)for(let $=0;$<2;$++){const fe=$===1,be=`lado-${$}`,ye=dt[be]||{},_e=fe?uf:cf,Oe=da+(Ir-tn)/2;if(Ie==="contrachapado")ie.push({id:be,layer:"lado-plancha",index:$,largoPieza:ye.largoPieza??tn,anchoPieza:ye.anchoPieza??ve,alto:ye.alto??Ml,x:Oe,z:_e,y:ms});else{const me=!x||F==="largo",ae=me?tn:Ml,ue=me?Ml:tn,ne=[];if(Ie==="jaula"){const ce=pn(ae,Ft,0,_t),we=mn(ae,ce,0,_t);for(const Ce of we)ne.push({center:Ce,w:_t})}else{let ce=0;for(;ce+_t<=ae;)ne.push({center:ce+_t/2,w:_t}),ce+=_t;const we=ae-ce;we>.5&&ne.push({center:ce+we/2,w:we})}for(let ce=0;ce<ne.length;ce++){const we=`lado-${$}-tabla-${ce}`,Ce=dt[we]||{},rt=me?ms:ms+(Ce.center??ne[ce].center)-(Ce.ancho??ne[ce].w)/2,ft=me?Oe+(Ce.center??ne[ce].center)-(Ce.ancho??ne[ce].w)/2:Oe;ie.push({id:we,layer:"lado-tabla",parentIndex:$,index:ce,center:Ce.center??ne[ce].center,ancho:Ce.ancho??ne[ce].w,alto:Ce.alto??ue,largoPieza:Ce.largo??ve,x:ft,z:_e,y:rt,faceType:"lado",boardsAlongAlto:me})}}}const ff=-de,pf=at,bl=yn+i-gs;if(Qe)for(let $=0;$<2;$++){const fe=$===1,be=`testero-${$}`,ye=dt[be]||{},_e=fe?pf:ff,Oe=ha+(Dr-nn)/2;if(ee==="contrachapado")ie.push({id:be,layer:"testero-plancha",index:$,largoPieza:ye.largoPieza??de,anchoPieza:ye.anchoPieza??nn,alto:ye.alto??bl,x:_e,z:Oe,y:gs});else{const me=!De||Te==="largo",ae=me?nn:bl,ue=me?bl:nn,ne=[];if(ee==="jaula"){const ce=pn(ae,ze,0,le),we=mn(ae,ce,0,le);for(const Ce of we)ne.push({center:Ce,w:le})}else{let ce=0;for(;ce+le<=ae;)ne.push({center:ce+le/2,w:le}),ce+=le;const we=ae-ce;we>.5&&ne.push({center:ce+we/2,w:we})}for(let ce=0;ce<ne.length;ce++){const we=`testero-${$}-tabla-${ce}`,Ce=dt[we]||{},rt=me?gs:gs+(Ce.center??ne[ce].center)-(Ce.ancho??ne[ce].w)/2,ft=me?Oe+(Ce.center??ne[ce].center)-(Ce.ancho??ne[ce].w)/2:Oe;ie.push({id:we,layer:"testero-tabla",parentIndex:$,index:ce,center:Ce.center??ne[ce].center,ancho:Ce.ancho??ne[ce].w,alto:Ce.alto??ue,largoPieza:Ce.largo??de,x:_e,z:ft,y:rt,faceType:"testero",boardsAlongAlto:me})}}}const El=-(Qe?de+hn:0),Tl=-(he?ve+Jt:0),Ur=at+2*(Qe?de+hn:0),Nr=Ke+2*(he?ve+Jt:0),_u=yl>0?z:0,xu=Sl>0?Re:0,Al=bt==="llapasa"&&yl>0?z:0,wl=qe==="llapasa"&&Sl>0?Re:0;if(it){const $=yn+i,fe=yt?Kt:0,be=El+xu-fe,ye=Tl+_u-fe,_e=Ur-2*xu+2*fe,Oe=Nr-2*_u+2*fe;if(je==="contrachapado"){const me="tapa",ae=dt[me]||{};ie.push({id:me,layer:"tapa-plancha",largoPieza:ae.largoPieza??_e,anchoPieza:ae.anchoPieza??Oe,alto:ae.alto??wt,x:be,z:ye,y:$})}else{const me=xe?Pe==="ancho":Rt==="largo",ae=me?_e:Oe,ue=me?Oe:_e,ne=me?be:ye,ce=me?ye:be,we=[];if(je==="jaula"){const Ce=pn(ue,Dt,0,lt),rt=mn(ue,Ce,0,lt);for(const ft of rt)we.push({center:ft,w:lt})}else{let Ce=0;for(;Ce+lt<=ue;)we.push({center:Ce+lt/2,w:lt}),Ce+=lt;const rt=ue-Ce;rt>.5&&we.push({center:Ce+rt/2,w:rt})}for(let Ce=0;Ce<we.length;Ce++){const rt=`tapa-tabla-${Ce}`,ft=dt[rt]||{};ie.push({id:rt,layer:"tapa-tabla",index:Ce,center:ft.center??we[Ce].center,ancho:ft.ancho??we[Ce].w,alto:ft.alto??wt,largoPieza:ft.largo??ae,x:me?ne:ce+(ft.center??we[Ce].center)-(ft.ancho??we[Ce].w)/2,z:me?ce+(ft.center??we[Ce].center)-(ft.ancho??we[Ce].w)/2:ne,y:$,boardsAlongLargo:me})}}}if(x&&he){const $=F==="largo",fe=cn+Yi,be=se==="interior"?yn:hu,ye=se==="interior"&&I&&K==="largo"?k:0,_e=yn+i-(se==="interior"?Le:0)-be-ye+yl,Oe=$?fe:_e,me=$?_e:fe,ae=pn(me,pe,0,N),ue=mn(me,ae,0,N);for(let ne=0;ne<2;ne++){const ce=ne===1,we=ce?Ke+ve:-ve-z,Ce=ce?Ke-z:0,rt=se==="exterior"?we:Ce,ft=(at-fe)/2;for(let Ze=0;Ze<ue.length;Ze++){const xt=`llap-lado-${ne}-${Ze}`,st=dt[xt]||{};if($){const He=st.ancho??N,et=st.center??be+ye+ue[Ze];ie.push({id:xt,layer:"llap-lado",parentIndex:ne,index:Ze,x:ft,z:rt,y:et-He/2,center:et,w:st.largo??Oe,h:He,d:st.grosor??z})}else{const He=st.ancho??N,et=st.center??ft+ue[Ze];ie.push({id:xt,layer:"llap-lado",parentIndex:ne,index:Ze,x:et-He/2,z:rt,y:be,center:et,w:He,h:st.largo??Oe,d:st.grosor??z})}}}}if(q&&x&&he){const $=F==="largo",fe=cn+Yi,be=se==="interior"?yn:rf,ye=se==="interior"&&I&&K==="largo"?k:0,_e=yn+i-(se==="interior"?Le:0)-be-ye,Oe=$?_e:fe,me=pn(Oe,pe,0,N),ae=mn(Oe,me,0,N);if(ae.length>=2){const ue=$?fe:_e,ne=Je&&se==="exterior",ce=ne?z:0;for(let we=0;we<2;we++){const Ce=we===1,rt=(Ce?Ke+ve:-ve-z)+(Ce?1:-1)*ce,ft=Ce?Ke-z:0,Ze=se==="exterior"?rt:ft,xt=-(fe-at)/2;let st;if(ne)st=[{g:ae[ae.length-1]+N/2-(ae[0]-N/2),dStart:ae[0]-N/2,sign:1}];else{const He=ae[1]-N/2-(ae[0]+N/2),et=ae[ae.length-1]-N/2-(ae[ae.length-2]+N/2),mt=ae.length===2&&nt!==1,Xt=mt?He/2:He,an=mt?et/2:et,fn=[{g:Xt,dStart:ae[0]+N/2,sign:1},{g:an,dStart:ae[ae.length-1]-N/2-an,sign:-1}];st=nt===1?[fn[0]]:fn}for(let He=0;He<st.length;He++){const{g:et,dStart:mt,sign:Xt}=st[He];if(et<=0)continue;const{L:an,a:fn}=Su(et,ue,N);if(an<=0)continue;const Oa=mt+et/2,fa=ue/2,xi=fn*Xt*(kt?Ce?1:-1:1),Or=`llap-incl-lado-${we}-${He}`;$?ie.push({id:Or,layer:"llap-incl-lado",parentIndex:we,diagIndex:He,cx:xt+fa,cy:be+ye+Oa,cz:Ze+z/2,w:an,h:N,d:z,rotZ:xi}):ie.push({id:Or,layer:"llap-incl-lado",parentIndex:we,diagIndex:He,cx:xt+Oa,cy:be+fa,cz:Ze+z/2,w:N,h:an,d:z,rotZ:-xi})}}}}if(De&&Qe){const $=Te==="largo",fe=un+Xi,be=Ve==="interior"?yn:fu,ye=Ve==="interior"&&I&&K==="ancho"?k:0,_e=yn+i-(Ve==="interior"?Le:0)-be-ye+Sl,Oe=$?fe:_e,me=$?_e:fe,ae=pn(me,tt,0,re),ue=mn(me,ae,0,re);for(let ne=0;ne<2;ne++){const ce=ne===1,we=ce?at+de:-de-Re,Ce=ce?at-Re:0,rt=Ve==="exterior"?we:Ce,ft=(Ke-fe)/2;for(let Ze=0;Ze<ue.length;Ze++){const xt=`llap-testero-${ne}-${Ze}`,st=dt[xt]||{};if($){const He=st.ancho??re,et=st.center??be+ye+ue[Ze];ie.push({id:xt,layer:"llap-testero",parentIndex:ne,index:Ze,x:rt,z:ft,y:et-He/2,center:et,w:st.grosor??Re,h:He,d:st.largo??Oe})}else{const He=st.ancho??re,et=st.center??ft+ue[Ze];ie.push({id:xt,layer:"llap-testero",parentIndex:ne,index:Ze,x:rt,z:et-He/2,y:be,center:et,w:st.grosor??Re,h:st.largo??Oe,d:He})}}}}if(D&&De&&Qe){const $=Te==="largo",fe=un+Xi,be=Ve==="interior"?yn:sf,ye=Ve==="interior"&&I&&K==="ancho"?k:0,_e=yn+i-(Ve==="interior"?Le:0)-be-ye,Oe=$?_e:fe,me=pn(Oe,tt,0,re),ae=mn(Oe,me,0,re);if(ae.length>=2){const ue=$?fe:_e,ne=xn&&Ve==="exterior",ce=ne?Re:0;for(let we=0;we<2;we++){const Ce=we===1,rt=(Ce?at+de:-de-Re)+(Ce?1:-1)*ce,ft=Ce?at-Re:0,Ze=Ve==="exterior"?rt:ft,xt=-(fe-Ke)/2;let st;if(ne)st=[{g:ae[ae.length-1]+re/2-(ae[0]-re/2),dStart:ae[0]-re/2,sign:1}];else{const He=ae[1]-re/2-(ae[0]+re/2),et=ae[ae.length-1]-re/2-(ae[ae.length-2]+re/2),mt=ae.length===2&&Xe!==1,Xt=mt?He/2:He,an=mt?et/2:et,fn=[{g:Xt,dStart:ae[0]+re/2,sign:1},{g:an,dStart:ae[ae.length-1]-re/2-an,sign:-1}];st=Xe===1?[fn[0]]:fn}for(let He=0;He<st.length;He++){const{g:et,dStart:mt,sign:Xt}=st[He];if(et<=0)continue;const{L:an,a:fn}=Su(et,ue,re);if(an<=0)continue;const Oa=mt+et/2,fa=ue/2,xi=fn*Xt*(Ce&&Wt?-1:1),Or=`llap-incl-testero-${we}-${He}`;$?ie.push({id:Or,layer:"llap-incl-testero",parentIndex:we,diagIndex:He,cx:Ze+Re/2,cy:be+ye+Oa,cz:xt+fa,w:Re,h:re,d:an,rotX:-xi}):ie.push({id:Or,layer:"llap-incl-testero",parentIndex:we,diagIndex:He,cx:Ze+Re/2,cy:be+fa,cz:xt+Oa,w:Re,h:an,d:re,rotX:xi})}}}}if(Q&&x&&he){const $=F==="largo",fe=cn+Yi,be=se==="interior"?yn:hu,ye=se==="interior"&&I&&K==="largo"?k:0,_e=yn+i-(se==="interior"?Le:0)-be-ye,Oe=$?_e:fe,me=$?fe:_e,ae=pn(Oe,pe,0,N),ue=mn(Oe,ae,0,N);for(let ne=0;ne<2;ne++){const ce=ne===1,we=ce?Ke+ve:-ve-z,Ce=ce?Ke-z:0,rt=se==="exterior"?we:Ce,ft=(at-fe)/2;for(let Ze=0;Ze<ue.length-1;Ze++){const xt=ue[Ze]+N/2,He=ue[Ze+1]-N/2-xt;if(He<=0)continue;const et=pn(me,Ee,0,N),mt=mn(me,et,0,N);for(let Xt=0;Xt<mt.length;Xt++){const an=`rec-lado-${ne}-${Ze}-${Xt}`,fn=dt[an]||{};$?ie.push({id:an,layer:"rec-lado",parentIndex:ne,x:ft+mt[Xt]-N/2,z:rt,y:be+ye+xt,w:fn.ancho??N,h:fn.largo??He,d:z}):ie.push({id:an,layer:"rec-lado",parentIndex:ne,x:ft+xt,z:rt,y:be+mt[Xt]-N/2,w:fn.largo??He,h:fn.ancho??N,d:z})}}}}if(Se&&De&&Qe){const $=Te==="largo",fe=un+Xi,be=Ve==="interior"?yn:fu,ye=Ve==="interior"&&I&&K==="ancho"?k:0,_e=yn+i-(Ve==="interior"?Le:0)-be-ye,Oe=$?_e:fe,me=$?fe:_e,ae=pn(Oe,tt,0,re),ue=mn(Oe,ae,0,re);for(let ne=0;ne<2;ne++){const ce=ne===1,we=ce?at+de:-de-Re,Ce=ce?at-Re:0,rt=Ve==="exterior"?we:Ce,ft=(Ke-fe)/2;for(let Ze=0;Ze<ue.length-1;Ze++){const xt=ue[Ze]+re/2,He=ue[Ze+1]-re/2-xt;if(He<=0)continue;const et=pn(me,Z,0,re),mt=mn(me,et,0,re);for(let Xt=0;Xt<mt.length;Xt++){const an=`rec-testero-${ne}-${Ze}-${Xt}`,fn=dt[an]||{};$?ie.push({id:an,layer:"rec-testero",parentIndex:ne,x:rt,z:ft+mt[Xt]-re/2,y:be+ye+xt,w:Re,h:fn.largo??He,d:fn.ancho??re}):ie.push({id:an,layer:"rec-testero",parentIndex:ne,x:rt,z:ft+xt,y:be+mt[Xt]-re/2,w:Re,h:fn.ancho??re,d:fn.largo??He})}}}}if(J&&xe&&it){const $=Pe==="largo",fe=yn+i;let be,ye,_e,Oe;W==="interior"?(be=$?Ke:at,ye=$?at:Ke,_e=0,Oe=0):(be=$?Nr:Ur,ye=$?Ur:Nr,_e=El,Oe=Tl);const me=pn(be,We,0,te),ae=mn(be,me,0,te),ue=W==="exterior"?fe+wt:fe-Be;for(let ne=0;ne<ae.length-1;ne++){const ce=ae[ne]+te/2,Ce=ae[ne+1]-te/2-ce;if(Ce<=0)continue;const rt=pn(ye,Ge,0,te),ft=mn(ye,rt,0,te);for(let Ze=0;Ze<ft.length;Ze++){const xt=`rec-tapa-${ne}-${Ze}`,st=dt[xt]||{};if($){const He=_e+ft[Ze]-te/2,et=Oe+ce,mt=st.posX??He,Xt=st.posZ??et;ie.push({id:xt,layer:"rec-tapa",orient:"largo",x:mt,z:Xt,y:ue,posX:mt,posZ:Xt,w:st.ancho??te,h:Be,d:st.largo??Ce})}else{const He=_e+ce,et=Oe+ft[Ze]-te/2,mt=st.posX??He,Xt=st.posZ??et;ie.push({id:xt,layer:"rec-tapa",orient:"ancho",x:mt,z:Xt,y:ue,posX:mt,posZ:Xt,w:st.largo??Ce,h:Be,d:st.ancho??te})}}}}if(xe&&it){const $=yn+i,fe=Pe==="largo";let be,ye,_e,Oe;W==="interior"?(be=fe?at:Ke,ye=fe?Ke:at,_e=0,Oe=0):(be=fe?Ur-2*wl:Nr-2*Al,ye=fe?Nr-2*Al:Ur-2*wl,_e=El+wl,Oe=Tl+Al);const me=pn(ye,We,0,te),ae=mn(ye,me,0,te),ue=W==="exterior"?$+wt:$-Be;for(let ne=0;ne<ae.length;ne++){const ce=`llap-tapa-${ne}`,we=dt[ce]||{};if(fe){const Ce=we.ancho??te,rt=we.center??Oe+ae[ne],ft=we.posX??_e;ie.push({id:ce,layer:"llap-tapa",index:ne,x:ft,z:rt-Ce/2,y:ue,center:rt,posX:ft,w:we.largo??be,h:we.grosor??Be,d:Ce})}else{const Ce=we.ancho??te,rt=we.center??_e+ae[ne],ft=we.posZ??Oe;ie.push({id:ce,layer:"llap-tapa",index:ne,x:rt-Ce/2,z:ft,y:ue,center:rt,posZ:ft,w:Ce,h:we.grosor??Be,d:we.largo??be})}}}if(it&&gi){const fe=yn+i-ca,be=ca,ye=[{id:"cuad-long-0",z:0},{id:"cuad-long-1",z:Ke-Pn}];for(const ue of ye){const ne=dt[ue.id]||{};ie.push({id:ue.id,layer:"cuadradillo",kind:"long",x:0,z:ne.z??ue.z,y:fe,w:ne.largo??at,h:be,d:ne.ancho??Pn})}const _e=at;let Oe=pn(_e,er,0,Pn);Oe<2&&(Oe=2);const me=mn(_e,Oe,0,Pn),ae=Ke-2*Pn;if(ae>.5)for(let ue=0;ue<me.length;ue++){const ne=`cuad-trans-${ue}`,ce=dt[ne]||{};ie.push({id:ne,layer:"cuadradillo",kind:"trans",index:ue,x:(ce.center??me[ue])-(ce.ancho??Pn)/2,z:Pn,y:fe,w:ce.ancho??Pn,h:be,d:ce.largo??ae})}}if(ke&&he&&a==="dobleBase"&&u==="ancho"){const $=ie.filter(fe=>fe.layer==="db");if($.length){const fe=it&&gi?ca:0,be=yn,ye=i-fe;let _e=0;for(const Oe of $){const me=(at-Oe.layerLargo)/2,ae=Oe.center+me;for(let ue=0;ue<2;ue++){const ne=`puntal-${_e++}`,ce=dt[ne]||{},we=ce.ancho??Ae,Ce=ce.grosor??Ye,rt=Qe?de:0,ft=I&&K==="ancho"?X:0,Ze=I&&K==="largo"?X:0,xt=rt+ft,st=at-rt-ft-we;let He=ae-we/2;He=Math.min(Math.max(He,xt),st);const et=ue===1?Ke-Ce:0,mt=ue===1?et-Ze:et+Ze;ie.push({id:ne,layer:"puntal",parentIndex:ue,x:ce.x??He,z:ce.z??mt,y:ce.y??be,w:we,h:ce.alto??ye,d:Ce,layerLargo:at,layerAncho:Ke})}}}}if($e&&Qe&&x&&F==="largo"){const be=ie.filter(_e=>_e.layer==="llap-lado"&&_e.parentIndex===0).map(_e=>({y:_e.y,h:_e.h})).sort((_e,Oe)=>_e.y-Oe.y).slice(1,-1);let ye=0;for(const _e of be){const Oe=_e.y+_e.h/2;for(let me=0;me<2;me++){const ae=`bref-${ye++}`,ue=dt[ae]||{},ne=ue.grosor??St,ce=ue.ancho??gt,we=ue.largo??Ke;ie.push({id:ae,layer:"barrote-ref",parentIndex:me,x:me===1?at-ne:0,z:0,y:ue.y??Oe-ce/2,w:ne,h:ce,d:we,layerLargo:at,layerAncho:Ke})}}}for(const $ of en)ie.push({id:$.id,layer:"barrote",attachedTo:$.attachedTo??null,orient:$.orient,largo:$.largo,ancho:$.ancho,alto:$.alto,x:$.x,y:$.y,z:$.z});return ie}function bu(n){return n.startsWith("lado")||n.startsWith("testero")||n.startsWith("tapa")||n.startsWith("llap-")||n.startsWith("rec-")}function Ud(n,e){const t=e.largo,i=e.ancho,a=e.baseLargo||t,r=e.baseAncho||i,s=[],l=(o,d,h,u,p,g,v,_,m,M)=>{s.push({layer:o,id:d,x0:Math.min(h,g),y0:Math.min(u,v),z0:Math.min(p,_),x1:Math.max(h,g),y1:Math.max(u,v),z1:Math.max(p,_),...m?{rot:m}:{},...M!==void 0?{attachedTo:M}:{}})},c=e.hiddenPieces??{};for(const o of n){if(c[o.id])continue;const d=o.layer,h=o.layerLargo!=null?o.layerLargo:bu(d)?a:t,u=o.layerAncho!=null?o.layerAncho:bu(d)?r:i,p=-h/2,g=-u/2;let v,_,m,M,R,E,A;if(o.w!=null){if(o.cx!=null){const j=d==="llap-incl-testero",I=j?o.rotX||0:o.rotZ||0,X=Math.abs(Math.cos(I)),k=Math.abs(Math.sin(I)),K=j?o.w/2:(o.w*X+o.h*k)/2,oe=j?(o.h*X+o.d*k)/2:(o.w*k+o.h*X)/2,he=j?(o.h*k+o.d*X)/2:o.d/2;l(d,o.id,p+o.cx-K,o.cy-oe,g+o.cz-he,p+o.cx+K,o.cy+oe,g+o.cz+he,{axis:j?"x":"z",angle:I,cx:p+o.cx,cy:o.cy,cz:g+o.cz,w:o.w,h:o.h,d:o.d});continue}const L=d==="cuadradillo"?-a/2:p,V=d==="cuadradillo"?-r/2:g;v=L+o.x,M=v+o.w,_=o.y,R=_+o.h,m=V+o.z,E=m+o.d,l(d,o.id,v,_,m,M,R,E);continue}let y,T,f,b=0,w=0;const P=o.y||0;if(d==="db")y=o.ancho,T=o.alto,f=o.largoPieza,o.orient==="ancho"?(b=p+o.center-y/2,w=g+(u-f)/2):(A=y,y=f,f=A,b=p+(h-y)/2,w=g+o.center-f/2);else if(d==="rastrel"){y=o.ancho,T=o.alto,f=o.largoPieza;const L=o.runStart||0;o.orient==="largo"?(A=y,y=f,f=A,b=p+L,w=g+o.center-f/2):(b=p+o.center-y/2,w=g+L)}else if(d==="tablon"||d==="intermedia")y=o.ancho,T=o.alto,f=o.largoPieza,o.orient==="largo"?(A=y,y=f,f=A,b=p+(h-y)/2,w=g+o.center-f/2):(b=p+o.center-y/2,w=g+(u-f)/2);else if(d==="taco")y=o.largoPieza,T=o.alto,f=o.ancho,b=p+o.centerX-y/2,w=g+o.centerZ-f/2;else if(d==="taco-arrastre")o.runAlongX?(y=o.largoPieza,f=o.ancho):(y=o.ancho,f=o.largoPieza),T=o.alto,b=p+o.x,w=g+o.z;else if(d==="recuadro")y=o.ancho,T=o.alto,f=o.largoPieza,o.orient==="ancho"?(b=p+o.centerDist-y/2,w=g+o.centerRun-f/2):(A=y,y=f,f=A,b=p+o.centerRun-y/2,w=g+o.centerDist-f/2);else if(d==="cubrir-plancha")y=o.largoPieza,T=o.alto,f=o.anchoPieza,b=p,w=g;else if(d==="cubrir-tabla")y=o.ancho,T=o.alto,f=o.largoPieza,o.orient==="largo"?(A=y,y=f,f=A,b=p,w=g+o.center-f/2):(b=p+o.center-y/2,w=g);else if(d==="orilla")y=o.ancho,T=o.alto,f=o.largoPieza,o.orient==="largo"?(A=y,y=f,f=A,b=p+(h-y)/2,w=g+o.center-f/2):(b=p+o.center-y/2,w=g+(u-f)/2);else if(d==="tapaboca")y=o.orient==="largo"?o.largoPieza:o.ancho,T=o.alto,f=o.orient==="largo"?o.ancho:o.largoPieza,o.orient==="largo"?(b=p+o.center-y/2,w=g+o.edgePos):(b=p+o.edgePos,w=g+o.center-f/2);else if(d==="barrote")o.orient==="largo"?(y=o.largo,T=o.alto,f=o.ancho):o.orient==="ancho"?(y=o.ancho,T=o.alto,f=o.largo):(y=o.ancho,T=o.largo,f=o.alto),b=o.x-y/2,w=o.z-f/2;else if(d==="lado-plancha"||d==="testero-plancha"||d==="tapa-plancha")y=o.largoPieza,T=o.alto,f=o.anchoPieza,b=p+o.x,w=g+o.z;else if(d==="lado-tabla")y=o.boardsAlongAlto!==!1?o.ancho:o.alto,T=o.boardsAlongAlto!==!1?o.alto:o.ancho,f=o.largoPieza,b=p+o.x,w=g+o.z;else if(d==="testero-tabla")y=o.largoPieza,T=o.boardsAlongAlto!==!1?o.alto:o.ancho,f=o.boardsAlongAlto!==!1?o.ancho:o.alto,b=p+o.x,w=g+o.z;else if(d==="tapa-tabla")y=o.boardsAlongLargo!==!1?o.largoPieza:o.ancho,T=o.alto,f=o.boardsAlongLargo!==!1?o.ancho:o.largoPieza,b=p+o.x,w=g+o.z;else continue;y==null||T==null||f==null||l(d,o.id,b,P,w,b+y,P+T,w+f,void 0,d==="barrote"?o.attachedTo??null:void 0)}return s}function Nf(n){let e=1/0,t=1/0,i=1/0,a=-1/0,r=-1/0,s=-1/0;for(const l of n)l.x0<e&&(e=l.x0),l.y0<t&&(t=l.y0),l.z0<i&&(i=l.z0),l.x1>a&&(a=l.x1),l.y1>r&&(r=l.y1),l.z1>s&&(s=l.z1);return{minX:e,minY:t,minZ:i,maxX:a,maxY:r,maxZ:s,largo:a-e,alto:r-t,ancho:s-i}}const Of=new Set(["lado-plancha","lado-tabla","llap-lado","llap-incl-lado","rec-lado"]),Ff=new Set(["testero-plancha","testero-tabla","llap-testero","llap-incl-testero","rec-testero"]),Bf=new Set(["tapa-plancha","tapa-tabla","llap-tapa","rec-tapa","cuadradillo"]);function Eu(n){return n.layer==="puntal"||n.layer==="barrote-ref"||n.layer==="barrote"}function _s(n){const e=/(?:lado|testero)-(\d)/.exec(n);return e?Number(e[1]):null}function zf(n){const e=n.x1-n.x0,t=n.y1-n.y0,i=n.z1-n.z0;return e<=t&&e<=i?{w:t,h:e,d:i}:i<=t&&i<=e?{w:e,h:i,d:t}:{w:e,h:t,d:i}}function Cl(n){if(!n.length)return null;let e=1/0,t=-1/0,i=1/0,a=-1/0,r=1/0,s=-1/0;for(const l of n)l.x0<e&&(e=l.x0),l.x1>t&&(t=l.x1),l.y0<i&&(i=l.y0),l.y1>a&&(a=l.y1),l.z0<r&&(r=l.z0),l.z1>s&&(s=l.z1);return{minX:e,maxX:t,minY:i,maxY:a,minZ:r,maxZ:s}}function kf(n){const e=n.filter(f=>!Eu(f)),t=f=>Of.has(f.layer),i=f=>Ff.has(f.layer),a=f=>Bf.has(f.layer),r=f=>!t(f)&&!i(f)&&!a(f),s=e.filter(r),l=Cl(s);if(!l)return e;const c=[...s];let o=l.maxY;const d=l.maxX-l.minX,h=l.maxZ-l.minZ,u=(f,b)=>{if(!f.length)return null;const w=Cl(f),P=f.map(V=>{const{rot:j,...I}=V;return b==="x"?{...I,x0:V.x0-w.minX,x1:V.x1-w.minX,y0:V.z0-w.minZ,y1:V.z1-w.minZ,z0:V.y0-w.minY,z1:V.y1-w.minY}:b==="z"?{...I,x0:V.y0-w.minY,x1:V.y1-w.minY,y0:V.x0-w.minX,y1:V.x1-w.minX,z0:V.z0-w.minZ,z1:V.z1-w.minZ}:{...I,x0:V.x0-w.minX,x1:V.x1-w.minX,y0:V.y0-w.minY,y1:V.y1-w.minY,z0:V.z0-w.minZ,z1:V.z1-w.minZ}}),L=Cl(P);return{cajas:P,grosor:L.maxY-L.minY,footprintX:L.maxX-L.minX,footprintZ:L.maxZ-L.minZ}},p=(f,b)=>f?b?{cajas:[...f.cajas,...b.cajas.map(w=>({...w,y0:w.y0+f.grosor,y1:w.y1+f.grosor}))],grosor:f.grosor+b.grosor,footprintX:Math.max(f.footprintX,b.footprintX),footprintZ:Math.max(f.footprintZ,b.footprintZ)}:f:b,g=f=>({grosor:f.grosor,footprintX:f.footprintZ,footprintZ:f.footprintX,cajas:f.cajas.map(b=>({...b,x0:b.z0,x1:b.z1,z0:b.x0,z1:b.x1}))}),v=(f,b,w=0,P=0)=>{for(const L of f.cajas)c.push({...L,x0:L.x0+w+l.minX,x1:L.x1+w+l.minX,y0:L.y0+b,y1:L.y1+b,z0:L.z0+P+l.minZ,z1:L.z1+P+l.minZ})},_=u(e.filter(a),null),m=u(e.filter(f=>t(f)&&_s(f.id)===0),"x"),M=u(e.filter(f=>t(f)&&_s(f.id)===1),"x"),R=u(e.filter(f=>i(f)&&_s(f.id)===0),"z"),E=u(e.filter(f=>i(f)&&_s(f.id)===1),"z");_&&(v(_,o),o+=_.grosor);const A=p(m,M),y=p(R,E);if(A&&y){const f=Math.max(A.footprintZ,y.footprintX);if(f>0&&2*f<=Math.min(d,h)){if(h<=d){v(A,o,0,0);const w=g(y);v(w,o,0,A.footprintZ)}else{const w=g(A);v(w,o,0,0),v(y,o,w.footprintX,0)}o+=Math.max(A.grosor,y.grosor)}else v(A,o),o+=A.grosor,v(y,o),o+=y.grosor}else A?(v(A,o),o+=A.grosor):y&&(v(y,o),o+=y.grosor);const T=n.filter(Eu);if(T.length){let f=0,b=0,w=0,P=0;for(const L of T){const{w:V,h:j,d:I}=zf(L);f>0&&f+V>d&&(f=0,b+=w,w=0),c.push({layer:L.layer,id:L.id,x0:l.minX+f,x1:l.minX+f+V,y0:o,y1:o+j,z0:l.minZ+b,z1:l.minZ+b+I}),f+=V,w=Math.max(w,I),P=Math.max(P,j)}o+=P}return c}const Gf=new WeakMap,Hf=new WeakMap;function Nd(n,e=!1){const t=e?Hf:Gf;if(n&&typeof n=="object"){const c=t.get(n);if(c)return c}const i=Cc(n),a=Rc(i);let r=Ud(a,i);e&&(r=kf(r));const s=Nf(r),l={boxes:r,bbox:s};return n&&typeof n=="object"&&t.set(n,l),l}function Vf(n){return n.startsWith("cubrir")||n.startsWith("tapa")?1.15:n.startsWith("lado")||n.startsWith("testero")?1:n.startsWith("llap")||n.startsWith("rec")?.9:n==="db"||n==="taco"||n==="rastrel"||n==="tablon"||n==="intermedia"||n==="orilla"?.72:.85}function xs(n,e,t){const{boxes:i,bbox:a}=Nd(e,t.desmontado??!1),r=new n.Group,s=[],l=[];if(r.userData.recursos3d={geoms:s,mats:l},!i.length)return r;const c=t.escala*10,o=new n.Color(t.colorBase??"#c8a05a"),d=t.conAristas??!0,h=t.opacidad??1,u=new Map,p=M=>{const R=Vf(M);let E=u.get(R);return E||(E=new n.MeshStandardMaterial({color:o.clone().multiplyScalar(R),roughness:.6,metalness:.04,transparent:h<1,opacity:h}),u.set(R,E),l.push(E)),E},g=d?new n.LineBasicMaterial({color:2759690,transparent:!0,opacity:.35}):null;g&&l.push(g);const v=new n.Group,_=(a.minX+a.maxX)/2,m=(a.minZ+a.maxZ)/2;for(const M of i){let R,E,A,y,T,f;if(M.rot?(R=M.rot.w*c,E=M.rot.h*c,A=M.rot.d*c,y=(M.rot.cx-_)*c,T=M.rot.cy*c,f=(M.rot.cz-m)*c):(R=(M.x1-M.x0)*c,E=(M.y1-M.y0)*c,A=(M.z1-M.z0)*c,y=((M.x0+M.x1)/2-_)*c,T=(M.y0+M.y1)/2*c,f=((M.z0+M.z1)/2-m)*c),R<=0||E<=0||A<=0)continue;const b=new n.BoxGeometry(R,E,A);s.push(b);const w=new n.Mesh(b,p(M.layer));if(w.position.set(y,T,f),M.rot&&(M.rot.axis==="z"?w.rotation.z=M.rot.angle:w.rotation.x=M.rot.angle),v.add(w),g){const P=new n.EdgesGeometry(b);s.push(P);const L=new n.LineSegments(P,g);L.position.copy(w.position),L.rotation.copy(w.rotation),v.add(L)}}if(t.cargaEncima&&t.cargaEncima.unidades>0){const M=t.cargaEncima,R=M.laminaLargoCm*c,E=M.laminaAnchoCm*c,A=M.laminaAltoCm*c,y=new n.MeshStandardMaterial({color:o.clone().multiplyScalar(1.25),roughness:.5,metalness:.04,transparent:h<1,opacity:h});l.push(y);const T=a.maxY*c;for(let f=0;f<M.unidades;f++){const b=new n.BoxGeometry(R,A,E);s.push(b);const w=new n.Mesh(b,y);w.position.set(0,T+A*(f+.5),0),v.add(w);const P=new n.EdgesGeometry(b);s.push(P);const L=new n.LineSegments(P,g);L.position.copy(w.position),L.renderOrder=1,v.add(L)}}return t.rotar90&&(v.rotation.y=Math.PI/2),r.add(v),r}function Ka(n,e=!1){const{bbox:t}=Nd(n,e);return{largo:t.largo,ancho:t.ancho,alto:t.alto}}const na=n=>Math.round(n*10);function Wn(n){return typeof n=="number"&&isFinite(n)&&n>0}function Wf(n){if(n==null)return null;if(!Wn(n.largoCm)||!Wn(n.anchoCm)||!Wn(n.altoCm)||!Wn(n.pesoKg))throw new Error("cargaEncima tiene medidas o peso no válidos (deben ser números > 0).");return{largoMm:na(n.largoCm),anchoMm:na(n.anchoCm),altoMm:na(n.altoCm),pesoKg:n.pesoKg}}function Xf(n){if(n==null||typeof n!="object")return null;try{const{largo:e,ancho:t,alto:i}=Ka(n,!0);return!Wn(e)||!Wn(t)||!Wn(i)?null:{largoMm:na(e),anchoMm:na(t),altoMm:na(i)}}catch{return null}}function Yf(n,e){if(n==null||typeof n!="object")return e;try{const{largo:t,ancho:i,alto:a}=Ka(n);return!Wn(t)||!Wn(i)||!Wn(a)?e:{largoCm:Math.max(t,e.largoCm),anchoCm:Math.max(i,e.anchoCm),altoCm:Math.max(a,e.altoCm)}}catch{return e}}function $f(n){var l;if(!n||typeof n!="object")throw new Error("El archivo no es un envoltorio válido (falta el objeto raíz).");const e=n.meta;if(!e||typeof e!="object")throw new Error('Falta el bloque "meta" en el archivo. ¿Exportaste desde el constructor con la ficha logística?');if(typeof e.sku!="string"||!e.sku.trim())throw new Error('El "meta" no tiene un SKU válido.');const t=e.tipo;if(t!=="palet"&&t!=="caja"&&t!=="jaula"&&t!=="carga"&&t!=="foam")throw new Error(`Tipo de bulto no reconocido en ${e.sku}: "${String(t)}".`);if(t==="carga"&&(typeof e.paletBase!="string"||!e.paletBase.trim()))throw new Error(`La referencia "carga" ${e.sku} necesita "paletBase" (SKU del palet).`);if(!e.exterior||!Wn(e.exterior.largoCm)||!Wn(e.exterior.anchoCm)||!Wn(e.exterior.altoCm))throw new Error(`Medidas exteriores no válidas en ${e.sku} (largo/ancho/alto deben ser números > 0 en cm).`);if(typeof e.pesoUnidadKg!="number"||!isFinite(e.pesoUnidadKg)||e.pesoUnidadKg<0)throw new Error(`Peso por unidad no válido en ${e.sku} (debe ser un número ≥ 0 en kg).`);if(!Wn(e.unidadesPorPack)||!Number.isInteger(e.unidadesPorPack))throw new Error(`unidadesPorPack no válido en ${e.sku} (debe ser un entero > 0).`);if(typeof e.apilable!="boolean")throw new Error(`Falta el flag "apilable" (true/false) en ${e.sku}.`);const i=Wf(e.cargaEncima),a=e.desmontado===!0?Xf(n.crate):null,r=Yf(n.crate,e.exterior),s=e.pesoMaxApilableKg==null?null:Wn(e.pesoMaxApilableKg)?e.pesoMaxApilableKg:(()=>{throw new Error(`pesoMaxApilableKg no válido en ${e.sku}.`)})();return{id:e.sku,sku:e.sku,nombre:((l=e.nombre)==null?void 0:l.trim())||e.sku,tipo:t,paletBase:t==="carga"?e.paletBase.trim():null,apilable:e.apilable,unidadesPorPack:e.unidadesPorPack,largoMm:na(r.largoCm),anchoMm:na(r.anchoCm),altoUnidadMm:na(r.altoCm),pesoUnidadKg:e.pesoUnidadKg,pesoMaxApilableKg:s,cargaEncima:i,desmontado:a,crateJson:n.crate??null}}function Od(n){let e;try{e=JSON.parse(n)}catch{return{reference:null,error:"El archivo no es un JSON válido."}}try{return{reference:$f(e),error:null}}catch(t){return{reference:null,error:t instanceof Error?t.message:String(t)}}}function Rl(n){if(n==null||typeof n!="object")return!0;const e=n;return e.useTacosArrastre===!0?!0:e.apoyoType!=="dobleBase"}function js(n){if(n==null||typeof n!="object")return!1;const e=n;return e.apoyoType==="dobleBase"&&e.dbOrient==="ancho"}function qf(n,e){var c,o,d;if(e||n==null||typeof n!="object")return;const t=n;if(t.apoyoType!=="tacos"||t.useCapiculado!==!0||t.cubrirType!=="jaula")return;const i=typeof t.cubrirGrosor=="number"?t.cubrirGrosor:Number(t.cubrirGrosor);if(!Number.isFinite(i)||i<=0)return;let a=0,r=!0,s=!0,l=!1;try{const h=Cc(n),u=Rc(h),p=u.filter(T=>T.layer==="cubrir-tabla"&&T.center!=null);l=((c=p[0])==null?void 0:c.orient)==="largo";const g=p.map(T=>T.center).sort((T,f)=>T-f);if(g.length>=2){const T=((o=p[0])==null?void 0:o.ancho)??0;r=g[1]-g[0]-T>=T;const b=[];for(let P=1;P<g.length;P++)b.push(g[P]-g[P-1]);const w=b.reduce((P,L)=>P+L,0)/b.length;a=Math.round(w/2*10)}const v=u.filter(T=>T.layer==="taco"&&T.centerX!=null),_=u.filter(T=>T.layer==="rastrel"&&T.center!=null),m=((d=_[0])==null?void 0:d.orient)==="largo",M=(T,f)=>{const b=Math.min(T.length,f.length);if(b===0)return 0;let w=0;for(let P=0;P<b;P++){const L=T[P].center-f[P].center+(T[P].ancho+f[P].ancho)/2;w=Math.max(w,L)}return w},R=(T,f)=>{const b=Math.min(T.length,f.length);for(let w=0;w<b;w++)if(Math.abs(T[w].center-f[w].center)<(T[w].ancho+f[w].ancho)/2)return!0;return!1},E=(T,f)=>{const b=T.map(w=>({center:f?w.centerZ:w.centerX,ancho:w.largoPieza})).sort((w,P)=>w.center-P.center);return b.filter((w,P)=>b.findIndex(L=>L.center===w.center)===P)},A=T=>{const f=E(v,T),b=_.map(L=>({center:L.center,ancho:L.ancho})).sort((L,V)=>L.center-V.center);if(b.length===0)return{shiftCm:M(f,f),seguro:!0};if(m===T)return{shiftCm:Math.max(M(f,f),M(f,b),M(b,f)),seguro:!0};const w=E(v,!T),P=!R(w,b);return{shiftCm:M(f,f),seguro:P}},y=A(l);if(s=y.seguro,y.shiftCm>0&&(a=Math.max(a,Math.round(y.shiftCm*10))),!r&&!s){const T=A(!l);T.seguro&&(l=!l,a=Math.round(T.shiftCm*10),s=!0)}}catch{}return r?{gananciaMm:Math.round(i*10),desplazamientoMm:a,desplazamientoEjeAncho:l,cabeUnionAlterna:s}:{gananciaMm:0,desplazamientoMm:a,desplazamientoEjeAncho:l,cabeUnionAlterna:s}}function Kf(n,e,t,i){if(e||n==null||typeof n!="object")return;const a=n;if(!(a.apoyoType!=="tacos"||a.useCapiculado!==!0||a.useRastreles!==!0))try{const r=Cc(n),s=Ud(Rc(r),r);if(s.length===0)return;const l=Math.max(...s.map(g=>g.y1));if(!(l>0))return;const c=t/10,o=i?0:c,d=i?c:0,h=s.map(g=>({x0:g.x0+o,x1:g.x1+o,y0:l-g.y1,y1:l-g.y0,z0:g.z0+d,z1:g.z1+d}));let u=0;for(const g of s)for(const v of h){const _=Math.min(g.x1,v.x1)-Math.max(g.x0,v.x0),m=Math.min(g.z1,v.z1)-Math.max(g.z0,v.z0);if(_>1e-6&&m>1e-6){const M=v.y1-g.y0;M>u&&(u=M)}}const p=l-u;return p>0?Math.round(p*10):void 0}catch{return}}function Fd(n,e,t,i,a,r){const s=Math.floor(t/n),l=Math.floor(i/e),c=s*l,o=Math.floor(t/e),d=Math.floor(i/n),h=o*d;let u,p,g;if(c<=0&&h<=0?(u=!1,p=1,g=1):(u=h>c,p=u?o:s,g=u?d:l),r&&r>0&&(p>1||g>1)){const _=Math.max(1,Math.round(r));g>=p?(g=_,p=1):(p=_,g=1)}const v=Math.max(1,Math.min(p*g,a));return{columnas:v,colsLargo:p,colsAncho:g,girado:u,unidadesPorColumna:Math.ceil(a/v)}}function Zf(n,e,t,i,a){var g,v,_;if(n.tipo==="carga"&&n.paletBase){const m=e.get(n.paletBase),M=t.get(n.paletBase);if(!m||!M)throw new Error(`La carga ${n.sku} necesita el palet base ${n.paletBase} cargado.`);const R=Ka(M),E=Math.round(R.alto*10),A=Math.round(R.largo*10),y=Math.round(R.ancho*10),T=i??n.unidadesPorPack,f=Fd(n.largoMm,n.anchoMm,A,y,T,a);let b=Math.max(A,n.largoMm),w=Math.max(y,n.anchoMm);const P=Math.round(E+n.altoUnidadMm*f.unidadesPorColumna);return js(m.crateJson)&&([b,w]=[w,b]),{id:n.id,sku:n.sku,nombre:n.nombre,unidadesPorPalet:T,loteMinimo:1,apilable:n.apilable,palletType:{id:`pt-${n.id}`,nombre:`Bulto ${n.sku}`,largoMm:b,anchoMm:w,alturaBaseMm:0,pesoMaxKg:Js,pesoTaraKg:0},pesoUnitarioKg:n.pesoUnidadKg,alturaPaletCompletoMm:P,rotable:Rl(m.crateJson)}}if(n.tipo==="foam"){if(!n.crateJson)throw new Error(`El foam ${n.sku} no tiene geometría (crateJson vacío) — expórtalo diseñando la caja como siempre.`);const m=Ka(n.crateJson);let M=Math.round(m.largo*10),R=Math.round(m.ancho*10);const E=Math.round(m.alto*10),A=i??n.unidadesPorPack;return js(n.crateJson)&&([M,R]=[R,M]),{id:n.id,sku:n.sku,nombre:n.nombre,unidadesPorPalet:A,loteMinimo:1,apilable:n.apilable,palletType:{id:`pt-${n.id}`,nombre:`Bulto ${n.sku}`,largoMm:M,anchoMm:R,alturaBaseMm:0,pesoMaxKg:n.pesoMaxApilableKg??Js,pesoTaraKg:0},pesoUnitarioKg:n.pesoUnidadKg,alturaPaletCompletoMm:E,rotable:Rl(n.crateJson),alturaFija:!0}}let r=((g=n.desmontado)==null?void 0:g.largoMm)??n.largoMm,s=((v=n.desmontado)==null?void 0:v.anchoMm)??n.anchoMm;const l=((_=n.desmontado)==null?void 0:_.altoMm)??n.altoUnidadMm,c=i??n.unidadesPorPack,o=Math.round(l*c),d=js(n.crateJson);d&&([r,s]=[s,r]);const h=qf(n.crateJson,!!n.desmontado),u=(h==null?void 0:h.cabeUnionAlterna)===!1?void 0:Kf(n.crateJson,!!n.desmontado,(h==null?void 0:h.desplazamientoMm)??0,(h==null?void 0:h.desplazamientoEjeAncho)??!1),p=h?d?!h.desplazamientoEjeAncho:h.desplazamientoEjeAncho:!1;return{id:n.id,sku:n.sku,nombre:n.nombre,unidadesPorPalet:c,loteMinimo:1,apilable:n.apilable,palletType:{id:`pt-${n.id}`,nombre:`Bulto ${n.sku}`,largoMm:r,anchoMm:s,alturaBaseMm:0,pesoMaxKg:n.pesoMaxApilableKg??Js,pesoTaraKg:0},pesoUnitarioKg:n.pesoUnidadKg,alturaPaletCompletoMm:o,rotable:Rl(n.crateJson),alturaGanadaCapiculadoMm:h==null?void 0:h.gananciaMm,desplazamientoCapiculadoMm:h==null?void 0:h.desplazamientoMm,desplazamientoCapiculadoEjeAncho:p,alturaGanadaCapiculadoAltMm:u,altoUnidadMm:l}}/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const il="185",Xa={ROTATE:0,DOLLY:1,PAN:2},Va={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Bd=0,hc=1,zd=2,Jr=1,kd=2,yr=3,ra=0,Xn=1,hi=2,ki=0,Ya=1,fc=2,pc=3,mc=4,Gd=5,Sa=100,Hd=101,Vd=102,Wd=103,Xd=104,Yd=200,$d=201,qd=202,Kd=203,ro=204,so=205,Zd=206,Jd=207,jd=208,Qd=209,eh=210,th=211,nh=212,ih=213,ah=214,oo=0,lo=1,co=2,Za=3,uo=4,ho=5,fo=6,po=7,Pc=0,rh=1,sh=2,Ai=0,Lc=1,Ic=2,Dc=3,Uc=4,Nc=5,Oc=6,Fc=7,Bc=300,Pa=301,Ja=302,Qs=303,eo=304,hs=306,mo=1e3,Fi=1001,go=1002,wn=1003,oh=1004,qr=1005,In=1006,to=1007,ba=1008,Zn=1009,zc=1010,kc=1011,br=1012,al=1013,Ci=1014,Ei=1015,Gi=1016,rl=1017,sl=1018,Er=1020,Gc=35902,Hc=35899,Vc=1021,Wc=1022,pi=1023,Hi=1026,Ea=1027,Xc=1028,ol=1029,La=1030,ll=1031,cl=1033,jr=33776,Qr=33777,es=33778,ts=33779,_o=35840,xo=35841,vo=35842,Mo=35843,yo=36196,So=37492,bo=37496,Eo=37488,To=37489,rs=37490,Ao=37491,wo=37808,Co=37809,Ro=37810,Po=37811,Lo=37812,Io=37813,Do=37814,Uo=37815,No=37816,Oo=37817,Fo=37818,Bo=37819,zo=37820,ko=37821,Go=36492,Ho=36494,Vo=36495,Wo=36283,Xo=36284,ss=36285,Yo=36286,lh=3200,$o=0,ch=1,Qi="",ii="srgb",os="srgb-linear",ls="linear",Vt="srgb",Ga=7680,gc=519,uh=512,dh=513,hh=514,ul=515,fh=516,ph=517,dl=518,mh=519,qo=35044,_c="300 es",Ti=2e3,Tr=2001;function Jf(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Ko(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function gh(){const n=Ko("canvas");return n.style.display="block",n}const Tu={};function cs(...n){const e="THREE."+n.shift();console.log(e,...n)}function _h(n){const e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function ut(...n){n=_h(n);const e="THREE."+n.shift();{const t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function Lt(...n){n=_h(n);const e="THREE."+n.shift();{const t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function $a(...n){const e=n.join(" ");e in Tu||(Tu[e]=!0,ut(...n))}function jf(n,e,t){return new Promise(function(i,a){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:a();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}const Qf={[oo]:lo,[co]:fo,[uo]:po,[Za]:ho,[lo]:oo,[fo]:co,[po]:uo,[ho]:Za};class la{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const a=i[e];if(a!==void 0){const r=a.indexOf(t);r!==-1&&a.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const a=i.slice(0);for(let r=0,s=a.length;r<s;r++)a[r].call(this,e);e.target=null}}}const On=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],ns=Math.PI/180,xc=180/Math.PI;function Ra(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(On[n&255]+On[n>>8&255]+On[n>>16&255]+On[n>>24&255]+"-"+On[e&255]+On[e>>8&255]+"-"+On[e>>16&15|64]+On[e>>24&255]+"-"+On[t&63|128]+On[t>>8&255]+"-"+On[t>>16&255]+On[t>>24&255]+On[i&255]+On[i>>8&255]+On[i>>16&255]+On[i>>24&255]).toLowerCase()}function Pt(n,e,t){return Math.max(e,Math.min(t,n))}function ep(n,e){return(n%e+e)%e}function Pl(n,e,t){return(1-t)*n+t*e}function Oi(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Yt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const xh={DEG2RAD:ns},ou=class ou{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,a=e.elements;return this.x=a[0]*t+a[3]*i+a[6],this.y=a[1]*t+a[4]*i+a[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Pt(this.x,e.x,t.x),this.y=Pt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Pt(this.x,e,t),this.y=Pt(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Pt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Pt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),a=Math.sin(t),r=this.x-e.x,s=this.y-e.y;return this.x=r*i-s*a+e.x,this.y=r*a+s*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};ou.prototype.isVector2=!0;let ot=ou;class sa{constructor(e=0,t=0,i=0,a=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=a}static slerpFlat(e,t,i,a,r,s,l){let c=i[a+0],o=i[a+1],d=i[a+2],h=i[a+3],u=r[s+0],p=r[s+1],g=r[s+2],v=r[s+3];if(h!==v||c!==u||o!==p||d!==g){let _=c*u+o*p+d*g+h*v;_<0&&(u=-u,p=-p,g=-g,v=-v,_=-_);let m=1-l;if(_<.9995){const M=Math.acos(_),R=Math.sin(M);m=Math.sin(m*M)/R,l=Math.sin(l*M)/R,c=c*m+u*l,o=o*m+p*l,d=d*m+g*l,h=h*m+v*l}else{c=c*m+u*l,o=o*m+p*l,d=d*m+g*l,h=h*m+v*l;const M=1/Math.sqrt(c*c+o*o+d*d+h*h);c*=M,o*=M,d*=M,h*=M}}e[t]=c,e[t+1]=o,e[t+2]=d,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,a,r,s){const l=i[a],c=i[a+1],o=i[a+2],d=i[a+3],h=r[s],u=r[s+1],p=r[s+2],g=r[s+3];return e[t]=l*g+d*h+c*p-o*u,e[t+1]=c*g+d*u+o*h-l*p,e[t+2]=o*g+d*p+l*u-c*h,e[t+3]=d*g-l*h-c*u-o*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,a){return this._x=e,this._y=t,this._z=i,this._w=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,a=e._y,r=e._z,s=e._order,l=Math.cos,c=Math.sin,o=l(i/2),d=l(a/2),h=l(r/2),u=c(i/2),p=c(a/2),g=c(r/2);switch(s){case"XYZ":this._x=u*d*h+o*p*g,this._y=o*p*h-u*d*g,this._z=o*d*g+u*p*h,this._w=o*d*h-u*p*g;break;case"YXZ":this._x=u*d*h+o*p*g,this._y=o*p*h-u*d*g,this._z=o*d*g-u*p*h,this._w=o*d*h+u*p*g;break;case"ZXY":this._x=u*d*h-o*p*g,this._y=o*p*h+u*d*g,this._z=o*d*g+u*p*h,this._w=o*d*h-u*p*g;break;case"ZYX":this._x=u*d*h-o*p*g,this._y=o*p*h+u*d*g,this._z=o*d*g-u*p*h,this._w=o*d*h+u*p*g;break;case"YZX":this._x=u*d*h+o*p*g,this._y=o*p*h+u*d*g,this._z=o*d*g-u*p*h,this._w=o*d*h-u*p*g;break;case"XZY":this._x=u*d*h-o*p*g,this._y=o*p*h-u*d*g,this._z=o*d*g+u*p*h,this._w=o*d*h+u*p*g;break;default:ut("Quaternion: .setFromEuler() encountered an unknown order: "+s)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,a=Math.sin(i);return this._x=e.x*a,this._y=e.y*a,this._z=e.z*a,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],a=t[4],r=t[8],s=t[1],l=t[5],c=t[9],o=t[2],d=t[6],h=t[10],u=i+l+h;if(u>0){const p=.5/Math.sqrt(u+1);this._w=.25/p,this._x=(d-c)*p,this._y=(r-o)*p,this._z=(s-a)*p}else if(i>l&&i>h){const p=2*Math.sqrt(1+i-l-h);this._w=(d-c)/p,this._x=.25*p,this._y=(a+s)/p,this._z=(r+o)/p}else if(l>h){const p=2*Math.sqrt(1+l-i-h);this._w=(r-o)/p,this._x=(a+s)/p,this._y=.25*p,this._z=(c+d)/p}else{const p=2*Math.sqrt(1+h-i-l);this._w=(s-a)/p,this._x=(r+o)/p,this._y=(c+d)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Pt(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const a=Math.min(1,t/i);return this.slerp(e,a),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,a=e._y,r=e._z,s=e._w,l=t._x,c=t._y,o=t._z,d=t._w;return this._x=i*d+s*l+a*o-r*c,this._y=a*d+s*c+r*l-i*o,this._z=r*d+s*o+i*c-a*l,this._w=s*d-i*l-a*c-r*o,this._onChangeCallback(),this}slerp(e,t){let i=e._x,a=e._y,r=e._z,s=e._w,l=this.dot(e);l<0&&(i=-i,a=-a,r=-r,s=-s,l=-l);let c=1-t;if(l<.9995){const o=Math.acos(l),d=Math.sin(o);c=Math.sin(c*o)/d,t=Math.sin(t*o)/d,this._x=this._x*c+i*t,this._y=this._y*c+a*t,this._z=this._z*c+r*t,this._w=this._w*c+s*t,this._onChangeCallback()}else this._x=this._x*c+i*t,this._y=this._y*c+a*t,this._z=this._z*c+r*t,this._w=this._w*c+s*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),a=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(a*Math.sin(e),a*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const lu=class lu{constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Au.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Au.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,a=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*a,this.y=r[1]*t+r[4]*i+r[7]*a,this.z=r[2]*t+r[5]*i+r[8]*a,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,a=this.z,r=e.elements,s=1/(r[3]*t+r[7]*i+r[11]*a+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*a+r[12])*s,this.y=(r[1]*t+r[5]*i+r[9]*a+r[13])*s,this.z=(r[2]*t+r[6]*i+r[10]*a+r[14])*s,this}applyQuaternion(e){const t=this.x,i=this.y,a=this.z,r=e.x,s=e.y,l=e.z,c=e.w,o=2*(s*a-l*i),d=2*(l*t-r*a),h=2*(r*i-s*t);return this.x=t+c*o+s*h-l*d,this.y=i+c*d+l*o-r*h,this.z=a+c*h+r*d-s*o,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,a=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*a,this.y=r[1]*t+r[5]*i+r[9]*a,this.z=r[2]*t+r[6]*i+r[10]*a,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Pt(this.x,e.x,t.x),this.y=Pt(this.y,e.y,t.y),this.z=Pt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Pt(this.x,e,t),this.y=Pt(this.y,e,t),this.z=Pt(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Pt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,a=e.y,r=e.z,s=t.x,l=t.y,c=t.z;return this.x=a*c-r*l,this.y=r*s-i*c,this.z=i*l-a*s,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Ll.copy(this).projectOnVector(e),this.sub(Ll)}reflect(e){return this.sub(Ll.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Pt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,a=this.z-e.z;return t*t+i*i+a*a}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const a=Math.sin(t)*e;return this.x=a*Math.sin(i),this.y=Math.cos(t)*e,this.z=a*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),a=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=a,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};lu.prototype.isVector3=!0;let B=lu;const Ll=new B,Au=new sa,cu=class cu{constructor(e,t,i,a,r,s,l,c,o){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,a,r,s,l,c,o)}set(e,t,i,a,r,s,l,c,o){const d=this.elements;return d[0]=e,d[1]=a,d[2]=l,d[3]=t,d[4]=r,d[5]=c,d[6]=i,d[7]=s,d[8]=o,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,a=t.elements,r=this.elements,s=i[0],l=i[3],c=i[6],o=i[1],d=i[4],h=i[7],u=i[2],p=i[5],g=i[8],v=a[0],_=a[3],m=a[6],M=a[1],R=a[4],E=a[7],A=a[2],y=a[5],T=a[8];return r[0]=s*v+l*M+c*A,r[3]=s*_+l*R+c*y,r[6]=s*m+l*E+c*T,r[1]=o*v+d*M+h*A,r[4]=o*_+d*R+h*y,r[7]=o*m+d*E+h*T,r[2]=u*v+p*M+g*A,r[5]=u*_+p*R+g*y,r[8]=u*m+p*E+g*T,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],a=e[2],r=e[3],s=e[4],l=e[5],c=e[6],o=e[7],d=e[8];return t*s*d-t*l*o-i*r*d+i*l*c+a*r*o-a*s*c}invert(){const e=this.elements,t=e[0],i=e[1],a=e[2],r=e[3],s=e[4],l=e[5],c=e[6],o=e[7],d=e[8],h=d*s-l*o,u=l*c-d*r,p=o*r-s*c,g=t*h+i*u+a*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=h*v,e[1]=(a*o-d*i)*v,e[2]=(l*i-a*s)*v,e[3]=u*v,e[4]=(d*t-a*c)*v,e[5]=(a*r-l*t)*v,e[6]=p*v,e[7]=(i*c-o*t)*v,e[8]=(s*t-i*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,a,r,s,l){const c=Math.cos(r),o=Math.sin(r);return this.set(i*c,i*o,-i*(c*s+o*l)+s+e,-a*o,a*c,-a*(-o*s+c*l)+l+t,0,0,1),this}scale(e,t){return $a("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Il.makeScale(e,t)),this}rotate(e){return $a("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Il.makeRotation(-e)),this}translate(e,t){return $a("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Il.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let a=0;a<9;a++)if(t[a]!==i[a])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};cu.prototype.isMatrix3=!0;let vt=cu;const Il=new vt,wu=new vt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Cu=new vt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function tp(){const n={enabled:!0,workingColorSpace:os,spaces:{},convert:function(a,r,s){return this.enabled===!1||r===s||!r||!s||(this.spaces[r].transfer===Vt&&(a.r=ia(a.r),a.g=ia(a.g),a.b=ia(a.b)),this.spaces[r].primaries!==this.spaces[s].primaries&&(a.applyMatrix3(this.spaces[r].toXYZ),a.applyMatrix3(this.spaces[s].fromXYZ)),this.spaces[s].transfer===Vt&&(a.r=Sr(a.r),a.g=Sr(a.g),a.b=Sr(a.b))),a},workingToColorSpace:function(a,r){return this.convert(a,this.workingColorSpace,r)},colorSpaceToWorking:function(a,r){return this.convert(a,r,this.workingColorSpace)},getPrimaries:function(a){return this.spaces[a].primaries},getTransfer:function(a){return a===Qi?ls:this.spaces[a].transfer},getToneMappingMode:function(a){return this.spaces[a].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(a,r=this.workingColorSpace){return a.fromArray(this.spaces[r].luminanceCoefficients)},define:function(a){Object.assign(this.spaces,a)},_getMatrix:function(a,r,s){return a.copy(this.spaces[r].toXYZ).multiply(this.spaces[s].fromXYZ)},_getDrawingBufferColorSpace:function(a){return this.spaces[a].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(a=this.workingColorSpace){return this.spaces[a].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(a,r){return $a("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(a,r)},toWorkingColorSpace:function(a,r){return $a("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(a,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[os]:{primaries:e,whitePoint:i,transfer:ls,toXYZ:wu,fromXYZ:Cu,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:ii},outputColorSpaceConfig:{drawingBufferColorSpace:ii}},[ii]:{primaries:e,whitePoint:i,transfer:Vt,toXYZ:wu,fromXYZ:Cu,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:ii}}}),n}const It=tp();function ia(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Sr(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let nr;class vh{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{nr===void 0&&(nr=Ko("canvas")),nr.width=e.width,nr.height=e.height;const a=nr.getContext("2d");e instanceof ImageData?a.putImageData(e,0,0):a.drawImage(e,0,0,e.width,e.height),i=nr}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Ko("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const a=i.getImageData(0,0,e.width,e.height),r=a.data;for(let s=0;s<r.length;s++)r[s]=ia(r[s]/255)*255;return i.putImageData(a,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(ia(t[i]/255)*255):t[i]=ia(t[i]);return{data:t,width:e.width,height:e.height}}else return ut("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let np=0;class hl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:np++}),this.uuid=Ra(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},a=this.data;if(a!==null){let r;if(Array.isArray(a)){r=[];for(let s=0,l=a.length;s<l;s++)a[s].isDataTexture?r.push(Dl(a[s].image)):r.push(Dl(a[s]))}else r=Dl(a);i.url=r}return t||(e.images[this.uuid]=i),i}}function Dl(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?vh.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(ut("Texture: Unable to serialize Texture."),{})}let ip=0;const Ul=new B;class Dn extends la{constructor(e=Dn.DEFAULT_IMAGE,t=Dn.DEFAULT_MAPPING,i=Fi,a=Fi,r=In,s=ba,l=pi,c=Zn,o=Dn.DEFAULT_ANISOTROPY,d=Qi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ip++}),this.uuid=Ra(),this.name="",this.source=new hl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=r,this.minFilter=s,this.anisotropy=o,this.format=l,this.internalFormat=null,this.type=c,this.offset=new ot(0,0),this.repeat=new ot(1,1),this.center=new ot(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new vt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Ul).x}get height(){return this.source.getSize(Ul).y}get depth(){return this.source.getSize(Ul).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){ut(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const a=this[t];if(a===void 0){ut(`Texture.setValues(): property '${t}' does not exist.`);continue}a&&i&&a.isVector2&&i.isVector2||a&&i&&a.isVector3&&i.isVector3||a&&i&&a.isMatrix3&&i.isMatrix3?a.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Bc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case mo:e.x=e.x-Math.floor(e.x);break;case Fi:e.x=e.x<0?0:1;break;case go:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case mo:e.y=e.y-Math.floor(e.y);break;case Fi:e.y=e.y<0?0:1;break;case go:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Dn.DEFAULT_IMAGE=null;Dn.DEFAULT_MAPPING=Bc;Dn.DEFAULT_ANISOTROPY=1;const uu=class uu{constructor(e=0,t=0,i=0,a=1){this.x=e,this.y=t,this.z=i,this.w=a}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,a){return this.x=e,this.y=t,this.z=i,this.w=a,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,a=this.z,r=this.w,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*a+s[12]*r,this.y=s[1]*t+s[5]*i+s[9]*a+s[13]*r,this.z=s[2]*t+s[6]*i+s[10]*a+s[14]*r,this.w=s[3]*t+s[7]*i+s[11]*a+s[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,a,r;const c=e.elements,o=c[0],d=c[4],h=c[8],u=c[1],p=c[5],g=c[9],v=c[2],_=c[6],m=c[10];if(Math.abs(d-u)<.01&&Math.abs(h-v)<.01&&Math.abs(g-_)<.01){if(Math.abs(d+u)<.1&&Math.abs(h+v)<.1&&Math.abs(g+_)<.1&&Math.abs(o+p+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const R=(o+1)/2,E=(p+1)/2,A=(m+1)/2,y=(d+u)/4,T=(h+v)/4,f=(g+_)/4;return R>E&&R>A?R<.01?(i=0,a=.707106781,r=.707106781):(i=Math.sqrt(R),a=y/i,r=T/i):E>A?E<.01?(i=.707106781,a=0,r=.707106781):(a=Math.sqrt(E),i=y/a,r=f/a):A<.01?(i=.707106781,a=.707106781,r=0):(r=Math.sqrt(A),i=T/r,a=f/r),this.set(i,a,r,t),this}let M=Math.sqrt((_-g)*(_-g)+(h-v)*(h-v)+(u-d)*(u-d));return Math.abs(M)<.001&&(M=1),this.x=(_-g)/M,this.y=(h-v)/M,this.z=(u-d)/M,this.w=Math.acos((o+p+m-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Pt(this.x,e.x,t.x),this.y=Pt(this.y,e.y,t.y),this.z=Pt(this.z,e.z,t.z),this.w=Pt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Pt(this.x,e,t),this.y=Pt(this.y,e,t),this.z=Pt(this.z,e,t),this.w=Pt(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Pt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};uu.prototype.isVector4=!0;let rn=uu;class Mh extends la{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:In,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new rn(0,0,e,t),this.scissorTest=!1,this.viewport=new rn(0,0,e,t),this.textures=[];const a={width:e,height:t,depth:i.depth},r=new Dn(a),s=i.count;for(let l=0;l<s;l++)this.textures[l]=r.clone(),this.textures[l].isRenderTargetTexture=!0,this.textures[l].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:In,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let a=0,r=this.textures.length;a<r;a++)this.textures[a].image.width=e,this.textures[a].image.height=t,this.textures[a].image.depth=i,this.textures[a].isData3DTexture!==!0&&(this.textures[a].isArrayTexture=this.textures[a].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const a=Object.assign({},e.textures[t].image);this.textures[t].source=new hl(a)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class wi extends Mh{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Yc extends Dn{constructor(e=null,t=1,i=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:a},this.magFilter=wn,this.minFilter=wn,this.wrapR=Fi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class yh extends Dn{constructor(e=null,t=1,i=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:a},this.magFilter=wn,this.minFilter=wn,this.wrapR=Fi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const nl=class nl{constructor(e,t,i,a,r,s,l,c,o,d,h,u,p,g,v,_){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,a,r,s,l,c,o,d,h,u,p,g,v,_)}set(e,t,i,a,r,s,l,c,o,d,h,u,p,g,v,_){const m=this.elements;return m[0]=e,m[4]=t,m[8]=i,m[12]=a,m[1]=r,m[5]=s,m[9]=l,m[13]=c,m[2]=o,m[6]=d,m[10]=h,m[14]=u,m[3]=p,m[7]=g,m[11]=v,m[15]=_,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new nl().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,i=e.elements,a=1/ir.setFromMatrixColumn(e,0).length(),r=1/ir.setFromMatrixColumn(e,1).length(),s=1/ir.setFromMatrixColumn(e,2).length();return t[0]=i[0]*a,t[1]=i[1]*a,t[2]=i[2]*a,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*s,t[9]=i[9]*s,t[10]=i[10]*s,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,a=e.y,r=e.z,s=Math.cos(i),l=Math.sin(i),c=Math.cos(a),o=Math.sin(a),d=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){const u=s*d,p=s*h,g=l*d,v=l*h;t[0]=c*d,t[4]=-c*h,t[8]=o,t[1]=p+g*o,t[5]=u-v*o,t[9]=-l*c,t[2]=v-u*o,t[6]=g+p*o,t[10]=s*c}else if(e.order==="YXZ"){const u=c*d,p=c*h,g=o*d,v=o*h;t[0]=u+v*l,t[4]=g*l-p,t[8]=s*o,t[1]=s*h,t[5]=s*d,t[9]=-l,t[2]=p*l-g,t[6]=v+u*l,t[10]=s*c}else if(e.order==="ZXY"){const u=c*d,p=c*h,g=o*d,v=o*h;t[0]=u-v*l,t[4]=-s*h,t[8]=g+p*l,t[1]=p+g*l,t[5]=s*d,t[9]=v-u*l,t[2]=-s*o,t[6]=l,t[10]=s*c}else if(e.order==="ZYX"){const u=s*d,p=s*h,g=l*d,v=l*h;t[0]=c*d,t[4]=g*o-p,t[8]=u*o+v,t[1]=c*h,t[5]=v*o+u,t[9]=p*o-g,t[2]=-o,t[6]=l*c,t[10]=s*c}else if(e.order==="YZX"){const u=s*c,p=s*o,g=l*c,v=l*o;t[0]=c*d,t[4]=v-u*h,t[8]=g*h+p,t[1]=h,t[5]=s*d,t[9]=-l*d,t[2]=-o*d,t[6]=p*h+g,t[10]=u-v*h}else if(e.order==="XZY"){const u=s*c,p=s*o,g=l*c,v=l*o;t[0]=c*d,t[4]=-h,t[8]=o*d,t[1]=u*h+v,t[5]=s*d,t[9]=p*h-g,t[2]=g*h-p,t[6]=l*d,t[10]=v*h+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(ap,e,rp)}lookAt(e,t,i){const a=this.elements;return ti.subVectors(e,t),ti.lengthSq()===0&&(ti.z=1),ti.normalize(),pa.crossVectors(i,ti),pa.lengthSq()===0&&(Math.abs(i.z)===1?ti.x+=1e-4:ti.z+=1e-4,ti.normalize(),pa.crossVectors(i,ti)),pa.normalize(),vs.crossVectors(ti,pa),a[0]=pa.x,a[4]=vs.x,a[8]=ti.x,a[1]=pa.y,a[5]=vs.y,a[9]=ti.y,a[2]=pa.z,a[6]=vs.z,a[10]=ti.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,a=t.elements,r=this.elements,s=i[0],l=i[4],c=i[8],o=i[12],d=i[1],h=i[5],u=i[9],p=i[13],g=i[2],v=i[6],_=i[10],m=i[14],M=i[3],R=i[7],E=i[11],A=i[15],y=a[0],T=a[4],f=a[8],b=a[12],w=a[1],P=a[5],L=a[9],V=a[13],j=a[2],I=a[6],X=a[10],k=a[14],K=a[3],oe=a[7],he=a[11],Ie=a[15];return r[0]=s*y+l*w+c*j+o*K,r[4]=s*T+l*P+c*I+o*oe,r[8]=s*f+l*L+c*X+o*he,r[12]=s*b+l*V+c*k+o*Ie,r[1]=d*y+h*w+u*j+p*K,r[5]=d*T+h*P+u*I+p*oe,r[9]=d*f+h*L+u*X+p*he,r[13]=d*b+h*V+u*k+p*Ie,r[2]=g*y+v*w+_*j+m*K,r[6]=g*T+v*P+_*I+m*oe,r[10]=g*f+v*L+_*X+m*he,r[14]=g*b+v*V+_*k+m*Ie,r[3]=M*y+R*w+E*j+A*K,r[7]=M*T+R*P+E*I+A*oe,r[11]=M*f+R*L+E*X+A*he,r[15]=M*b+R*V+E*k+A*Ie,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],a=e[8],r=e[12],s=e[1],l=e[5],c=e[9],o=e[13],d=e[2],h=e[6],u=e[10],p=e[14],g=e[3],v=e[7],_=e[11],m=e[15],M=c*p-o*u,R=l*p-o*h,E=l*u-c*h,A=s*p-o*d,y=s*u-c*d,T=s*h-l*d;return t*(v*M-_*R+m*E)-i*(g*M-_*A+m*y)+a*(g*R-v*A+m*T)-r*(g*E-v*y+_*T)}determinantAffine(){const e=this.elements,t=e[0],i=e[4],a=e[8],r=e[1],s=e[5],l=e[9],c=e[2],o=e[6],d=e[10];return t*(s*d-l*o)-i*(r*d-l*c)+a*(r*o-s*c)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const a=this.elements;return e.isVector3?(a[12]=e.x,a[13]=e.y,a[14]=e.z):(a[12]=e,a[13]=t,a[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],a=e[2],r=e[3],s=e[4],l=e[5],c=e[6],o=e[7],d=e[8],h=e[9],u=e[10],p=e[11],g=e[12],v=e[13],_=e[14],m=e[15],M=t*l-i*s,R=t*c-a*s,E=t*o-r*s,A=i*c-a*l,y=i*o-r*l,T=a*o-r*c,f=d*v-h*g,b=d*_-u*g,w=d*m-p*g,P=h*_-u*v,L=h*m-p*v,V=u*m-p*_,j=M*V-R*L+E*P+A*w-y*b+T*f;if(j===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const I=1/j;return e[0]=(l*V-c*L+o*P)*I,e[1]=(a*L-i*V-r*P)*I,e[2]=(v*T-_*y+m*A)*I,e[3]=(u*y-h*T-p*A)*I,e[4]=(c*w-s*V-o*b)*I,e[5]=(t*V-a*w+r*b)*I,e[6]=(_*E-g*T-m*R)*I,e[7]=(d*T-u*E+p*R)*I,e[8]=(s*L-l*w+o*f)*I,e[9]=(i*w-t*L-r*f)*I,e[10]=(g*y-v*E+m*M)*I,e[11]=(h*E-d*y-p*M)*I,e[12]=(l*b-s*P-c*f)*I,e[13]=(t*P-i*b+a*f)*I,e[14]=(v*R-g*A-_*M)*I,e[15]=(d*A-h*R+u*M)*I,this}scale(e){const t=this.elements,i=e.x,a=e.y,r=e.z;return t[0]*=i,t[4]*=a,t[8]*=r,t[1]*=i,t[5]*=a,t[9]*=r,t[2]*=i,t[6]*=a,t[10]*=r,t[3]*=i,t[7]*=a,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],a=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,a))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),a=Math.sin(t),r=1-i,s=e.x,l=e.y,c=e.z,o=r*s,d=r*l;return this.set(o*s+i,o*l-a*c,o*c+a*l,0,o*l+a*c,d*l+i,d*c-a*s,0,o*c-a*l,d*c+a*s,r*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,a,r,s){return this.set(1,i,r,0,e,1,s,0,t,a,1,0,0,0,0,1),this}compose(e,t,i){const a=this.elements,r=t._x,s=t._y,l=t._z,c=t._w,o=r+r,d=s+s,h=l+l,u=r*o,p=r*d,g=r*h,v=s*d,_=s*h,m=l*h,M=c*o,R=c*d,E=c*h,A=i.x,y=i.y,T=i.z;return a[0]=(1-(v+m))*A,a[1]=(p+E)*A,a[2]=(g-R)*A,a[3]=0,a[4]=(p-E)*y,a[5]=(1-(u+m))*y,a[6]=(_+M)*y,a[7]=0,a[8]=(g+R)*T,a[9]=(_-M)*T,a[10]=(1-(u+v))*T,a[11]=0,a[12]=e.x,a[13]=e.y,a[14]=e.z,a[15]=1,this}decompose(e,t,i){const a=this.elements;e.x=a[12],e.y=a[13],e.z=a[14];const r=this.determinantAffine();if(r===0)return i.set(1,1,1),t.identity(),this;let s=ir.set(a[0],a[1],a[2]).length();const l=ir.set(a[4],a[5],a[6]).length(),c=ir.set(a[8],a[9],a[10]).length();r<0&&(s=-s),vi.copy(this);const o=1/s,d=1/l,h=1/c;return vi.elements[0]*=o,vi.elements[1]*=o,vi.elements[2]*=o,vi.elements[4]*=d,vi.elements[5]*=d,vi.elements[6]*=d,vi.elements[8]*=h,vi.elements[9]*=h,vi.elements[10]*=h,t.setFromRotationMatrix(vi),i.x=s,i.y=l,i.z=c,this}makePerspective(e,t,i,a,r,s,l=Ti,c=!1){const o=this.elements,d=2*r/(t-e),h=2*r/(i-a),u=(t+e)/(t-e),p=(i+a)/(i-a);let g,v;if(c)g=r/(s-r),v=s*r/(s-r);else if(l===Ti)g=-(s+r)/(s-r),v=-2*s*r/(s-r);else if(l===Tr)g=-s/(s-r),v=-s*r/(s-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+l);return o[0]=d,o[4]=0,o[8]=u,o[12]=0,o[1]=0,o[5]=h,o[9]=p,o[13]=0,o[2]=0,o[6]=0,o[10]=g,o[14]=v,o[3]=0,o[7]=0,o[11]=-1,o[15]=0,this}makeOrthographic(e,t,i,a,r,s,l=Ti,c=!1){const o=this.elements,d=2/(t-e),h=2/(i-a),u=-(t+e)/(t-e),p=-(i+a)/(i-a);let g,v;if(c)g=1/(s-r),v=s/(s-r);else if(l===Ti)g=-2/(s-r),v=-(s+r)/(s-r);else if(l===Tr)g=-1/(s-r),v=-r/(s-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+l);return o[0]=d,o[4]=0,o[8]=0,o[12]=u,o[1]=0,o[5]=h,o[9]=0,o[13]=p,o[2]=0,o[6]=0,o[10]=g,o[14]=v,o[3]=0,o[7]=0,o[11]=0,o[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let a=0;a<16;a++)if(t[a]!==i[a])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}};nl.prototype.isMatrix4=!0;let Qt=nl;const ir=new B,vi=new Qt,ap=new B(0,0,0),rp=new B(1,1,1),pa=new B,vs=new B,ti=new B,Ru=new Qt,Pu=new sa;class oa{constructor(e=0,t=0,i=0,a=oa.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=a}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,a=this._order){return this._x=e,this._y=t,this._z=i,this._order=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const a=e.elements,r=a[0],s=a[4],l=a[8],c=a[1],o=a[5],d=a[9],h=a[2],u=a[6],p=a[10];switch(t){case"XYZ":this._y=Math.asin(Pt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,p),this._z=Math.atan2(-s,r)):(this._x=Math.atan2(u,o),this._z=0);break;case"YXZ":this._x=Math.asin(-Pt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(l,p),this._z=Math.atan2(c,o)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(Pt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-s,o)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Pt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(u,p),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-s,o));break;case"YZX":this._z=Math.asin(Pt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-d,o),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(l,p));break;case"XZY":this._z=Math.asin(-Pt(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(u,o),this._y=Math.atan2(l,r)):(this._x=Math.atan2(-d,p),this._y=0);break;default:ut("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Ru.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ru,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Pu.setFromEuler(this),this.setFromQuaternion(Pu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}oa.DEFAULT_ORDER="XYZ";class fl{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let sp=0;const Lu=new B,ar=new sa,$i=new Qt,Ms=new B,Fr=new B,op=new B,lp=new sa,Iu=new B(1,0,0),Du=new B(0,1,0),Uu=new B(0,0,1),Nu={type:"added"},cp={type:"removed"},rr={type:"childadded",child:null},Nl={type:"childremoved",child:null};class Mn extends la{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:sp++}),this.uuid=Ra(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Mn.DEFAULT_UP.clone();const e=new B,t=new oa,i=new sa,a=new B(1,1,1);function r(){i.setFromEuler(t,!1)}function s(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(s),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:a},modelViewMatrix:{value:new Qt},normalMatrix:{value:new vt}}),this.matrix=new Qt,this.matrixWorld=new Qt,this.matrixAutoUpdate=Mn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Mn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new fl,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ar.setFromAxisAngle(e,t),this.quaternion.multiply(ar),this}rotateOnWorldAxis(e,t){return ar.setFromAxisAngle(e,t),this.quaternion.premultiply(ar),this}rotateX(e){return this.rotateOnAxis(Iu,e)}rotateY(e){return this.rotateOnAxis(Du,e)}rotateZ(e){return this.rotateOnAxis(Uu,e)}translateOnAxis(e,t){return Lu.copy(e).applyQuaternion(this.quaternion),this.position.add(Lu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Iu,e)}translateY(e){return this.translateOnAxis(Du,e)}translateZ(e){return this.translateOnAxis(Uu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4($i.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Ms.copy(e):Ms.set(e,t,i);const a=this.parent;this.updateWorldMatrix(!0,!1),Fr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?$i.lookAt(Fr,Ms,this.up):$i.lookAt(Ms,Fr,this.up),this.quaternion.setFromRotationMatrix($i),a&&($i.extractRotation(a.matrixWorld),ar.setFromRotationMatrix($i),this.quaternion.premultiply(ar.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Lt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Nu),rr.child=e,this.dispatchEvent(rr),rr.child=null):Lt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(cp),Nl.child=e,this.dispatchEvent(Nl),Nl.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),$i.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),$i.multiply(e.parent.matrixWorld)),e.applyMatrix4($i),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Nu),rr.child=e,this.dispatchEvent(rr),rr.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,a=this.children.length;i<a;i++){const s=this.children[i].getObjectByProperty(e,t);if(s!==void 0)return s}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const a=this.children;for(let r=0,s=a.length;r<s;r++)a[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fr,e,op),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fr,lp,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,a=t.length;i<a;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,a=t.length;i<a;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,i=e.y,a=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*i-r[8]*a,r[13]+=i-r[1]*t-r[5]*i-r[9]*a,r[14]+=a-r[2]*t-r[6]*i-r[10]*a}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,a=t.length;i<a;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){const a=this.parent;if(e===!0&&a!==null&&a.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){const r=this.children;for(let s=0,l=r.length;s<l;s++)r[s].updateWorldMatrix(!1,!0,i)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const a={};a.uuid=this.uuid,a.type=this.type,this.name!==""&&(a.name=this.name),this.castShadow===!0&&(a.castShadow=!0),this.receiveShadow===!0&&(a.receiveShadow=!0),this.visible===!1&&(a.visible=!1),this.frustumCulled===!1&&(a.frustumCulled=!1),this.renderOrder!==0&&(a.renderOrder=this.renderOrder),this.static!==!1&&(a.static=this.static),Object.keys(this.userData).length>0&&(a.userData=this.userData),a.layers=this.layers.mask,a.matrix=this.matrix.toArray(),a.up=this.up.toArray(),this.pivot!==null&&(a.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(a.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(a.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(a.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(a.type="InstancedMesh",a.count=this.count,a.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(a.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(a.type="BatchedMesh",a.perObjectFrustumCulled=this.perObjectFrustumCulled,a.sortObjects=this.sortObjects,a.drawRanges=this._drawRanges,a.reservedRanges=this._reservedRanges,a.geometryInfo=this._geometryInfo.map(l=>({...l,boundingBox:l.boundingBox?l.boundingBox.toJSON():void 0,boundingSphere:l.boundingSphere?l.boundingSphere.toJSON():void 0})),a.instanceInfo=this._instanceInfo.map(l=>({...l})),a.availableInstanceIds=this._availableInstanceIds.slice(),a.availableGeometryIds=this._availableGeometryIds.slice(),a.nextIndexStart=this._nextIndexStart,a.nextVertexStart=this._nextVertexStart,a.geometryCount=this._geometryCount,a.maxInstanceCount=this._maxInstanceCount,a.maxVertexCount=this._maxVertexCount,a.maxIndexCount=this._maxIndexCount,a.geometryInitialized=this._geometryInitialized,a.matricesTexture=this._matricesTexture.toJSON(e),a.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(a.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(a.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(a.boundingBox=this.boundingBox.toJSON()));function r(l,c){return l[c.uuid]===void 0&&(l[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?a.background=this.background.toJSON():this.background.isTexture&&(a.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(a.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){a.geometry=r(e.geometries,this.geometry);const l=this.geometry.parameters;if(l!==void 0&&l.shapes!==void 0){const c=l.shapes;if(Array.isArray(c))for(let o=0,d=c.length;o<d;o++){const h=c[o];r(e.shapes,h)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(a.bindMode=this.bindMode,a.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),a.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const l=[];for(let c=0,o=this.material.length;c<o;c++)l.push(r(e.materials,this.material[c]));a.material=l}else a.material=r(e.materials,this.material);if(this.children.length>0){a.children=[];for(let l=0;l<this.children.length;l++)a.children.push(this.children[l].toJSON(e).object)}if(this.animations.length>0){a.animations=[];for(let l=0;l<this.animations.length;l++){const c=this.animations[l];a.animations.push(r(e.animations,c))}}if(t){const l=s(e.geometries),c=s(e.materials),o=s(e.textures),d=s(e.images),h=s(e.shapes),u=s(e.skeletons),p=s(e.animations),g=s(e.nodes);l.length>0&&(i.geometries=l),c.length>0&&(i.materials=c),o.length>0&&(i.textures=o),d.length>0&&(i.images=d),h.length>0&&(i.shapes=h),u.length>0&&(i.skeletons=u),p.length>0&&(i.animations=p),g.length>0&&(i.nodes=g)}return i.object=a,i;function s(l){const c=[];for(const o in l){const d=l[o];delete d.metadata,c.push(d)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const a=e.children[i];this.add(a.clone())}return this}}Mn.DEFAULT_UP=new B(0,1,0);Mn.DEFAULT_MATRIX_AUTO_UPDATE=!0;Mn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Ta extends Mn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const up={type:"move"};class no{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ta,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ta,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new B,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new B),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ta,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new B,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new B,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let a=null,r=null,s=null;const l=this._targetRay,c=this._grip,o=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(o&&e.hand){s=!0;for(const v of e.hand.values()){const _=t.getJointPose(v,i),m=this._getHandJoint(o,v);_!==null&&(m.matrix.fromArray(_.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=_.radius),m.visible=_!==null}const d=o.joints["index-finger-tip"],h=o.joints["thumb-tip"],u=d.position.distanceTo(h.position),p=.02,g=.005;o.inputState.pinching&&u>p+g?(o.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!o.inputState.pinching&&u<=p-g&&(o.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));l!==null&&(a=t.getPose(e.targetRaySpace,i),a===null&&r!==null&&(a=r),a!==null&&(l.matrix.fromArray(a.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,a.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(a.linearVelocity)):l.hasLinearVelocity=!1,a.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(a.angularVelocity)):l.hasAngularVelocity=!1,this.dispatchEvent(up)))}return l!==null&&(l.visible=a!==null),c!==null&&(c.visible=r!==null),o!==null&&(o.visible=s!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Ta;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const Sh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ma={h:0,s:0,l:0},ys={h:0,s:0,l:0};function Ol(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class At{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const a=e;a&&a.isColor?this.copy(a):typeof a=="number"?this.setHex(a):typeof a=="string"&&this.setStyle(a)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ii){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,It.colorSpaceToWorking(this,t),this}setRGB(e,t,i,a=It.workingColorSpace){return this.r=e,this.g=t,this.b=i,It.colorSpaceToWorking(this,a),this}setHSL(e,t,i,a=It.workingColorSpace){if(e=ep(e,1),t=Pt(t,0,1),i=Pt(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,s=2*i-r;this.r=Ol(s,r,e+1/3),this.g=Ol(s,r,e),this.b=Ol(s,r,e-1/3)}return It.colorSpaceToWorking(this,a),this}setStyle(e,t=ii){function i(r){r!==void 0&&parseFloat(r)<1&&ut("Color: Alpha component of "+e+" will be ignored.")}let a;if(a=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const s=a[1],l=a[2];switch(s){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(l))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(l))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(l))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:ut("Color: Unknown color model "+e)}}else if(a=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=a[1],s=r.length;if(s===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(s===6)return this.setHex(parseInt(r,16),t);ut("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ii){const i=Sh[e.toLowerCase()];return i!==void 0?this.setHex(i,t):ut("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ia(e.r),this.g=ia(e.g),this.b=ia(e.b),this}copyLinearToSRGB(e){return this.r=Sr(e.r),this.g=Sr(e.g),this.b=Sr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ii){return It.workingToColorSpace(Fn.copy(this),e),Math.round(Pt(Fn.r*255,0,255))*65536+Math.round(Pt(Fn.g*255,0,255))*256+Math.round(Pt(Fn.b*255,0,255))}getHexString(e=ii){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=It.workingColorSpace){It.workingToColorSpace(Fn.copy(this),t);const i=Fn.r,a=Fn.g,r=Fn.b,s=Math.max(i,a,r),l=Math.min(i,a,r);let c,o;const d=(l+s)/2;if(l===s)c=0,o=0;else{const h=s-l;switch(o=d<=.5?h/(s+l):h/(2-s-l),s){case i:c=(a-r)/h+(a<r?6:0);break;case a:c=(r-i)/h+2;break;case r:c=(i-a)/h+4;break}c/=6}return e.h=c,e.s=o,e.l=d,e}getRGB(e,t=It.workingColorSpace){return It.workingToColorSpace(Fn.copy(this),t),e.r=Fn.r,e.g=Fn.g,e.b=Fn.b,e}getStyle(e=ii){It.workingToColorSpace(Fn.copy(this),e);const t=Fn.r,i=Fn.g,a=Fn.b;return e!==ii?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${a.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(a*255)})`}offsetHSL(e,t,i){return this.getHSL(ma),this.setHSL(ma.h+e,ma.s+t,ma.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(ma),e.getHSL(ys);const i=Pl(ma.h,ys.h,t),a=Pl(ma.s,ys.s,t),r=Pl(ma.l,ys.l,t);return this.setHSL(i,a,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,a=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*a,this.g=r[1]*t+r[4]*i+r[7]*a,this.b=r[2]*t+r[5]*i+r[8]*a,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Fn=new At;At.NAMES=Sh;class pl{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new At(e),this.near=t,this.far=i}clone(){return new pl(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class bh extends Mn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new oa,this.environmentIntensity=1,this.environmentRotation=new oa,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const Mi=new B,qi=new B,Fl=new B,Ki=new B,sr=new B,or=new B,Ou=new B,Bl=new B,zl=new B,kl=new B,Gl=new rn,Hl=new rn,Vl=new rn;class Jn{constructor(e=new B,t=new B,i=new B){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,a){a.subVectors(i,t),Mi.subVectors(e,t),a.cross(Mi);const r=a.lengthSq();return r>0?a.multiplyScalar(1/Math.sqrt(r)):a.set(0,0,0)}static getBarycoord(e,t,i,a,r){Mi.subVectors(a,t),qi.subVectors(i,t),Fl.subVectors(e,t);const s=Mi.dot(Mi),l=Mi.dot(qi),c=Mi.dot(Fl),o=qi.dot(qi),d=qi.dot(Fl),h=s*o-l*l;if(h===0)return r.set(0,0,0),null;const u=1/h,p=(o*c-l*d)*u,g=(s*d-l*c)*u;return r.set(1-p-g,g,p)}static containsPoint(e,t,i,a){return this.getBarycoord(e,t,i,a,Ki)===null?!1:Ki.x>=0&&Ki.y>=0&&Ki.x+Ki.y<=1}static getInterpolation(e,t,i,a,r,s,l,c){return this.getBarycoord(e,t,i,a,Ki)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Ki.x),c.addScaledVector(s,Ki.y),c.addScaledVector(l,Ki.z),c)}static getInterpolatedAttribute(e,t,i,a,r,s){return Gl.setScalar(0),Hl.setScalar(0),Vl.setScalar(0),Gl.fromBufferAttribute(e,t),Hl.fromBufferAttribute(e,i),Vl.fromBufferAttribute(e,a),s.setScalar(0),s.addScaledVector(Gl,r.x),s.addScaledVector(Hl,r.y),s.addScaledVector(Vl,r.z),s}static isFrontFacing(e,t,i,a){return Mi.subVectors(i,t),qi.subVectors(e,t),Mi.cross(qi).dot(a)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,a){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[a]),this}setFromAttributeAndIndices(e,t,i,a){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,a),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Mi.subVectors(this.c,this.b),qi.subVectors(this.a,this.b),Mi.cross(qi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Jn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Jn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,a,r){return Jn.getInterpolation(e,this.a,this.b,this.c,t,i,a,r)}containsPoint(e){return Jn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Jn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,a=this.b,r=this.c;let s,l;sr.subVectors(a,i),or.subVectors(r,i),Bl.subVectors(e,i);const c=sr.dot(Bl),o=or.dot(Bl);if(c<=0&&o<=0)return t.copy(i);zl.subVectors(e,a);const d=sr.dot(zl),h=or.dot(zl);if(d>=0&&h<=d)return t.copy(a);const u=c*h-d*o;if(u<=0&&c>=0&&d<=0)return s=c/(c-d),t.copy(i).addScaledVector(sr,s);kl.subVectors(e,r);const p=sr.dot(kl),g=or.dot(kl);if(g>=0&&p<=g)return t.copy(r);const v=p*o-c*g;if(v<=0&&o>=0&&g<=0)return l=o/(o-g),t.copy(i).addScaledVector(or,l);const _=d*g-p*h;if(_<=0&&h-d>=0&&p-g>=0)return Ou.subVectors(r,a),l=(h-d)/(h-d+(p-g)),t.copy(a).addScaledVector(Ou,l);const m=1/(_+v+u);return s=v*m,l=u*m,t.copy(i).addScaledVector(sr,s).addScaledVector(or,l)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class Pr{constructor(e=new B(1/0,1/0,1/0),t=new B(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(yi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(yi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=yi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let s=0,l=r.count;s<l;s++)e.isMesh===!0?e.getVertexPosition(s,yi):yi.fromBufferAttribute(r,s),yi.applyMatrix4(e.matrixWorld),this.expandByPoint(yi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ss.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Ss.copy(i.boundingBox)),Ss.applyMatrix4(e.matrixWorld),this.union(Ss)}const a=e.children;for(let r=0,s=a.length;r<s;r++)this.expandByObject(a[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,yi),yi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Br),bs.subVectors(this.max,Br),lr.subVectors(e.a,Br),cr.subVectors(e.b,Br),ur.subVectors(e.c,Br),ga.subVectors(cr,lr),_a.subVectors(ur,cr),Fa.subVectors(lr,ur);let t=[0,-ga.z,ga.y,0,-_a.z,_a.y,0,-Fa.z,Fa.y,ga.z,0,-ga.x,_a.z,0,-_a.x,Fa.z,0,-Fa.x,-ga.y,ga.x,0,-_a.y,_a.x,0,-Fa.y,Fa.x,0];return!Wl(t,lr,cr,ur,bs)||(t=[1,0,0,0,1,0,0,0,1],!Wl(t,lr,cr,ur,bs))?!1:(Es.crossVectors(ga,_a),t=[Es.x,Es.y,Es.z],Wl(t,lr,cr,ur,bs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,yi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(yi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Zi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Zi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Zi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Zi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Zi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Zi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Zi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Zi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Zi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Zi=[new B,new B,new B,new B,new B,new B,new B,new B],yi=new B,Ss=new Pr,lr=new B,cr=new B,ur=new B,ga=new B,_a=new B,Fa=new B,Br=new B,bs=new B,Es=new B,Ba=new B;function Wl(n,e,t,i,a){for(let r=0,s=n.length-3;r<=s;r+=3){Ba.fromArray(n,r);const l=a.x*Math.abs(Ba.x)+a.y*Math.abs(Ba.y)+a.z*Math.abs(Ba.z),c=e.dot(Ba),o=t.dot(Ba),d=i.dot(Ba);if(Math.max(-Math.max(c,o,d),Math.min(c,o,d))>l)return!1}return!0}const vn=new B,Ts=new ot;let dp=0;class mi extends la{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:dp++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=qo,this.updateRanges=[],this.gpuType=Ei,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let a=0,r=this.itemSize;a<r;a++)this.array[e+a]=t.array[i+a];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Ts.fromBufferAttribute(this,t),Ts.applyMatrix3(e),this.setXY(t,Ts.x,Ts.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)vn.fromBufferAttribute(this,t),vn.applyMatrix3(e),this.setXYZ(t,vn.x,vn.y,vn.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)vn.fromBufferAttribute(this,t),vn.applyMatrix4(e),this.setXYZ(t,vn.x,vn.y,vn.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)vn.fromBufferAttribute(this,t),vn.applyNormalMatrix(e),this.setXYZ(t,vn.x,vn.y,vn.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)vn.fromBufferAttribute(this,t),vn.transformDirection(e),this.setXYZ(t,vn.x,vn.y,vn.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Oi(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Yt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Oi(t,this.array)),t}setX(e,t){return this.normalized&&(t=Yt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Oi(t,this.array)),t}setY(e,t){return this.normalized&&(t=Yt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Oi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Yt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Oi(t,this.array)),t}setW(e,t){return this.normalized&&(t=Yt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Yt(t,this.array),i=Yt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,a){return e*=this.itemSize,this.normalized&&(t=Yt(t,this.array),i=Yt(i,this.array),a=Yt(a,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=a,this}setXYZW(e,t,i,a,r){return e*=this.itemSize,this.normalized&&(t=Yt(t,this.array),i=Yt(i,this.array),a=Yt(a,this.array),r=Yt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=a,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==qo&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}}class $c extends mi{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class qc extends mi{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class Yn extends mi{constructor(e,t,i){super(new Float32Array(e),t,i)}}const hp=new Pr,zr=new B,Xl=new B;class fs{constructor(e=new B,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):hp.setFromPoints(e).getCenter(i);let a=0;for(let r=0,s=e.length;r<s;r++)a=Math.max(a,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(a),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;zr.subVectors(e,this.center);const t=zr.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),a=(i-this.radius)*.5;this.center.addScaledVector(zr,a/i),this.radius+=a}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Xl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(zr.copy(e.center).add(Xl)),this.expandByPoint(zr.copy(e.center).sub(Xl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let fp=0;const di=new Qt,Yl=new Mn,dr=new B,ni=new Pr,kr=new Pr,An=new B;class Qn extends la{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:fp++}),this.uuid=Ra(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Jf(e)?qc:$c)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new vt().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const a=this.attributes.tangent;return a!==void 0&&(a.transformDirection(e),a.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return di.makeRotationFromQuaternion(e),this.applyMatrix4(di),this}rotateX(e){return di.makeRotationX(e),this.applyMatrix4(di),this}rotateY(e){return di.makeRotationY(e),this.applyMatrix4(di),this}rotateZ(e){return di.makeRotationZ(e),this.applyMatrix4(di),this}translate(e,t,i){return di.makeTranslation(e,t,i),this.applyMatrix4(di),this}scale(e,t,i){return di.makeScale(e,t,i),this.applyMatrix4(di),this}lookAt(e){return Yl.lookAt(e),Yl.updateMatrix(),this.applyMatrix4(Yl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(dr).negate(),this.translate(dr.x,dr.y,dr.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let a=0,r=e.length;a<r;a++){const s=e[a];i.push(s.x,s.y,s.z||0)}this.setAttribute("position",new Yn(i,3))}else{const i=Math.min(e.length,t.count);for(let a=0;a<i;a++){const r=e[a];t.setXYZ(a,r.x,r.y,r.z||0)}e.length>t.count&&ut("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Pr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Lt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new B(-1/0,-1/0,-1/0),new B(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,a=t.length;i<a;i++){const r=t[i];ni.setFromBufferAttribute(r),this.morphTargetsRelative?(An.addVectors(this.boundingBox.min,ni.min),this.boundingBox.expandByPoint(An),An.addVectors(this.boundingBox.max,ni.max),this.boundingBox.expandByPoint(An)):(this.boundingBox.expandByPoint(ni.min),this.boundingBox.expandByPoint(ni.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Lt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new fs);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Lt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new B,1/0);return}if(e){const i=this.boundingSphere.center;if(ni.setFromBufferAttribute(e),t)for(let r=0,s=t.length;r<s;r++){const l=t[r];kr.setFromBufferAttribute(l),this.morphTargetsRelative?(An.addVectors(ni.min,kr.min),ni.expandByPoint(An),An.addVectors(ni.max,kr.max),ni.expandByPoint(An)):(ni.expandByPoint(kr.min),ni.expandByPoint(kr.max))}ni.getCenter(i);let a=0;for(let r=0,s=e.count;r<s;r++)An.fromBufferAttribute(e,r),a=Math.max(a,i.distanceToSquared(An));if(t)for(let r=0,s=t.length;r<s;r++){const l=t[r],c=this.morphTargetsRelative;for(let o=0,d=l.count;o<d;o++)An.fromBufferAttribute(l,o),c&&(dr.fromBufferAttribute(e,o),An.add(dr)),a=Math.max(a,i.distanceToSquared(An))}this.boundingSphere.radius=Math.sqrt(a),isNaN(this.boundingSphere.radius)&&Lt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Lt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,a=t.normal,r=t.uv;let s=this.getAttribute("tangent");(s===void 0||s.count!==i.count)&&(s=new mi(new Float32Array(4*i.count),4),this.setAttribute("tangent",s));const l=[],c=[];for(let f=0;f<i.count;f++)l[f]=new B,c[f]=new B;const o=new B,d=new B,h=new B,u=new ot,p=new ot,g=new ot,v=new B,_=new B;function m(f,b,w){o.fromBufferAttribute(i,f),d.fromBufferAttribute(i,b),h.fromBufferAttribute(i,w),u.fromBufferAttribute(r,f),p.fromBufferAttribute(r,b),g.fromBufferAttribute(r,w),d.sub(o),h.sub(o),p.sub(u),g.sub(u);const P=1/(p.x*g.y-g.x*p.y);isFinite(P)&&(v.copy(d).multiplyScalar(g.y).addScaledVector(h,-p.y).multiplyScalar(P),_.copy(h).multiplyScalar(p.x).addScaledVector(d,-g.x).multiplyScalar(P),l[f].add(v),l[b].add(v),l[w].add(v),c[f].add(_),c[b].add(_),c[w].add(_))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let f=0,b=M.length;f<b;++f){const w=M[f],P=w.start,L=w.count;for(let V=P,j=P+L;V<j;V+=3)m(e.getX(V+0),e.getX(V+1),e.getX(V+2))}const R=new B,E=new B,A=new B,y=new B;function T(f){A.fromBufferAttribute(a,f),y.copy(A);const b=l[f];R.copy(b),R.sub(A.multiplyScalar(A.dot(b))).normalize(),E.crossVectors(y,b);const P=E.dot(c[f])<0?-1:1;s.setXYZW(f,R.x,R.y,R.z,P)}for(let f=0,b=M.length;f<b;++f){const w=M[f],P=w.start,L=w.count;for(let V=P,j=P+L;V<j;V+=3)T(e.getX(V+0)),T(e.getX(V+1)),T(e.getX(V+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new mi(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let u=0,p=i.count;u<p;u++)i.setXYZ(u,0,0,0);const a=new B,r=new B,s=new B,l=new B,c=new B,o=new B,d=new B,h=new B;if(e)for(let u=0,p=e.count;u<p;u+=3){const g=e.getX(u+0),v=e.getX(u+1),_=e.getX(u+2);a.fromBufferAttribute(t,g),r.fromBufferAttribute(t,v),s.fromBufferAttribute(t,_),d.subVectors(s,r),h.subVectors(a,r),d.cross(h),l.fromBufferAttribute(i,g),c.fromBufferAttribute(i,v),o.fromBufferAttribute(i,_),l.add(d),c.add(d),o.add(d),i.setXYZ(g,l.x,l.y,l.z),i.setXYZ(v,c.x,c.y,c.z),i.setXYZ(_,o.x,o.y,o.z)}else for(let u=0,p=t.count;u<p;u+=3)a.fromBufferAttribute(t,u+0),r.fromBufferAttribute(t,u+1),s.fromBufferAttribute(t,u+2),d.subVectors(s,r),h.subVectors(a,r),d.cross(h),i.setXYZ(u+0,d.x,d.y,d.z),i.setXYZ(u+1,d.x,d.y,d.z),i.setXYZ(u+2,d.x,d.y,d.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)An.fromBufferAttribute(e,t),An.normalize(),e.setXYZ(t,An.x,An.y,An.z)}toNonIndexed(){function e(l,c){const o=l.array,d=l.itemSize,h=l.normalized,u=new o.constructor(c.length*d);let p=0,g=0;for(let v=0,_=c.length;v<_;v++){l.isInterleavedBufferAttribute?p=c[v]*l.data.stride+l.offset:p=c[v]*d;for(let m=0;m<d;m++)u[g++]=o[p++]}return new mi(u,d,h)}if(this.index===null)return ut("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Qn,i=this.index.array,a=this.attributes;for(const l in a){const c=a[l],o=e(c,i);t.setAttribute(l,o)}const r=this.morphAttributes;for(const l in r){const c=[],o=r[l];for(let d=0,h=o.length;d<h;d++){const u=o[d],p=e(u,i);c.push(p)}t.morphAttributes[l]=c}t.morphTargetsRelative=this.morphTargetsRelative;const s=this.groups;for(let l=0,c=s.length;l<c;l++){const o=s[l];t.addGroup(o.start,o.count,o.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const c=this.parameters;for(const o in c)c[o]!==void 0&&(e[o]=c[o]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const c in i){const o=i[c];e.data.attributes[c]=o.toJSON(e.data)}const a={};let r=!1;for(const c in this.morphAttributes){const o=this.morphAttributes[c],d=[];for(let h=0,u=o.length;h<u;h++){const p=o[h];d.push(p.toJSON(e.data))}d.length>0&&(a[c]=d,r=!0)}r&&(e.data.morphAttributes=a,e.data.morphTargetsRelative=this.morphTargetsRelative);const s=this.groups;s.length>0&&(e.data.groups=JSON.parse(JSON.stringify(s)));const l=this.boundingSphere;return l!==null&&(e.data.boundingSphere=l.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const a=e.attributes;for(const o in a){const d=a[o];this.setAttribute(o,d.clone(t))}const r=e.morphAttributes;for(const o in r){const d=[],h=r[o];for(let u=0,p=h.length;u<p;u++)d.push(h[u].clone(t));this.morphAttributes[o]=d}this.morphTargetsRelative=e.morphTargetsRelative;const s=e.groups;for(let o=0,d=s.length;o<d;o++){const h=s[o];this.addGroup(h.start,h.count,h.materialIndex)}const l=e.boundingBox;l!==null&&(this.boundingBox=l.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Eh{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=qo,this.updateRanges=[],this.version=0,this.uuid=Ra()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let a=0,r=this.stride;a<r;a++)this.array[e+a]=t.array[i+a];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ra()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ra()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Gn=new B;class us{constructor(e,t,i,a=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=a}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Gn.fromBufferAttribute(this,t),Gn.applyMatrix4(e),this.setXYZ(t,Gn.x,Gn.y,Gn.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Gn.fromBufferAttribute(this,t),Gn.applyNormalMatrix(e),this.setXYZ(t,Gn.x,Gn.y,Gn.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Gn.fromBufferAttribute(this,t),Gn.transformDirection(e),this.setXYZ(t,Gn.x,Gn.y,Gn.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=Oi(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Yt(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=Yt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Yt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Yt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Yt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Oi(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Oi(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Oi(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Oi(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Yt(t,this.array),i=Yt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,a){return e=e*this.data.stride+this.offset,this.normalized&&(t=Yt(t,this.array),i=Yt(i,this.array),a=Yt(a,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=a,this}setXYZW(e,t,i,a,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Yt(t,this.array),i=Yt(i,this.array),a=Yt(a,this.array),r=Yt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=a,this.data.array[e+3]=r,this}clone(e){if(e===void 0){cs("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const a=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[a+r])}return new mi(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new us(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){cs("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const a=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[a+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}let pp=0;class Ua extends la{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:pp++}),this.uuid=Ra(),this.name="",this.type="Material",this.blending=Ya,this.side=ra,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ro,this.blendDst=so,this.blendEquation=Sa,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new At(0,0,0),this.blendAlpha=0,this.depthFunc=Za,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=gc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ga,this.stencilZFail=Ga,this.stencilZPass=Ga,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){ut(`Material: parameter '${t}' has value of undefined.`);continue}const a=this[t];if(a===void 0){ut(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}a&&a.isColor?a.set(i):a&&a.isVector2&&i&&i.isVector2||a&&a.isEuler&&i&&i.isEuler||a&&a.isVector3&&i&&i.isVector3?a.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Ya&&(i.blending=this.blending),this.side!==ra&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==ro&&(i.blendSrc=this.blendSrc),this.blendDst!==so&&(i.blendDst=this.blendDst),this.blendEquation!==Sa&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Za&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==gc&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ga&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Ga&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Ga&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function a(r){const s=[];for(const l in r){const c=r[l];delete c.metadata,s.push(c)}return s}if(t){const r=a(e.textures),s=a(e.images);r.length>0&&(i.textures=r),s.length>0&&(i.images=s)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new At().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new ot().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ot().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const a=t.length;i=new Array(a);for(let r=0;r!==a;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Kc extends Ua{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new At(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let hr;const Gr=new B,fr=new B,pr=new B,mr=new ot,Hr=new ot,Th=new Qt,As=new B,Vr=new B,ws=new B,Fu=new ot,$l=new ot,Bu=new ot;class Ah extends Mn{constructor(e=new Kc){if(super(),this.isSprite=!0,this.type="Sprite",hr===void 0){hr=new Qn;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new Eh(t,5);hr.setIndex([0,1,2,0,2,3]),hr.setAttribute("position",new us(i,3,0,!1)),hr.setAttribute("uv",new us(i,2,3,!1))}this.geometry=hr,this.material=e,this.center=new ot(.5,.5),this.count=1}raycast(e,t){e.camera===null&&Lt('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),fr.setFromMatrixScale(this.matrixWorld),Th.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),pr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&fr.multiplyScalar(-pr.z);const i=this.material.rotation;let a,r;i!==0&&(r=Math.cos(i),a=Math.sin(i));const s=this.center;Cs(As.set(-.5,-.5,0),pr,s,fr,a,r),Cs(Vr.set(.5,-.5,0),pr,s,fr,a,r),Cs(ws.set(.5,.5,0),pr,s,fr,a,r),Fu.set(0,0),$l.set(1,0),Bu.set(1,1);let l=e.ray.intersectTriangle(As,Vr,ws,!1,Gr);if(l===null&&(Cs(Vr.set(-.5,.5,0),pr,s,fr,a,r),$l.set(0,1),l=e.ray.intersectTriangle(As,ws,Vr,!1,Gr),l===null))return;const c=e.ray.origin.distanceTo(Gr);c<e.near||c>e.far||t.push({distance:c,point:Gr.clone(),uv:Jn.getInterpolation(Gr,As,Vr,ws,Fu,$l,Bu,new ot),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Cs(n,e,t,i,a,r){mr.subVectors(n,t).addScalar(.5).multiply(i),a!==void 0?(Hr.x=r*mr.x-a*mr.y,Hr.y=a*mr.x+r*mr.y):Hr.copy(mr),n.copy(e),n.x+=Hr.x,n.y+=Hr.y,n.applyMatrix4(Th)}const Ji=new B,ql=new B,Rs=new B,xa=new B,Kl=new B,Ps=new B,Zl=new B;class ps{constructor(e=new B,t=new B(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ji)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Ji.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ji.copy(this.origin).addScaledVector(this.direction,t),Ji.distanceToSquared(e))}distanceSqToSegment(e,t,i,a){ql.copy(e).add(t).multiplyScalar(.5),Rs.copy(t).sub(e).normalize(),xa.copy(this.origin).sub(ql);const r=e.distanceTo(t)*.5,s=-this.direction.dot(Rs),l=xa.dot(this.direction),c=-xa.dot(Rs),o=xa.lengthSq(),d=Math.abs(1-s*s);let h,u,p,g;if(d>0)if(h=s*c-l,u=s*l-c,g=r*d,h>=0)if(u>=-g)if(u<=g){const v=1/d;h*=v,u*=v,p=h*(h+s*u+2*l)+u*(s*h+u+2*c)+o}else u=r,h=Math.max(0,-(s*u+l)),p=-h*h+u*(u+2*c)+o;else u=-r,h=Math.max(0,-(s*u+l)),p=-h*h+u*(u+2*c)+o;else u<=-g?(h=Math.max(0,-(-s*r+l)),u=h>0?-r:Math.min(Math.max(-r,-c),r),p=-h*h+u*(u+2*c)+o):u<=g?(h=0,u=Math.min(Math.max(-r,-c),r),p=u*(u+2*c)+o):(h=Math.max(0,-(s*r+l)),u=h>0?r:Math.min(Math.max(-r,-c),r),p=-h*h+u*(u+2*c)+o);else u=s>0?-r:r,h=Math.max(0,-(s*u+l)),p=-h*h+u*(u+2*c)+o;return i&&i.copy(this.origin).addScaledVector(this.direction,h),a&&a.copy(ql).addScaledVector(Rs,u),p}intersectSphere(e,t){Ji.subVectors(e.center,this.origin);const i=Ji.dot(this.direction),a=Ji.dot(Ji)-i*i,r=e.radius*e.radius;if(a>r)return null;const s=Math.sqrt(r-a),l=i-s,c=i+s;return c<0?null:l<0?this.at(c,t):this.at(l,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,a,r,s,l,c;const o=1/this.direction.x,d=1/this.direction.y,h=1/this.direction.z,u=this.origin;return o>=0?(i=(e.min.x-u.x)*o,a=(e.max.x-u.x)*o):(i=(e.max.x-u.x)*o,a=(e.min.x-u.x)*o),d>=0?(r=(e.min.y-u.y)*d,s=(e.max.y-u.y)*d):(r=(e.max.y-u.y)*d,s=(e.min.y-u.y)*d),i>s||r>a||((r>i||isNaN(i))&&(i=r),(s<a||isNaN(a))&&(a=s),h>=0?(l=(e.min.z-u.z)*h,c=(e.max.z-u.z)*h):(l=(e.max.z-u.z)*h,c=(e.min.z-u.z)*h),i>c||l>a)||((l>i||i!==i)&&(i=l),(c<a||a!==a)&&(a=c),a<0)?null:this.at(i>=0?i:a,t)}intersectsBox(e){return this.intersectBox(e,Ji)!==null}intersectTriangle(e,t,i,a,r){Kl.subVectors(t,e),Ps.subVectors(i,e),Zl.crossVectors(Kl,Ps);let s=this.direction.dot(Zl),l;if(s>0){if(a)return null;l=1}else if(s<0)l=-1,s=-s;else return null;xa.subVectors(this.origin,e);const c=l*this.direction.dot(Ps.crossVectors(xa,Ps));if(c<0)return null;const o=l*this.direction.dot(Kl.cross(xa));if(o<0||c+o>s)return null;const d=-l*xa.dot(Zl);return d<0?null:this.at(d/s,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Zc extends Ua{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new At(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new oa,this.combine=Pc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const zu=new Qt,za=new ps,Ls=new fs,ku=new B,Is=new B,Ds=new B,Us=new B,Jl=new B,Ns=new B,Gu=new B,Os=new B;class bn extends Mn{constructor(e=new Qn,t=new Zc){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const a=t[i[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,s=a.length;r<s;r++){const l=a[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[l]=r}}}}getVertexPosition(e,t){const i=this.geometry,a=i.attributes.position,r=i.morphAttributes.position,s=i.morphTargetsRelative;t.fromBufferAttribute(a,e);const l=this.morphTargetInfluences;if(r&&l){Ns.set(0,0,0);for(let c=0,o=r.length;c<o;c++){const d=l[c],h=r[c];d!==0&&(Jl.fromBufferAttribute(h,e),s?Ns.addScaledVector(Jl,d):Ns.addScaledVector(Jl.sub(t),d))}t.add(Ns)}return t}raycast(e,t){const i=this.geometry,a=this.material,r=this.matrixWorld;a!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Ls.copy(i.boundingSphere),Ls.applyMatrix4(r),za.copy(e.ray).recast(e.near),!(Ls.containsPoint(za.origin)===!1&&(za.intersectSphere(Ls,ku)===null||za.origin.distanceToSquared(ku)>(e.far-e.near)**2))&&(zu.copy(r).invert(),za.copy(e.ray).applyMatrix4(zu),!(i.boundingBox!==null&&za.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,za)))}_computeIntersections(e,t,i){let a;const r=this.geometry,s=this.material,l=r.index,c=r.attributes.position,o=r.attributes.uv,d=r.attributes.uv1,h=r.attributes.normal,u=r.groups,p=r.drawRange;if(l!==null)if(Array.isArray(s))for(let g=0,v=u.length;g<v;g++){const _=u[g],m=s[_.materialIndex],M=Math.max(_.start,p.start),R=Math.min(l.count,Math.min(_.start+_.count,p.start+p.count));for(let E=M,A=R;E<A;E+=3){const y=l.getX(E),T=l.getX(E+1),f=l.getX(E+2);a=Fs(this,m,e,i,o,d,h,y,T,f),a&&(a.faceIndex=Math.floor(E/3),a.face.materialIndex=_.materialIndex,t.push(a))}}else{const g=Math.max(0,p.start),v=Math.min(l.count,p.start+p.count);for(let _=g,m=v;_<m;_+=3){const M=l.getX(_),R=l.getX(_+1),E=l.getX(_+2);a=Fs(this,s,e,i,o,d,h,M,R,E),a&&(a.faceIndex=Math.floor(_/3),t.push(a))}}else if(c!==void 0)if(Array.isArray(s))for(let g=0,v=u.length;g<v;g++){const _=u[g],m=s[_.materialIndex],M=Math.max(_.start,p.start),R=Math.min(c.count,Math.min(_.start+_.count,p.start+p.count));for(let E=M,A=R;E<A;E+=3){const y=E,T=E+1,f=E+2;a=Fs(this,m,e,i,o,d,h,y,T,f),a&&(a.faceIndex=Math.floor(E/3),a.face.materialIndex=_.materialIndex,t.push(a))}}else{const g=Math.max(0,p.start),v=Math.min(c.count,p.start+p.count);for(let _=g,m=v;_<m;_+=3){const M=_,R=_+1,E=_+2;a=Fs(this,s,e,i,o,d,h,M,R,E),a&&(a.faceIndex=Math.floor(_/3),t.push(a))}}}}function mp(n,e,t,i,a,r,s,l){let c;if(e.side===Xn?c=i.intersectTriangle(s,r,a,!0,l):c=i.intersectTriangle(a,r,s,e.side===ra,l),c===null)return null;Os.copy(l),Os.applyMatrix4(n.matrixWorld);const o=t.ray.origin.distanceTo(Os);return o<t.near||o>t.far?null:{distance:o,point:Os.clone(),object:n}}function Fs(n,e,t,i,a,r,s,l,c,o){n.getVertexPosition(l,Is),n.getVertexPosition(c,Ds),n.getVertexPosition(o,Us);const d=mp(n,e,t,i,Is,Ds,Us,Gu);if(d){const h=new B;Jn.getBarycoord(Gu,Is,Ds,Us,h),a&&(d.uv=Jn.getInterpolatedAttribute(a,l,c,o,h,new ot)),r&&(d.uv1=Jn.getInterpolatedAttribute(r,l,c,o,h,new ot)),s&&(d.normal=Jn.getInterpolatedAttribute(s,l,c,o,h,new B),d.normal.dot(i.direction)>0&&d.normal.multiplyScalar(-1));const u={a:l,b:c,c:o,normal:new B,materialIndex:0};Jn.getNormal(Is,Ds,Us,u.normal),d.face=u,d.barycoord=h}return d}class wh extends Dn{constructor(e=null,t=1,i=1,a,r,s,l,c,o=wn,d=wn,h,u){super(null,s,l,c,o,d,a,r,h,u),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const jl=new B,gp=new B,_p=new vt;class Ni{constructor(e=new B(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,a){return this.normal.set(e,t,i),this.constant=a,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const a=jl.subVectors(i,t).cross(gp.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(a,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){const a=e.delta(jl),r=this.normal.dot(a);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(s<0||s>1)?null:t.copy(e.start).addScaledVector(a,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||_p.getNormalMatrix(e),a=this.coplanarPoint(jl).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-a.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ka=new fs,xp=new ot(.5,.5),Bs=new B;class ml{constructor(e=new Ni,t=new Ni,i=new Ni,a=new Ni,r=new Ni,s=new Ni){this.planes=[e,t,i,a,r,s]}set(e,t,i,a,r,s){const l=this.planes;return l[0].copy(e),l[1].copy(t),l[2].copy(i),l[3].copy(a),l[4].copy(r),l[5].copy(s),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Ti,i=!1){const a=this.planes,r=e.elements,s=r[0],l=r[1],c=r[2],o=r[3],d=r[4],h=r[5],u=r[6],p=r[7],g=r[8],v=r[9],_=r[10],m=r[11],M=r[12],R=r[13],E=r[14],A=r[15];if(a[0].setComponents(o-s,p-d,m-g,A-M).normalize(),a[1].setComponents(o+s,p+d,m+g,A+M).normalize(),a[2].setComponents(o+l,p+h,m+v,A+R).normalize(),a[3].setComponents(o-l,p-h,m-v,A-R).normalize(),i)a[4].setComponents(c,u,_,E).normalize(),a[5].setComponents(o-c,p-u,m-_,A-E).normalize();else if(a[4].setComponents(o-c,p-u,m-_,A-E).normalize(),t===Ti)a[5].setComponents(o+c,p+u,m+_,A+E).normalize();else if(t===Tr)a[5].setComponents(c,u,_,E).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ka.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ka.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ka)}intersectsSprite(e){ka.center.set(0,0,0);const t=xp.distanceTo(e.center);return ka.radius=.7071067811865476+t,ka.applyMatrix4(e.matrixWorld),this.intersectsSphere(ka)}intersectsSphere(e){const t=this.planes,i=e.center,a=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<a)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const a=t[i];if(Bs.x=a.normal.x>0?e.max.x:e.min.x,Bs.y=a.normal.y>0?e.max.y:e.min.y,Bs.z=a.normal.z>0?e.max.z:e.min.z,a.distanceToPoint(Bs)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class ji extends Ua{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new At(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Zo=new B,Jo=new B,Hu=new Qt,Wr=new ps,zs=new fs,Ql=new B,Vu=new B;class Ch extends Mn{constructor(e=new Qn,t=new ji){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let a=1,r=t.count;a<r;a++)Zo.fromBufferAttribute(t,a-1),Jo.fromBufferAttribute(t,a),i[a]=i[a-1],i[a]+=Zo.distanceTo(Jo);e.setAttribute("lineDistance",new Yn(i,1))}else ut("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,a=this.matrixWorld,r=e.params.Line.threshold,s=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),zs.copy(i.boundingSphere),zs.applyMatrix4(a),zs.radius+=r,e.ray.intersectsSphere(zs)===!1)return;Hu.copy(a).invert(),Wr.copy(e.ray).applyMatrix4(Hu);const l=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=l*l,o=this.isLineSegments?2:1,d=i.index,u=i.attributes.position;if(d!==null){const p=Math.max(0,s.start),g=Math.min(d.count,s.start+s.count);for(let v=p,_=g-1;v<_;v+=o){const m=d.getX(v),M=d.getX(v+1),R=ks(this,e,Wr,c,m,M,v);R&&t.push(R)}if(this.isLineLoop){const v=d.getX(g-1),_=d.getX(p),m=ks(this,e,Wr,c,v,_,g-1);m&&t.push(m)}}else{const p=Math.max(0,s.start),g=Math.min(u.count,s.start+s.count);for(let v=p,_=g-1;v<_;v+=o){const m=ks(this,e,Wr,c,v,v+1,v);m&&t.push(m)}if(this.isLineLoop){const v=ks(this,e,Wr,c,g-1,p,g-1);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const a=t[i[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,s=a.length;r<s;r++){const l=a[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[l]=r}}}}}function ks(n,e,t,i,a,r,s){const l=n.geometry.attributes.position;if(Zo.fromBufferAttribute(l,a),Jo.fromBufferAttribute(l,r),t.distanceSqToSegment(Zo,Jo,Ql,Vu)>i)return;Ql.applyMatrix4(n.matrixWorld);const o=e.ray.origin.distanceTo(Ql);if(!(o<e.near||o>e.far))return{distance:o,point:Vu.clone().applyMatrix4(n.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:n}}const Wu=new B,Xu=new B;class Di extends Ch{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let a=0,r=t.count;a<r;a+=2)Wu.fromBufferAttribute(t,a),Xu.fromBufferAttribute(t,a+1),i[a]=a===0?0:i[a-1],i[a+1]=i[a]+Wu.distanceTo(Xu);e.setAttribute("lineDistance",new Yn(i,1))}else ut("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Jc extends Dn{constructor(e=[],t=Pa,i,a,r,s,l,c,o,d){super(e,t,i,a,r,s,l,c,o,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Rh extends Dn{constructor(e,t,i,a,r,s,l,c,o){super(e,t,i,a,r,s,l,c,o),this.isCanvasTexture=!0,this.needsUpdate=!0}}class ja extends Dn{constructor(e,t,i=Ci,a,r,s,l=wn,c=wn,o,d=Hi,h=1){if(d!==Hi&&d!==Ea)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const u={width:e,height:t,depth:h};super(u,a,r,s,l,c,d,i,o),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new hl(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Ph extends ja{constructor(e,t=Ci,i=Pa,a,r,s=wn,l=wn,c,o=Hi){const d={width:e,height:e,depth:1},h=[d,d,d,d,d,d];super(e,e,t,i,a,r,s,l,c,o),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class jc extends Dn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class ai extends Qn{constructor(e=1,t=1,i=1,a=1,r=1,s=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:a,heightSegments:r,depthSegments:s};const l=this;a=Math.floor(a),r=Math.floor(r),s=Math.floor(s);const c=[],o=[],d=[],h=[];let u=0,p=0;g("z","y","x",-1,-1,i,t,e,s,r,0),g("z","y","x",1,-1,i,t,-e,s,r,1),g("x","z","y",1,1,e,i,t,a,s,2),g("x","z","y",1,-1,e,i,-t,a,s,3),g("x","y","z",1,-1,e,t,i,a,r,4),g("x","y","z",-1,-1,e,t,-i,a,r,5),this.setIndex(c),this.setAttribute("position",new Yn(o,3)),this.setAttribute("normal",new Yn(d,3)),this.setAttribute("uv",new Yn(h,2));function g(v,_,m,M,R,E,A,y,T,f,b){const w=E/T,P=A/f,L=E/2,V=A/2,j=y/2,I=T+1,X=f+1;let k=0,K=0;const oe=new B;for(let he=0;he<X;he++){const Ie=he*P-V;for(let ve=0;ve<I;ve++){const _t=ve*w-L;oe[v]=_t*M,oe[_]=Ie*R,oe[m]=j,o.push(oe.x,oe.y,oe.z),oe[v]=0,oe[_]=0,oe[m]=y>0?1:-1,d.push(oe.x,oe.y,oe.z),h.push(ve/T),h.push(1-he/f),k+=1}}for(let he=0;he<f;he++)for(let Ie=0;Ie<T;Ie++){const ve=u+Ie+I*he,_t=u+Ie+I*(he+1),Ft=u+(Ie+1)+I*(he+1),Qe=u+(Ie+1)+I*he;c.push(ve,_t,Qe),c.push(_t,Ft,Qe),K+=6}l.addGroup(p,K,b),p+=K,u+=k}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ai(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}const Gs=new B,Hs=new B,ec=new B,Vs=new Jn;class Ma extends Qn{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){const a=Math.pow(10,4),r=Math.cos(ns*t),s=e.getIndex(),l=e.getAttribute("position"),c=s?s.count:l.count,o=[0,0,0],d=["a","b","c"],h=new Array(3),u={},p=[];for(let g=0;g<c;g+=3){s?(o[0]=s.getX(g),o[1]=s.getX(g+1),o[2]=s.getX(g+2)):(o[0]=g,o[1]=g+1,o[2]=g+2);const{a:v,b:_,c:m}=Vs;if(v.fromBufferAttribute(l,o[0]),_.fromBufferAttribute(l,o[1]),m.fromBufferAttribute(l,o[2]),Vs.getNormal(ec),h[0]=`${Math.round(v.x*a)},${Math.round(v.y*a)},${Math.round(v.z*a)}`,h[1]=`${Math.round(_.x*a)},${Math.round(_.y*a)},${Math.round(_.z*a)}`,h[2]=`${Math.round(m.x*a)},${Math.round(m.y*a)},${Math.round(m.z*a)}`,!(h[0]===h[1]||h[1]===h[2]||h[2]===h[0]))for(let M=0;M<3;M++){const R=(M+1)%3,E=h[M],A=h[R],y=Vs[d[M]],T=Vs[d[R]],f=`${E}_${A}`,b=`${A}_${E}`;b in u&&u[b]?(ec.dot(u[b].normal)<=r&&(p.push(y.x,y.y,y.z),p.push(T.x,T.y,T.z)),u[b]=null):f in u||(u[f]={index0:o[M],index1:o[R],normal:ec.clone()})}}for(const g in u)if(u[g]){const{index0:v,index1:_}=u[g];Gs.fromBufferAttribute(l,v),Hs.fromBufferAttribute(l,_),p.push(Gs.x,Gs.y,Gs.z),p.push(Hs.x,Hs.y,Hs.z)}this.setAttribute("position",new Yn(p,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}class Qa extends Qn{constructor(e=1,t=1,i=1,a=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:a};const r=e/2,s=t/2,l=Math.floor(i),c=Math.floor(a),o=l+1,d=c+1,h=e/l,u=t/c,p=[],g=[],v=[],_=[];for(let m=0;m<d;m++){const M=m*u-s;for(let R=0;R<o;R++){const E=R*h-r;g.push(E,-M,0),v.push(0,0,1),_.push(R/l),_.push(1-m/c)}}for(let m=0;m<c;m++)for(let M=0;M<l;M++){const R=M+o*m,E=M+o*(m+1),A=M+1+o*(m+1),y=M+1+o*m;p.push(R,E,y),p.push(E,A,y)}this.setIndex(p),this.setAttribute("position",new Yn(g,3)),this.setAttribute("normal",new Yn(v,3)),this.setAttribute("uv",new Yn(_,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Qa(e.width,e.height,e.widthSegments,e.heightSegments)}}function Ar(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const a=n[t][i];if(Yu(a))a.isRenderTargetTexture?(ut("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=a.clone();else if(Array.isArray(a))if(Yu(a[0])){const r=[];for(let s=0,l=a.length;s<l;s++)r[s]=a[s].clone();e[t][i]=r}else e[t][i]=a.slice();else e[t][i]=a}}return e}function Hn(n){const e={};for(let t=0;t<n.length;t++){const i=Ar(n[t]);for(const a in i)e[a]=i[a]}return e}function Yu(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function vp(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Lh(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:It.workingColorSpace}const Ih={clone:Ar,merge:Hn};var Mp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,yp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ri extends Ua{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Mp,this.fragmentShader=yp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ar(e.uniforms),this.uniformsGroups=vp(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const a in this.uniforms){const s=this.uniforms[a].value;s&&s.isTexture?t.uniforms[a]={type:"t",value:s.toJSON(e).uuid}:s&&s.isColor?t.uniforms[a]={type:"c",value:s.getHex()}:s&&s.isVector2?t.uniforms[a]={type:"v2",value:s.toArray()}:s&&s.isVector3?t.uniforms[a]={type:"v3",value:s.toArray()}:s&&s.isVector4?t.uniforms[a]={type:"v4",value:s.toArray()}:s&&s.isMatrix3?t.uniforms[a]={type:"m3",value:s.toArray()}:s&&s.isMatrix4?t.uniforms[a]={type:"m4",value:s.toArray()}:t.uniforms[a]={value:s}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const a in this.extensions)this.extensions[a]===!0&&(i[a]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const i in e.uniforms){const a=e.uniforms[i];switch(this.uniforms[i]={},a.type){case"t":this.uniforms[i].value=t[a.value]||null;break;case"c":this.uniforms[i].value=new At().setHex(a.value);break;case"v2":this.uniforms[i].value=new ot().fromArray(a.value);break;case"v3":this.uniforms[i].value=new B().fromArray(a.value);break;case"v4":this.uniforms[i].value=new rn().fromArray(a.value);break;case"m3":this.uniforms[i].value=new vt().fromArray(a.value);break;case"m4":this.uniforms[i].value=new Qt().fromArray(a.value);break;default:this.uniforms[i].value=a.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class Dh extends Ri{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class io extends Ua{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new At(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new At(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=$o,this.normalScale=new ot(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new oa,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Uh extends Ua{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=lh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Nh extends Ua{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Qc extends Mn{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new At(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class Oh extends Qc{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Mn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new At(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const tc=new Qt,$u=new B,qu=new B;class Sp{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ot(512,512),this.mapType=Zn,this.map=null,this.mapPass=null,this.matrix=new Qt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ml,this._frameExtents=new ot(1,1),this._viewportCount=1,this._viewports=[new rn(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;$u.setFromMatrixPosition(e.matrixWorld),t.position.copy($u),qu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(qu),t.updateMatrixWorld(),tc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(tc,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===Tr||t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(tc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Ws=new B,Xs=new sa,Li=new B;class eu extends Mn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Qt,this.projectionMatrix=new Qt,this.projectionMatrixInverse=new Qt,this.coordinateSystem=Ti,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ws,Xs,Li),Li.x===1&&Li.y===1&&Li.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ws,Xs,Li.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(Ws,Xs,Li),Li.x===1&&Li.y===1&&Li.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ws,Xs,Li.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const va=new B,Ku=new ot,Zu=new ot;class ri extends eu{constructor(e=50,t=1,i=.1,a=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=a,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=xc*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ns*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return xc*2*Math.atan(Math.tan(ns*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){va.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(va.x,va.y).multiplyScalar(-e/va.z),va.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(va.x,va.y).multiplyScalar(-e/va.z)}getViewSize(e,t){return this.getViewBounds(e,Ku,Zu),t.subVectors(Zu,Ku)}setViewOffset(e,t,i,a,r,s){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=a,this.view.width=r,this.view.height=s,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ns*.5*this.fov)/this.zoom,i=2*t,a=this.aspect*i,r=-.5*a;const s=this.view;if(this.view!==null&&this.view.enabled){const c=s.fullWidth,o=s.fullHeight;r+=s.offsetX*a/c,t-=s.offsetY*i/o,a*=s.width/c,i*=s.height/o}const l=this.filmOffset;l!==0&&(r+=e*l/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+a,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class gl extends eu{constructor(e=-1,t=1,i=1,a=-1,r=.1,s=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=a,this.near=r,this.far=s,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,a,r,s){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=a,this.view.width=r,this.view.height=s,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,a=(this.top+this.bottom)/2;let r=i-e,s=i+e,l=a+t,c=a-t;if(this.view!==null&&this.view.enabled){const o=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=o*this.view.offsetX,s=r+o*this.view.width,l-=d*this.view.offsetY,c=l-d*this.view.height}this.projectionMatrix.makeOrthographic(r,s,l,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class bp extends Sp{constructor(){super(new gl(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Fh extends Qc{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Mn.DEFAULT_UP),this.updateMatrix(),this.target=new Mn,this.shadow=new bp}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}const gr=-90,_r=1;class Bh extends Mn{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const a=new ri(gr,_r,e,t);a.layers=this.layers,this.add(a);const r=new ri(gr,_r,e,t);r.layers=this.layers,this.add(r);const s=new ri(gr,_r,e,t);s.layers=this.layers,this.add(s);const l=new ri(gr,_r,e,t);l.layers=this.layers,this.add(l);const c=new ri(gr,_r,e,t);c.layers=this.layers,this.add(c);const o=new ri(gr,_r,e,t);o.layers=this.layers,this.add(o)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,a,r,s,l,c]=t;for(const o of t)this.remove(o);if(e===Ti)i.up.set(0,1,0),i.lookAt(1,0,0),a.up.set(0,1,0),a.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),s.up.set(0,0,1),s.lookAt(0,-1,0),l.up.set(0,1,0),l.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Tr)i.up.set(0,-1,0),i.lookAt(-1,0,0),a.up.set(0,-1,0),a.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),s.up.set(0,0,-1),s.lookAt(0,-1,0),l.up.set(0,-1,0),l.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const o of t)this.add(o),o.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:a}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,s,l,c,o,d]=this.children,h=e.getRenderTarget(),u=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let _=!1;e.isWebGLRenderer===!0?_=e.state.buffers.depth.getReversed():_=e.reversedDepthBuffer,e.setRenderTarget(i,0,a),_&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,a),_&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(i,2,a),_&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(i,3,a),_&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(i,4,a),_&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),i.texture.generateMipmaps=v,e.setRenderTarget(i,5,a),_&&e.autoClear===!1&&e.clearDepth(),e.render(t,d),e.setRenderTarget(h,u,p),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class zh extends ri{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const Ju=new Qt;class kh{constructor(e,t,i=0,a=1/0){this.ray=new ps(e,t),this.near=i,this.far=a,this.camera=null,this.layers=new fl,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Lt("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Ju.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Ju),this}intersectObject(e,t=!0,i=[]){return vc(e,this,i,t),i.sort(ju),i}intersectObjects(e,t=!0,i=[]){for(let a=0,r=e.length;a<r;a++)vc(e[a],this,i,t);return i.sort(ju),i}}function ju(n,e){return n.distance-e.distance}function vc(n,e,t,i){let a=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(a=!1),a===!0&&i===!0){const r=n.children;for(let s=0,l=r.length;s<l;s++)vc(r[s],e,t,!0)}}class Mc{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Pt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(Pt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const du=class du{constructor(e,t,i,a){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,a)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,a){const r=this.elements;return r[0]=e,r[2]=t,r[1]=i,r[3]=a,this}};du.prototype.isMatrix2=!0;let yc=du;class Gh extends Di{constructor(e=10,t=10,i=4473924,a=8947848){i=new At(i),a=new At(a);const r=t/2,s=e/t,l=e/2,c=[],o=[];for(let u=0,p=0,g=-l;u<=t;u++,g+=s){c.push(-l,0,g,l,0,g),c.push(g,0,-l,g,0,l);const v=u===r?i:a;v.toArray(o,p),p+=3,v.toArray(o,p),p+=3,v.toArray(o,p),p+=3,v.toArray(o,p),p+=3}const d=new Qn;d.setAttribute("position",new Yn(c,3)),d.setAttribute("color",new Yn(o,3));const h=new ji({vertexColors:!0,toneMapped:!1});super(d,h),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class Hh extends la{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){ut("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}}function Qu(n,e,t,i){const a=Ep(i);switch(t){case Vc:return n*e;case Xc:return n*e/a.components*a.byteLength;case ol:return n*e/a.components*a.byteLength;case La:return n*e*2/a.components*a.byteLength;case ll:return n*e*2/a.components*a.byteLength;case Wc:return n*e*3/a.components*a.byteLength;case pi:return n*e*4/a.components*a.byteLength;case cl:return n*e*4/a.components*a.byteLength;case jr:case Qr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case es:case ts:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case xo:case Mo:return Math.max(n,16)*Math.max(e,8)/4;case _o:case vo:return Math.max(n,8)*Math.max(e,8)/2;case yo:case So:case Eo:case To:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case bo:case rs:case Ao:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case wo:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Co:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Ro:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Po:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Lo:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Io:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Do:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Uo:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case No:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Oo:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case Fo:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Bo:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case zo:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case ko:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Go:case Ho:case Vo:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Wo:case Xo:return Math.ceil(n/4)*Math.ceil(e/4)*8;case ss:case Yo:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Ep(n){switch(n){case Zn:case zc:return{byteLength:1,components:1};case br:case kc:case Gi:return{byteLength:2,components:1};case rl:case sl:return{byteLength:2,components:4};case Ci:case al:case Ei:return{byteLength:4,components:1};case Gc:case Hc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:il}}));typeof window<"u"&&(window.__THREE__?ut("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=il);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Vh(){let n=null,e=!1,t=null,i=null;function a(r,s){t(r,s),i=n.requestAnimationFrame(a)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(a),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function Tp(n){const e=new WeakMap;function t(l,c){const o=l.array,d=l.usage,h=o.byteLength,u=n.createBuffer();n.bindBuffer(c,u),n.bufferData(c,o,d),l.onUploadCallback();let p;if(o instanceof Float32Array)p=n.FLOAT;else if(typeof Float16Array<"u"&&o instanceof Float16Array)p=n.HALF_FLOAT;else if(o instanceof Uint16Array)l.isFloat16BufferAttribute?p=n.HALF_FLOAT:p=n.UNSIGNED_SHORT;else if(o instanceof Int16Array)p=n.SHORT;else if(o instanceof Uint32Array)p=n.UNSIGNED_INT;else if(o instanceof Int32Array)p=n.INT;else if(o instanceof Int8Array)p=n.BYTE;else if(o instanceof Uint8Array)p=n.UNSIGNED_BYTE;else if(o instanceof Uint8ClampedArray)p=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+o);return{buffer:u,type:p,bytesPerElement:o.BYTES_PER_ELEMENT,version:l.version,size:h}}function i(l,c,o){const d=c.array,h=c.updateRanges;if(n.bindBuffer(o,l),h.length===0)n.bufferSubData(o,0,d);else{h.sort((p,g)=>p.start-g.start);let u=0;for(let p=1;p<h.length;p++){const g=h[u],v=h[p];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++u,h[u]=v)}h.length=u+1;for(let p=0,g=h.length;p<g;p++){const v=h[p];n.bufferSubData(o,v.start*d.BYTES_PER_ELEMENT,d,v.start,v.count)}c.clearUpdateRanges()}c.onUploadCallback()}function a(l){return l.isInterleavedBufferAttribute&&(l=l.data),e.get(l)}function r(l){l.isInterleavedBufferAttribute&&(l=l.data);const c=e.get(l);c&&(n.deleteBuffer(c.buffer),e.delete(l))}function s(l,c){if(l.isInterleavedBufferAttribute&&(l=l.data),l.isGLBufferAttribute){const d=e.get(l);(!d||d.version<l.version)&&e.set(l,{buffer:l.buffer,type:l.type,bytesPerElement:l.elementSize,version:l.version});return}const o=e.get(l);if(o===void 0)e.set(l,t(l,c));else if(o.version<l.version){if(o.size!==l.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(o.buffer,l,c),o.version=l.version}}return{get:a,remove:r,update:s}}var Ap=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,wp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Cp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Rp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Pp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Lp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Ip=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Dp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Up=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Np=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Op=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Fp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Bp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,zp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,kp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Gp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Hp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Vp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Wp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Xp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Yp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,$p=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,qp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Kp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Zp=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Jp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,jp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Qp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,em=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,tm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,nm="gl_FragColor = linearToOutputTexel( gl_FragColor );",im=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,am=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,rm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,sm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,om=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,lm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,cm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,um=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,dm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,hm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,fm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,pm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,mm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,gm=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,_m=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,xm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,vm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Mm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,ym=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Sm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,bm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Em=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Tm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Am=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,wm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Cm=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Rm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Pm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Lm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Im=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Dm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Um=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Nm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Om=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Fm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Bm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,zm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,km=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Gm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Hm=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Vm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Wm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Xm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Ym=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,$m=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,qm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Km=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Zm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Jm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,jm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Qm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,eg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,tg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,ng=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,ig=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,ag=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,rg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,sg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,og=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,lg=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,cg=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,ug=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,dg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,hg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,fg=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,pg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,mg=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,gg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,_g=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,xg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,vg=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Mg=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,yg=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Sg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,bg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Eg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Tg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Ag=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,wg=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Cg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Rg=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Pg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Lg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ig=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Dg=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Ug=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Ng=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Og=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Fg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Bg=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,zg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,kg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Gg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Hg=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Vg=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wg=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Xg=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Yg=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,$g=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,qg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Kg=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Zg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Jg=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jg=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Qg=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,e_=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,t_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,n_=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,i_=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,a_=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,r_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Tt={alphahash_fragment:Ap,alphahash_pars_fragment:wp,alphamap_fragment:Cp,alphamap_pars_fragment:Rp,alphatest_fragment:Pp,alphatest_pars_fragment:Lp,aomap_fragment:Ip,aomap_pars_fragment:Dp,batching_pars_vertex:Up,batching_vertex:Np,begin_vertex:Op,beginnormal_vertex:Fp,bsdfs:Bp,iridescence_fragment:zp,bumpmap_pars_fragment:kp,clipping_planes_fragment:Gp,clipping_planes_pars_fragment:Hp,clipping_planes_pars_vertex:Vp,clipping_planes_vertex:Wp,color_fragment:Xp,color_pars_fragment:Yp,color_pars_vertex:$p,color_vertex:qp,common:Kp,cube_uv_reflection_fragment:Zp,defaultnormal_vertex:Jp,displacementmap_pars_vertex:jp,displacementmap_vertex:Qp,emissivemap_fragment:em,emissivemap_pars_fragment:tm,colorspace_fragment:nm,colorspace_pars_fragment:im,envmap_fragment:am,envmap_common_pars_fragment:rm,envmap_pars_fragment:sm,envmap_pars_vertex:om,envmap_physical_pars_fragment:xm,envmap_vertex:lm,fog_vertex:cm,fog_pars_vertex:um,fog_fragment:dm,fog_pars_fragment:hm,gradientmap_pars_fragment:fm,lightmap_pars_fragment:pm,lights_lambert_fragment:mm,lights_lambert_pars_fragment:gm,lights_pars_begin:_m,lights_toon_fragment:vm,lights_toon_pars_fragment:Mm,lights_phong_fragment:ym,lights_phong_pars_fragment:Sm,lights_physical_fragment:bm,lights_physical_pars_fragment:Em,lights_fragment_begin:Tm,lights_fragment_maps:Am,lights_fragment_end:wm,lightprobes_pars_fragment:Cm,logdepthbuf_fragment:Rm,logdepthbuf_pars_fragment:Pm,logdepthbuf_pars_vertex:Lm,logdepthbuf_vertex:Im,map_fragment:Dm,map_pars_fragment:Um,map_particle_fragment:Nm,map_particle_pars_fragment:Om,metalnessmap_fragment:Fm,metalnessmap_pars_fragment:Bm,morphinstance_vertex:zm,morphcolor_vertex:km,morphnormal_vertex:Gm,morphtarget_pars_vertex:Hm,morphtarget_vertex:Vm,normal_fragment_begin:Wm,normal_fragment_maps:Xm,normal_pars_fragment:Ym,normal_pars_vertex:$m,normal_vertex:qm,normalmap_pars_fragment:Km,clearcoat_normal_fragment_begin:Zm,clearcoat_normal_fragment_maps:Jm,clearcoat_pars_fragment:jm,iridescence_pars_fragment:Qm,opaque_fragment:eg,packing:tg,premultiplied_alpha_fragment:ng,project_vertex:ig,dithering_fragment:ag,dithering_pars_fragment:rg,roughnessmap_fragment:sg,roughnessmap_pars_fragment:og,shadowmap_pars_fragment:lg,shadowmap_pars_vertex:cg,shadowmap_vertex:ug,shadowmask_pars_fragment:dg,skinbase_vertex:hg,skinning_pars_vertex:fg,skinning_vertex:pg,skinnormal_vertex:mg,specularmap_fragment:gg,specularmap_pars_fragment:_g,tonemapping_fragment:xg,tonemapping_pars_fragment:vg,transmission_fragment:Mg,transmission_pars_fragment:yg,uv_pars_fragment:Sg,uv_pars_vertex:bg,uv_vertex:Eg,worldpos_vertex:Tg,background_vert:Ag,background_frag:wg,backgroundCube_vert:Cg,backgroundCube_frag:Rg,cube_vert:Pg,cube_frag:Lg,depth_vert:Ig,depth_frag:Dg,distance_vert:Ug,distance_frag:Ng,equirect_vert:Og,equirect_frag:Fg,linedashed_vert:Bg,linedashed_frag:zg,meshbasic_vert:kg,meshbasic_frag:Gg,meshlambert_vert:Hg,meshlambert_frag:Vg,meshmatcap_vert:Wg,meshmatcap_frag:Xg,meshnormal_vert:Yg,meshnormal_frag:$g,meshphong_vert:qg,meshphong_frag:Kg,meshphysical_vert:Zg,meshphysical_frag:Jg,meshtoon_vert:jg,meshtoon_frag:Qg,points_vert:e_,points_frag:t_,shadow_vert:n_,shadow_frag:i_,sprite_vert:a_,sprite_frag:r_},Fe={common:{diffuse:{value:new At(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new vt},alphaMap:{value:null},alphaMapTransform:{value:new vt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new vt}},envmap:{envMap:{value:null},envMapRotation:{value:new vt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new vt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new vt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new vt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new vt},normalScale:{value:new ot(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new vt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new vt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new vt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new vt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new At(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new B},probesMax:{value:new B},probesResolution:{value:new B}},points:{diffuse:{value:new At(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new vt},alphaTest:{value:0},uvTransform:{value:new vt}},sprite:{diffuse:{value:new At(16777215)},opacity:{value:1},center:{value:new ot(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new vt},alphaMap:{value:null},alphaMapTransform:{value:new vt},alphaTest:{value:0}}},bi={basic:{uniforms:Hn([Fe.common,Fe.specularmap,Fe.envmap,Fe.aomap,Fe.lightmap,Fe.fog]),vertexShader:Tt.meshbasic_vert,fragmentShader:Tt.meshbasic_frag},lambert:{uniforms:Hn([Fe.common,Fe.specularmap,Fe.envmap,Fe.aomap,Fe.lightmap,Fe.emissivemap,Fe.bumpmap,Fe.normalmap,Fe.displacementmap,Fe.fog,Fe.lights,{emissive:{value:new At(0)},envMapIntensity:{value:1}}]),vertexShader:Tt.meshlambert_vert,fragmentShader:Tt.meshlambert_frag},phong:{uniforms:Hn([Fe.common,Fe.specularmap,Fe.envmap,Fe.aomap,Fe.lightmap,Fe.emissivemap,Fe.bumpmap,Fe.normalmap,Fe.displacementmap,Fe.fog,Fe.lights,{emissive:{value:new At(0)},specular:{value:new At(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Tt.meshphong_vert,fragmentShader:Tt.meshphong_frag},standard:{uniforms:Hn([Fe.common,Fe.envmap,Fe.aomap,Fe.lightmap,Fe.emissivemap,Fe.bumpmap,Fe.normalmap,Fe.displacementmap,Fe.roughnessmap,Fe.metalnessmap,Fe.fog,Fe.lights,{emissive:{value:new At(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Tt.meshphysical_vert,fragmentShader:Tt.meshphysical_frag},toon:{uniforms:Hn([Fe.common,Fe.aomap,Fe.lightmap,Fe.emissivemap,Fe.bumpmap,Fe.normalmap,Fe.displacementmap,Fe.gradientmap,Fe.fog,Fe.lights,{emissive:{value:new At(0)}}]),vertexShader:Tt.meshtoon_vert,fragmentShader:Tt.meshtoon_frag},matcap:{uniforms:Hn([Fe.common,Fe.bumpmap,Fe.normalmap,Fe.displacementmap,Fe.fog,{matcap:{value:null}}]),vertexShader:Tt.meshmatcap_vert,fragmentShader:Tt.meshmatcap_frag},points:{uniforms:Hn([Fe.points,Fe.fog]),vertexShader:Tt.points_vert,fragmentShader:Tt.points_frag},dashed:{uniforms:Hn([Fe.common,Fe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Tt.linedashed_vert,fragmentShader:Tt.linedashed_frag},depth:{uniforms:Hn([Fe.common,Fe.displacementmap]),vertexShader:Tt.depth_vert,fragmentShader:Tt.depth_frag},normal:{uniforms:Hn([Fe.common,Fe.bumpmap,Fe.normalmap,Fe.displacementmap,{opacity:{value:1}}]),vertexShader:Tt.meshnormal_vert,fragmentShader:Tt.meshnormal_frag},sprite:{uniforms:Hn([Fe.sprite,Fe.fog]),vertexShader:Tt.sprite_vert,fragmentShader:Tt.sprite_frag},background:{uniforms:{uvTransform:{value:new vt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Tt.background_vert,fragmentShader:Tt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new vt}},vertexShader:Tt.backgroundCube_vert,fragmentShader:Tt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Tt.cube_vert,fragmentShader:Tt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Tt.equirect_vert,fragmentShader:Tt.equirect_frag},distance:{uniforms:Hn([Fe.common,Fe.displacementmap,{referencePosition:{value:new B},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Tt.distance_vert,fragmentShader:Tt.distance_frag},shadow:{uniforms:Hn([Fe.lights,Fe.fog,{color:{value:new At(0)},opacity:{value:1}}]),vertexShader:Tt.shadow_vert,fragmentShader:Tt.shadow_frag}};bi.physical={uniforms:Hn([bi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new vt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new vt},clearcoatNormalScale:{value:new ot(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new vt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new vt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new vt},sheen:{value:0},sheenColor:{value:new At(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new vt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new vt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new vt},transmissionSamplerSize:{value:new ot},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new vt},attenuationDistance:{value:0},attenuationColor:{value:new At(0)},specularColor:{value:new At(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new vt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new vt},anisotropyVector:{value:new ot},anisotropyMap:{value:null},anisotropyMapTransform:{value:new vt}}]),vertexShader:Tt.meshphysical_vert,fragmentShader:Tt.meshphysical_frag};const Ys={r:0,b:0,g:0},s_=new Qt,Wh=new vt;Wh.set(-1,0,0,0,1,0,0,0,1);function o_(n,e,t,i,a,r){const s=new At(0);let l=a===!0?0:1,c,o,d=null,h=0,u=null;function p(M){let R=M.isScene===!0?M.background:null;if(R&&R.isTexture){const E=M.backgroundBlurriness>0;R=e.get(R,E)}return R}function g(M){let R=!1;const E=p(M);E===null?_(s,l):E&&E.isColor&&(_(E,1),R=!0);const A=n.xr.getEnvironmentBlendMode();A==="additive"?t.buffers.color.setClear(0,0,0,1,r):A==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(n.autoClear||R)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function v(M,R){const E=p(R);E&&(E.isCubeTexture||E.mapping===hs)?(o===void 0&&(o=new bn(new ai(1,1,1),new Ri({name:"BackgroundCubeMaterial",uniforms:Ar(bi.backgroundCube.uniforms),vertexShader:bi.backgroundCube.vertexShader,fragmentShader:bi.backgroundCube.fragmentShader,side:Xn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),o.geometry.deleteAttribute("normal"),o.geometry.deleteAttribute("uv"),o.onBeforeRender=function(A,y,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(o.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(o)),o.material.uniforms.envMap.value=E,o.material.uniforms.backgroundBlurriness.value=R.backgroundBlurriness,o.material.uniforms.backgroundIntensity.value=R.backgroundIntensity,o.material.uniforms.backgroundRotation.value.setFromMatrix4(s_.makeRotationFromEuler(R.backgroundRotation)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&o.material.uniforms.backgroundRotation.value.premultiply(Wh),o.material.toneMapped=It.getTransfer(E.colorSpace)!==Vt,(d!==E||h!==E.version||u!==n.toneMapping)&&(o.material.needsUpdate=!0,d=E,h=E.version,u=n.toneMapping),o.layers.enableAll(),M.unshift(o,o.geometry,o.material,0,0,null)):E&&E.isTexture&&(c===void 0&&(c=new bn(new Qa(2,2),new Ri({name:"BackgroundMaterial",uniforms:Ar(bi.background.uniforms),vertexShader:bi.background.vertexShader,fragmentShader:bi.background.fragmentShader,side:ra,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=E,c.material.uniforms.backgroundIntensity.value=R.backgroundIntensity,c.material.toneMapped=It.getTransfer(E.colorSpace)!==Vt,E.matrixAutoUpdate===!0&&E.updateMatrix(),c.material.uniforms.uvTransform.value.copy(E.matrix),(d!==E||h!==E.version||u!==n.toneMapping)&&(c.material.needsUpdate=!0,d=E,h=E.version,u=n.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null))}function _(M,R){M.getRGB(Ys,Lh(n)),t.buffers.color.setClear(Ys.r,Ys.g,Ys.b,R,r)}function m(){o!==void 0&&(o.geometry.dispose(),o.material.dispose(),o=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return s},setClearColor:function(M,R=1){s.set(M),l=R,_(s,l)},getClearAlpha:function(){return l},setClearAlpha:function(M){l=M,_(s,l)},render:g,addToRenderList:v,dispose:m}}function l_(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},a=u(null);let r=a,s=!1;function l(P,L,V,j,I){let X=!1;const k=h(P,j,V,L);r!==k&&(r=k,o(r.object)),X=p(P,j,V,I),X&&g(P,j,V,I),I!==null&&e.update(I,n.ELEMENT_ARRAY_BUFFER),(X||s)&&(s=!1,E(P,L,V,j),I!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(I).buffer))}function c(){return n.createVertexArray()}function o(P){return n.bindVertexArray(P)}function d(P){return n.deleteVertexArray(P)}function h(P,L,V,j){const I=j.wireframe===!0;let X=i[L.id];X===void 0&&(X={},i[L.id]=X);const k=P.isInstancedMesh===!0?P.id:0;let K=X[k];K===void 0&&(K={},X[k]=K);let oe=K[V.id];oe===void 0&&(oe={},K[V.id]=oe);let he=oe[I];return he===void 0&&(he=u(c()),oe[I]=he),he}function u(P){const L=[],V=[],j=[];for(let I=0;I<t;I++)L[I]=0,V[I]=0,j[I]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:V,attributeDivisors:j,object:P,attributes:{},index:null}}function p(P,L,V,j){const I=r.attributes,X=L.attributes;let k=0;const K=V.getAttributes();for(const oe in K)if(K[oe].location>=0){const Ie=I[oe];let ve=X[oe];if(ve===void 0&&(oe==="instanceMatrix"&&P.instanceMatrix&&(ve=P.instanceMatrix),oe==="instanceColor"&&P.instanceColor&&(ve=P.instanceColor)),Ie===void 0||Ie.attribute!==ve||ve&&Ie.data!==ve.data)return!0;k++}return r.attributesNum!==k||r.index!==j}function g(P,L,V,j){const I={},X=L.attributes;let k=0;const K=V.getAttributes();for(const oe in K)if(K[oe].location>=0){let Ie=X[oe];Ie===void 0&&(oe==="instanceMatrix"&&P.instanceMatrix&&(Ie=P.instanceMatrix),oe==="instanceColor"&&P.instanceColor&&(Ie=P.instanceColor));const ve={};ve.attribute=Ie,Ie&&Ie.data&&(ve.data=Ie.data),I[oe]=ve,k++}r.attributes=I,r.attributesNum=k,r.index=j}function v(){const P=r.newAttributes;for(let L=0,V=P.length;L<V;L++)P[L]=0}function _(P){m(P,0)}function m(P,L){const V=r.newAttributes,j=r.enabledAttributes,I=r.attributeDivisors;V[P]=1,j[P]===0&&(n.enableVertexAttribArray(P),j[P]=1),I[P]!==L&&(n.vertexAttribDivisor(P,L),I[P]=L)}function M(){const P=r.newAttributes,L=r.enabledAttributes;for(let V=0,j=L.length;V<j;V++)L[V]!==P[V]&&(n.disableVertexAttribArray(V),L[V]=0)}function R(P,L,V,j,I,X,k){k===!0?n.vertexAttribIPointer(P,L,V,I,X):n.vertexAttribPointer(P,L,V,j,I,X)}function E(P,L,V,j){v();const I=j.attributes,X=V.getAttributes(),k=L.defaultAttributeValues;for(const K in X){const oe=X[K];if(oe.location>=0){let he=I[K];if(he===void 0&&(K==="instanceMatrix"&&P.instanceMatrix&&(he=P.instanceMatrix),K==="instanceColor"&&P.instanceColor&&(he=P.instanceColor)),he!==void 0){const Ie=he.normalized,ve=he.itemSize,_t=e.get(he);if(_t===void 0)continue;const Ft=_t.buffer,Qe=_t.type,ee=_t.bytesPerElement,de=Qe===n.INT||Qe===n.UNSIGNED_INT||he.gpuType===al;if(he.isInterleavedBufferAttribute){const le=he.data,ze=le.stride,it=he.offset;if(le.isInstancedInterleavedBuffer){for(let je=0;je<oe.locationSize;je++)m(oe.location+je,le.meshPerAttribute);P.isInstancedMesh!==!0&&j._maxInstanceCount===void 0&&(j._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let je=0;je<oe.locationSize;je++)_(oe.location+je);n.bindBuffer(n.ARRAY_BUFFER,Ft);for(let je=0;je<oe.locationSize;je++)R(oe.location+je,ve/oe.locationSize,Qe,Ie,ze*ee,(it+ve/oe.locationSize*je)*ee,de)}else{if(he.isInstancedBufferAttribute){for(let le=0;le<oe.locationSize;le++)m(oe.location+le,he.meshPerAttribute);P.isInstancedMesh!==!0&&j._maxInstanceCount===void 0&&(j._maxInstanceCount=he.meshPerAttribute*he.count)}else for(let le=0;le<oe.locationSize;le++)_(oe.location+le);n.bindBuffer(n.ARRAY_BUFFER,Ft);for(let le=0;le<oe.locationSize;le++)R(oe.location+le,ve/oe.locationSize,Qe,Ie,ve*ee,ve/oe.locationSize*le*ee,de)}}else if(k!==void 0){const Ie=k[K];if(Ie!==void 0)switch(Ie.length){case 2:n.vertexAttrib2fv(oe.location,Ie);break;case 3:n.vertexAttrib3fv(oe.location,Ie);break;case 4:n.vertexAttrib4fv(oe.location,Ie);break;default:n.vertexAttrib1fv(oe.location,Ie)}}}}M()}function A(){b();for(const P in i){const L=i[P];for(const V in L){const j=L[V];for(const I in j){const X=j[I];for(const k in X)d(X[k].object),delete X[k];delete j[I]}}delete i[P]}}function y(P){if(i[P.id]===void 0)return;const L=i[P.id];for(const V in L){const j=L[V];for(const I in j){const X=j[I];for(const k in X)d(X[k].object),delete X[k];delete j[I]}}delete i[P.id]}function T(P){for(const L in i){const V=i[L];for(const j in V){const I=V[j];if(I[P.id]===void 0)continue;const X=I[P.id];for(const k in X)d(X[k].object),delete X[k];delete I[P.id]}}}function f(P){for(const L in i){const V=i[L],j=P.isInstancedMesh===!0?P.id:0,I=V[j];if(I!==void 0){for(const X in I){const k=I[X];for(const K in k)d(k[K].object),delete k[K];delete I[X]}delete V[j],Object.keys(V).length===0&&delete i[L]}}}function b(){w(),s=!0,r!==a&&(r=a,o(r.object))}function w(){a.geometry=null,a.program=null,a.wireframe=!1}return{setup:l,reset:b,resetDefaultState:w,dispose:A,releaseStatesOfGeometry:y,releaseStatesOfObject:f,releaseStatesOfProgram:T,initAttributes:v,enableAttribute:_,disableUnusedAttributes:M}}function c_(n,e,t){let i;function a(c){i=c}function r(c,o){n.drawArrays(i,c,o),t.update(o,i,1)}function s(c,o,d){d!==0&&(n.drawArraysInstanced(i,c,o,d),t.update(o,i,d))}function l(c,o,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,o,0,d);let u=0;for(let p=0;p<d;p++)u+=o[p];t.update(u,i,1)}this.setMode=a,this.render=r,this.renderInstances=s,this.renderMultiDraw=l}function u_(n,e,t,i){let a;function r(){if(a!==void 0)return a;if(e.has("EXT_texture_filter_anisotropic")===!0){const T=e.get("EXT_texture_filter_anisotropic");a=n.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else a=0;return a}function s(T){return!(T!==pi&&i.convert(T)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function l(T){const f=T===Gi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(T!==Zn&&i.convert(T)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&T!==Ei&&!f)}function c(T){if(T==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let o=t.precision!==void 0?t.precision:"highp";const d=c(o);d!==o&&(ut("WebGLRenderer:",o,"not supported, using",d,"instead."),o=d);const h=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&ut("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const p=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=n.getParameter(n.MAX_TEXTURE_SIZE),_=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),m=n.getParameter(n.MAX_VERTEX_ATTRIBS),M=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),R=n.getParameter(n.MAX_VARYING_VECTORS),E=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),A=n.getParameter(n.MAX_SAMPLES),y=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:s,textureTypeReadable:l,precision:o,logarithmicDepthBuffer:h,reversedDepthBuffer:u,maxTextures:p,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:_,maxAttributes:m,maxVertexUniforms:M,maxVaryings:R,maxFragmentUniforms:E,maxSamples:A,samples:y}}function d_(n){const e=this;let t=null,i=0,a=!1,r=!1;const s=new Ni,l=new vt,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,u){const p=h.length!==0||u||i!==0||a;return a=u,i=h.length,p},this.beginShadows=function(){r=!0,d(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,u){t=d(h,u,0)},this.setState=function(h,u,p){const g=h.clippingPlanes,v=h.clipIntersection,_=h.clipShadows,m=n.get(h);if(!a||g===null||g.length===0||r&&!_)r?d(null):o();else{const M=r?0:i,R=M*4;let E=m.clippingState||null;c.value=E,E=d(g,u,R,p);for(let A=0;A!==R;++A)E[A]=t[A];m.clippingState=E,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=M}};function o(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function d(h,u,p,g){const v=h!==null?h.length:0;let _=null;if(v!==0){if(_=c.value,g!==!0||_===null){const m=p+v*4,M=u.matrixWorldInverse;l.getNormalMatrix(M),(_===null||_.length<m)&&(_=new Float32Array(m));for(let R=0,E=p;R!==v;++R,E+=4)s.copy(h[R]).applyMatrix4(M,l),s.normal.toArray(_,E),_[E+3]=s.constant}c.value=_,c.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,_}}const Aa=4,ed=[.125,.215,.35,.446,.526,.582],Ha=20,h_=256,Xr=new gl,td=new At;let nc=null,ic=0,ac=0,rc=!1;const f_=new B;class Sc{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,a=100,r={}){const{size:s=256,position:l=f_}=r;nc=this._renderer.getRenderTarget(),ic=this._renderer.getActiveCubeFace(),ac=this._renderer.getActiveMipmapLevel(),rc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(s);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,i,a,c,l),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ad(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=id(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(nc,ic,ac),this._renderer.xr.enabled=rc,e.scissorTest=!1,xr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Pa||e.mapping===Ja?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),nc=this._renderer.getRenderTarget(),ic=this._renderer.getActiveCubeFace(),ac=this._renderer.getActiveMipmapLevel(),rc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:In,minFilter:In,generateMipmaps:!1,type:Gi,format:pi,colorSpace:os,depthBuffer:!1},a=nd(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=nd(e,t,i);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=p_(r)),this._blurMaterial=g_(r,e,t),this._ggxMaterial=m_(r,e,t)}return a}_compileMaterial(e){const t=new bn(new Qn,e);this._renderer.compile(t,Xr)}_sceneToCubeUV(e,t,i,a,r){const c=new ri(90,1,t,i),o=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,p=h.toneMapping;h.getClearColor(td),h.toneMapping=Ai,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(a),h.clearDepth(),h.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new bn(new ai,new Zc({name:"PMREM.Background",side:Xn,depthWrite:!1,depthTest:!1})));const v=this._backgroundBox,_=v.material;let m=!1;const M=e.background;M?M.isColor&&(_.color.copy(M),e.background=null,m=!0):(_.color.copy(td),m=!0);for(let R=0;R<6;R++){const E=R%3;E===0?(c.up.set(0,o[R],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+d[R],r.y,r.z)):E===1?(c.up.set(0,0,o[R]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+d[R],r.z)):(c.up.set(0,o[R],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+d[R]));const A=this._cubeSize;xr(a,E*A,R>2?A:0,A,A),h.setRenderTarget(a),m&&h.render(v,c),h.render(e,c)}h.toneMapping=p,h.autoClear=u,e.background=M}_textureToCubeUV(e,t){const i=this._renderer,a=e.mapping===Pa||e.mapping===Ja;a?(this._cubemapMaterial===null&&(this._cubemapMaterial=ad()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=id());const r=a?this._cubemapMaterial:this._equirectMaterial,s=this._lodMeshes[0];s.material=r;const l=r.uniforms;l.envMap.value=e;const c=this._cubeSize;xr(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(s,Xr)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const a=this._lodMeshes.length;for(let r=1;r<a;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){const a=this._renderer,r=this._pingPongRenderTarget,s=this._ggxMaterial,l=this._lodMeshes[i];l.material=s;const c=s.uniforms,o=i/(this._lodMeshes.length-1),d=t/(this._lodMeshes.length-1),h=Math.sqrt(o*o-d*d),u=0+o*1.25,p=h*u,{_lodMax:g}=this,v=this._sizeLods[i],_=3*v*(i>g-Aa?i-g+Aa:0),m=4*(this._cubeSize-v);c.envMap.value=e.texture,c.roughness.value=p,c.mipInt.value=g-t,xr(r,_,m,3*v,2*v),a.setRenderTarget(r),a.render(l,Xr),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=g-i,xr(e,_,m,3*v,2*v),a.setRenderTarget(e),a.render(l,Xr)}_blur(e,t,i,a,r){const s=this._pingPongRenderTarget;this._halfBlur(e,s,t,i,a,"latitudinal",r),this._halfBlur(s,e,i,i,a,"longitudinal",r)}_halfBlur(e,t,i,a,r,s,l){const c=this._renderer,o=this._blurMaterial;s!=="latitudinal"&&s!=="longitudinal"&&Lt("blur direction must be either latitudinal or longitudinal!");const d=3,h=this._lodMeshes[a];h.material=o;const u=o.uniforms,p=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*Ha-1),v=r/g,_=isFinite(r)?1+Math.floor(d*v):Ha;_>Ha&&ut(`sigmaRadians, ${r}, is too large and will clip, as it requested ${_} samples when the maximum is set to ${Ha}`);const m=[];let M=0;for(let T=0;T<Ha;++T){const f=T/v,b=Math.exp(-f*f/2);m.push(b),T===0?M+=b:T<_&&(M+=2*b)}for(let T=0;T<m.length;T++)m[T]=m[T]/M;u.envMap.value=e.texture,u.samples.value=_,u.weights.value=m,u.latitudinal.value=s==="latitudinal",l&&(u.poleAxis.value=l);const{_lodMax:R}=this;u.dTheta.value=g,u.mipInt.value=R-i;const E=this._sizeLods[a],A=3*E*(a>R-Aa?a-R+Aa:0),y=4*(this._cubeSize-E);xr(t,A,y,3*E,2*E),c.setRenderTarget(t),c.render(h,Xr)}}function p_(n){const e=[],t=[],i=[];let a=n;const r=n-Aa+1+ed.length;for(let s=0;s<r;s++){const l=Math.pow(2,a);e.push(l);let c=1/l;s>n-Aa?c=ed[s-n+Aa-1]:s===0&&(c=0),t.push(c);const o=1/(l-2),d=-o,h=1+o,u=[d,d,h,d,h,h,d,d,h,h,d,h],p=6,g=6,v=3,_=2,m=1,M=new Float32Array(v*g*p),R=new Float32Array(_*g*p),E=new Float32Array(m*g*p);for(let y=0;y<p;y++){const T=y%3*2/3-1,f=y>2?0:-1,b=[T,f,0,T+2/3,f,0,T+2/3,f+1,0,T,f,0,T+2/3,f+1,0,T,f+1,0];M.set(b,v*g*y),R.set(u,_*g*y);const w=[y,y,y,y,y,y];E.set(w,m*g*y)}const A=new Qn;A.setAttribute("position",new mi(M,v)),A.setAttribute("uv",new mi(R,_)),A.setAttribute("faceIndex",new mi(E,m)),i.push(new bn(A,null)),a>Aa&&a--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function nd(n,e,t){const i=new wi(n,e,t);return i.texture.mapping=hs,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function xr(n,e,t,i,a){n.viewport.set(e,t,i,a),n.scissor.set(e,t,i,a)}function m_(n,e,t){return new Ri({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:h_,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:_l(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:ki,depthTest:!1,depthWrite:!1})}function g_(n,e,t){const i=new Float32Array(Ha),a=new B(0,1,0);return new Ri({name:"SphericalGaussianBlur",defines:{n:Ha,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:a}},vertexShader:_l(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:ki,depthTest:!1,depthWrite:!1})}function id(){return new Ri({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:_l(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:ki,depthTest:!1,depthWrite:!1})}function ad(){return new Ri({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:_l(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ki,depthTest:!1,depthWrite:!1})}function _l(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}class tu extends wi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},a=[i,i,i,i,i,i];this.texture=new Jc(a),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},a=new ai(5,5,5),r=new Ri({name:"CubemapFromEquirect",uniforms:Ar(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Xn,blending:ki});r.uniforms.tEquirect.value=t;const s=new bn(a,r),l=t.minFilter;return t.minFilter===ba&&(t.minFilter=In),new Bh(1,10,this).update(e,s),t.minFilter=l,s.geometry.dispose(),s.material.dispose(),this}clear(e,t=!0,i=!0,a=!0){const r=e.getRenderTarget();for(let s=0;s<6;s++)e.setRenderTarget(this,s),e.clear(t,i,a);e.setRenderTarget(r)}}function __(n){let e=new WeakMap,t=new WeakMap,i=null;function a(u,p=!1){return u==null?null:p?s(u):r(u)}function r(u){if(u&&u.isTexture){const p=u.mapping;if(p===Qs||p===eo)if(e.has(u)){const g=e.get(u).texture;return l(g,u.mapping)}else{const g=u.image;if(g&&g.height>0){const v=new tu(g.height);return v.fromEquirectangularTexture(n,u),e.set(u,v),u.addEventListener("dispose",o),l(v.texture,u.mapping)}else return null}}return u}function s(u){if(u&&u.isTexture){const p=u.mapping,g=p===Qs||p===eo,v=p===Pa||p===Ja;if(g||v){let _=t.get(u);const m=_!==void 0?_.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==m)return i===null&&(i=new Sc(n)),_=g?i.fromEquirectangular(u,_):i.fromCubemap(u,_),_.texture.pmremVersion=u.pmremVersion,t.set(u,_),_.texture;if(_!==void 0)return _.texture;{const M=u.image;return g&&M&&M.height>0||v&&M&&c(M)?(i===null&&(i=new Sc(n)),_=g?i.fromEquirectangular(u):i.fromCubemap(u),_.texture.pmremVersion=u.pmremVersion,t.set(u,_),u.addEventListener("dispose",d),_.texture):null}}}return u}function l(u,p){return p===Qs?u.mapping=Pa:p===eo&&(u.mapping=Ja),u}function c(u){let p=0;const g=6;for(let v=0;v<g;v++)u[v]!==void 0&&p++;return p===g}function o(u){const p=u.target;p.removeEventListener("dispose",o);const g=e.get(p);g!==void 0&&(e.delete(p),g.dispose())}function d(u){const p=u.target;p.removeEventListener("dispose",d);const g=t.get(p);g!==void 0&&(t.delete(p),g.dispose())}function h(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:a,dispose:h}}function x_(n){const e={};function t(i){if(e[i]!==void 0)return e[i];const a=n.getExtension(i);return e[i]=a,a}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const a=t(i);return a===null&&$a("WebGLRenderer: "+i+" extension not supported."),a}}}function v_(n,e,t,i){const a={},r=new WeakMap;function s(h){const u=h.target;u.index!==null&&e.remove(u.index);for(const g in u.attributes)e.remove(u.attributes[g]);u.removeEventListener("dispose",s),delete a[u.id];const p=r.get(u);p&&(e.remove(p),r.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function l(h,u){return a[u.id]===!0||(u.addEventListener("dispose",s),a[u.id]=!0,t.memory.geometries++),u}function c(h){const u=h.attributes;for(const p in u)e.update(u[p],n.ARRAY_BUFFER)}function o(h){const u=[],p=h.index,g=h.attributes.position;let v=0;if(g===void 0)return;if(p!==null){const M=p.array;v=p.version;for(let R=0,E=M.length;R<E;R+=3){const A=M[R+0],y=M[R+1],T=M[R+2];u.push(A,y,y,T,T,A)}}else{const M=g.array;v=g.version;for(let R=0,E=M.length/3-1;R<E;R+=3){const A=R+0,y=R+1,T=R+2;u.push(A,y,y,T,T,A)}}const _=new(g.count>=65535?qc:$c)(u,1);_.version=v;const m=r.get(h);m&&e.remove(m),r.set(h,_)}function d(h){const u=r.get(h);if(u){const p=h.index;p!==null&&u.version<p.version&&o(h)}else o(h);return r.get(h)}return{get:l,update:c,getWireframeAttribute:d}}function M_(n,e,t){let i;function a(h){i=h}let r,s;function l(h){r=h.type,s=h.bytesPerElement}function c(h,u){n.drawElements(i,u,r,h*s),t.update(u,i,1)}function o(h,u,p){p!==0&&(n.drawElementsInstanced(i,u,r,h*s,p),t.update(u,i,p))}function d(h,u,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,r,h,0,p);let v=0;for(let _=0;_<p;_++)v+=u[_];t.update(v,i,1)}this.setMode=a,this.setIndex=l,this.render=c,this.renderInstances=o,this.renderMultiDraw=d}function y_(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,s,l){switch(t.calls++,s){case n.TRIANGLES:t.triangles+=l*(r/3);break;case n.LINES:t.lines+=l*(r/2);break;case n.LINE_STRIP:t.lines+=l*(r-1);break;case n.LINE_LOOP:t.lines+=l*r;break;case n.POINTS:t.points+=l*r;break;default:Lt("WebGLInfo: Unknown draw mode:",s);break}}function a(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:a,update:i}}function S_(n,e,t){const i=new WeakMap,a=new rn;function r(s,l,c){const o=s.morphTargetInfluences,d=l.morphAttributes.position||l.morphAttributes.normal||l.morphAttributes.color,h=d!==void 0?d.length:0;let u=i.get(l);if(u===void 0||u.count!==h){let w=function(){f.dispose(),i.delete(l),l.removeEventListener("dispose",w)};var p=w;u!==void 0&&u.texture.dispose();const g=l.morphAttributes.position!==void 0,v=l.morphAttributes.normal!==void 0,_=l.morphAttributes.color!==void 0,m=l.morphAttributes.position||[],M=l.morphAttributes.normal||[],R=l.morphAttributes.color||[];let E=0;g===!0&&(E=1),v===!0&&(E=2),_===!0&&(E=3);let A=l.attributes.position.count*E,y=1;A>e.maxTextureSize&&(y=Math.ceil(A/e.maxTextureSize),A=e.maxTextureSize);const T=new Float32Array(A*y*4*h),f=new Yc(T,A,y,h);f.type=Ei,f.needsUpdate=!0;const b=E*4;for(let P=0;P<h;P++){const L=m[P],V=M[P],j=R[P],I=A*y*4*P;for(let X=0;X<L.count;X++){const k=X*b;g===!0&&(a.fromBufferAttribute(L,X),T[I+k+0]=a.x,T[I+k+1]=a.y,T[I+k+2]=a.z,T[I+k+3]=0),v===!0&&(a.fromBufferAttribute(V,X),T[I+k+4]=a.x,T[I+k+5]=a.y,T[I+k+6]=a.z,T[I+k+7]=0),_===!0&&(a.fromBufferAttribute(j,X),T[I+k+8]=a.x,T[I+k+9]=a.y,T[I+k+10]=a.z,T[I+k+11]=j.itemSize===4?a.w:1)}}u={count:h,texture:f,size:new ot(A,y)},i.set(l,u),l.addEventListener("dispose",w)}if(s.isInstancedMesh===!0&&s.morphTexture!==null)c.getUniforms().setValue(n,"morphTexture",s.morphTexture,t);else{let g=0;for(let _=0;_<o.length;_++)g+=o[_];const v=l.morphTargetsRelative?1:1-g;c.getUniforms().setValue(n,"morphTargetBaseInfluence",v),c.getUniforms().setValue(n,"morphTargetInfluences",o)}c.getUniforms().setValue(n,"morphTargetsTexture",u.texture,t),c.getUniforms().setValue(n,"morphTargetsTextureSize",u.size)}return{update:r}}function b_(n,e,t,i,a){let r=new WeakMap;function s(o){const d=a.render.frame,h=o.geometry,u=e.get(o,h);if(r.get(u)!==d&&(e.update(u),r.set(u,d)),o.isInstancedMesh&&(o.hasEventListener("dispose",c)===!1&&o.addEventListener("dispose",c),r.get(o)!==d&&(t.update(o.instanceMatrix,n.ARRAY_BUFFER),o.instanceColor!==null&&t.update(o.instanceColor,n.ARRAY_BUFFER),r.set(o,d))),o.isSkinnedMesh){const p=o.skeleton;r.get(p)!==d&&(p.update(),r.set(p,d))}return u}function l(){r=new WeakMap}function c(o){const d=o.target;d.removeEventListener("dispose",c),i.releaseStatesOfObject(d),t.remove(d.instanceMatrix),d.instanceColor!==null&&t.remove(d.instanceColor)}return{update:s,dispose:l}}const E_={[Lc]:"LINEAR_TONE_MAPPING",[Ic]:"REINHARD_TONE_MAPPING",[Dc]:"CINEON_TONE_MAPPING",[Uc]:"ACES_FILMIC_TONE_MAPPING",[Oc]:"AGX_TONE_MAPPING",[Fc]:"NEUTRAL_TONE_MAPPING",[Nc]:"CUSTOM_TONE_MAPPING"};function T_(n,e,t,i,a,r){const s=new wi(e,t,{type:n,depthBuffer:a,stencilBuffer:r,samples:i?4:0,depthTexture:a?new ja(e,t):void 0}),l=new wi(e,t,{type:Gi,depthBuffer:!1,stencilBuffer:!1}),c=new Qn;c.setAttribute("position",new Yn([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Yn([0,2,0,0,2,0],2));const o=new Dh({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new bn(c,o),h=new gl(-1,1,1,-1,0,1);let u=null,p=null,g=!1,v,_=null,m=[],M=!1;this.setSize=function(R,E){s.setSize(R,E),l.setSize(R,E);for(let A=0;A<m.length;A++){const y=m[A];y.setSize&&y.setSize(R,E)}},this.setEffects=function(R){m=R,M=m.length>0&&m[0].isRenderPass===!0;const E=s.width,A=s.height;for(let y=0;y<m.length;y++){const T=m[y];T.setSize&&T.setSize(E,A)}},this.begin=function(R,E){if(g||R.toneMapping===Ai&&m.length===0)return!1;if(_=E,E!==null){const A=E.width,y=E.height;(s.width!==A||s.height!==y)&&this.setSize(A,y)}return M===!1&&R.setRenderTarget(s),v=R.toneMapping,R.toneMapping=Ai,!0},this.hasRenderPass=function(){return M},this.end=function(R,E){R.toneMapping=v,g=!0;let A=s,y=l;for(let T=0;T<m.length;T++){const f=m[T];if(f.enabled!==!1&&(f.render(R,y,A,E),f.needsSwap!==!1)){const b=A;A=y,y=b}}if(u!==R.outputColorSpace||p!==R.toneMapping){u=R.outputColorSpace,p=R.toneMapping,o.defines={},It.getTransfer(u)===Vt&&(o.defines.SRGB_TRANSFER="");const T=E_[p];T&&(o.defines[T]=""),o.needsUpdate=!0}o.uniforms.tDiffuse.value=A.texture,R.setRenderTarget(_),R.render(d,h),_=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){s.depthTexture&&s.depthTexture.dispose(),s.dispose(),l.dispose(),c.dispose(),o.dispose()}}const Xh=new Dn,bc=new ja(1,1),Yh=new Yc,$h=new yh,qh=new Jc,rd=[],sd=[],od=new Float32Array(16),ld=new Float32Array(9),cd=new Float32Array(4);function Lr(n,e,t){const i=n[0];if(i<=0||i>0)return n;const a=e*t;let r=rd[a];if(r===void 0&&(r=new Float32Array(a),rd[a]=r),e!==0){i.toArray(r,0);for(let s=1,l=0;s!==e;++s)l+=t,n[s].toArray(r,l)}return r}function En(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Tn(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function xl(n,e){let t=sd[e];t===void 0&&(t=new Int32Array(e),sd[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function A_(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function w_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(En(t,e))return;n.uniform2fv(this.addr,e),Tn(t,e)}}function C_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(En(t,e))return;n.uniform3fv(this.addr,e),Tn(t,e)}}function R_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(En(t,e))return;n.uniform4fv(this.addr,e),Tn(t,e)}}function P_(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(En(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Tn(t,e)}else{if(En(t,i))return;cd.set(i),n.uniformMatrix2fv(this.addr,!1,cd),Tn(t,i)}}function L_(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(En(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Tn(t,e)}else{if(En(t,i))return;ld.set(i),n.uniformMatrix3fv(this.addr,!1,ld),Tn(t,i)}}function I_(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(En(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Tn(t,e)}else{if(En(t,i))return;od.set(i),n.uniformMatrix4fv(this.addr,!1,od),Tn(t,i)}}function D_(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function U_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(En(t,e))return;n.uniform2iv(this.addr,e),Tn(t,e)}}function N_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(En(t,e))return;n.uniform3iv(this.addr,e),Tn(t,e)}}function O_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(En(t,e))return;n.uniform4iv(this.addr,e),Tn(t,e)}}function F_(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function B_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(En(t,e))return;n.uniform2uiv(this.addr,e),Tn(t,e)}}function z_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(En(t,e))return;n.uniform3uiv(this.addr,e),Tn(t,e)}}function k_(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(En(t,e))return;n.uniform4uiv(this.addr,e),Tn(t,e)}}function G_(n,e,t){const i=this.cache,a=t.allocateTextureUnit();i[0]!==a&&(n.uniform1i(this.addr,a),i[0]=a);let r;this.type===n.SAMPLER_2D_SHADOW?(bc.compareFunction=t.isReversedDepthBuffer()?dl:ul,r=bc):r=Xh,t.setTexture2D(e||r,a)}function H_(n,e,t){const i=this.cache,a=t.allocateTextureUnit();i[0]!==a&&(n.uniform1i(this.addr,a),i[0]=a),t.setTexture3D(e||$h,a)}function V_(n,e,t){const i=this.cache,a=t.allocateTextureUnit();i[0]!==a&&(n.uniform1i(this.addr,a),i[0]=a),t.setTextureCube(e||qh,a)}function W_(n,e,t){const i=this.cache,a=t.allocateTextureUnit();i[0]!==a&&(n.uniform1i(this.addr,a),i[0]=a),t.setTexture2DArray(e||Yh,a)}function X_(n){switch(n){case 5126:return A_;case 35664:return w_;case 35665:return C_;case 35666:return R_;case 35674:return P_;case 35675:return L_;case 35676:return I_;case 5124:case 35670:return D_;case 35667:case 35671:return U_;case 35668:case 35672:return N_;case 35669:case 35673:return O_;case 5125:return F_;case 36294:return B_;case 36295:return z_;case 36296:return k_;case 35678:case 36198:case 36298:case 36306:case 35682:return G_;case 35679:case 36299:case 36307:return H_;case 35680:case 36300:case 36308:case 36293:return V_;case 36289:case 36303:case 36311:case 36292:return W_}}function Y_(n,e){n.uniform1fv(this.addr,e)}function $_(n,e){const t=Lr(e,this.size,2);n.uniform2fv(this.addr,t)}function q_(n,e){const t=Lr(e,this.size,3);n.uniform3fv(this.addr,t)}function K_(n,e){const t=Lr(e,this.size,4);n.uniform4fv(this.addr,t)}function Z_(n,e){const t=Lr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function J_(n,e){const t=Lr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function j_(n,e){const t=Lr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function Q_(n,e){n.uniform1iv(this.addr,e)}function e0(n,e){n.uniform2iv(this.addr,e)}function t0(n,e){n.uniform3iv(this.addr,e)}function n0(n,e){n.uniform4iv(this.addr,e)}function i0(n,e){n.uniform1uiv(this.addr,e)}function a0(n,e){n.uniform2uiv(this.addr,e)}function r0(n,e){n.uniform3uiv(this.addr,e)}function s0(n,e){n.uniform4uiv(this.addr,e)}function o0(n,e,t){const i=this.cache,a=e.length,r=xl(t,a);En(i,r)||(n.uniform1iv(this.addr,r),Tn(i,r));let s;this.type===n.SAMPLER_2D_SHADOW?s=bc:s=Xh;for(let l=0;l!==a;++l)t.setTexture2D(e[l]||s,r[l])}function l0(n,e,t){const i=this.cache,a=e.length,r=xl(t,a);En(i,r)||(n.uniform1iv(this.addr,r),Tn(i,r));for(let s=0;s!==a;++s)t.setTexture3D(e[s]||$h,r[s])}function c0(n,e,t){const i=this.cache,a=e.length,r=xl(t,a);En(i,r)||(n.uniform1iv(this.addr,r),Tn(i,r));for(let s=0;s!==a;++s)t.setTextureCube(e[s]||qh,r[s])}function u0(n,e,t){const i=this.cache,a=e.length,r=xl(t,a);En(i,r)||(n.uniform1iv(this.addr,r),Tn(i,r));for(let s=0;s!==a;++s)t.setTexture2DArray(e[s]||Yh,r[s])}function d0(n){switch(n){case 5126:return Y_;case 35664:return $_;case 35665:return q_;case 35666:return K_;case 35674:return Z_;case 35675:return J_;case 35676:return j_;case 5124:case 35670:return Q_;case 35667:case 35671:return e0;case 35668:case 35672:return t0;case 35669:case 35673:return n0;case 5125:return i0;case 36294:return a0;case 36295:return r0;case 36296:return s0;case 35678:case 36198:case 36298:case 36306:case 35682:return o0;case 35679:case 36299:case 36307:return l0;case 35680:case 36300:case 36308:case 36293:return c0;case 36289:case 36303:case 36311:case 36292:return u0}}class h0{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=X_(t.type)}}class f0{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=d0(t.type)}}class p0{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const a=this.seq;for(let r=0,s=a.length;r!==s;++r){const l=a[r];l.setValue(e,t[l.id],i)}}}const sc=/(\w+)(\])?(\[|\.)?/g;function ud(n,e){n.seq.push(e),n.map[e.id]=e}function m0(n,e,t){const i=n.name,a=i.length;for(sc.lastIndex=0;;){const r=sc.exec(i),s=sc.lastIndex;let l=r[1];const c=r[2]==="]",o=r[3];if(c&&(l=l|0),o===void 0||o==="["&&s+2===a){ud(t,o===void 0?new h0(l,n,e):new f0(l,n,e));break}else{let h=t.map[l];h===void 0&&(h=new p0(l),ud(t,h)),t=h}}}class ao{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){const l=e.getActiveUniform(t,s),c=e.getUniformLocation(t,l.name);m0(l,c,this)}const a=[],r=[];for(const s of this.seq)s.type===e.SAMPLER_2D_SHADOW||s.type===e.SAMPLER_CUBE_SHADOW||s.type===e.SAMPLER_2D_ARRAY_SHADOW?a.push(s):r.push(s);a.length>0&&(this.seq=a.concat(r))}setValue(e,t,i,a){const r=this.map[t];r!==void 0&&r.setValue(e,i,a)}setOptional(e,t,i){const a=t[i];a!==void 0&&this.setValue(e,i,a)}static upload(e,t,i,a){for(let r=0,s=t.length;r!==s;++r){const l=t[r],c=i[l.id];c.needsUpdate!==!1&&l.setValue(e,c.value,a)}}static seqWithValue(e,t){const i=[];for(let a=0,r=e.length;a!==r;++a){const s=e[a];s.id in t&&i.push(s)}return i}}function dd(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const g0=37297;let _0=0;function x0(n,e){const t=n.split(`
`),i=[],a=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let s=a;s<r;s++){const l=s+1;i.push(`${l===e?">":" "} ${l}: ${t[s]}`)}return i.join(`
`)}const hd=new vt;function v0(n){It._getMatrix(hd,It.workingColorSpace,n);const e=`mat3( ${hd.elements.map(t=>t.toFixed(4))} )`;switch(It.getTransfer(n)){case ls:return[e,"LinearTransferOETF"];case Vt:return[e,"sRGBTransferOETF"];default:return ut("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function fd(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const l=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+x0(n.getShaderSource(e),l)}else return r}function M0(n,e){const t=v0(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const y0={[Lc]:"Linear",[Ic]:"Reinhard",[Dc]:"Cineon",[Uc]:"ACESFilmic",[Oc]:"AgX",[Fc]:"Neutral",[Nc]:"Custom"};function S0(n,e){const t=y0[e];return t===void 0?(ut("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const $s=new B;function b0(){It.getLuminanceCoefficients($s);const n=$s.x.toFixed(4),e=$s.y.toFixed(4),t=$s.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function E0(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Kr).join(`
`)}function T0(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function A0(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let a=0;a<i;a++){const r=n.getActiveAttrib(e,a),s=r.name;let l=1;r.type===n.FLOAT_MAT2&&(l=2),r.type===n.FLOAT_MAT3&&(l=3),r.type===n.FLOAT_MAT4&&(l=4),t[s]={type:r.type,location:n.getAttribLocation(e,s),locationSize:l}}return t}function Kr(n){return n!==""}function pd(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function md(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const w0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ec(n){return n.replace(w0,R0)}const C0=new Map;function R0(n,e){let t=Tt[e];if(t===void 0){const i=C0.get(e);if(i!==void 0)t=Tt[i],ut('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Ec(t)}const P0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function gd(n){return n.replace(P0,L0)}function L0(n,e,t,i){let a="";for(let r=parseInt(e);r<parseInt(t);r++)a+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return a}function _d(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const I0={[Jr]:"SHADOWMAP_TYPE_PCF",[yr]:"SHADOWMAP_TYPE_VSM"};function D0(n){return I0[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const U0={[Pa]:"ENVMAP_TYPE_CUBE",[Ja]:"ENVMAP_TYPE_CUBE",[hs]:"ENVMAP_TYPE_CUBE_UV"};function N0(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":U0[n.envMapMode]||"ENVMAP_TYPE_CUBE"}const O0={[Ja]:"ENVMAP_MODE_REFRACTION"};function F0(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":O0[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}const B0={[Pc]:"ENVMAP_BLENDING_MULTIPLY",[rh]:"ENVMAP_BLENDING_MIX",[sh]:"ENVMAP_BLENDING_ADD"};function z0(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":B0[n.combine]||"ENVMAP_BLENDING_NONE"}function k0(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:i,maxMip:t}}function G0(n,e,t,i){const a=n.getContext(),r=t.defines;let s=t.vertexShader,l=t.fragmentShader;const c=D0(t),o=N0(t),d=F0(t),h=z0(t),u=k0(t),p=E0(t),g=T0(r),v=a.createProgram();let _,m,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Kr).join(`
`),_.length>0&&(_+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Kr).join(`
`),m.length>0&&(m+=`
`)):(_=[_d(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Kr).join(`
`),m=[_d(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+o:"",t.envMap?"#define "+d:"",t.envMap?"#define "+h:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Ai?"#define TONE_MAPPING":"",t.toneMapping!==Ai?Tt.tonemapping_pars_fragment:"",t.toneMapping!==Ai?S0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Tt.colorspace_pars_fragment,M0("linearToOutputTexel",t.outputColorSpace),b0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Kr).join(`
`)),s=Ec(s),s=pd(s,t),s=md(s,t),l=Ec(l),l=pd(l,t),l=md(l,t),s=gd(s),l=gd(l),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,_=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,m=["#define varying in",t.glslVersion===_c?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===_c?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const R=M+_+s,E=M+m+l,A=dd(a,a.VERTEX_SHADER,R),y=dd(a,a.FRAGMENT_SHADER,E);a.attachShader(v,A),a.attachShader(v,y),t.index0AttributeName!==void 0?a.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&a.bindAttribLocation(v,0,"position"),a.linkProgram(v);function T(P){if(n.debug.checkShaderErrors){const L=a.getProgramInfoLog(v)||"",V=a.getShaderInfoLog(A)||"",j=a.getShaderInfoLog(y)||"",I=L.trim(),X=V.trim(),k=j.trim();let K=!0,oe=!0;if(a.getProgramParameter(v,a.LINK_STATUS)===!1)if(K=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(a,v,A,y);else{const he=fd(a,A,"vertex"),Ie=fd(a,y,"fragment");Lt("WebGLProgram: Shader Error "+a.getError()+" - VALIDATE_STATUS "+a.getProgramParameter(v,a.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+I+`
`+he+`
`+Ie)}else I!==""?ut("WebGLProgram: Program Info Log:",I):(X===""||k==="")&&(oe=!1);oe&&(P.diagnostics={runnable:K,programLog:I,vertexShader:{log:X,prefix:_},fragmentShader:{log:k,prefix:m}})}a.deleteShader(A),a.deleteShader(y),f=new ao(a,v),b=A0(a,v)}let f;this.getUniforms=function(){return f===void 0&&T(this),f};let b;this.getAttributes=function(){return b===void 0&&T(this),b};let w=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return w===!1&&(w=a.getProgramParameter(v,g0)),w},this.destroy=function(){i.releaseStatesOfProgram(this),a.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=_0++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=A,this.fragmentShader=y,this}let H0=0;class V0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){const a=this._getShaderCacheForMaterial(e);return a.has(t)===!1&&(a.add(t),t.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new W0(e),t.set(e,i)),i}}class W0{constructor(e){this.id=H0++,this.code=e,this.usedTimes=0}}function X0(n){return n===La||n===rs||n===ss}function Y0(n,e,t,i,a,r){const s=new fl,l=new V0,c=new Set,o=[],d=new Map,h=i.logarithmicDepthBuffer;let u=i.precision;const p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(f){return c.add(f),f===0?"uv":`uv${f}`}function v(f,b,w,P,L,V){const j=P.fog,I=L.geometry,X=f.isMeshStandardMaterial||f.isMeshLambertMaterial||f.isMeshPhongMaterial?P.environment:null,k=f.isMeshStandardMaterial||f.isMeshLambertMaterial&&!f.envMap||f.isMeshPhongMaterial&&!f.envMap,K=e.get(f.envMap||X,k),oe=K&&K.mapping===hs?K.image.height:null,he=p[f.type];f.precision!==null&&(u=i.getMaxPrecision(f.precision),u!==f.precision&&ut("WebGLProgram.getParameters:",f.precision,"not supported, using",u,"instead."));const Ie=I.morphAttributes.position||I.morphAttributes.normal||I.morphAttributes.color,ve=Ie!==void 0?Ie.length:0;let _t=0;I.morphAttributes.position!==void 0&&(_t=1),I.morphAttributes.normal!==void 0&&(_t=2),I.morphAttributes.color!==void 0&&(_t=3);let Ft,Qe,ee,de;if(he){const We=bi[he];Ft=We.vertexShader,Qe=We.fragmentShader}else{Ft=f.vertexShader,Qe=f.fragmentShader;const We=l.getVertexShaderStage(f),W=l.getFragmentShaderStage(f);l.update(f,We,W),ee=We.id,de=W.id}const le=n.getRenderTarget(),ze=n.state.buffers.depth.getReversed(),it=L.isInstancedMesh===!0,je=L.isBatchedMesh===!0,wt=!!f.map,lt=!!f.matcap,Dt=!!K,Rt=!!f.aoMap,yt=!!f.lightMap,Kt=!!f.bumpMap&&f.wireframe===!1,zt=!!f.normalMap,Et=!!f.displacementMap,Zt=!!f.emissiveMap,Bt=!!f.metalnessMap,Ht=!!f.roughnessMap,U=f.anisotropy>0,sn=f.clearcoat>0,Ut=f.dispersion>0,C=f.iridescence>0,x=f.sheen>0,F=f.transmission>0,N=U&&!!f.anisotropyMap,z=sn&&!!f.clearcoatMap,pe=sn&&!!f.clearcoatNormalMap,se=sn&&!!f.clearcoatRoughnessMap,q=C&&!!f.iridescenceMap,Q=C&&!!f.iridescenceThicknessMap,Ee=x&&!!f.sheenColorMap,De=x&&!!f.sheenRoughnessMap,Te=!!f.specularMap,re=!!f.specularColorMap,Re=!!f.specularIntensityMap,tt=F&&!!f.transmissionMap,Ve=F&&!!f.thicknessMap,D=!!f.gradientMap,Se=!!f.alphaMap,Z=f.alphaTest>0,xe=!!f.alphaHash,Pe=!!f.extensions;let te=Ai;f.toneMapped&&(le===null||le.isXRRenderTarget===!0)&&(te=n.toneMapping);const Be={shaderID:he,shaderType:f.type,shaderName:f.name,vertexShader:Ft,fragmentShader:Qe,defines:f.defines,customVertexShaderID:ee,customFragmentShaderID:de,isRawShaderMaterial:f.isRawShaderMaterial===!0,glslVersion:f.glslVersion,precision:u,batching:je,batchingColor:je&&L._colorsTexture!==null,instancing:it,instancingColor:it&&L.instanceColor!==null,instancingMorph:it&&L.morphTexture!==null,outputColorSpace:le===null?n.outputColorSpace:le.isXRRenderTarget===!0?le.texture.colorSpace:It.workingColorSpace,alphaToCoverage:!!f.alphaToCoverage,map:wt,matcap:lt,envMap:Dt,envMapMode:Dt&&K.mapping,envMapCubeUVHeight:oe,aoMap:Rt,lightMap:yt,bumpMap:Kt,normalMap:zt,displacementMap:Et,emissiveMap:Zt,normalMapObjectSpace:zt&&f.normalMapType===ch,normalMapTangentSpace:zt&&f.normalMapType===$o,packedNormalMap:zt&&f.normalMapType===$o&&X0(f.normalMap.format),metalnessMap:Bt,roughnessMap:Ht,anisotropy:U,anisotropyMap:N,clearcoat:sn,clearcoatMap:z,clearcoatNormalMap:pe,clearcoatRoughnessMap:se,dispersion:Ut,iridescence:C,iridescenceMap:q,iridescenceThicknessMap:Q,sheen:x,sheenColorMap:Ee,sheenRoughnessMap:De,specularMap:Te,specularColorMap:re,specularIntensityMap:Re,transmission:F,transmissionMap:tt,thicknessMap:Ve,gradientMap:D,opaque:f.transparent===!1&&f.blending===Ya&&f.alphaToCoverage===!1,alphaMap:Se,alphaTest:Z,alphaHash:xe,combine:f.combine,mapUv:wt&&g(f.map.channel),aoMapUv:Rt&&g(f.aoMap.channel),lightMapUv:yt&&g(f.lightMap.channel),bumpMapUv:Kt&&g(f.bumpMap.channel),normalMapUv:zt&&g(f.normalMap.channel),displacementMapUv:Et&&g(f.displacementMap.channel),emissiveMapUv:Zt&&g(f.emissiveMap.channel),metalnessMapUv:Bt&&g(f.metalnessMap.channel),roughnessMapUv:Ht&&g(f.roughnessMap.channel),anisotropyMapUv:N&&g(f.anisotropyMap.channel),clearcoatMapUv:z&&g(f.clearcoatMap.channel),clearcoatNormalMapUv:pe&&g(f.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:se&&g(f.clearcoatRoughnessMap.channel),iridescenceMapUv:q&&g(f.iridescenceMap.channel),iridescenceThicknessMapUv:Q&&g(f.iridescenceThicknessMap.channel),sheenColorMapUv:Ee&&g(f.sheenColorMap.channel),sheenRoughnessMapUv:De&&g(f.sheenRoughnessMap.channel),specularMapUv:Te&&g(f.specularMap.channel),specularColorMapUv:re&&g(f.specularColorMap.channel),specularIntensityMapUv:Re&&g(f.specularIntensityMap.channel),transmissionMapUv:tt&&g(f.transmissionMap.channel),thicknessMapUv:Ve&&g(f.thicknessMap.channel),alphaMapUv:Se&&g(f.alphaMap.channel),vertexTangents:!!I.attributes.tangent&&(zt||U),vertexNormals:!!I.attributes.normal,vertexColors:f.vertexColors,vertexAlphas:f.vertexColors===!0&&!!I.attributes.color&&I.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!I.attributes.uv&&(wt||Se),fog:!!j,useFog:f.fog===!0,fogExp2:!!j&&j.isFogExp2,flatShading:f.wireframe===!1&&(f.flatShading===!0||I.attributes.normal===void 0&&zt===!1&&(f.isMeshLambertMaterial||f.isMeshPhongMaterial||f.isMeshStandardMaterial||f.isMeshPhysicalMaterial)),sizeAttenuation:f.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:ze,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:I.attributes.position!==void 0,morphTargets:I.morphAttributes.position!==void 0,morphNormals:I.morphAttributes.normal!==void 0,morphColors:I.morphAttributes.color!==void 0,morphTargetsCount:ve,morphTextureStride:_t,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numLightProbeGrids:V.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:f.dithering,shadowMapEnabled:n.shadowMap.enabled&&w.length>0,shadowMapType:n.shadowMap.type,toneMapping:te,decodeVideoTexture:wt&&f.map.isVideoTexture===!0&&It.getTransfer(f.map.colorSpace)===Vt,decodeVideoTextureEmissive:Zt&&f.emissiveMap.isVideoTexture===!0&&It.getTransfer(f.emissiveMap.colorSpace)===Vt,premultipliedAlpha:f.premultipliedAlpha,doubleSided:f.side===hi,flipSided:f.side===Xn,useDepthPacking:f.depthPacking>=0,depthPacking:f.depthPacking||0,index0AttributeName:f.index0AttributeName,extensionClipCullDistance:Pe&&f.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Pe&&f.extensions.multiDraw===!0||je)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:f.customProgramCacheKey()};return Be.vertexUv1s=c.has(1),Be.vertexUv2s=c.has(2),Be.vertexUv3s=c.has(3),c.clear(),Be}function _(f){const b=[];if(f.shaderID?b.push(f.shaderID):(b.push(f.customVertexShaderID),b.push(f.customFragmentShaderID)),f.defines!==void 0)for(const w in f.defines)b.push(w),b.push(f.defines[w]);return f.isRawShaderMaterial===!1&&(m(b,f),M(b,f),b.push(n.outputColorSpace)),b.push(f.customProgramCacheKey),b.join()}function m(f,b){f.push(b.precision),f.push(b.outputColorSpace),f.push(b.envMapMode),f.push(b.envMapCubeUVHeight),f.push(b.mapUv),f.push(b.alphaMapUv),f.push(b.lightMapUv),f.push(b.aoMapUv),f.push(b.bumpMapUv),f.push(b.normalMapUv),f.push(b.displacementMapUv),f.push(b.emissiveMapUv),f.push(b.metalnessMapUv),f.push(b.roughnessMapUv),f.push(b.anisotropyMapUv),f.push(b.clearcoatMapUv),f.push(b.clearcoatNormalMapUv),f.push(b.clearcoatRoughnessMapUv),f.push(b.iridescenceMapUv),f.push(b.iridescenceThicknessMapUv),f.push(b.sheenColorMapUv),f.push(b.sheenRoughnessMapUv),f.push(b.specularMapUv),f.push(b.specularColorMapUv),f.push(b.specularIntensityMapUv),f.push(b.transmissionMapUv),f.push(b.thicknessMapUv),f.push(b.combine),f.push(b.fogExp2),f.push(b.sizeAttenuation),f.push(b.morphTargetsCount),f.push(b.morphAttributeCount),f.push(b.numDirLights),f.push(b.numPointLights),f.push(b.numSpotLights),f.push(b.numSpotLightMaps),f.push(b.numHemiLights),f.push(b.numRectAreaLights),f.push(b.numDirLightShadows),f.push(b.numPointLightShadows),f.push(b.numSpotLightShadows),f.push(b.numSpotLightShadowsWithMaps),f.push(b.numLightProbes),f.push(b.shadowMapType),f.push(b.toneMapping),f.push(b.numClippingPlanes),f.push(b.numClipIntersection),f.push(b.depthPacking)}function M(f,b){s.disableAll(),b.instancing&&s.enable(0),b.instancingColor&&s.enable(1),b.instancingMorph&&s.enable(2),b.matcap&&s.enable(3),b.envMap&&s.enable(4),b.normalMapObjectSpace&&s.enable(5),b.normalMapTangentSpace&&s.enable(6),b.clearcoat&&s.enable(7),b.iridescence&&s.enable(8),b.alphaTest&&s.enable(9),b.vertexColors&&s.enable(10),b.vertexAlphas&&s.enable(11),b.vertexUv1s&&s.enable(12),b.vertexUv2s&&s.enable(13),b.vertexUv3s&&s.enable(14),b.vertexTangents&&s.enable(15),b.anisotropy&&s.enable(16),b.alphaHash&&s.enable(17),b.batching&&s.enable(18),b.dispersion&&s.enable(19),b.batchingColor&&s.enable(20),b.gradientMap&&s.enable(21),b.packedNormalMap&&s.enable(22),b.vertexNormals&&s.enable(23),f.push(s.mask),s.disableAll(),b.fog&&s.enable(0),b.useFog&&s.enable(1),b.flatShading&&s.enable(2),b.logarithmicDepthBuffer&&s.enable(3),b.reversedDepthBuffer&&s.enable(4),b.skinning&&s.enable(5),b.morphTargets&&s.enable(6),b.morphNormals&&s.enable(7),b.morphColors&&s.enable(8),b.premultipliedAlpha&&s.enable(9),b.shadowMapEnabled&&s.enable(10),b.doubleSided&&s.enable(11),b.flipSided&&s.enable(12),b.useDepthPacking&&s.enable(13),b.dithering&&s.enable(14),b.transmission&&s.enable(15),b.sheen&&s.enable(16),b.opaque&&s.enable(17),b.pointsUvs&&s.enable(18),b.decodeVideoTexture&&s.enable(19),b.decodeVideoTextureEmissive&&s.enable(20),b.alphaToCoverage&&s.enable(21),b.numLightProbeGrids>0&&s.enable(22),b.hasPositionAttribute&&s.enable(23),f.push(s.mask)}function R(f){const b=p[f.type];let w;if(b){const P=bi[b];w=Ih.clone(P.uniforms)}else w=f.uniforms;return w}function E(f,b){let w=d.get(b);return w!==void 0?++w.usedTimes:(w=new G0(n,b,f,a),o.push(w),d.set(b,w)),w}function A(f){if(--f.usedTimes===0){const b=o.indexOf(f);o[b]=o[o.length-1],o.pop(),d.delete(f.cacheKey),f.destroy()}}function y(f){l.remove(f)}function T(){l.dispose()}return{getParameters:v,getProgramCacheKey:_,getUniforms:R,acquireProgram:E,releaseProgram:A,releaseShaderCache:y,programs:o,dispose:T}}function $0(){let n=new WeakMap;function e(s){return n.has(s)}function t(s){let l=n.get(s);return l===void 0&&(l={},n.set(s,l)),l}function i(s){n.delete(s)}function a(s,l,c){n.get(s)[l]=c}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:a,dispose:r}}function q0(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function xd(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function vd(){const n=[];let e=0;const t=[],i=[],a=[];function r(){e=0,t.length=0,i.length=0,a.length=0}function s(u){let p=0;return u.isInstancedMesh&&(p+=2),u.isSkinnedMesh&&(p+=1),p}function l(u,p,g,v,_,m){let M=n[e];return M===void 0?(M={id:u.id,object:u,geometry:p,material:g,materialVariant:s(u),groupOrder:v,renderOrder:u.renderOrder,z:_,group:m},n[e]=M):(M.id=u.id,M.object=u,M.geometry=p,M.material=g,M.materialVariant=s(u),M.groupOrder=v,M.renderOrder=u.renderOrder,M.z=_,M.group=m),e++,M}function c(u,p,g,v,_,m){const M=l(u,p,g,v,_,m);g.transmission>0?i.push(M):g.transparent===!0?a.push(M):t.push(M)}function o(u,p,g,v,_,m){const M=l(u,p,g,v,_,m);g.transmission>0?i.unshift(M):g.transparent===!0?a.unshift(M):t.unshift(M)}function d(u,p,g){t.length>1&&t.sort(u||q0),i.length>1&&i.sort(p||xd),a.length>1&&a.sort(p||xd),g&&(t.reverse(),i.reverse(),a.reverse())}function h(){for(let u=e,p=n.length;u<p;u++){const g=n[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:i,transparent:a,init:r,push:c,unshift:o,finish:h,sort:d}}function K0(){let n=new WeakMap;function e(i,a){const r=n.get(i);let s;return r===void 0?(s=new vd,n.set(i,[s])):a>=r.length?(s=new vd,r.push(s)):s=r[a],s}function t(){n=new WeakMap}return{get:e,dispose:t}}function Z0(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new B,color:new At};break;case"SpotLight":t={position:new B,direction:new B,color:new At,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new B,color:new At,distance:0,decay:0};break;case"HemisphereLight":t={direction:new B,skyColor:new At,groundColor:new At};break;case"RectAreaLight":t={color:new At,position:new B,halfWidth:new B,halfHeight:new B};break}return n[e.id]=t,t}}}function J0(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ot};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ot};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ot,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let j0=0;function Q0(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function ex(n){const e=new Z0,t=J0(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let o=0;o<9;o++)i.probe.push(new B);const a=new B,r=new Qt,s=new Qt;function l(o){let d=0,h=0,u=0;for(let b=0;b<9;b++)i.probe[b].set(0,0,0);let p=0,g=0,v=0,_=0,m=0,M=0,R=0,E=0,A=0,y=0,T=0;o.sort(Q0);for(let b=0,w=o.length;b<w;b++){const P=o[b],L=P.color,V=P.intensity,j=P.distance;let I=null;if(P.shadow&&P.shadow.map&&(P.shadow.map.texture.format===La?I=P.shadow.map.texture:I=P.shadow.map.depthTexture||P.shadow.map.texture),P.isAmbientLight)d+=L.r*V,h+=L.g*V,u+=L.b*V;else if(P.isLightProbe){for(let X=0;X<9;X++)i.probe[X].addScaledVector(P.sh.coefficients[X],V);T++}else if(P.isDirectionalLight){const X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const k=P.shadow,K=t.get(P);K.shadowIntensity=k.intensity,K.shadowBias=k.bias,K.shadowNormalBias=k.normalBias,K.shadowRadius=k.radius,K.shadowMapSize=k.mapSize,i.directionalShadow[p]=K,i.directionalShadowMap[p]=I,i.directionalShadowMatrix[p]=P.shadow.matrix,M++}i.directional[p]=X,p++}else if(P.isSpotLight){const X=e.get(P);X.position.setFromMatrixPosition(P.matrixWorld),X.color.copy(L).multiplyScalar(V),X.distance=j,X.coneCos=Math.cos(P.angle),X.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),X.decay=P.decay,i.spot[v]=X;const k=P.shadow;if(P.map&&(i.spotLightMap[A]=P.map,A++,k.updateMatrices(P),P.castShadow&&y++),i.spotLightMatrix[v]=k.matrix,P.castShadow){const K=t.get(P);K.shadowIntensity=k.intensity,K.shadowBias=k.bias,K.shadowNormalBias=k.normalBias,K.shadowRadius=k.radius,K.shadowMapSize=k.mapSize,i.spotShadow[v]=K,i.spotShadowMap[v]=I,E++}v++}else if(P.isRectAreaLight){const X=e.get(P);X.color.copy(L).multiplyScalar(V),X.halfWidth.set(P.width*.5,0,0),X.halfHeight.set(0,P.height*.5,0),i.rectArea[_]=X,_++}else if(P.isPointLight){const X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),X.distance=P.distance,X.decay=P.decay,P.castShadow){const k=P.shadow,K=t.get(P);K.shadowIntensity=k.intensity,K.shadowBias=k.bias,K.shadowNormalBias=k.normalBias,K.shadowRadius=k.radius,K.shadowMapSize=k.mapSize,K.shadowCameraNear=k.camera.near,K.shadowCameraFar=k.camera.far,i.pointShadow[g]=K,i.pointShadowMap[g]=I,i.pointShadowMatrix[g]=P.shadow.matrix,R++}i.point[g]=X,g++}else if(P.isHemisphereLight){const X=e.get(P);X.skyColor.copy(P.color).multiplyScalar(V),X.groundColor.copy(P.groundColor).multiplyScalar(V),i.hemi[m]=X,m++}}_>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Fe.LTC_FLOAT_1,i.rectAreaLTC2=Fe.LTC_FLOAT_2):(i.rectAreaLTC1=Fe.LTC_HALF_1,i.rectAreaLTC2=Fe.LTC_HALF_2)),i.ambient[0]=d,i.ambient[1]=h,i.ambient[2]=u;const f=i.hash;(f.directionalLength!==p||f.pointLength!==g||f.spotLength!==v||f.rectAreaLength!==_||f.hemiLength!==m||f.numDirectionalShadows!==M||f.numPointShadows!==R||f.numSpotShadows!==E||f.numSpotMaps!==A||f.numLightProbes!==T)&&(i.directional.length=p,i.spot.length=v,i.rectArea.length=_,i.point.length=g,i.hemi.length=m,i.directionalShadow.length=M,i.directionalShadowMap.length=M,i.pointShadow.length=R,i.pointShadowMap.length=R,i.spotShadow.length=E,i.spotShadowMap.length=E,i.directionalShadowMatrix.length=M,i.pointShadowMatrix.length=R,i.spotLightMatrix.length=E+A-y,i.spotLightMap.length=A,i.numSpotLightShadowsWithMaps=y,i.numLightProbes=T,f.directionalLength=p,f.pointLength=g,f.spotLength=v,f.rectAreaLength=_,f.hemiLength=m,f.numDirectionalShadows=M,f.numPointShadows=R,f.numSpotShadows=E,f.numSpotMaps=A,f.numLightProbes=T,i.version=j0++)}function c(o,d){let h=0,u=0,p=0,g=0,v=0;const _=d.matrixWorldInverse;for(let m=0,M=o.length;m<M;m++){const R=o[m];if(R.isDirectionalLight){const E=i.directional[h];E.direction.setFromMatrixPosition(R.matrixWorld),a.setFromMatrixPosition(R.target.matrixWorld),E.direction.sub(a),E.direction.transformDirection(_),h++}else if(R.isSpotLight){const E=i.spot[p];E.position.setFromMatrixPosition(R.matrixWorld),E.position.applyMatrix4(_),E.direction.setFromMatrixPosition(R.matrixWorld),a.setFromMatrixPosition(R.target.matrixWorld),E.direction.sub(a),E.direction.transformDirection(_),p++}else if(R.isRectAreaLight){const E=i.rectArea[g];E.position.setFromMatrixPosition(R.matrixWorld),E.position.applyMatrix4(_),s.identity(),r.copy(R.matrixWorld),r.premultiply(_),s.extractRotation(r),E.halfWidth.set(R.width*.5,0,0),E.halfHeight.set(0,R.height*.5,0),E.halfWidth.applyMatrix4(s),E.halfHeight.applyMatrix4(s),g++}else if(R.isPointLight){const E=i.point[u];E.position.setFromMatrixPosition(R.matrixWorld),E.position.applyMatrix4(_),u++}else if(R.isHemisphereLight){const E=i.hemi[v];E.direction.setFromMatrixPosition(R.matrixWorld),E.direction.transformDirection(_),v++}}}return{setup:l,setupView:c,state:i}}function Md(n){const e=new ex(n),t=[],i=[],a=[];function r(u){h.camera=u,t.length=0,i.length=0,a.length=0}function s(u){t.push(u)}function l(u){i.push(u)}function c(u){a.push(u)}function o(){e.setup(t)}function d(u){e.setupView(t,u)}const h={lightsArray:t,shadowsArray:i,lightProbeGridArray:a,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:o,setupLightsView:d,pushLight:s,pushShadow:l,pushLightProbeGrid:c}}function tx(n){let e=new WeakMap;function t(a,r=0){const s=e.get(a);let l;return s===void 0?(l=new Md(n),e.set(a,[l])):r>=s.length?(l=new Md(n),s.push(l)):l=s[r],l}function i(){e=new WeakMap}return{get:t,dispose:i}}const nx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ix=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,ax=[new B(1,0,0),new B(-1,0,0),new B(0,1,0),new B(0,-1,0),new B(0,0,1),new B(0,0,-1)],rx=[new B(0,-1,0),new B(0,-1,0),new B(0,0,1),new B(0,0,-1),new B(0,-1,0),new B(0,-1,0)],yd=new Qt,Yr=new B,oc=new B;function sx(n,e,t){let i=new ml;const a=new ot,r=new ot,s=new rn,l=new Uh,c=new Nh,o={},d=t.maxTextureSize,h={[ra]:Xn,[Xn]:ra,[hi]:hi},u=new Ri({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ot},radius:{value:4}},vertexShader:nx,fragmentShader:ix}),p=u.clone();p.defines.HORIZONTAL_PASS=1;const g=new Qn;g.setAttribute("position",new mi(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new bn(g,u),_=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Jr;let m=this.type;this.render=function(y,T,f){if(_.enabled===!1||_.autoUpdate===!1&&_.needsUpdate===!1||y.length===0)return;this.type===kd&&(ut("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Jr);const b=n.getRenderTarget(),w=n.getActiveCubeFace(),P=n.getActiveMipmapLevel(),L=n.state;L.setBlending(ki),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);const V=m!==this.type;V&&T.traverse(function(j){j.material&&(Array.isArray(j.material)?j.material.forEach(I=>I.needsUpdate=!0):j.material.needsUpdate=!0)});for(let j=0,I=y.length;j<I;j++){const X=y[j],k=X.shadow;if(k===void 0){ut("WebGLShadowMap:",X,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;a.copy(k.mapSize);const K=k.getFrameExtents();a.multiply(K),r.copy(k.mapSize),(a.x>d||a.y>d)&&(a.x>d&&(r.x=Math.floor(d/K.x),a.x=r.x*K.x,k.mapSize.x=r.x),a.y>d&&(r.y=Math.floor(d/K.y),a.y=r.y*K.y,k.mapSize.y=r.y));const oe=n.state.buffers.depth.getReversed();if(k.camera._reversedDepth=oe,k.map===null||V===!0){if(k.map!==null&&(k.map.depthTexture!==null&&(k.map.depthTexture.dispose(),k.map.depthTexture=null),k.map.dispose()),this.type===yr){if(X.isPointLight){ut("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}k.map=new wi(a.x,a.y,{format:La,type:Gi,minFilter:In,magFilter:In,generateMipmaps:!1}),k.map.texture.name=X.name+".shadowMap",k.map.depthTexture=new ja(a.x,a.y,Ei),k.map.depthTexture.name=X.name+".shadowMapDepth",k.map.depthTexture.format=Hi,k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=wn,k.map.depthTexture.magFilter=wn}else X.isPointLight?(k.map=new tu(a.x),k.map.depthTexture=new Ph(a.x,Ci)):(k.map=new wi(a.x,a.y),k.map.depthTexture=new ja(a.x,a.y,Ci)),k.map.depthTexture.name=X.name+".shadowMap",k.map.depthTexture.format=Hi,this.type===Jr?(k.map.depthTexture.compareFunction=oe?dl:ul,k.map.depthTexture.minFilter=In,k.map.depthTexture.magFilter=In):(k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=wn,k.map.depthTexture.magFilter=wn);k.camera.updateProjectionMatrix()}const he=k.map.isWebGLCubeRenderTarget?6:1;for(let Ie=0;Ie<he;Ie++){if(k.map.isWebGLCubeRenderTarget)n.setRenderTarget(k.map,Ie),n.clear();else{Ie===0&&(n.setRenderTarget(k.map),n.clear());const ve=k.getViewport(Ie);s.set(r.x*ve.x,r.y*ve.y,r.x*ve.z,r.y*ve.w),L.viewport(s)}if(X.isPointLight){const ve=k.camera,_t=k.matrix,Ft=X.distance||ve.far;Ft!==ve.far&&(ve.far=Ft,ve.updateProjectionMatrix()),Yr.setFromMatrixPosition(X.matrixWorld),ve.position.copy(Yr),oc.copy(ve.position),oc.add(ax[Ie]),ve.up.copy(rx[Ie]),ve.lookAt(oc),ve.updateMatrixWorld(),_t.makeTranslation(-Yr.x,-Yr.y,-Yr.z),yd.multiplyMatrices(ve.projectionMatrix,ve.matrixWorldInverse),k._frustum.setFromProjectionMatrix(yd,ve.coordinateSystem,ve.reversedDepth)}else k.updateMatrices(X);i=k.getFrustum(),E(T,f,k.camera,X,this.type)}k.isPointLightShadow!==!0&&this.type===yr&&M(k,f),k.needsUpdate=!1}m=this.type,_.needsUpdate=!1,n.setRenderTarget(b,w,P)};function M(y,T){const f=e.update(v);u.defines.VSM_SAMPLES!==y.blurSamples&&(u.defines.VSM_SAMPLES=y.blurSamples,p.defines.VSM_SAMPLES=y.blurSamples,u.needsUpdate=!0,p.needsUpdate=!0),y.mapPass===null&&(y.mapPass=new wi(a.x,a.y,{format:La,type:Gi})),u.uniforms.shadow_pass.value=y.map.depthTexture,u.uniforms.resolution.value=y.mapSize,u.uniforms.radius.value=y.radius,n.setRenderTarget(y.mapPass),n.clear(),n.renderBufferDirect(T,null,f,u,v,null),p.uniforms.shadow_pass.value=y.mapPass.texture,p.uniforms.resolution.value=y.mapSize,p.uniforms.radius.value=y.radius,n.setRenderTarget(y.map),n.clear(),n.renderBufferDirect(T,null,f,p,v,null)}function R(y,T,f,b){let w=null;const P=f.isPointLight===!0?y.customDistanceMaterial:y.customDepthMaterial;if(P!==void 0)w=P;else if(w=f.isPointLight===!0?c:l,n.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0||T.alphaToCoverage===!0){const L=w.uuid,V=T.uuid;let j=o[L];j===void 0&&(j={},o[L]=j);let I=j[V];I===void 0&&(I=w.clone(),j[V]=I,T.addEventListener("dispose",A)),w=I}if(w.visible=T.visible,w.wireframe=T.wireframe,b===yr?w.side=T.shadowSide!==null?T.shadowSide:T.side:w.side=T.shadowSide!==null?T.shadowSide:h[T.side],w.alphaMap=T.alphaMap,w.alphaTest=T.alphaToCoverage===!0?.5:T.alphaTest,w.map=T.map,w.clipShadows=T.clipShadows,w.clippingPlanes=T.clippingPlanes,w.clipIntersection=T.clipIntersection,w.displacementMap=T.displacementMap,w.displacementScale=T.displacementScale,w.displacementBias=T.displacementBias,w.wireframeLinewidth=T.wireframeLinewidth,w.linewidth=T.linewidth,f.isPointLight===!0&&w.isMeshDistanceMaterial===!0){const L=n.properties.get(w);L.light=f}return w}function E(y,T,f,b,w){if(y.visible===!1)return;if(y.layers.test(T.layers)&&(y.isMesh||y.isLine||y.isPoints)&&(y.castShadow||y.receiveShadow&&w===yr)&&(!y.frustumCulled||i.intersectsObject(y))){y.modelViewMatrix.multiplyMatrices(f.matrixWorldInverse,y.matrixWorld);const V=e.update(y),j=y.material;if(Array.isArray(j)){const I=V.groups;for(let X=0,k=I.length;X<k;X++){const K=I[X],oe=j[K.materialIndex];if(oe&&oe.visible){const he=R(y,oe,b,w);y.onBeforeShadow(n,y,T,f,V,he,K),n.renderBufferDirect(f,null,V,he,y,K),y.onAfterShadow(n,y,T,f,V,he,K)}}}else if(j.visible){const I=R(y,j,b,w);y.onBeforeShadow(n,y,T,f,V,I,null),n.renderBufferDirect(f,null,V,I,y,null),y.onAfterShadow(n,y,T,f,V,I,null)}}const L=y.children;for(let V=0,j=L.length;V<j;V++)E(L[V],T,f,b,w)}function A(y){y.target.removeEventListener("dispose",A);for(const f in o){const b=o[f],w=y.target.uuid;w in b&&(b[w].dispose(),delete b[w])}}}function ox(n,e){function t(){let D=!1;const Se=new rn;let Z=null;const xe=new rn(0,0,0,0);return{setMask:function(Pe){Z!==Pe&&!D&&(n.colorMask(Pe,Pe,Pe,Pe),Z=Pe)},setLocked:function(Pe){D=Pe},setClear:function(Pe,te,Be,We,W){W===!0&&(Pe*=We,te*=We,Be*=We),Se.set(Pe,te,Be,We),xe.equals(Se)===!1&&(n.clearColor(Pe,te,Be,We),xe.copy(Se))},reset:function(){D=!1,Z=null,xe.set(-1,0,0,0)}}}function i(){let D=!1,Se=!1,Z=null,xe=null,Pe=null;return{setReversed:function(te){if(Se!==te){const Be=e.get("EXT_clip_control");te?Be.clipControlEXT(Be.LOWER_LEFT_EXT,Be.ZERO_TO_ONE_EXT):Be.clipControlEXT(Be.LOWER_LEFT_EXT,Be.NEGATIVE_ONE_TO_ONE_EXT),Se=te;const We=Pe;Pe=null,this.setClear(We)}},getReversed:function(){return Se},setTest:function(te){te?le(n.DEPTH_TEST):ze(n.DEPTH_TEST)},setMask:function(te){Z!==te&&!D&&(n.depthMask(te),Z=te)},setFunc:function(te){if(Se&&(te=Qf[te]),xe!==te){switch(te){case oo:n.depthFunc(n.NEVER);break;case lo:n.depthFunc(n.ALWAYS);break;case co:n.depthFunc(n.LESS);break;case Za:n.depthFunc(n.LEQUAL);break;case uo:n.depthFunc(n.EQUAL);break;case ho:n.depthFunc(n.GEQUAL);break;case fo:n.depthFunc(n.GREATER);break;case po:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}xe=te}},setLocked:function(te){D=te},setClear:function(te){Pe!==te&&(Pe=te,Se&&(te=1-te),n.clearDepth(te))},reset:function(){D=!1,Z=null,xe=null,Pe=null,Se=!1}}}function a(){let D=!1,Se=null,Z=null,xe=null,Pe=null,te=null,Be=null,We=null,W=null;return{setTest:function(J){D||(J?le(n.STENCIL_TEST):ze(n.STENCIL_TEST))},setMask:function(J){Se!==J&&!D&&(n.stencilMask(J),Se=J)},setFunc:function(J,Ge,Me){(Z!==J||xe!==Ge||Pe!==Me)&&(n.stencilFunc(J,Ge,Me),Z=J,xe=Ge,Pe=Me)},setOp:function(J,Ge,Me){(te!==J||Be!==Ge||We!==Me)&&(n.stencilOp(J,Ge,Me),te=J,Be=Ge,We=Me)},setLocked:function(J){D=J},setClear:function(J){W!==J&&(n.clearStencil(J),W=J)},reset:function(){D=!1,Se=null,Z=null,xe=null,Pe=null,te=null,Be=null,We=null,W=null}}}const r=new t,s=new i,l=new a,c=new WeakMap,o=new WeakMap;let d={},h={},u={},p=new WeakMap,g=[],v=null,_=!1,m=null,M=null,R=null,E=null,A=null,y=null,T=null,f=new At(0,0,0),b=0,w=!1,P=null,L=null,V=null,j=null,I=null;const X=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let k=!1,K=0;const oe=n.getParameter(n.VERSION);oe.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(oe)[1]),k=K>=1):oe.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(oe)[1]),k=K>=2);let he=null,Ie={};const ve=n.getParameter(n.SCISSOR_BOX),_t=n.getParameter(n.VIEWPORT),Ft=new rn().fromArray(ve),Qe=new rn().fromArray(_t);function ee(D,Se,Z,xe){const Pe=new Uint8Array(4),te=n.createTexture();n.bindTexture(D,te),n.texParameteri(D,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(D,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Be=0;Be<Z;Be++)D===n.TEXTURE_3D||D===n.TEXTURE_2D_ARRAY?n.texImage3D(Se,0,n.RGBA,1,1,xe,0,n.RGBA,n.UNSIGNED_BYTE,Pe):n.texImage2D(Se+Be,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Pe);return te}const de={};de[n.TEXTURE_2D]=ee(n.TEXTURE_2D,n.TEXTURE_2D,1),de[n.TEXTURE_CUBE_MAP]=ee(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),de[n.TEXTURE_2D_ARRAY]=ee(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),de[n.TEXTURE_3D]=ee(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),s.setClear(1),l.setClear(0),le(n.DEPTH_TEST),s.setFunc(Za),Kt(!1),zt(hc),le(n.CULL_FACE),Rt(ki);function le(D){d[D]!==!0&&(n.enable(D),d[D]=!0)}function ze(D){d[D]!==!1&&(n.disable(D),d[D]=!1)}function it(D,Se){return u[D]!==Se?(n.bindFramebuffer(D,Se),u[D]=Se,D===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=Se),D===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=Se),!0):!1}function je(D,Se){let Z=g,xe=!1;if(D){Z=p.get(Se),Z===void 0&&(Z=[],p.set(Se,Z));const Pe=D.textures;if(Z.length!==Pe.length||Z[0]!==n.COLOR_ATTACHMENT0){for(let te=0,Be=Pe.length;te<Be;te++)Z[te]=n.COLOR_ATTACHMENT0+te;Z.length=Pe.length,xe=!0}}else Z[0]!==n.BACK&&(Z[0]=n.BACK,xe=!0);xe&&n.drawBuffers(Z)}function wt(D){return v!==D?(n.useProgram(D),v=D,!0):!1}const lt={[Sa]:n.FUNC_ADD,[Hd]:n.FUNC_SUBTRACT,[Vd]:n.FUNC_REVERSE_SUBTRACT};lt[Wd]=n.MIN,lt[Xd]=n.MAX;const Dt={[Yd]:n.ZERO,[$d]:n.ONE,[qd]:n.SRC_COLOR,[ro]:n.SRC_ALPHA,[eh]:n.SRC_ALPHA_SATURATE,[jd]:n.DST_COLOR,[Zd]:n.DST_ALPHA,[Kd]:n.ONE_MINUS_SRC_COLOR,[so]:n.ONE_MINUS_SRC_ALPHA,[Qd]:n.ONE_MINUS_DST_COLOR,[Jd]:n.ONE_MINUS_DST_ALPHA,[th]:n.CONSTANT_COLOR,[nh]:n.ONE_MINUS_CONSTANT_COLOR,[ih]:n.CONSTANT_ALPHA,[ah]:n.ONE_MINUS_CONSTANT_ALPHA};function Rt(D,Se,Z,xe,Pe,te,Be,We,W,J){if(D===ki){_===!0&&(ze(n.BLEND),_=!1);return}if(_===!1&&(le(n.BLEND),_=!0),D!==Gd){if(D!==m||J!==w){if((M!==Sa||A!==Sa)&&(n.blendEquation(n.FUNC_ADD),M=Sa,A=Sa),J)switch(D){case Ya:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case fc:n.blendFunc(n.ONE,n.ONE);break;case pc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case mc:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Lt("WebGLState: Invalid blending: ",D);break}else switch(D){case Ya:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case fc:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case pc:Lt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case mc:Lt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Lt("WebGLState: Invalid blending: ",D);break}R=null,E=null,y=null,T=null,f.set(0,0,0),b=0,m=D,w=J}return}Pe=Pe||Se,te=te||Z,Be=Be||xe,(Se!==M||Pe!==A)&&(n.blendEquationSeparate(lt[Se],lt[Pe]),M=Se,A=Pe),(Z!==R||xe!==E||te!==y||Be!==T)&&(n.blendFuncSeparate(Dt[Z],Dt[xe],Dt[te],Dt[Be]),R=Z,E=xe,y=te,T=Be),(We.equals(f)===!1||W!==b)&&(n.blendColor(We.r,We.g,We.b,W),f.copy(We),b=W),m=D,w=!1}function yt(D,Se){D.side===hi?ze(n.CULL_FACE):le(n.CULL_FACE);let Z=D.side===Xn;Se&&(Z=!Z),Kt(Z),D.blending===Ya&&D.transparent===!1?Rt(ki):Rt(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),s.setFunc(D.depthFunc),s.setTest(D.depthTest),s.setMask(D.depthWrite),r.setMask(D.colorWrite);const xe=D.stencilWrite;l.setTest(xe),xe&&(l.setMask(D.stencilWriteMask),l.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),l.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),Zt(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?le(n.SAMPLE_ALPHA_TO_COVERAGE):ze(n.SAMPLE_ALPHA_TO_COVERAGE)}function Kt(D){P!==D&&(D?n.frontFace(n.CW):n.frontFace(n.CCW),P=D)}function zt(D){D!==Bd?(le(n.CULL_FACE),D!==L&&(D===hc?n.cullFace(n.BACK):D===zd?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):ze(n.CULL_FACE),L=D}function Et(D){D!==V&&(k&&n.lineWidth(D),V=D)}function Zt(D,Se,Z){D?(le(n.POLYGON_OFFSET_FILL),(j!==Se||I!==Z)&&(j=Se,I=Z,s.getReversed()&&(Se=-Se),n.polygonOffset(Se,Z))):ze(n.POLYGON_OFFSET_FILL)}function Bt(D){D?le(n.SCISSOR_TEST):ze(n.SCISSOR_TEST)}function Ht(D){D===void 0&&(D=n.TEXTURE0+X-1),he!==D&&(n.activeTexture(D),he=D)}function U(D,Se,Z){Z===void 0&&(he===null?Z=n.TEXTURE0+X-1:Z=he);let xe=Ie[Z];xe===void 0&&(xe={type:void 0,texture:void 0},Ie[Z]=xe),(xe.type!==D||xe.texture!==Se)&&(he!==Z&&(n.activeTexture(Z),he=Z),n.bindTexture(D,Se||de[D]),xe.type=D,xe.texture=Se)}function sn(){const D=Ie[he];D!==void 0&&D.type!==void 0&&(n.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function Ut(){try{n.compressedTexImage2D(...arguments)}catch(D){Lt("WebGLState:",D)}}function C(){try{n.compressedTexImage3D(...arguments)}catch(D){Lt("WebGLState:",D)}}function x(){try{n.texSubImage2D(...arguments)}catch(D){Lt("WebGLState:",D)}}function F(){try{n.texSubImage3D(...arguments)}catch(D){Lt("WebGLState:",D)}}function N(){try{n.compressedTexSubImage2D(...arguments)}catch(D){Lt("WebGLState:",D)}}function z(){try{n.compressedTexSubImage3D(...arguments)}catch(D){Lt("WebGLState:",D)}}function pe(){try{n.texStorage2D(...arguments)}catch(D){Lt("WebGLState:",D)}}function se(){try{n.texStorage3D(...arguments)}catch(D){Lt("WebGLState:",D)}}function q(){try{n.texImage2D(...arguments)}catch(D){Lt("WebGLState:",D)}}function Q(){try{n.texImage3D(...arguments)}catch(D){Lt("WebGLState:",D)}}function Ee(D){return h[D]!==void 0?h[D]:n.getParameter(D)}function De(D,Se){h[D]!==Se&&(n.pixelStorei(D,Se),h[D]=Se)}function Te(D){Ft.equals(D)===!1&&(n.scissor(D.x,D.y,D.z,D.w),Ft.copy(D))}function re(D){Qe.equals(D)===!1&&(n.viewport(D.x,D.y,D.z,D.w),Qe.copy(D))}function Re(D,Se){let Z=o.get(Se);Z===void 0&&(Z=new WeakMap,o.set(Se,Z));let xe=Z.get(D);xe===void 0&&(xe=n.getUniformBlockIndex(Se,D.name),Z.set(D,xe))}function tt(D,Se){const xe=o.get(Se).get(D);c.get(Se)!==xe&&(n.uniformBlockBinding(Se,xe,D.__bindingPointIndex),c.set(Se,xe))}function Ve(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),s.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),d={},h={},he=null,Ie={},u={},p=new WeakMap,g=[],v=null,_=!1,m=null,M=null,R=null,E=null,A=null,y=null,T=null,f=new At(0,0,0),b=0,w=!1,P=null,L=null,V=null,j=null,I=null,Ft.set(0,0,n.canvas.width,n.canvas.height),Qe.set(0,0,n.canvas.width,n.canvas.height),r.reset(),s.reset(),l.reset()}return{buffers:{color:r,depth:s,stencil:l},enable:le,disable:ze,bindFramebuffer:it,drawBuffers:je,useProgram:wt,setBlending:Rt,setMaterial:yt,setFlipSided:Kt,setCullFace:zt,setLineWidth:Et,setPolygonOffset:Zt,setScissorTest:Bt,activeTexture:Ht,bindTexture:U,unbindTexture:sn,compressedTexImage2D:Ut,compressedTexImage3D:C,texImage2D:q,texImage3D:Q,pixelStorei:De,getParameter:Ee,updateUBOMapping:Re,uniformBlockBinding:tt,texStorage2D:pe,texStorage3D:se,texSubImage2D:x,texSubImage3D:F,compressedTexSubImage2D:N,compressedTexSubImage3D:z,scissor:Te,viewport:re,reset:Ve}}function lx(n,e,t,i,a,r,s){const l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),o=new ot,d=new WeakMap,h=new Set;let u;const p=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(C,x){return g?new OffscreenCanvas(C,x):Ko("canvas")}function _(C,x,F){let N=1;const z=Ut(C);if((z.width>F||z.height>F)&&(N=F/Math.max(z.width,z.height)),N<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const pe=Math.floor(N*z.width),se=Math.floor(N*z.height);u===void 0&&(u=v(pe,se));const q=x?v(pe,se):u;return q.width=pe,q.height=se,q.getContext("2d").drawImage(C,0,0,pe,se),ut("WebGLRenderer: Texture has been resized from ("+z.width+"x"+z.height+") to ("+pe+"x"+se+")."),q}else return"data"in C&&ut("WebGLRenderer: Image in DataTexture is too big ("+z.width+"x"+z.height+")."),C;return C}function m(C){return C.generateMipmaps}function M(C){n.generateMipmap(C)}function R(C){return C.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?n.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function E(C,x,F,N,z,pe=!1){if(C!==null){if(n[C]!==void 0)return n[C];ut("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let se;N&&(se=e.get("EXT_texture_norm16"),se||ut("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let q=x;if(x===n.RED&&(F===n.FLOAT&&(q=n.R32F),F===n.HALF_FLOAT&&(q=n.R16F),F===n.UNSIGNED_BYTE&&(q=n.R8),F===n.UNSIGNED_SHORT&&se&&(q=se.R16_EXT),F===n.SHORT&&se&&(q=se.R16_SNORM_EXT)),x===n.RED_INTEGER&&(F===n.UNSIGNED_BYTE&&(q=n.R8UI),F===n.UNSIGNED_SHORT&&(q=n.R16UI),F===n.UNSIGNED_INT&&(q=n.R32UI),F===n.BYTE&&(q=n.R8I),F===n.SHORT&&(q=n.R16I),F===n.INT&&(q=n.R32I)),x===n.RG&&(F===n.FLOAT&&(q=n.RG32F),F===n.HALF_FLOAT&&(q=n.RG16F),F===n.UNSIGNED_BYTE&&(q=n.RG8),F===n.UNSIGNED_SHORT&&se&&(q=se.RG16_EXT),F===n.SHORT&&se&&(q=se.RG16_SNORM_EXT)),x===n.RG_INTEGER&&(F===n.UNSIGNED_BYTE&&(q=n.RG8UI),F===n.UNSIGNED_SHORT&&(q=n.RG16UI),F===n.UNSIGNED_INT&&(q=n.RG32UI),F===n.BYTE&&(q=n.RG8I),F===n.SHORT&&(q=n.RG16I),F===n.INT&&(q=n.RG32I)),x===n.RGB_INTEGER&&(F===n.UNSIGNED_BYTE&&(q=n.RGB8UI),F===n.UNSIGNED_SHORT&&(q=n.RGB16UI),F===n.UNSIGNED_INT&&(q=n.RGB32UI),F===n.BYTE&&(q=n.RGB8I),F===n.SHORT&&(q=n.RGB16I),F===n.INT&&(q=n.RGB32I)),x===n.RGBA_INTEGER&&(F===n.UNSIGNED_BYTE&&(q=n.RGBA8UI),F===n.UNSIGNED_SHORT&&(q=n.RGBA16UI),F===n.UNSIGNED_INT&&(q=n.RGBA32UI),F===n.BYTE&&(q=n.RGBA8I),F===n.SHORT&&(q=n.RGBA16I),F===n.INT&&(q=n.RGBA32I)),x===n.RGB&&(F===n.UNSIGNED_SHORT&&se&&(q=se.RGB16_EXT),F===n.SHORT&&se&&(q=se.RGB16_SNORM_EXT),F===n.UNSIGNED_INT_5_9_9_9_REV&&(q=n.RGB9_E5),F===n.UNSIGNED_INT_10F_11F_11F_REV&&(q=n.R11F_G11F_B10F)),x===n.RGBA){const Q=pe?ls:It.getTransfer(z);F===n.FLOAT&&(q=n.RGBA32F),F===n.HALF_FLOAT&&(q=n.RGBA16F),F===n.UNSIGNED_BYTE&&(q=Q===Vt?n.SRGB8_ALPHA8:n.RGBA8),F===n.UNSIGNED_SHORT&&se&&(q=se.RGBA16_EXT),F===n.SHORT&&se&&(q=se.RGBA16_SNORM_EXT),F===n.UNSIGNED_SHORT_4_4_4_4&&(q=n.RGBA4),F===n.UNSIGNED_SHORT_5_5_5_1&&(q=n.RGB5_A1)}return(q===n.R16F||q===n.R32F||q===n.RG16F||q===n.RG32F||q===n.RGBA16F||q===n.RGBA32F)&&e.get("EXT_color_buffer_float"),q}function A(C,x){let F;return C?x===null||x===Ci||x===Er?F=n.DEPTH24_STENCIL8:x===Ei?F=n.DEPTH32F_STENCIL8:x===br&&(F=n.DEPTH24_STENCIL8,ut("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===Ci||x===Er?F=n.DEPTH_COMPONENT24:x===Ei?F=n.DEPTH_COMPONENT32F:x===br&&(F=n.DEPTH_COMPONENT16),F}function y(C,x){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==wn&&C.minFilter!==In?Math.log2(Math.max(x.width,x.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?x.mipmaps.length:1}function T(C){const x=C.target;x.removeEventListener("dispose",T),b(x),x.isVideoTexture&&d.delete(x),x.isHTMLTexture&&h.delete(x)}function f(C){const x=C.target;x.removeEventListener("dispose",f),P(x)}function b(C){const x=i.get(C);if(x.__webglInit===void 0)return;const F=C.source,N=p.get(F);if(N){const z=N[x.__cacheKey];z.usedTimes--,z.usedTimes===0&&w(C),Object.keys(N).length===0&&p.delete(F)}i.remove(C)}function w(C){const x=i.get(C);n.deleteTexture(x.__webglTexture);const F=C.source,N=p.get(F);delete N[x.__cacheKey],s.memory.textures--}function P(C){const x=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let N=0;N<6;N++){if(Array.isArray(x.__webglFramebuffer[N]))for(let z=0;z<x.__webglFramebuffer[N].length;z++)n.deleteFramebuffer(x.__webglFramebuffer[N][z]);else n.deleteFramebuffer(x.__webglFramebuffer[N]);x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer[N])}else{if(Array.isArray(x.__webglFramebuffer))for(let N=0;N<x.__webglFramebuffer.length;N++)n.deleteFramebuffer(x.__webglFramebuffer[N]);else n.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&n.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let N=0;N<x.__webglColorRenderbuffer.length;N++)x.__webglColorRenderbuffer[N]&&n.deleteRenderbuffer(x.__webglColorRenderbuffer[N]);x.__webglDepthRenderbuffer&&n.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const F=C.textures;for(let N=0,z=F.length;N<z;N++){const pe=i.get(F[N]);pe.__webglTexture&&(n.deleteTexture(pe.__webglTexture),s.memory.textures--),i.remove(F[N])}i.remove(C)}let L=0;function V(){L=0}function j(){return L}function I(C){L=C}function X(){const C=L;return C>=a.maxTextures&&ut("WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+a.maxTextures),L+=1,C}function k(C){const x=[];return x.push(C.wrapS),x.push(C.wrapT),x.push(C.wrapR||0),x.push(C.magFilter),x.push(C.minFilter),x.push(C.anisotropy),x.push(C.internalFormat),x.push(C.format),x.push(C.type),x.push(C.generateMipmaps),x.push(C.premultiplyAlpha),x.push(C.flipY),x.push(C.unpackAlignment),x.push(C.colorSpace),x.join()}function K(C,x){const F=i.get(C);if(C.isVideoTexture&&U(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&F.__version!==C.version){const N=C.image;if(N===null)ut("WebGLRenderer: Texture marked for update but no image data found.");else if(N.complete===!1)ut("WebGLRenderer: Texture marked for update but image is incomplete");else{ze(F,C,x);return}}else C.isExternalTexture&&(F.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,F.__webglTexture,n.TEXTURE0+x)}function oe(C,x){const F=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&F.__version!==C.version){ze(F,C,x);return}else C.isExternalTexture&&(F.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,F.__webglTexture,n.TEXTURE0+x)}function he(C,x){const F=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&F.__version!==C.version){ze(F,C,x);return}t.bindTexture(n.TEXTURE_3D,F.__webglTexture,n.TEXTURE0+x)}function Ie(C,x){const F=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&F.__version!==C.version){it(F,C,x);return}t.bindTexture(n.TEXTURE_CUBE_MAP,F.__webglTexture,n.TEXTURE0+x)}const ve={[mo]:n.REPEAT,[Fi]:n.CLAMP_TO_EDGE,[go]:n.MIRRORED_REPEAT},_t={[wn]:n.NEAREST,[oh]:n.NEAREST_MIPMAP_NEAREST,[qr]:n.NEAREST_MIPMAP_LINEAR,[In]:n.LINEAR,[to]:n.LINEAR_MIPMAP_NEAREST,[ba]:n.LINEAR_MIPMAP_LINEAR},Ft={[uh]:n.NEVER,[mh]:n.ALWAYS,[dh]:n.LESS,[ul]:n.LEQUAL,[hh]:n.EQUAL,[dl]:n.GEQUAL,[fh]:n.GREATER,[ph]:n.NOTEQUAL};function Qe(C,x){if(x.type===Ei&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===In||x.magFilter===to||x.magFilter===qr||x.magFilter===ba||x.minFilter===In||x.minFilter===to||x.minFilter===qr||x.minFilter===ba)&&ut("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(C,n.TEXTURE_WRAP_S,ve[x.wrapS]),n.texParameteri(C,n.TEXTURE_WRAP_T,ve[x.wrapT]),(C===n.TEXTURE_3D||C===n.TEXTURE_2D_ARRAY)&&n.texParameteri(C,n.TEXTURE_WRAP_R,ve[x.wrapR]),n.texParameteri(C,n.TEXTURE_MAG_FILTER,_t[x.magFilter]),n.texParameteri(C,n.TEXTURE_MIN_FILTER,_t[x.minFilter]),x.compareFunction&&(n.texParameteri(C,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(C,n.TEXTURE_COMPARE_FUNC,Ft[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===wn||x.minFilter!==qr&&x.minFilter!==ba||x.type===Ei&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||i.get(x).__currentAnisotropy){const F=e.get("EXT_texture_filter_anisotropic");n.texParameterf(C,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,a.getMaxAnisotropy())),i.get(x).__currentAnisotropy=x.anisotropy}}}function ee(C,x){let F=!1;C.__webglInit===void 0&&(C.__webglInit=!0,x.addEventListener("dispose",T));const N=x.source;let z=p.get(N);z===void 0&&(z={},p.set(N,z));const pe=k(x);if(pe!==C.__cacheKey){z[pe]===void 0&&(z[pe]={texture:n.createTexture(),usedTimes:0},s.memory.textures++,F=!0),z[pe].usedTimes++;const se=z[C.__cacheKey];se!==void 0&&(z[C.__cacheKey].usedTimes--,se.usedTimes===0&&w(x)),C.__cacheKey=pe,C.__webglTexture=z[pe].texture}return F}function de(C,x,F){return Math.floor(Math.floor(C/F)/x)}function le(C,x,F,N){const pe=C.updateRanges;if(pe.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,x.width,x.height,F,N,x.data);else{pe.sort((De,Te)=>De.start-Te.start);let se=0;for(let De=1;De<pe.length;De++){const Te=pe[se],re=pe[De],Re=Te.start+Te.count,tt=de(re.start,x.width,4),Ve=de(Te.start,x.width,4);re.start<=Re+1&&tt===Ve&&de(re.start+re.count-1,x.width,4)===tt?Te.count=Math.max(Te.count,re.start+re.count-Te.start):(++se,pe[se]=re)}pe.length=se+1;const q=t.getParameter(n.UNPACK_ROW_LENGTH),Q=t.getParameter(n.UNPACK_SKIP_PIXELS),Ee=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,x.width);for(let De=0,Te=pe.length;De<Te;De++){const re=pe[De],Re=Math.floor(re.start/4),tt=Math.ceil(re.count/4),Ve=Re%x.width,D=Math.floor(Re/x.width),Se=tt,Z=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,Ve),t.pixelStorei(n.UNPACK_SKIP_ROWS,D),t.texSubImage2D(n.TEXTURE_2D,0,Ve,D,Se,Z,F,N,x.data)}C.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,q),t.pixelStorei(n.UNPACK_SKIP_PIXELS,Q),t.pixelStorei(n.UNPACK_SKIP_ROWS,Ee)}}function ze(C,x,F){let N=n.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(N=n.TEXTURE_2D_ARRAY),x.isData3DTexture&&(N=n.TEXTURE_3D);const z=ee(C,x),pe=x.source;t.bindTexture(N,C.__webglTexture,n.TEXTURE0+F);const se=i.get(pe);if(pe.version!==se.__version||z===!0){if(t.activeTexture(n.TEXTURE0+F),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){const Z=It.getPrimaries(It.workingColorSpace),xe=x.colorSpace===Qi?null:It.getPrimaries(x.colorSpace),Pe=x.colorSpace===Qi||Z===xe?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Pe)}t.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment);let Q=_(x.image,!1,a.maxTextureSize);Q=sn(x,Q);const Ee=r.convert(x.format,x.colorSpace),De=r.convert(x.type);let Te=E(x.internalFormat,Ee,De,x.normalized,x.colorSpace,x.isVideoTexture);Qe(N,x);let re;const Re=x.mipmaps,tt=x.isVideoTexture!==!0,Ve=se.__version===void 0||z===!0,D=pe.dataReady,Se=y(x,Q);if(x.isDepthTexture)Te=A(x.format===Ea,x.type),Ve&&(tt?t.texStorage2D(n.TEXTURE_2D,1,Te,Q.width,Q.height):t.texImage2D(n.TEXTURE_2D,0,Te,Q.width,Q.height,0,Ee,De,null));else if(x.isDataTexture)if(Re.length>0){tt&&Ve&&t.texStorage2D(n.TEXTURE_2D,Se,Te,Re[0].width,Re[0].height);for(let Z=0,xe=Re.length;Z<xe;Z++)re=Re[Z],tt?D&&t.texSubImage2D(n.TEXTURE_2D,Z,0,0,re.width,re.height,Ee,De,re.data):t.texImage2D(n.TEXTURE_2D,Z,Te,re.width,re.height,0,Ee,De,re.data);x.generateMipmaps=!1}else tt?(Ve&&t.texStorage2D(n.TEXTURE_2D,Se,Te,Q.width,Q.height),D&&le(x,Q,Ee,De)):t.texImage2D(n.TEXTURE_2D,0,Te,Q.width,Q.height,0,Ee,De,Q.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){tt&&Ve&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Se,Te,Re[0].width,Re[0].height,Q.depth);for(let Z=0,xe=Re.length;Z<xe;Z++)if(re=Re[Z],x.format!==pi)if(Ee!==null)if(tt){if(D)if(x.layerUpdates.size>0){const Pe=Qu(re.width,re.height,x.format,x.type);for(const te of x.layerUpdates){const Be=re.data.subarray(te*Pe/re.data.BYTES_PER_ELEMENT,(te+1)*Pe/re.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Z,0,0,te,re.width,re.height,1,Ee,Be)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Z,0,0,0,re.width,re.height,Q.depth,Ee,re.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,Z,Te,re.width,re.height,Q.depth,0,re.data,0,0);else ut("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else tt?D&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,Z,0,0,0,re.width,re.height,Q.depth,Ee,De,re.data):t.texImage3D(n.TEXTURE_2D_ARRAY,Z,Te,re.width,re.height,Q.depth,0,Ee,De,re.data)}else{tt&&Ve&&t.texStorage2D(n.TEXTURE_2D,Se,Te,Re[0].width,Re[0].height);for(let Z=0,xe=Re.length;Z<xe;Z++)re=Re[Z],x.format!==pi?Ee!==null?tt?D&&t.compressedTexSubImage2D(n.TEXTURE_2D,Z,0,0,re.width,re.height,Ee,re.data):t.compressedTexImage2D(n.TEXTURE_2D,Z,Te,re.width,re.height,0,re.data):ut("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):tt?D&&t.texSubImage2D(n.TEXTURE_2D,Z,0,0,re.width,re.height,Ee,De,re.data):t.texImage2D(n.TEXTURE_2D,Z,Te,re.width,re.height,0,Ee,De,re.data)}else if(x.isDataArrayTexture)if(tt){if(Ve&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Se,Te,Q.width,Q.height,Q.depth),D)if(x.layerUpdates.size>0){const Z=Qu(Q.width,Q.height,x.format,x.type);for(const xe of x.layerUpdates){const Pe=Q.data.subarray(xe*Z/Q.data.BYTES_PER_ELEMENT,(xe+1)*Z/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,xe,Q.width,Q.height,1,Ee,De,Pe)}x.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,Ee,De,Q.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Te,Q.width,Q.height,Q.depth,0,Ee,De,Q.data);else if(x.isData3DTexture)tt?(Ve&&t.texStorage3D(n.TEXTURE_3D,Se,Te,Q.width,Q.height,Q.depth),D&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,Ee,De,Q.data)):t.texImage3D(n.TEXTURE_3D,0,Te,Q.width,Q.height,Q.depth,0,Ee,De,Q.data);else if(x.isFramebufferTexture){if(Ve)if(tt)t.texStorage2D(n.TEXTURE_2D,Se,Te,Q.width,Q.height);else{let Z=Q.width,xe=Q.height;for(let Pe=0;Pe<Se;Pe++)t.texImage2D(n.TEXTURE_2D,Pe,Te,Z,xe,0,Ee,De,null),Z>>=1,xe>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in n){const Z=n.canvas;if(Z.hasAttribute("layoutsubtree")||Z.setAttribute("layoutsubtree","true"),Q.parentNode!==Z){Z.appendChild(Q),h.add(x),Z.onpaint=xe=>{const Pe=xe.changedElements;for(const te of h)Pe.includes(te.image)&&(te.needsUpdate=!0)},Z.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,Q);else{const Pe=n.RGBA,te=n.RGBA,Be=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,Pe,te,Be,Q)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(Re.length>0){if(tt&&Ve){const Z=Ut(Re[0]);t.texStorage2D(n.TEXTURE_2D,Se,Te,Z.width,Z.height)}for(let Z=0,xe=Re.length;Z<xe;Z++)re=Re[Z],tt?D&&t.texSubImage2D(n.TEXTURE_2D,Z,0,0,Ee,De,re):t.texImage2D(n.TEXTURE_2D,Z,Te,Ee,De,re);x.generateMipmaps=!1}else if(tt){if(Ve){const Z=Ut(Q);t.texStorage2D(n.TEXTURE_2D,Se,Te,Z.width,Z.height)}D&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,Ee,De,Q)}else t.texImage2D(n.TEXTURE_2D,0,Te,Ee,De,Q);m(x)&&M(N),se.__version=pe.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function it(C,x,F){if(x.image.length!==6)return;const N=ee(C,x),z=x.source;t.bindTexture(n.TEXTURE_CUBE_MAP,C.__webglTexture,n.TEXTURE0+F);const pe=i.get(z);if(z.version!==pe.__version||N===!0){t.activeTexture(n.TEXTURE0+F);const se=It.getPrimaries(It.workingColorSpace),q=x.colorSpace===Qi?null:It.getPrimaries(x.colorSpace),Q=x.colorSpace===Qi||se===q?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Q);const Ee=x.isCompressedTexture||x.image[0].isCompressedTexture,De=x.image[0]&&x.image[0].isDataTexture,Te=[];for(let te=0;te<6;te++)!Ee&&!De?Te[te]=_(x.image[te],!0,a.maxCubemapSize):Te[te]=De?x.image[te].image:x.image[te],Te[te]=sn(x,Te[te]);const re=Te[0],Re=r.convert(x.format,x.colorSpace),tt=r.convert(x.type),Ve=E(x.internalFormat,Re,tt,x.normalized,x.colorSpace),D=x.isVideoTexture!==!0,Se=pe.__version===void 0||N===!0,Z=z.dataReady;let xe=y(x,re);Qe(n.TEXTURE_CUBE_MAP,x);let Pe;if(Ee){D&&Se&&t.texStorage2D(n.TEXTURE_CUBE_MAP,xe,Ve,re.width,re.height);for(let te=0;te<6;te++){Pe=Te[te].mipmaps;for(let Be=0;Be<Pe.length;Be++){const We=Pe[Be];x.format!==pi?Re!==null?D?Z&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,Be,0,0,We.width,We.height,Re,We.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,Be,Ve,We.width,We.height,0,We.data):ut("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?Z&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,Be,0,0,We.width,We.height,Re,tt,We.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,Be,Ve,We.width,We.height,0,Re,tt,We.data)}}}else{if(Pe=x.mipmaps,D&&Se){Pe.length>0&&xe++;const te=Ut(Te[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,xe,Ve,te.width,te.height)}for(let te=0;te<6;te++)if(De){D?Z&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,0,0,Te[te].width,Te[te].height,Re,tt,Te[te].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,Ve,Te[te].width,Te[te].height,0,Re,tt,Te[te].data);for(let Be=0;Be<Pe.length;Be++){const W=Pe[Be].image[te].image;D?Z&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,Be+1,0,0,W.width,W.height,Re,tt,W.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,Be+1,Ve,W.width,W.height,0,Re,tt,W.data)}}else{D?Z&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,0,0,Re,tt,Te[te]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,Ve,Re,tt,Te[te]);for(let Be=0;Be<Pe.length;Be++){const We=Pe[Be];D?Z&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,Be+1,0,0,Re,tt,We.image[te]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,Be+1,Ve,Re,tt,We.image[te])}}}m(x)&&M(n.TEXTURE_CUBE_MAP),pe.__version=z.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function je(C,x,F,N,z,pe){const se=r.convert(F.format,F.colorSpace),q=r.convert(F.type),Q=E(F.internalFormat,se,q,F.normalized,F.colorSpace),Ee=i.get(x),De=i.get(F);if(De.__renderTarget=x,!Ee.__hasExternalTextures){const Te=Math.max(1,x.width>>pe),re=Math.max(1,x.height>>pe);z===n.TEXTURE_3D||z===n.TEXTURE_2D_ARRAY?t.texImage3D(z,pe,Q,Te,re,x.depth,0,se,q,null):t.texImage2D(z,pe,Q,Te,re,0,se,q,null)}t.bindFramebuffer(n.FRAMEBUFFER,C),Ht(x)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,N,z,De.__webglTexture,0,Bt(x)):(z===n.TEXTURE_2D||z>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&z<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,N,z,De.__webglTexture,pe),t.bindFramebuffer(n.FRAMEBUFFER,null)}function wt(C,x,F){if(n.bindRenderbuffer(n.RENDERBUFFER,C),x.depthBuffer){const N=x.depthTexture,z=N&&N.isDepthTexture?N.type:null,pe=A(x.stencilBuffer,z),se=x.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;Ht(x)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Bt(x),pe,x.width,x.height):F?n.renderbufferStorageMultisample(n.RENDERBUFFER,Bt(x),pe,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,pe,x.width,x.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,se,n.RENDERBUFFER,C)}else{const N=x.textures;for(let z=0;z<N.length;z++){const pe=N[z],se=r.convert(pe.format,pe.colorSpace),q=r.convert(pe.type),Q=E(pe.internalFormat,se,q,pe.normalized,pe.colorSpace);Ht(x)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Bt(x),Q,x.width,x.height):F?n.renderbufferStorageMultisample(n.RENDERBUFFER,Bt(x),Q,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,Q,x.width,x.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function lt(C,x,F){const N=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,C),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const z=i.get(x.depthTexture);if(z.__renderTarget=x,(!z.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),N){if(z.__webglInit===void 0&&(z.__webglInit=!0,x.depthTexture.addEventListener("dispose",T)),z.__webglTexture===void 0){z.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,z.__webglTexture),Qe(n.TEXTURE_CUBE_MAP,x.depthTexture);const Ee=r.convert(x.depthTexture.format),De=r.convert(x.depthTexture.type);let Te;x.depthTexture.format===Hi?Te=n.DEPTH_COMPONENT24:x.depthTexture.format===Ea&&(Te=n.DEPTH24_STENCIL8);for(let re=0;re<6;re++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,Te,x.width,x.height,0,Ee,De,null)}}else K(x.depthTexture,0);const pe=z.__webglTexture,se=Bt(x),q=N?n.TEXTURE_CUBE_MAP_POSITIVE_X+F:n.TEXTURE_2D,Q=x.depthTexture.format===Ea?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(x.depthTexture.format===Hi)Ht(x)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Q,q,pe,0,se):n.framebufferTexture2D(n.FRAMEBUFFER,Q,q,pe,0);else if(x.depthTexture.format===Ea)Ht(x)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Q,q,pe,0,se):n.framebufferTexture2D(n.FRAMEBUFFER,Q,q,pe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Dt(C){const x=i.get(C),F=C.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==C.depthTexture){const N=C.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),N){const z=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,N.removeEventListener("dispose",z)};N.addEventListener("dispose",z),x.__depthDisposeCallback=z}x.__boundDepthTexture=N}if(C.depthTexture&&!x.__autoAllocateDepthBuffer)if(F)for(let N=0;N<6;N++)lt(x.__webglFramebuffer[N],C,N);else{const N=C.texture.mipmaps;N&&N.length>0?lt(x.__webglFramebuffer[0],C,0):lt(x.__webglFramebuffer,C,0)}else if(F){x.__webglDepthbuffer=[];for(let N=0;N<6;N++)if(t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[N]),x.__webglDepthbuffer[N]===void 0)x.__webglDepthbuffer[N]=n.createRenderbuffer(),wt(x.__webglDepthbuffer[N],C,!1);else{const z=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,pe=x.__webglDepthbuffer[N];n.bindRenderbuffer(n.RENDERBUFFER,pe),n.framebufferRenderbuffer(n.FRAMEBUFFER,z,n.RENDERBUFFER,pe)}}else{const N=C.texture.mipmaps;if(N&&N.length>0?t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=n.createRenderbuffer(),wt(x.__webglDepthbuffer,C,!1);else{const z=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,pe=x.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,pe),n.framebufferRenderbuffer(n.FRAMEBUFFER,z,n.RENDERBUFFER,pe)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function Rt(C,x,F){const N=i.get(C);x!==void 0&&je(N.__webglFramebuffer,C,C.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),F!==void 0&&Dt(C)}function yt(C){const x=C.texture,F=i.get(C),N=i.get(x);C.addEventListener("dispose",f);const z=C.textures,pe=C.isWebGLCubeRenderTarget===!0,se=z.length>1;if(se||(N.__webglTexture===void 0&&(N.__webglTexture=n.createTexture()),N.__version=x.version,s.memory.textures++),pe){F.__webglFramebuffer=[];for(let q=0;q<6;q++)if(x.mipmaps&&x.mipmaps.length>0){F.__webglFramebuffer[q]=[];for(let Q=0;Q<x.mipmaps.length;Q++)F.__webglFramebuffer[q][Q]=n.createFramebuffer()}else F.__webglFramebuffer[q]=n.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){F.__webglFramebuffer=[];for(let q=0;q<x.mipmaps.length;q++)F.__webglFramebuffer[q]=n.createFramebuffer()}else F.__webglFramebuffer=n.createFramebuffer();if(se)for(let q=0,Q=z.length;q<Q;q++){const Ee=i.get(z[q]);Ee.__webglTexture===void 0&&(Ee.__webglTexture=n.createTexture(),s.memory.textures++)}if(C.samples>0&&Ht(C)===!1){F.__webglMultisampledFramebuffer=n.createFramebuffer(),F.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let q=0;q<z.length;q++){const Q=z[q];F.__webglColorRenderbuffer[q]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,F.__webglColorRenderbuffer[q]);const Ee=r.convert(Q.format,Q.colorSpace),De=r.convert(Q.type),Te=E(Q.internalFormat,Ee,De,Q.normalized,Q.colorSpace,C.isXRRenderTarget===!0),re=Bt(C);n.renderbufferStorageMultisample(n.RENDERBUFFER,re,Te,C.width,C.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+q,n.RENDERBUFFER,F.__webglColorRenderbuffer[q])}n.bindRenderbuffer(n.RENDERBUFFER,null),C.depthBuffer&&(F.__webglDepthRenderbuffer=n.createRenderbuffer(),wt(F.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(pe){t.bindTexture(n.TEXTURE_CUBE_MAP,N.__webglTexture),Qe(n.TEXTURE_CUBE_MAP,x);for(let q=0;q<6;q++)if(x.mipmaps&&x.mipmaps.length>0)for(let Q=0;Q<x.mipmaps.length;Q++)je(F.__webglFramebuffer[q][Q],C,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+q,Q);else je(F.__webglFramebuffer[q],C,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+q,0);m(x)&&M(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(se){for(let q=0,Q=z.length;q<Q;q++){const Ee=z[q],De=i.get(Ee);let Te=n.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Te=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Te,De.__webglTexture),Qe(Te,Ee),je(F.__webglFramebuffer,C,Ee,n.COLOR_ATTACHMENT0+q,Te,0),m(Ee)&&M(Te)}t.unbindTexture()}else{let q=n.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(q=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(q,N.__webglTexture),Qe(q,x),x.mipmaps&&x.mipmaps.length>0)for(let Q=0;Q<x.mipmaps.length;Q++)je(F.__webglFramebuffer[Q],C,x,n.COLOR_ATTACHMENT0,q,Q);else je(F.__webglFramebuffer,C,x,n.COLOR_ATTACHMENT0,q,0);m(x)&&M(q),t.unbindTexture()}C.depthBuffer&&Dt(C)}function Kt(C){const x=C.textures;for(let F=0,N=x.length;F<N;F++){const z=x[F];if(m(z)){const pe=R(C),se=i.get(z).__webglTexture;t.bindTexture(pe,se),M(pe),t.unbindTexture()}}}const zt=[],Et=[];function Zt(C){if(C.samples>0){if(Ht(C)===!1){const x=C.textures,F=C.width,N=C.height;let z=n.COLOR_BUFFER_BIT;const pe=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,se=i.get(C),q=x.length>1;if(q)for(let Ee=0;Ee<x.length;Ee++)t.bindFramebuffer(n.FRAMEBUFFER,se.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ee,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,se.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ee,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,se.__webglMultisampledFramebuffer);const Q=C.texture.mipmaps;Q&&Q.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,se.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,se.__webglFramebuffer);for(let Ee=0;Ee<x.length;Ee++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(z|=n.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(z|=n.STENCIL_BUFFER_BIT)),q){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,se.__webglColorRenderbuffer[Ee]);const De=i.get(x[Ee]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,De,0)}n.blitFramebuffer(0,0,F,N,0,0,F,N,z,n.NEAREST),c===!0&&(zt.length=0,Et.length=0,zt.push(n.COLOR_ATTACHMENT0+Ee),C.depthBuffer&&C.resolveDepthBuffer===!1&&(zt.push(pe),Et.push(pe),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Et)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,zt))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),q)for(let Ee=0;Ee<x.length;Ee++){t.bindFramebuffer(n.FRAMEBUFFER,se.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ee,n.RENDERBUFFER,se.__webglColorRenderbuffer[Ee]);const De=i.get(x[Ee]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,se.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ee,n.TEXTURE_2D,De,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,se.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&c){const x=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[x])}}}function Bt(C){return Math.min(a.maxSamples,C.samples)}function Ht(C){const x=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function U(C){const x=s.render.frame;d.get(C)!==x&&(d.set(C,x),C.update())}function sn(C,x){const F=C.colorSpace,N=C.format,z=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||F!==os&&F!==Qi&&(It.getTransfer(F)===Vt?(N!==pi||z!==Zn)&&ut("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Lt("WebGLTextures: Unsupported texture color space:",F)),x}function Ut(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(o.width=C.naturalWidth||C.width,o.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(o.width=C.displayWidth,o.height=C.displayHeight):(o.width=C.width,o.height=C.height),o}this.allocateTextureUnit=X,this.resetTextureUnits=V,this.getTextureUnits=j,this.setTextureUnits=I,this.setTexture2D=K,this.setTexture2DArray=oe,this.setTexture3D=he,this.setTextureCube=Ie,this.rebindTextures=Rt,this.setupRenderTarget=yt,this.updateRenderTargetMipmap=Kt,this.updateMultisampleRenderTarget=Zt,this.setupDepthRenderbuffer=Dt,this.setupFrameBufferTexture=je,this.useMultisampledRTT=Ht,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Kh(n,e){function t(i,a=Qi){let r;const s=It.getTransfer(a);if(i===Zn)return n.UNSIGNED_BYTE;if(i===rl)return n.UNSIGNED_SHORT_4_4_4_4;if(i===sl)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Gc)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Hc)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===zc)return n.BYTE;if(i===kc)return n.SHORT;if(i===br)return n.UNSIGNED_SHORT;if(i===al)return n.INT;if(i===Ci)return n.UNSIGNED_INT;if(i===Ei)return n.FLOAT;if(i===Gi)return n.HALF_FLOAT;if(i===Vc)return n.ALPHA;if(i===Wc)return n.RGB;if(i===pi)return n.RGBA;if(i===Hi)return n.DEPTH_COMPONENT;if(i===Ea)return n.DEPTH_STENCIL;if(i===Xc)return n.RED;if(i===ol)return n.RED_INTEGER;if(i===La)return n.RG;if(i===ll)return n.RG_INTEGER;if(i===cl)return n.RGBA_INTEGER;if(i===jr||i===Qr||i===es||i===ts)if(s===Vt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===jr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Qr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===es)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===ts)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===jr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Qr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===es)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===ts)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===_o||i===xo||i===vo||i===Mo)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===_o)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===xo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===vo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Mo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===yo||i===So||i===bo||i===Eo||i===To||i===rs||i===Ao)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===yo||i===So)return s===Vt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===bo)return s===Vt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Eo)return r.COMPRESSED_R11_EAC;if(i===To)return r.COMPRESSED_SIGNED_R11_EAC;if(i===rs)return r.COMPRESSED_RG11_EAC;if(i===Ao)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===wo||i===Co||i===Ro||i===Po||i===Lo||i===Io||i===Do||i===Uo||i===No||i===Oo||i===Fo||i===Bo||i===zo||i===ko)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===wo)return s===Vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Co)return s===Vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Ro)return s===Vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Po)return s===Vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Lo)return s===Vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Io)return s===Vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Do)return s===Vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Uo)return s===Vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===No)return s===Vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Oo)return s===Vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Fo)return s===Vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Bo)return s===Vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===zo)return s===Vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===ko)return s===Vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Go||i===Ho||i===Vo)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===Go)return s===Vt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Ho)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Vo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Wo||i===Xo||i===ss||i===Yo)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===Wo)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Xo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===ss)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Yo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Er?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}const cx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ux=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class dx{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new jc(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Ri({vertexShader:cx,fragmentShader:ux,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new bn(new Qa(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class hx extends la{constructor(e,t){super();const i=this;let a=null,r=1,s=null,l="local-floor",c=1,o=null,d=null,h=null,u=null,p=null,g=null;const v=typeof XRWebGLBinding<"u",_=new dx,m={},M=t.getContextAttributes();let R=null,E=null;const A=[],y=[],T=new ot;let f=null;const b=new ri;b.viewport=new rn;const w=new ri;w.viewport=new rn;const P=[b,w],L=new zh;let V=null,j=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ee){let de=A[ee];return de===void 0&&(de=new no,A[ee]=de),de.getTargetRaySpace()},this.getControllerGrip=function(ee){let de=A[ee];return de===void 0&&(de=new no,A[ee]=de),de.getGripSpace()},this.getHand=function(ee){let de=A[ee];return de===void 0&&(de=new no,A[ee]=de),de.getHandSpace()};function I(ee){const de=y.indexOf(ee.inputSource);if(de===-1)return;const le=A[de];le!==void 0&&(le.update(ee.inputSource,ee.frame,o||s),le.dispatchEvent({type:ee.type,data:ee.inputSource}))}function X(){a.removeEventListener("select",I),a.removeEventListener("selectstart",I),a.removeEventListener("selectend",I),a.removeEventListener("squeeze",I),a.removeEventListener("squeezestart",I),a.removeEventListener("squeezeend",I),a.removeEventListener("end",X),a.removeEventListener("inputsourceschange",k);for(let ee=0;ee<A.length;ee++){const de=y[ee];de!==null&&(y[ee]=null,A[ee].disconnect(de))}V=null,j=null,_.reset();for(const ee in m)delete m[ee];e.setRenderTarget(R),p=null,u=null,h=null,a=null,E=null,Qe.stop(),i.isPresenting=!1,e.setPixelRatio(f),e.setSize(T.width,T.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ee){r=ee,i.isPresenting===!0&&ut("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ee){l=ee,i.isPresenting===!0&&ut("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return o||s},this.setReferenceSpace=function(ee){o=ee},this.getBaseLayer=function(){return u!==null?u:p},this.getBinding=function(){return h===null&&v&&(h=new XRWebGLBinding(a,t)),h},this.getFrame=function(){return g},this.getSession=function(){return a},this.setSession=async function(ee){if(a=ee,a!==null){if(R=e.getRenderTarget(),a.addEventListener("select",I),a.addEventListener("selectstart",I),a.addEventListener("selectend",I),a.addEventListener("squeeze",I),a.addEventListener("squeezestart",I),a.addEventListener("squeezeend",I),a.addEventListener("end",X),a.addEventListener("inputsourceschange",k),M.xrCompatible!==!0&&await t.makeXRCompatible(),f=e.getPixelRatio(),e.getSize(T),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let le=null,ze=null,it=null;M.depth&&(it=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,le=M.stencil?Ea:Hi,ze=M.stencil?Er:Ci);const je={colorFormat:t.RGBA8,depthFormat:it,scaleFactor:r};h=this.getBinding(),u=h.createProjectionLayer(je),a.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),E=new wi(u.textureWidth,u.textureHeight,{format:pi,type:Zn,depthTexture:new ja(u.textureWidth,u.textureHeight,ze,void 0,void 0,void 0,void 0,void 0,void 0,le),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}else{const le={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(a,t,le),a.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),E=new wi(p.framebufferWidth,p.framebufferHeight,{format:pi,type:Zn,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(c),o=null,s=await a.requestReferenceSpace(l),Qe.setContext(a),Qe.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(a!==null)return a.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function k(ee){for(let de=0;de<ee.removed.length;de++){const le=ee.removed[de],ze=y.indexOf(le);ze>=0&&(y[ze]=null,A[ze].disconnect(le))}for(let de=0;de<ee.added.length;de++){const le=ee.added[de];let ze=y.indexOf(le);if(ze===-1){for(let je=0;je<A.length;je++)if(je>=y.length){y.push(le),ze=je;break}else if(y[je]===null){y[je]=le,ze=je;break}if(ze===-1)break}const it=A[ze];it&&it.connect(le)}}const K=new B,oe=new B;function he(ee,de,le){K.setFromMatrixPosition(de.matrixWorld),oe.setFromMatrixPosition(le.matrixWorld);const ze=K.distanceTo(oe),it=de.projectionMatrix.elements,je=le.projectionMatrix.elements,wt=it[14]/(it[10]-1),lt=it[14]/(it[10]+1),Dt=(it[9]+1)/it[5],Rt=(it[9]-1)/it[5],yt=(it[8]-1)/it[0],Kt=(je[8]+1)/je[0],zt=wt*yt,Et=wt*Kt,Zt=ze/(-yt+Kt),Bt=Zt*-yt;if(de.matrixWorld.decompose(ee.position,ee.quaternion,ee.scale),ee.translateX(Bt),ee.translateZ(Zt),ee.matrixWorld.compose(ee.position,ee.quaternion,ee.scale),ee.matrixWorldInverse.copy(ee.matrixWorld).invert(),it[10]===-1)ee.projectionMatrix.copy(de.projectionMatrix),ee.projectionMatrixInverse.copy(de.projectionMatrixInverse);else{const Ht=wt+Zt,U=lt+Zt,sn=zt-Bt,Ut=Et+(ze-Bt),C=Dt*lt/U*Ht,x=Rt*lt/U*Ht;ee.projectionMatrix.makePerspective(sn,Ut,C,x,Ht,U),ee.projectionMatrixInverse.copy(ee.projectionMatrix).invert()}}function Ie(ee,de){de===null?ee.matrixWorld.copy(ee.matrix):ee.matrixWorld.multiplyMatrices(de.matrixWorld,ee.matrix),ee.matrixWorldInverse.copy(ee.matrixWorld).invert()}this.updateCamera=function(ee){if(a===null)return;let de=ee.near,le=ee.far;_.texture!==null&&(_.depthNear>0&&(de=_.depthNear),_.depthFar>0&&(le=_.depthFar)),L.near=w.near=b.near=de,L.far=w.far=b.far=le,(V!==L.near||j!==L.far)&&(a.updateRenderState({depthNear:L.near,depthFar:L.far}),V=L.near,j=L.far),L.layers.mask=ee.layers.mask|6,b.layers.mask=L.layers.mask&-5,w.layers.mask=L.layers.mask&-3;const ze=ee.parent,it=L.cameras;Ie(L,ze);for(let je=0;je<it.length;je++)Ie(it[je],ze);it.length===2?he(L,b,w):L.projectionMatrix.copy(b.projectionMatrix),ve(ee,L,ze)};function ve(ee,de,le){le===null?ee.matrix.copy(de.matrixWorld):(ee.matrix.copy(le.matrixWorld),ee.matrix.invert(),ee.matrix.multiply(de.matrixWorld)),ee.matrix.decompose(ee.position,ee.quaternion,ee.scale),ee.updateMatrixWorld(!0),ee.projectionMatrix.copy(de.projectionMatrix),ee.projectionMatrixInverse.copy(de.projectionMatrixInverse),ee.isPerspectiveCamera&&(ee.fov=xc*2*Math.atan(1/ee.projectionMatrix.elements[5]),ee.zoom=1)}this.getCamera=function(){return L},this.getFoveation=function(){if(!(u===null&&p===null))return c},this.setFoveation=function(ee){c=ee,u!==null&&(u.fixedFoveation=ee),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=ee)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(L)},this.getCameraTexture=function(ee){return m[ee]};let _t=null;function Ft(ee,de){if(d=de.getViewerPose(o||s),g=de,d!==null){const le=d.views;p!==null&&(e.setRenderTargetFramebuffer(E,p.framebuffer),e.setRenderTarget(E));let ze=!1;le.length!==L.cameras.length&&(L.cameras.length=0,ze=!0);for(let lt=0;lt<le.length;lt++){const Dt=le[lt];let Rt=null;if(p!==null)Rt=p.getViewport(Dt);else{const Kt=h.getViewSubImage(u,Dt);Rt=Kt.viewport,lt===0&&(e.setRenderTargetTextures(E,Kt.colorTexture,Kt.depthStencilTexture),e.setRenderTarget(E))}let yt=P[lt];yt===void 0&&(yt=new ri,yt.layers.enable(lt),yt.viewport=new rn,P[lt]=yt),yt.matrix.fromArray(Dt.transform.matrix),yt.matrix.decompose(yt.position,yt.quaternion,yt.scale),yt.projectionMatrix.fromArray(Dt.projectionMatrix),yt.projectionMatrixInverse.copy(yt.projectionMatrix).invert(),yt.viewport.set(Rt.x,Rt.y,Rt.width,Rt.height),lt===0&&(L.matrix.copy(yt.matrix),L.matrix.decompose(L.position,L.quaternion,L.scale)),ze===!0&&L.cameras.push(yt)}const it=a.enabledFeatures;if(it&&it.includes("depth-sensing")&&a.depthUsage=="gpu-optimized"&&v){h=i.getBinding();const lt=h.getDepthInformation(le[0]);lt&&lt.isValid&&lt.texture&&_.init(lt,a.renderState)}if(it&&it.includes("camera-access")&&v){e.state.unbindTexture(),h=i.getBinding();for(let lt=0;lt<le.length;lt++){const Dt=le[lt].camera;if(Dt){let Rt=m[Dt];Rt||(Rt=new jc,m[Dt]=Rt);const yt=h.getCameraImage(Dt);Rt.sourceTexture=yt}}}}for(let le=0;le<A.length;le++){const ze=y[le],it=A[le];ze!==null&&it!==void 0&&it.update(ze,de,o||s)}_t&&_t(ee,de),de.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:de}),g=null}const Qe=new Vh;Qe.setAnimationLoop(Ft),this.setAnimationLoop=function(ee){_t=ee},this.dispose=function(){}}}const fx=new Qt,Zh=new vt;Zh.set(-1,0,0,0,1,0,0,0,1);function px(n,e){function t(_,m){_.matrixAutoUpdate===!0&&_.updateMatrix(),m.value.copy(_.matrix)}function i(_,m){m.color.getRGB(_.fogColor.value,Lh(n)),m.isFog?(_.fogNear.value=m.near,_.fogFar.value=m.far):m.isFogExp2&&(_.fogDensity.value=m.density)}function a(_,m,M,R,E){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(_,m):m.isMeshLambertMaterial?(r(_,m),m.envMap&&(_.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(_,m),h(_,m)):m.isMeshPhongMaterial?(r(_,m),d(_,m),m.envMap&&(_.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(_,m),u(_,m),m.isMeshPhysicalMaterial&&p(_,m,E)):m.isMeshMatcapMaterial?(r(_,m),g(_,m)):m.isMeshDepthMaterial?r(_,m):m.isMeshDistanceMaterial?(r(_,m),v(_,m)):m.isMeshNormalMaterial?r(_,m):m.isLineBasicMaterial?(s(_,m),m.isLineDashedMaterial&&l(_,m)):m.isPointsMaterial?c(_,m,M,R):m.isSpriteMaterial?o(_,m):m.isShadowMaterial?(_.color.value.copy(m.color),_.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(_,m){_.opacity.value=m.opacity,m.color&&_.diffuse.value.copy(m.color),m.emissive&&_.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(_.map.value=m.map,t(m.map,_.mapTransform)),m.alphaMap&&(_.alphaMap.value=m.alphaMap,t(m.alphaMap,_.alphaMapTransform)),m.bumpMap&&(_.bumpMap.value=m.bumpMap,t(m.bumpMap,_.bumpMapTransform),_.bumpScale.value=m.bumpScale,m.side===Xn&&(_.bumpScale.value*=-1)),m.normalMap&&(_.normalMap.value=m.normalMap,t(m.normalMap,_.normalMapTransform),_.normalScale.value.copy(m.normalScale),m.side===Xn&&_.normalScale.value.negate()),m.displacementMap&&(_.displacementMap.value=m.displacementMap,t(m.displacementMap,_.displacementMapTransform),_.displacementScale.value=m.displacementScale,_.displacementBias.value=m.displacementBias),m.emissiveMap&&(_.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,_.emissiveMapTransform)),m.specularMap&&(_.specularMap.value=m.specularMap,t(m.specularMap,_.specularMapTransform)),m.alphaTest>0&&(_.alphaTest.value=m.alphaTest);const M=e.get(m),R=M.envMap,E=M.envMapRotation;R&&(_.envMap.value=R,_.envMapRotation.value.setFromMatrix4(fx.makeRotationFromEuler(E)).transpose(),R.isCubeTexture&&R.isRenderTargetTexture===!1&&_.envMapRotation.value.premultiply(Zh),_.reflectivity.value=m.reflectivity,_.ior.value=m.ior,_.refractionRatio.value=m.refractionRatio),m.lightMap&&(_.lightMap.value=m.lightMap,_.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,_.lightMapTransform)),m.aoMap&&(_.aoMap.value=m.aoMap,_.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,_.aoMapTransform))}function s(_,m){_.diffuse.value.copy(m.color),_.opacity.value=m.opacity,m.map&&(_.map.value=m.map,t(m.map,_.mapTransform))}function l(_,m){_.dashSize.value=m.dashSize,_.totalSize.value=m.dashSize+m.gapSize,_.scale.value=m.scale}function c(_,m,M,R){_.diffuse.value.copy(m.color),_.opacity.value=m.opacity,_.size.value=m.size*M,_.scale.value=R*.5,m.map&&(_.map.value=m.map,t(m.map,_.uvTransform)),m.alphaMap&&(_.alphaMap.value=m.alphaMap,t(m.alphaMap,_.alphaMapTransform)),m.alphaTest>0&&(_.alphaTest.value=m.alphaTest)}function o(_,m){_.diffuse.value.copy(m.color),_.opacity.value=m.opacity,_.rotation.value=m.rotation,m.map&&(_.map.value=m.map,t(m.map,_.mapTransform)),m.alphaMap&&(_.alphaMap.value=m.alphaMap,t(m.alphaMap,_.alphaMapTransform)),m.alphaTest>0&&(_.alphaTest.value=m.alphaTest)}function d(_,m){_.specular.value.copy(m.specular),_.shininess.value=Math.max(m.shininess,1e-4)}function h(_,m){m.gradientMap&&(_.gradientMap.value=m.gradientMap)}function u(_,m){_.metalness.value=m.metalness,m.metalnessMap&&(_.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,_.metalnessMapTransform)),_.roughness.value=m.roughness,m.roughnessMap&&(_.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,_.roughnessMapTransform)),m.envMap&&(_.envMapIntensity.value=m.envMapIntensity)}function p(_,m,M){_.ior.value=m.ior,m.sheen>0&&(_.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),_.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(_.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,_.sheenColorMapTransform)),m.sheenRoughnessMap&&(_.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,_.sheenRoughnessMapTransform))),m.clearcoat>0&&(_.clearcoat.value=m.clearcoat,_.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(_.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,_.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(_.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,_.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(_.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,_.clearcoatNormalMapTransform),_.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Xn&&_.clearcoatNormalScale.value.negate())),m.dispersion>0&&(_.dispersion.value=m.dispersion),m.iridescence>0&&(_.iridescence.value=m.iridescence,_.iridescenceIOR.value=m.iridescenceIOR,_.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],_.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(_.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,_.iridescenceMapTransform)),m.iridescenceThicknessMap&&(_.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,_.iridescenceThicknessMapTransform))),m.transmission>0&&(_.transmission.value=m.transmission,_.transmissionSamplerMap.value=M.texture,_.transmissionSamplerSize.value.set(M.width,M.height),m.transmissionMap&&(_.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,_.transmissionMapTransform)),_.thickness.value=m.thickness,m.thicknessMap&&(_.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,_.thicknessMapTransform)),_.attenuationDistance.value=m.attenuationDistance,_.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(_.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(_.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,_.anisotropyMapTransform))),_.specularIntensity.value=m.specularIntensity,_.specularColor.value.copy(m.specularColor),m.specularColorMap&&(_.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,_.specularColorMapTransform)),m.specularIntensityMap&&(_.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,_.specularIntensityMapTransform))}function g(_,m){m.matcap&&(_.matcap.value=m.matcap)}function v(_,m){const M=e.get(m).light;_.referencePosition.value.setFromMatrixPosition(M.matrixWorld),_.nearDistance.value=M.shadow.camera.near,_.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:a}}function mx(n,e,t,i){let a={},r={},s=[];const l=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function c(E,A){const y=A.program;i.uniformBlockBinding(E,y)}function o(E,A){let y=a[E.id];y===void 0&&(_(E),y=d(E),a[E.id]=y,E.addEventListener("dispose",M));const T=A.program;i.updateUBOMapping(E,T);const f=e.render.frame;r[E.id]!==f&&(u(E),r[E.id]=f)}function d(E){const A=h();E.__bindingPointIndex=A;const y=n.createBuffer(),T=E.__size,f=E.usage;return n.bindBuffer(n.UNIFORM_BUFFER,y),n.bufferData(n.UNIFORM_BUFFER,T,f),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,A,y),y}function h(){for(let E=0;E<l;E++)if(s.indexOf(E)===-1)return s.push(E),E;return Lt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(E){const A=a[E.id],y=E.uniforms,T=E.__cache;n.bindBuffer(n.UNIFORM_BUFFER,A);for(let f=0,b=y.length;f<b;f++){const w=y[f];if(Array.isArray(w))for(let P=0,L=w.length;P<L;P++)p(w[P],f,P,T);else p(w,f,0,T)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function p(E,A,y,T){if(v(E,A,y,T)===!0){const f=E.__offset,b=E.value;if(Array.isArray(b)){let w=0;for(let P=0;P<b.length;P++){const L=b[P],V=m(L);g(L,E.__data,w),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(w+=V.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(b,E.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,f,E.__data)}}function g(E,A,y){typeof E=="number"||typeof E=="boolean"?A[0]=E:E.isMatrix3?(A[0]=E.elements[0],A[1]=E.elements[1],A[2]=E.elements[2],A[3]=0,A[4]=E.elements[3],A[5]=E.elements[4],A[6]=E.elements[5],A[7]=0,A[8]=E.elements[6],A[9]=E.elements[7],A[10]=E.elements[8],A[11]=0):ArrayBuffer.isView(E)?A.set(new E.constructor(E.buffer,E.byteOffset,A.length)):E.toArray(A,y)}function v(E,A,y,T){const f=E.value,b=A+"_"+y;if(T[b]===void 0)return typeof f=="number"||typeof f=="boolean"?T[b]=f:ArrayBuffer.isView(f)?T[b]=f.slice():T[b]=f.clone(),!0;{const w=T[b];if(typeof f=="number"||typeof f=="boolean"){if(w!==f)return T[b]=f,!0}else{if(ArrayBuffer.isView(f))return!0;if(w.equals(f)===!1)return w.copy(f),!0}}return!1}function _(E){const A=E.uniforms;let y=0;const T=16;for(let b=0,w=A.length;b<w;b++){const P=Array.isArray(A[b])?A[b]:[A[b]];for(let L=0,V=P.length;L<V;L++){const j=P[L],I=Array.isArray(j.value)?j.value:[j.value];for(let X=0,k=I.length;X<k;X++){const K=I[X],oe=m(K),he=y%T,Ie=he%oe.boundary,ve=he+Ie;y+=Ie,ve!==0&&T-ve<oe.storage&&(y+=T-ve),j.__data=new Float32Array(oe.storage/Float32Array.BYTES_PER_ELEMENT),j.__offset=y,y+=oe.storage}}}const f=y%T;return f>0&&(y+=T-f),E.__size=y,E.__cache={},this}function m(E){const A={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(A.boundary=4,A.storage=4):E.isVector2?(A.boundary=8,A.storage=8):E.isVector3||E.isColor?(A.boundary=16,A.storage=12):E.isVector4?(A.boundary=16,A.storage=16):E.isMatrix3?(A.boundary=48,A.storage=48):E.isMatrix4?(A.boundary=64,A.storage=64):E.isTexture?ut("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(E)?(A.boundary=16,A.storage=E.byteLength):ut("WebGLRenderer: Unsupported uniform value type.",E),A}function M(E){const A=E.target;A.removeEventListener("dispose",M);const y=s.indexOf(A.__bindingPointIndex);s.splice(y,1),n.deleteBuffer(a[A.id]),delete a[A.id],delete r[A.id]}function R(){for(const E in a)n.deleteBuffer(a[E]);s=[],a={},r={}}return{bind:c,update:o,dispose:R}}const gx=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Ii=null;function _x(){return Ii===null&&(Ii=new wh(gx,16,16,La,Gi),Ii.name="DFG_LUT",Ii.minFilter=In,Ii.magFilter=In,Ii.wrapS=Fi,Ii.wrapT=Fi,Ii.generateMipmaps=!1,Ii.needsUpdate=!0),Ii}class Jh{constructor(e={}){const{canvas:t=gh(),context:i=null,depth:a=!0,stencil:r=!1,alpha:s=!1,antialias:l=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:o=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:u=!1,outputBufferType:p=Zn}=e;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=s;const v=p,_=new Set([cl,ll,ol]),m=new Set([Zn,Ci,br,Er,rl,sl]),M=new Uint32Array(4),R=new Int32Array(4),E=new B;let A=null,y=null;const T=[],f=[];let b=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ai,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const w=this;let P=!1,L=null,V=null,j=null,I=null;this._outputColorSpace=ii;let X=0,k=0,K=null,oe=-1,he=null;const Ie=new rn,ve=new rn;let _t=null;const Ft=new At(0);let Qe=0,ee=t.width,de=t.height,le=1,ze=null,it=null;const je=new rn(0,0,ee,de),wt=new rn(0,0,ee,de);let lt=!1;const Dt=new ml;let Rt=!1,yt=!1;const Kt=new Qt,zt=new B,Et=new rn,Zt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Bt=!1;function Ht(){return K===null?le:1}let U=i;function sn(S,O){return t.getContext(S,O)}try{const S={alpha:!0,depth:a,stencil:r,antialias:l,premultipliedAlpha:c,preserveDrawingBuffer:o,powerPreference:d,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${il}`),t.addEventListener("webglcontextlost",W,!1),t.addEventListener("webglcontextrestored",J,!1),t.addEventListener("webglcontextcreationerror",Ge,!1),U===null){const O="webgl2";if(U=sn(O,S),U===null)throw sn(O)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(S){throw Lt("WebGLRenderer: "+S.message),S}let Ut,C,x,F,N,z,pe,se,q,Q,Ee,De,Te,re,Re,tt,Ve,D,Se,Z,xe,Pe,te;function Be(){Ut=new x_(U),Ut.init(),xe=new Kh(U,Ut),C=new u_(U,Ut,e,xe),x=new ox(U,Ut),C.reversedDepthBuffer&&u&&x.buffers.depth.setReversed(!0),V=U.createFramebuffer(),j=U.createFramebuffer(),I=U.createFramebuffer(),F=new y_(U),N=new $0,z=new lx(U,Ut,x,N,C,xe,F),pe=new __(w),se=new Tp(U),Pe=new l_(U,se),q=new v_(U,se,F,Pe),Q=new b_(U,q,se,Pe,F),D=new S_(U,C,z),Re=new d_(N),Ee=new Y0(w,pe,Ut,C,Pe,Re),De=new px(w,N),Te=new K0,re=new tx(Ut),Ve=new o_(w,pe,x,Q,g,c),tt=new sx(w,Q,C),te=new mx(U,F,C,x),Se=new c_(U,Ut,F),Z=new M_(U,Ut,F),F.programs=Ee.programs,w.capabilities=C,w.extensions=Ut,w.properties=N,w.renderLists=Te,w.shadowMap=tt,w.state=x,w.info=F}Be(),v!==Zn&&(b=new T_(v,t.width,t.height,l,a,r));const We=new hx(w,U);this.xr=We,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const S=Ut.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=Ut.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return le},this.setPixelRatio=function(S){S!==void 0&&(le=S,this.setSize(ee,de,!1))},this.getSize=function(S){return S.set(ee,de)},this.setSize=function(S,O,Y=!0){if(We.isPresenting){ut("WebGLRenderer: Can't change size while VR device is presenting.");return}ee=S,de=O,t.width=Math.floor(S*le),t.height=Math.floor(O*le),Y===!0&&(t.style.width=S+"px",t.style.height=O+"px"),b!==null&&b.setSize(t.width,t.height),this.setViewport(0,0,S,O)},this.getDrawingBufferSize=function(S){return S.set(ee*le,de*le).floor()},this.setDrawingBufferSize=function(S,O,Y){ee=S,de=O,le=Y,t.width=Math.floor(S*Y),t.height=Math.floor(O*Y),this.setViewport(0,0,S,O)},this.setEffects=function(S){if(v===Zn){Lt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(S){for(let O=0;O<S.length;O++)if(S[O].isOutputPass===!0){ut("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}b.setEffects(S||[])},this.getCurrentViewport=function(S){return S.copy(Ie)},this.getViewport=function(S){return S.copy(je)},this.setViewport=function(S,O,Y,G){S.isVector4?je.set(S.x,S.y,S.z,S.w):je.set(S,O,Y,G),x.viewport(Ie.copy(je).multiplyScalar(le).round())},this.getScissor=function(S){return S.copy(wt)},this.setScissor=function(S,O,Y,G){S.isVector4?wt.set(S.x,S.y,S.z,S.w):wt.set(S,O,Y,G),x.scissor(ve.copy(wt).multiplyScalar(le).round())},this.getScissorTest=function(){return lt},this.setScissorTest=function(S){x.setScissorTest(lt=S)},this.setOpaqueSort=function(S){ze=S},this.setTransparentSort=function(S){it=S},this.getClearColor=function(S){return S.copy(Ve.getClearColor())},this.setClearColor=function(){Ve.setClearColor(...arguments)},this.getClearAlpha=function(){return Ve.getClearAlpha()},this.setClearAlpha=function(){Ve.setClearAlpha(...arguments)},this.clear=function(S=!0,O=!0,Y=!0){let G=0;if(S){let H=!1;if(K!==null){const Ue=K.texture.format;H=_.has(Ue)}if(H){const Ue=K.texture.type,ke=m.has(Ue),Ae=Ve.getClearColor(),Ye=Ve.getClearAlpha(),$e=Ae.r,gt=Ae.g,St=Ae.b;ke?(M[0]=$e,M[1]=gt,M[2]=St,M[3]=Ye,U.clearBufferuiv(U.COLOR,0,M)):(R[0]=$e,R[1]=gt,R[2]=St,R[3]=Ye,U.clearBufferiv(U.COLOR,0,R))}else G|=U.COLOR_BUFFER_BIT}O&&(G|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Y&&(G|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&U.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(S){S.setRenderer(this),L=S},this.dispose=function(){t.removeEventListener("webglcontextlost",W,!1),t.removeEventListener("webglcontextrestored",J,!1),t.removeEventListener("webglcontextcreationerror",Ge,!1),Ve.dispose(),Te.dispose(),re.dispose(),N.dispose(),pe.dispose(),Q.dispose(),Pe.dispose(),te.dispose(),Ee.dispose(),We.dispose(),We.removeEventListener("sessionstart",qe),We.removeEventListener("sessionend",kt),Wt.stop()};function W(S){S.preventDefault(),cs("WebGLRenderer: Context Lost."),P=!0}function J(){cs("WebGLRenderer: Context Restored."),P=!1;const S=F.autoReset,O=tt.enabled,Y=tt.autoUpdate,G=tt.needsUpdate,H=tt.type;Be(),F.autoReset=S,tt.enabled=O,tt.autoUpdate=Y,tt.needsUpdate=G,tt.type=H}function Ge(S){Lt("WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function Me(S){const O=S.target;O.removeEventListener("dispose",Me),ge(O)}function ge(S){Le(S),N.remove(S)}function Le(S){const O=N.get(S).programs;O!==void 0&&(O.forEach(function(Y){Ee.releaseProgram(Y)}),S.isShaderMaterial&&Ee.releaseShaderCache(S))}this.renderBufferDirect=function(S,O,Y,G,H,Ue){O===null&&(O=Zt);const ke=H.isMesh&&H.matrixWorld.determinantAffine()<0,Ae=Pn(S,O,Y,G,H);x.setMaterial(G,ke);let Ye=Y.index,$e=1;if(G.wireframe===!0){if(Ye=q.getWireframeAttribute(Y),Ye===void 0)return;$e=2}const gt=Y.drawRange,St=Y.attributes.position;let ie=gt.start*$e,ct=(gt.start+gt.count)*$e;Ue!==null&&(ie=Math.max(ie,Ue.start*$e),ct=Math.min(ct,(Ue.start+Ue.count)*$e)),Ye!==null?(ie=Math.max(ie,0),ct=Math.min(ct,Ye.count)):St!=null&&(ie=Math.max(ie,0),ct=Math.min(ct,St.count));const Gt=ct-ie;if(Gt<0||Gt===1/0)return;Pe.setup(H,G,Ae,Y,Ye);let Mt,Ct=Se;if(Ye!==null&&(Mt=se.get(Ye),Ct=Z,Ct.setIndex(Mt)),H.isMesh)G.wireframe===!0?(x.setLineWidth(G.wireframeLinewidth*Ht()),Ct.setMode(U.LINES)):Ct.setMode(U.TRIANGLES);else if(H.isLine){let on=G.linewidth;on===void 0&&(on=1),x.setLineWidth(on*Ht()),H.isLineSegments?Ct.setMode(U.LINES):H.isLineLoop?Ct.setMode(U.LINE_LOOP):Ct.setMode(U.LINE_STRIP)}else H.isPoints?Ct.setMode(U.POINTS):H.isSprite&&Ct.setMode(U.TRIANGLES);if(H.isBatchedMesh)if(Ut.get("WEBGL_multi_draw"))Ct.renderMultiDraw(H._multiDrawStarts,H._multiDrawCounts,H._multiDrawCount);else{const on=H._multiDrawStarts,Ne=H._multiDrawCounts,dn=H._multiDrawCount,ht=Ye?se.get(Ye).bytesPerElement:1,gn=N.get(G).currentProgram.getUniforms();for(let _n=0;_n<dn;_n++)gn.setValue(U,"_gl_DrawID",_n),Ct.render(on[_n]/ht,Ne[_n])}else if(H.isInstancedMesh)Ct.renderInstances(ie,Gt,H.count);else if(Y.isInstancedBufferGeometry){const on=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,Ne=Math.min(Y.instanceCount,on);Ct.renderInstances(ie,Gt,Ne)}else Ct.render(ie,Gt)};function nt(S,O,Y){S.transparent===!0&&S.side===hi&&S.forceSinglePass===!1?(S.side=Xn,S.needsUpdate=!0,Rn(S,O,Y),S.side=ra,S.needsUpdate=!0,Rn(S,O,Y),S.side=hi):Rn(S,O,Y)}this.compile=function(S,O,Y=null){Y===null&&(Y=S),y=re.get(Y),y.init(O),f.push(y),Y.traverseVisible(function(H){H.isLight&&H.layers.test(O.layers)&&(y.pushLight(H),H.castShadow&&y.pushShadow(H))}),S!==Y&&S.traverseVisible(function(H){H.isLight&&H.layers.test(O.layers)&&(y.pushLight(H),H.castShadow&&y.pushShadow(H))}),y.setupLights();const G=new Set;return S.traverse(function(H){if(!(H.isMesh||H.isPoints||H.isLine||H.isSprite))return;const Ue=H.material;if(Ue)if(Array.isArray(Ue))for(let ke=0;ke<Ue.length;ke++){const Ae=Ue[ke];nt(Ae,Y,H),G.add(Ae)}else nt(Ue,Y,H),G.add(Ue)}),y=f.pop(),G},this.compileAsync=function(S,O,Y=null){const G=this.compile(S,O,Y);return new Promise(H=>{function Ue(){if(G.forEach(function(ke){N.get(ke).currentProgram.isReady()&&G.delete(ke)}),G.size===0){H(S);return}setTimeout(Ue,10)}Ut.get("KHR_parallel_shader_compile")!==null?Ue():setTimeout(Ue,10)})};let Xe=null;function bt(S){Xe&&Xe(S)}function qe(){Wt.stop()}function kt(){Wt.start()}const Wt=new Vh;Wt.setAnimationLoop(bt),typeof self<"u"&&Wt.setContext(self),this.setAnimationLoop=function(S){Xe=S,We.setAnimationLoop(S),S===null?Wt.stop():Wt.start()},We.addEventListener("sessionstart",qe),We.addEventListener("sessionend",kt),this.render=function(S,O){if(O!==void 0&&O.isCamera!==!0){Lt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;L!==null&&L.renderStart(S,O);const Y=We.enabled===!0&&We.isPresenting===!0,G=b!==null&&(K===null||Y)&&b.begin(w,K);if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),We.enabled===!0&&We.isPresenting===!0&&(b===null||b.isCompositing()===!1)&&(We.cameraAutoUpdate===!0&&We.updateCamera(O),O=We.getCamera()),S.isScene===!0&&S.onBeforeRender(w,S,O,K),y=re.get(S,f.length),y.init(O),y.state.textureUnits=z.getTextureUnits(),f.push(y),Kt.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),Dt.setFromProjectionMatrix(Kt,Ti,O.reversedDepth),yt=this.localClippingEnabled,Rt=Re.init(this.clippingPlanes,yt),A=Te.get(S,T.length),A.init(),T.push(A),We.enabled===!0&&We.isPresenting===!0){const ke=w.xr.getDepthSensingMesh();ke!==null&&Je(ke,O,-1/0,w.sortObjects)}Je(S,O,0,w.sortObjects),A.finish(),w.sortObjects===!0&&A.sort(ze,it,O.reversedDepth),Bt=We.enabled===!1||We.isPresenting===!1||We.hasDepthSensing()===!1,Bt&&Ve.addToRenderList(A,S),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Rt===!0&&Re.beginShadows();const H=y.state.shadowsArray;if(tt.render(H,S,O),Rt===!0&&Re.endShadows(),(G&&b.hasRenderPass())===!1){const ke=A.opaque,Ae=A.transmissive;if(y.setupLights(),O.isArrayCamera){const Ye=O.cameras;if(Ae.length>0)for(let $e=0,gt=Ye.length;$e<gt;$e++){const St=Ye[$e];en(ke,Ae,S,St)}Bt&&Ve.render(S);for(let $e=0,gt=Ye.length;$e<gt;$e++){const St=Ye[$e];xn(A,S,St,St.viewport)}}else Ae.length>0&&en(ke,Ae,S,O),Bt&&Ve.render(S),xn(A,S,O)}K!==null&&k===0&&(z.updateMultisampleRenderTarget(K),z.updateRenderTargetMipmap(K)),G&&b.end(w),S.isScene===!0&&S.onAfterRender(w,S,O),Pe.resetDefaultState(),oe=-1,he=null,f.pop(),f.length>0?(y=f[f.length-1],z.setTextureUnits(y.state.textureUnits),Rt===!0&&Re.setGlobalState(w.clippingPlanes,y.state.camera)):y=null,T.pop(),T.length>0?A=T[T.length-1]:A=null,L!==null&&L.renderEnd()};function Je(S,O,Y,G){if(S.visible===!1)return;if(S.layers.test(O.layers)){if(S.isGroup)Y=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(O);else if(S.isLightProbeGrid)y.pushLightProbeGrid(S);else if(S.isLight)y.pushLight(S),S.castShadow&&y.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||Dt.intersectsSprite(S)){G&&Et.setFromMatrixPosition(S.matrixWorld).applyMatrix4(Kt);const ke=Q.update(S),Ae=S.material;Ae.visible&&A.push(S,ke,Ae,Y,Et.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||Dt.intersectsObject(S))){const ke=Q.update(S),Ae=S.material;if(G&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),Et.copy(S.boundingSphere.center)):(ke.boundingSphere===null&&ke.computeBoundingSphere(),Et.copy(ke.boundingSphere.center)),Et.applyMatrix4(S.matrixWorld).applyMatrix4(Kt)),Array.isArray(Ae)){const Ye=ke.groups;for(let $e=0,gt=Ye.length;$e<gt;$e++){const St=Ye[$e],ie=Ae[St.materialIndex];ie&&ie.visible&&A.push(S,ke,ie,Y,Et.z,St)}}else Ae.visible&&A.push(S,ke,Ae,Y,Et.z,null)}}const Ue=S.children;for(let ke=0,Ae=Ue.length;ke<Ae;ke++)Je(Ue[ke],O,Y,G)}function xn(S,O,Y,G){const{opaque:H,transmissive:Ue,transparent:ke}=S;y.setupLightsView(Y),Rt===!0&&Re.setGlobalState(w.clippingPlanes,Y),G&&x.viewport(Ie.copy(G)),H.length>0&&dt(H,O,Y),Ue.length>0&&dt(Ue,O,Y),ke.length>0&&dt(ke,O,Y),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function en(S,O,Y,G){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(y.state.transmissionRenderTarget[G.id]===void 0){const ie=Ut.has("EXT_color_buffer_half_float")||Ut.has("EXT_color_buffer_float");y.state.transmissionRenderTarget[G.id]=new wi(1,1,{generateMipmaps:!0,type:ie?Gi:Zn,minFilter:ba,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:It.workingColorSpace})}const Ue=y.state.transmissionRenderTarget[G.id],ke=G.viewport||Ie;Ue.setSize(ke.z*w.transmissionResolutionScale,ke.w*w.transmissionResolutionScale);const Ae=w.getRenderTarget(),Ye=w.getActiveCubeFace(),$e=w.getActiveMipmapLevel();w.setRenderTarget(Ue),w.getClearColor(Ft),Qe=w.getClearAlpha(),Qe<1&&w.setClearColor(16777215,.5),w.clear(),Bt&&Ve.render(Y);const gt=w.toneMapping;w.toneMapping=Ai;const St=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),y.setupLightsView(G),Rt===!0&&Re.setGlobalState(w.clippingPlanes,G),dt(S,Y,G),z.updateMultisampleRenderTarget(Ue),z.updateRenderTargetMipmap(Ue),Ut.has("WEBGL_multisampled_render_to_texture")===!1){let ie=!1;for(let ct=0,Gt=O.length;ct<Gt;ct++){const Mt=O[ct],{object:Ct,geometry:on,material:Ne,group:dn}=Mt;if(Ne.side===hi&&Ct.layers.test(G.layers)){const ht=Ne.side;Ne.side=Xn,Ne.needsUpdate=!0,Cn(Ct,Y,G,on,Ne,dn),Ne.side=ht,Ne.needsUpdate=!0,ie=!0}}ie===!0&&(z.updateMultisampleRenderTarget(Ue),z.updateRenderTargetMipmap(Ue))}w.setRenderTarget(Ae,Ye,$e),w.setClearColor(Ft,Qe),St!==void 0&&(G.viewport=St),w.toneMapping=gt}function dt(S,O,Y){const G=O.isScene===!0?O.overrideMaterial:null;for(let H=0,Ue=S.length;H<Ue;H++){const ke=S[H],{object:Ae,geometry:Ye,group:$e}=ke;let gt=ke.material;gt.allowOverride===!0&&G!==null&&(gt=G),Ae.layers.test(Y.layers)&&Cn(Ae,O,Y,Ye,gt,$e)}}function Cn(S,O,Y,G,H,Ue){S.onBeforeRender(w,O,Y,G,H,Ue),S.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),H.onBeforeRender(w,O,Y,G,S,Ue),H.transparent===!0&&H.side===hi&&H.forceSinglePass===!1?(H.side=Xn,H.needsUpdate=!0,w.renderBufferDirect(Y,O,G,H,S,Ue),H.side=ra,H.needsUpdate=!0,w.renderBufferDirect(Y,O,G,H,S,Ue),H.side=hi):w.renderBufferDirect(Y,O,G,H,S,Ue),S.onAfterRender(w,O,Y,G,H,Ue)}function Rn(S,O,Y){O.isScene!==!0&&(O=Zt);const G=N.get(S),H=y.state.lights,Ue=y.state.shadowsArray,ke=H.state.version,Ae=Ee.getParameters(S,H.state,Ue,O,Y,y.state.lightProbeGridArray),Ye=Ee.getProgramCacheKey(Ae);let $e=G.programs;G.environment=S.isMeshStandardMaterial||S.isMeshLambertMaterial||S.isMeshPhongMaterial?O.environment:null,G.fog=O.fog;const gt=S.isMeshStandardMaterial||S.isMeshLambertMaterial&&!S.envMap||S.isMeshPhongMaterial&&!S.envMap;G.envMap=pe.get(S.envMap||G.environment,gt),G.envMapRotation=G.environment!==null&&S.envMap===null?O.environmentRotation:S.envMapRotation,$e===void 0&&(S.addEventListener("dispose",Me),$e=new Map,G.programs=$e);let St=$e.get(Ye);if(St!==void 0){if(G.currentProgram===St&&G.lightsStateVersion===ke)return li(S,Ae),St}else Ae.uniforms=Ee.getUniforms(S),L!==null&&S.isNodeMaterial&&L.build(S,Y,Ae),S.onBeforeCompile(Ae,w),St=Ee.acquireProgram(Ae,Ye),$e.set(Ye,St),G.uniforms=Ae.uniforms;const ie=G.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(ie.clippingPlanes=Re.uniform),li(S,Ae),G.needsLights=er(S),G.lightsStateVersion=ke,G.needsLights&&(ie.ambientLightColor.value=H.state.ambient,ie.lightProbe.value=H.state.probe,ie.directionalLights.value=H.state.directional,ie.directionalLightShadows.value=H.state.directionalShadow,ie.spotLights.value=H.state.spot,ie.spotLightShadows.value=H.state.spotShadow,ie.rectAreaLights.value=H.state.rectArea,ie.ltc_1.value=H.state.rectAreaLTC1,ie.ltc_2.value=H.state.rectAreaLTC2,ie.pointLights.value=H.state.point,ie.pointLightShadows.value=H.state.pointShadow,ie.hemisphereLights.value=H.state.hemi,ie.directionalShadowMatrix.value=H.state.directionalShadowMatrix,ie.spotLightMatrix.value=H.state.spotLightMatrix,ie.spotLightMap.value=H.state.spotLightMap,ie.pointShadowMatrix.value=H.state.pointShadowMatrix),G.lightProbeGrid=y.state.lightProbeGridArray.length>0,G.currentProgram=St,G.uniformsList=null,St}function zn(S){if(S.uniformsList===null){const O=S.currentProgram.getUniforms();S.uniformsList=ao.seqWithValue(O.seq,S.uniforms)}return S.uniformsList}function li(S,O){const Y=N.get(S);Y.outputColorSpace=O.outputColorSpace,Y.batching=O.batching,Y.batchingColor=O.batchingColor,Y.instancing=O.instancing,Y.instancingColor=O.instancingColor,Y.instancingMorph=O.instancingMorph,Y.skinning=O.skinning,Y.morphTargets=O.morphTargets,Y.morphNormals=O.morphNormals,Y.morphColors=O.morphColors,Y.morphTargetsCount=O.morphTargetsCount,Y.numClippingPlanes=O.numClippingPlanes,Y.numIntersection=O.numClipIntersection,Y.vertexAlphas=O.vertexAlphas,Y.vertexTangents=O.vertexTangents,Y.toneMapping=O.toneMapping}function gi(S,O){if(S.length===0)return null;if(S.length===1)return S[0].texture!==null?S[0]:null;E.setFromMatrixPosition(O.matrixWorld);for(let Y=0,G=S.length;Y<G;Y++){const H=S[Y];if(H.texture!==null&&H.boundingBox.containsPoint(E))return H}return null}function Pn(S,O,Y,G,H){O.isScene!==!0&&(O=Zt),z.resetTextureUnits();const Ue=O.fog,ke=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?O.environment:null,Ae=K===null?w.outputColorSpace:K.isXRRenderTarget===!0?K.texture.colorSpace:It.workingColorSpace,Ye=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,$e=pe.get(G.envMap||ke,Ye),gt=G.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,St=!!Y.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),ie=!!Y.morphAttributes.position,ct=!!Y.morphAttributes.normal,Gt=!!Y.morphAttributes.color;let Mt=Ai;G.toneMapped&&(K===null||K.isXRRenderTarget===!0)&&(Mt=w.toneMapping);const Ct=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,on=Ct!==void 0?Ct.length:0,Ne=N.get(G),dn=y.state.lights;if(Rt===!0&&(yt===!0||S!==he)){const pt=S===he&&G.id===oe;Re.setState(G,S,pt)}let ht=!1;G.version===Ne.__version?(Ne.needsLights&&Ne.lightsStateVersion!==dn.state.version||Ne.outputColorSpace!==Ae||H.isBatchedMesh&&Ne.batching===!1||!H.isBatchedMesh&&Ne.batching===!0||H.isBatchedMesh&&Ne.batchingColor===!0&&H.colorTexture===null||H.isBatchedMesh&&Ne.batchingColor===!1&&H.colorTexture!==null||H.isInstancedMesh&&Ne.instancing===!1||!H.isInstancedMesh&&Ne.instancing===!0||H.isSkinnedMesh&&Ne.skinning===!1||!H.isSkinnedMesh&&Ne.skinning===!0||H.isInstancedMesh&&Ne.instancingColor===!0&&H.instanceColor===null||H.isInstancedMesh&&Ne.instancingColor===!1&&H.instanceColor!==null||H.isInstancedMesh&&Ne.instancingMorph===!0&&H.morphTexture===null||H.isInstancedMesh&&Ne.instancingMorph===!1&&H.morphTexture!==null||Ne.envMap!==$e||G.fog===!0&&Ne.fog!==Ue||Ne.numClippingPlanes!==void 0&&(Ne.numClippingPlanes!==Re.numPlanes||Ne.numIntersection!==Re.numIntersection)||Ne.vertexAlphas!==gt||Ne.vertexTangents!==St||Ne.morphTargets!==ie||Ne.morphNormals!==ct||Ne.morphColors!==Gt||Ne.toneMapping!==Mt||Ne.morphTargetsCount!==on||!!Ne.lightProbeGrid!=y.state.lightProbeGridArray.length>0)&&(ht=!0):(ht=!0,Ne.__version=G.version);let gn=Ne.currentProgram;ht===!0&&(gn=Rn(G,O,H),L&&G.isNodeMaterial&&L.onUpdateProgram(G,gn,Ne));let _n=!1,Jt=!1,hn=!1;const Nt=gn.getUniforms(),jt=Ne.uniforms;if(x.useProgram(gn.program)&&(_n=!0,Jt=!0,hn=!0),G.id!==oe&&(oe=G.id,Jt=!0),Ne.needsLights){const pt=gi(y.state.lightProbeGridArray,H);Ne.lightProbeGrid!==pt&&(Ne.lightProbeGrid=pt,Jt=!0)}if(_n||he!==S){x.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),Nt.setValue(U,"projectionMatrix",S.projectionMatrix),Nt.setValue(U,"viewMatrix",S.matrixWorldInverse);const ln=Nt.map.cameraPosition;ln!==void 0&&ln.setValue(U,zt.setFromMatrixPosition(S.matrixWorld)),C.logarithmicDepthBuffer&&Nt.setValue(U,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&Nt.setValue(U,"isOrthographic",S.isOrthographicCamera===!0),he!==S&&(he=S,Jt=!0,hn=!0)}if(Ne.needsLights&&(dn.state.directionalShadowMap.length>0&&Nt.setValue(U,"directionalShadowMap",dn.state.directionalShadowMap,z),dn.state.spotShadowMap.length>0&&Nt.setValue(U,"spotShadowMap",dn.state.spotShadowMap,z),dn.state.pointShadowMap.length>0&&Nt.setValue(U,"pointShadowMap",dn.state.pointShadowMap,z)),H.isSkinnedMesh){Nt.setOptional(U,H,"bindMatrix"),Nt.setOptional(U,H,"bindMatrixInverse");const pt=H.skeleton;pt&&(pt.boneTexture===null&&pt.computeBoneTexture(),Nt.setValue(U,"boneTexture",pt.boneTexture,z))}H.isBatchedMesh&&(Nt.setOptional(U,H,"batchingTexture"),Nt.setValue(U,"batchingTexture",H._matricesTexture,z),Nt.setOptional(U,H,"batchingIdTexture"),Nt.setValue(U,"batchingIdTexture",H._indirectTexture,z),Nt.setOptional(U,H,"batchingColorTexture"),H._colorsTexture!==null&&Nt.setValue(U,"batchingColorTexture",H._colorsTexture,z));const kn=Y.morphAttributes;if((kn.position!==void 0||kn.normal!==void 0||kn.color!==void 0)&&D.update(H,Y,gn),(Jt||Ne.receiveShadow!==H.receiveShadow)&&(Ne.receiveShadow=H.receiveShadow,Nt.setValue(U,"receiveShadow",H.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&O.environment!==null&&(jt.envMapIntensity.value=O.environmentIntensity),jt.dfgLUT!==void 0&&(jt.dfgLUT.value=_x()),Jt){if(Nt.setValue(U,"toneMappingExposure",w.toneMappingExposure),Ne.needsLights&&ca(jt,hn),Ue&&G.fog===!0&&De.refreshFogUniforms(jt,Ue),De.refreshMaterialUniforms(jt,G,le,de,y.state.transmissionRenderTarget[S.id]),Ne.needsLights&&Ne.lightProbeGrid){const pt=Ne.lightProbeGrid;jt.probesSH.value=pt.texture,jt.probesMin.value.copy(pt.boundingBox.min),jt.probesMax.value.copy(pt.boundingBox.max),jt.probesResolution.value.copy(pt.resolution)}ao.upload(U,zn(Ne),jt,z)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(ao.upload(U,zn(Ne),jt,z),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&Nt.setValue(U,"center",H.center),Nt.setValue(U,"modelViewMatrix",H.modelViewMatrix),Nt.setValue(U,"normalMatrix",H.normalMatrix),Nt.setValue(U,"modelMatrix",H.matrixWorld),G.uniformsGroups!==void 0){const pt=G.uniformsGroups;for(let ln=0,at=pt.length;ln<at;ln++){const Ke=pt[ln];te.update(Ke,gn),te.bind(Ke,gn)}}return gn}function ca(S,O){S.ambientLightColor.needsUpdate=O,S.lightProbe.needsUpdate=O,S.directionalLights.needsUpdate=O,S.directionalLightShadows.needsUpdate=O,S.pointLights.needsUpdate=O,S.pointLightShadows.needsUpdate=O,S.spotLights.needsUpdate=O,S.spotLightShadows.needsUpdate=O,S.rectAreaLights.needsUpdate=O,S.hemisphereLights.needsUpdate=O}function er(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return k},this.getRenderTarget=function(){return K},this.setRenderTargetTextures=function(S,O,Y){const G=N.get(S);G.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),N.get(S.texture).__webglTexture=O,N.get(S.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:Y,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,O){const Y=N.get(S);Y.__webglFramebuffer=O,Y.__useDefaultFramebuffer=O===void 0},this.setRenderTarget=function(S,O=0,Y=0){K=S,X=O,k=Y;let G=null,H=!1,Ue=!1;if(S){const Ae=N.get(S);if(Ae.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(U.FRAMEBUFFER,Ae.__webglFramebuffer),Ie.copy(S.viewport),ve.copy(S.scissor),_t=S.scissorTest,x.viewport(Ie),x.scissor(ve),x.setScissorTest(_t),oe=-1;return}else if(Ae.__webglFramebuffer===void 0)z.setupRenderTarget(S);else if(Ae.__hasExternalTextures)z.rebindTextures(S,N.get(S.texture).__webglTexture,N.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){const gt=S.depthTexture;if(Ae.__boundDepthTexture!==gt){if(gt!==null&&N.has(gt)&&(S.width!==gt.image.width||S.height!==gt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");z.setupDepthRenderbuffer(S)}}const Ye=S.texture;(Ye.isData3DTexture||Ye.isDataArrayTexture||Ye.isCompressedArrayTexture)&&(Ue=!0);const $e=N.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray($e[O])?G=$e[O][Y]:G=$e[O],H=!0):S.samples>0&&z.useMultisampledRTT(S)===!1?G=N.get(S).__webglMultisampledFramebuffer:Array.isArray($e)?G=$e[Y]:G=$e,Ie.copy(S.viewport),ve.copy(S.scissor),_t=S.scissorTest}else Ie.copy(je).multiplyScalar(le).floor(),ve.copy(wt).multiplyScalar(le).floor(),_t=lt;if(Y!==0&&(G=V),x.bindFramebuffer(U.FRAMEBUFFER,G)&&x.drawBuffers(S,G),x.viewport(Ie),x.scissor(ve),x.setScissorTest(_t),H){const Ae=N.get(S.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+O,Ae.__webglTexture,Y)}else if(Ue){const Ae=O;for(let Ye=0;Ye<S.textures.length;Ye++){const $e=N.get(S.textures[Ye]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+Ye,$e.__webglTexture,Y,Ae)}}else if(S!==null&&Y!==0){const Ae=N.get(S.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Ae.__webglTexture,Y)}oe=-1},this.readRenderTargetPixels=function(S,O,Y,G,H,Ue,ke,Ae=0){if(!(S&&S.isWebGLRenderTarget)){Lt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ye=N.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&ke!==void 0&&(Ye=Ye[ke]),Ye){x.bindFramebuffer(U.FRAMEBUFFER,Ye);try{const $e=S.textures[Ae],gt=$e.format,St=$e.type;if(S.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+Ae),!C.textureFormatReadable(gt)){Lt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!C.textureTypeReadable(St)){Lt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=S.width-G&&Y>=0&&Y<=S.height-H&&U.readPixels(O,Y,G,H,xe.convert(gt),xe.convert(St),Ue)}finally{const $e=K!==null?N.get(K).__webglFramebuffer:null;x.bindFramebuffer(U.FRAMEBUFFER,$e)}}},this.readRenderTargetPixelsAsync=async function(S,O,Y,G,H,Ue,ke,Ae=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ye=N.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&ke!==void 0&&(Ye=Ye[ke]),Ye)if(O>=0&&O<=S.width-G&&Y>=0&&Y<=S.height-H){x.bindFramebuffer(U.FRAMEBUFFER,Ye);const $e=S.textures[Ae],gt=$e.format,St=$e.type;if(S.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+Ae),!C.textureFormatReadable(gt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!C.textureTypeReadable(St))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const ie=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,ie),U.bufferData(U.PIXEL_PACK_BUFFER,Ue.byteLength,U.STREAM_READ),U.readPixels(O,Y,G,H,xe.convert(gt),xe.convert(St),0);const ct=K!==null?N.get(K).__webglFramebuffer:null;x.bindFramebuffer(U.FRAMEBUFFER,ct);const Gt=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await jf(U,Gt,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,ie),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,Ue),U.deleteBuffer(ie),U.deleteSync(Gt),Ue}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,O=null,Y=0){const G=Math.pow(2,-Y),H=Math.floor(S.image.width*G),Ue=Math.floor(S.image.height*G),ke=O!==null?O.x:0,Ae=O!==null?O.y:0;z.setTexture2D(S,0),U.copyTexSubImage2D(U.TEXTURE_2D,Y,0,0,ke,Ae,H,Ue),x.unbindTexture()},this.copyTextureToTexture=function(S,O,Y=null,G=null,H=0,Ue=0){let ke,Ae,Ye,$e,gt,St,ie,ct,Gt;const Mt=S.isCompressedTexture?S.mipmaps[Ue]:S.image;if(Y!==null)ke=Y.max.x-Y.min.x,Ae=Y.max.y-Y.min.y,Ye=Y.isBox3?Y.max.z-Y.min.z:1,$e=Y.min.x,gt=Y.min.y,St=Y.isBox3?Y.min.z:0;else{const jt=Math.pow(2,-H);ke=Math.floor(Mt.width*jt),Ae=Math.floor(Mt.height*jt),S.isDataArrayTexture?Ye=Mt.depth:S.isData3DTexture?Ye=Math.floor(Mt.depth*jt):Ye=1,$e=0,gt=0,St=0}G!==null?(ie=G.x,ct=G.y,Gt=G.z):(ie=0,ct=0,Gt=0);const Ct=xe.convert(O.format),on=xe.convert(O.type);let Ne;O.isData3DTexture?(z.setTexture3D(O,0),Ne=U.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(z.setTexture2DArray(O,0),Ne=U.TEXTURE_2D_ARRAY):(z.setTexture2D(O,0),Ne=U.TEXTURE_2D),x.activeTexture(U.TEXTURE0),x.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,O.flipY),x.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),x.pixelStorei(U.UNPACK_ALIGNMENT,O.unpackAlignment);const dn=x.getParameter(U.UNPACK_ROW_LENGTH),ht=x.getParameter(U.UNPACK_IMAGE_HEIGHT),gn=x.getParameter(U.UNPACK_SKIP_PIXELS),_n=x.getParameter(U.UNPACK_SKIP_ROWS),Jt=x.getParameter(U.UNPACK_SKIP_IMAGES);x.pixelStorei(U.UNPACK_ROW_LENGTH,Mt.width),x.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Mt.height),x.pixelStorei(U.UNPACK_SKIP_PIXELS,$e),x.pixelStorei(U.UNPACK_SKIP_ROWS,gt),x.pixelStorei(U.UNPACK_SKIP_IMAGES,St);const hn=S.isDataArrayTexture||S.isData3DTexture,Nt=O.isDataArrayTexture||O.isData3DTexture;if(S.isDepthTexture){const jt=N.get(S),kn=N.get(O),pt=N.get(jt.__renderTarget),ln=N.get(kn.__renderTarget);x.bindFramebuffer(U.READ_FRAMEBUFFER,pt.__webglFramebuffer),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,ln.__webglFramebuffer);for(let at=0;at<Ye;at++)hn&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,N.get(S).__webglTexture,H,St+at),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,N.get(O).__webglTexture,Ue,Gt+at)),U.blitFramebuffer($e,gt,ke,Ae,ie,ct,ke,Ae,U.DEPTH_BUFFER_BIT,U.NEAREST);x.bindFramebuffer(U.READ_FRAMEBUFFER,null),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(H!==0||S.isRenderTargetTexture||N.has(S)){const jt=N.get(S),kn=N.get(O);x.bindFramebuffer(U.READ_FRAMEBUFFER,j),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,I);for(let pt=0;pt<Ye;pt++)hn?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,jt.__webglTexture,H,St+pt):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,jt.__webglTexture,H),Nt?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,kn.__webglTexture,Ue,Gt+pt):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,kn.__webglTexture,Ue),H!==0?U.blitFramebuffer($e,gt,ke,Ae,ie,ct,ke,Ae,U.COLOR_BUFFER_BIT,U.NEAREST):Nt?U.copyTexSubImage3D(Ne,Ue,ie,ct,Gt+pt,$e,gt,ke,Ae):U.copyTexSubImage2D(Ne,Ue,ie,ct,$e,gt,ke,Ae);x.bindFramebuffer(U.READ_FRAMEBUFFER,null),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else Nt?S.isDataTexture||S.isData3DTexture?U.texSubImage3D(Ne,Ue,ie,ct,Gt,ke,Ae,Ye,Ct,on,Mt.data):O.isCompressedArrayTexture?U.compressedTexSubImage3D(Ne,Ue,ie,ct,Gt,ke,Ae,Ye,Ct,Mt.data):U.texSubImage3D(Ne,Ue,ie,ct,Gt,ke,Ae,Ye,Ct,on,Mt):S.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,Ue,ie,ct,ke,Ae,Ct,on,Mt.data):S.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,Ue,ie,ct,Mt.width,Mt.height,Ct,Mt.data):U.texSubImage2D(U.TEXTURE_2D,Ue,ie,ct,ke,Ae,Ct,on,Mt);x.pixelStorei(U.UNPACK_ROW_LENGTH,dn),x.pixelStorei(U.UNPACK_IMAGE_HEIGHT,ht),x.pixelStorei(U.UNPACK_SKIP_PIXELS,gn),x.pixelStorei(U.UNPACK_SKIP_ROWS,_n),x.pixelStorei(U.UNPACK_SKIP_IMAGES,Jt),Ue===0&&O.generateMipmaps&&U.generateMipmap(Ne),x.unbindTexture()},this.initRenderTarget=function(S){N.get(S).__webglFramebuffer===void 0&&z.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?z.setTextureCube(S,0):S.isData3DTexture?z.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?z.setTexture2DArray(S,0):z.setTexture2D(S,0),x.unbindTexture()},this.resetState=function(){X=0,k=0,K=null,x.reset(),Pe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ti}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=It._getDrawingBufferColorSpace(e),t.unpackColorSpace=It._getUnpackColorSpace()}}const qs=Object.freeze(Object.defineProperty({__proto__:null,ACESFilmicToneMapping:Uc,AddEquation:Sa,AddOperation:sh,AdditiveBlending:fc,AgXToneMapping:Oc,AlphaFormat:Vc,AlwaysCompare:mh,AlwaysDepth:lo,AlwaysStencilFunc:gc,ArrayCamera:zh,BackSide:Xn,BasicDepthPacking:lh,Box3:Pr,BoxGeometry:ai,BufferAttribute:mi,BufferGeometry:Qn,ByteType:zc,Camera:eu,CanvasTexture:Rh,CineonToneMapping:Dc,ClampToEdgeWrapping:Fi,Color:At,ColorManagement:It,ConstantAlphaFactor:ih,ConstantColorFactor:th,Controls:Hh,CubeCamera:Bh,CubeDepthTexture:Ph,CubeReflectionMapping:Pa,CubeRefractionMapping:Ja,CubeTexture:Jc,CubeUVReflectionMapping:hs,CullFaceBack:hc,CullFaceFront:zd,CullFaceNone:Bd,CustomBlending:Gd,CustomToneMapping:Nc,Data3DTexture:yh,DataArrayTexture:Yc,DataTexture:wh,DepthFormat:Hi,DepthStencilFormat:Ea,DepthTexture:ja,DirectionalLight:Fh,DoubleSide:hi,DstAlphaFactor:Zd,DstColorFactor:jd,EdgesGeometry:Ma,EqualCompare:hh,EqualDepth:uo,EquirectangularReflectionMapping:Qs,EquirectangularRefractionMapping:eo,Euler:oa,EventDispatcher:la,ExternalTexture:jc,Float32BufferAttribute:Yn,FloatType:Ei,Fog:pl,FrontSide:ra,Frustum:ml,GLSL3:_c,GreaterCompare:fh,GreaterDepth:fo,GreaterEqualCompare:dl,GreaterEqualDepth:ho,GridHelper:Gh,Group:Ta,HalfFloatType:Gi,HemisphereLight:Oh,ImageUtils:vh,IntType:al,InterleavedBuffer:Eh,InterleavedBufferAttribute:us,KeepStencilOp:Ga,Layers:fl,LessCompare:dh,LessDepth:co,LessEqualCompare:ul,LessEqualDepth:Za,Light:Qc,Line:Ch,LineBasicMaterial:ji,LineSegments:Di,LinearFilter:In,LinearMipmapLinearFilter:ba,LinearMipmapNearestFilter:to,LinearSRGBColorSpace:os,LinearToneMapping:Lc,LinearTransfer:ls,MOUSE:Xa,Material:Ua,MathUtils:xh,Matrix2:yc,Matrix3:vt,Matrix4:Qt,MaxEquation:Xd,Mesh:bn,MeshBasicMaterial:Zc,MeshDepthMaterial:Uh,MeshDistanceMaterial:Nh,MeshStandardMaterial:io,MinEquation:Wd,MirroredRepeatWrapping:go,MixOperation:rh,MultiplyBlending:mc,MultiplyOperation:Pc,NearestFilter:wn,NearestMipmapLinearFilter:qr,NearestMipmapNearestFilter:oh,NeutralToneMapping:Fc,NeverCompare:uh,NeverDepth:oo,NoBlending:ki,NoColorSpace:Qi,NoToneMapping:Ai,NormalBlending:Ya,NotEqualCompare:ph,NotEqualDepth:po,Object3D:Mn,ObjectSpaceNormalMap:ch,OneFactor:$d,OneMinusConstantAlphaFactor:ah,OneMinusConstantColorFactor:nh,OneMinusDstAlphaFactor:Jd,OneMinusDstColorFactor:Qd,OneMinusSrcAlphaFactor:so,OneMinusSrcColorFactor:Kd,OrthographicCamera:gl,PCFShadowMap:Jr,PCFSoftShadowMap:kd,PMREMGenerator:Sc,PerspectiveCamera:ri,Plane:Ni,PlaneGeometry:Qa,Quaternion:sa,R11_EAC_Format:Eo,RED_GREEN_RGTC2_Format:ss,RED_RGTC1_Format:Wo,REVISION:il,RG11_EAC_Format:rs,RGBAFormat:pi,RGBAIntegerFormat:cl,RGBA_ASTC_10x10_Format:Bo,RGBA_ASTC_10x5_Format:No,RGBA_ASTC_10x6_Format:Oo,RGBA_ASTC_10x8_Format:Fo,RGBA_ASTC_12x10_Format:zo,RGBA_ASTC_12x12_Format:ko,RGBA_ASTC_4x4_Format:wo,RGBA_ASTC_5x4_Format:Co,RGBA_ASTC_5x5_Format:Ro,RGBA_ASTC_6x5_Format:Po,RGBA_ASTC_6x6_Format:Lo,RGBA_ASTC_8x5_Format:Io,RGBA_ASTC_8x6_Format:Do,RGBA_ASTC_8x8_Format:Uo,RGBA_BPTC_Format:Go,RGBA_ETC2_EAC_Format:bo,RGBA_PVRTC_2BPPV1_Format:Mo,RGBA_PVRTC_4BPPV1_Format:vo,RGBA_S3TC_DXT1_Format:Qr,RGBA_S3TC_DXT3_Format:es,RGBA_S3TC_DXT5_Format:ts,RGBFormat:Wc,RGB_BPTC_SIGNED_Format:Ho,RGB_BPTC_UNSIGNED_Format:Vo,RGB_ETC1_Format:yo,RGB_ETC2_Format:So,RGB_PVRTC_2BPPV1_Format:xo,RGB_PVRTC_4BPPV1_Format:_o,RGB_S3TC_DXT1_Format:jr,RGFormat:La,RGIntegerFormat:ll,RawShaderMaterial:Dh,Ray:ps,Raycaster:kh,RedFormat:Xc,RedIntegerFormat:ol,ReinhardToneMapping:Ic,RenderTarget:Mh,RepeatWrapping:mo,ReverseSubtractEquation:Vd,SIGNED_R11_EAC_Format:To,SIGNED_RED_GREEN_RGTC2_Format:Yo,SIGNED_RED_RGTC1_Format:Xo,SIGNED_RG11_EAC_Format:Ao,SRGBColorSpace:ii,SRGBTransfer:Vt,Scene:bh,ShaderChunk:Tt,ShaderLib:bi,ShaderMaterial:Ri,ShortType:kc,Source:hl,Sphere:fs,Spherical:Mc,Sprite:Ah,SpriteMaterial:Kc,SrcAlphaFactor:ro,SrcAlphaSaturateFactor:eh,SrcColorFactor:qd,StaticDrawUsage:qo,SubtractEquation:Hd,SubtractiveBlending:pc,TOUCH:Va,TangentSpaceNormalMap:$o,Texture:Dn,Triangle:Jn,UVMapping:Bc,Uint16BufferAttribute:$c,Uint32BufferAttribute:qc,UniformsLib:Fe,UniformsUtils:Ih,UnsignedByteType:Zn,UnsignedInt101111Type:Hc,UnsignedInt248Type:Er,UnsignedInt5999Type:Gc,UnsignedIntType:Ci,UnsignedShort4444Type:rl,UnsignedShort5551Type:sl,UnsignedShortType:br,VSMShadowMap:yr,Vector2:ot,Vector3:B,Vector4:rn,WebGLCoordinateSystem:Ti,WebGLCubeRenderTarget:tu,WebGLRenderTarget:wi,WebGLRenderer:Jh,WebGLUtils:Kh,WebGPUCoordinateSystem:Tr,WebXRController:no,ZeroFactor:Yd,createCanvasElement:gh,error:Lt,log:cs,warn:ut,warnOnce:$a},Symbol.toStringTag,{value:"Module"})),Sd={type:"change"},nu={type:"start"},jh={type:"end"},Ks=new ps,bd=new Ni,xx=Math.cos(70*xh.DEG2RAD),Sn=new B,qn=2*Math.PI,$t={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},lc=1e-6;class vx extends Hh{constructor(e,t=null){super(e,t),this.state=$t.NONE,this.target=new B,this.cursor=new B,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Xa.ROTATE,MIDDLE:Xa.DOLLY,RIGHT:Xa.PAN},this.touches={ONE:Va.ROTATE,TWO:Va.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new B,this._lastQuaternion=new sa,this._lastTargetPosition=new B,this._quat=new sa().setFromUnitVectors(e.up,new B(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Mc,this._sphericalDelta=new Mc,this._scale=1,this._panOffset=new B,this._rotateStart=new ot,this._rotateEnd=new ot,this._rotateDelta=new ot,this._panStart=new ot,this._panEnd=new ot,this._panDelta=new ot,this._dollyStart=new ot,this._dollyEnd=new ot,this._dollyDelta=new ot,this._dollyDirection=new B,this._mouse=new ot,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=yx.bind(this),this._onPointerDown=Mx.bind(this),this._onPointerUp=Sx.bind(this),this._onContextMenu=Rx.bind(this),this._onMouseWheel=Tx.bind(this),this._onKeyDown=Ax.bind(this),this._onTouchStart=wx.bind(this),this._onTouchMove=Cx.bind(this),this._onMouseDown=bx.bind(this),this._onMouseMove=Ex.bind(this),this._interceptControlDown=Px.bind(this),this._interceptControlUp=Lx.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Sd),this.update(),this.state=$t.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){const t=this.object.position;Sn.copy(t).sub(this.target),Sn.applyQuaternion(this._quat),this._spherical.setFromVector3(Sn),this.autoRotate&&this.state===$t.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,a=this.maxAzimuthAngle;isFinite(i)&&isFinite(a)&&(i<-Math.PI?i+=qn:i>Math.PI&&(i-=qn),a<-Math.PI?a+=qn:a>Math.PI&&(a-=qn),i<=a?this._spherical.theta=Math.max(i,Math.min(a,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+a)/2?Math.max(i,this._spherical.theta):Math.min(a,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const s=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=s!=this._spherical.radius}if(Sn.setFromSpherical(this._spherical),Sn.applyQuaternion(this._quatInverse),t.copy(this.target).add(Sn),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let s=null;if(this.object.isPerspectiveCamera){const l=Sn.length();s=this._clampDistance(l*this._scale);const c=l-s;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),r=!!c}else if(this.object.isOrthographicCamera){const l=new B(this._mouse.x,this._mouse.y,0);l.unproject(this.object);const c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=c!==this.object.zoom;const o=new B(this._mouse.x,this._mouse.y,0);o.unproject(this.object),this.object.position.sub(o).add(l),this.object.updateMatrixWorld(),s=Sn.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;s!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(s).add(this.object.position):(Ks.origin.copy(this.object.position),Ks.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ks.direction))<xx?this.object.lookAt(this.target):(bd.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ks.intersectPlane(bd,this.target))))}else if(this.object.isOrthographicCamera){const s=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),s!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>lc||8*(1-this._lastQuaternion.dot(this.object.quaternion))>lc||this._lastTargetPosition.distanceToSquared(this.target)>lc?(this.dispatchEvent(Sd),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?qn/60*this.autoRotateSpeed*e:qn/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Sn.setFromMatrixColumn(t,0),Sn.multiplyScalar(-e),this._panOffset.add(Sn)}_panUp(e,t){this.screenSpacePanning===!0?Sn.setFromMatrixColumn(t,1):(Sn.setFromMatrixColumn(t,0),Sn.crossVectors(this.object.up,Sn)),Sn.multiplyScalar(e),this._panOffset.add(Sn)}_pan(e,t){const i=this.domElement;if(this.object.isPerspectiveCamera){const a=this.object.position;Sn.copy(a).sub(this.target);let r=Sn.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/i.clientHeight,this.object.matrix),this._panUp(2*t*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const i=this.domElement.getBoundingClientRect(),a=e-i.left,r=t-i.top,s=i.width,l=i.height;this._mouse.x=a/s*2-1,this._mouse.y=-(r/l)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(qn*this._rotateDelta.x/t.clientHeight),this._rotateUp(qn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(qn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-qn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(qn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-qn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),a=.5*(e.pageY+t.y);this._rotateStart.set(i,a)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),a=.5*(e.pageY+t.y);this._panStart.set(i,a)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,a=e.pageY-t.y,r=Math.sqrt(i*i+a*a);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const i=this._getSecondPointerPosition(e),a=.5*(e.pageX+i.x),r=.5*(e.pageY+i.y);this._rotateEnd.set(a,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(qn*this._rotateDelta.x/t.clientHeight),this._rotateUp(qn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),a=.5*(e.pageY+t.y);this._panEnd.set(i,a)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,a=e.pageY-t.y,r=Math.sqrt(i*i+a*a);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const s=(e.pageX+t.x)*.5,l=(e.pageY+t.y)*.5;this._updateZoomParameters(s,l)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new ot,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}}function Mx(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function yx(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function Sx(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(jh),this.state=$t.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function bx(n){let e;switch(n.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Xa.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=$t.DOLLY;break;case Xa.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=$t.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=$t.ROTATE}break;case Xa.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=$t.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=$t.PAN}break;default:this.state=$t.NONE}this.state!==$t.NONE&&this.dispatchEvent(nu)}function Ex(n){switch(this.state){case $t.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case $t.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case $t.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function Tx(n){this.enabled===!1||this.enableZoom===!1||this.state!==$t.NONE||(n.preventDefault(),this.dispatchEvent(nu),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(jh))}function Ax(n){this.enabled!==!1&&this._handleKeyDown(n)}function wx(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case Va.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=$t.TOUCH_ROTATE;break;case Va.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=$t.TOUCH_PAN;break;default:this.state=$t.NONE}break;case 2:switch(this.touches.TWO){case Va.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=$t.TOUCH_DOLLY_PAN;break;case Va.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=$t.TOUCH_DOLLY_ROTATE;break;default:this.state=$t.NONE}break;default:this.state=$t.NONE}this.state!==$t.NONE&&this.dispatchEvent(nu)}function Cx(n){switch(this._trackPointer(n),this.state){case $t.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case $t.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case $t.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case $t.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=$t.NONE}}function Rx(n){this.enabled!==!1&&n.preventDefault()}function Px(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Lx(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}const Ot=1/100,Zs=10,Ed=4,Ix=400,Dx=2400;function $r(n){n&&(n.geoms.forEach(e=>e.dispose()),n.mats.forEach(e=>e.dispose()))}function Ux(n,e,t,i,a,r){let s=n,l=e,c=l.pallets,o=i,d=a,h=r??{},u=h.onSeleccion,p=h.onMoverCamion,g=h.onComprobarApilableManual,v=h.onApilarManual,_=h.onEnviarEspera,m=h.onRecuperarDeEspera,M=h.crateGeomPorRef,R=h.crateInfoPorRef,E=h.rotacionVisual,A=h.detalle??!1;const y=s.clientWidth||800,T=s.clientHeight||480;let f=l.truckProfile.largoInteriorMm*Ot,b=l.truckProfile.anchoInteriorMm*Ot,w=l.truckProfile.altoInteriorMm*Ot;const P=Ix*Ot,L=Dx*Ot;let V=b+P;const j=new bh;j.background=new At(988185);const I=new ri(45,y/T,.1,2e3);if(h.cameraState){const W=h.cameraState;I.position.set(W.px,W.py,W.pz)}else I.position.set(f*.95,w*1.8,(b+P+L)*1.4);const X=new Jh({antialias:!0});X.setSize(y,T),X.setPixelRatio(Math.min(window.devicePixelRatio,2)),s.innerHTML="",s.appendChild(X.domElement),j.add(new Oh(13625599,1316895,1));const k=new Fh(16777215,1.1);j.add(k);const K=new Ta;j.add(K);let oe={geoms:[],mats:[]};function he(){for(;K.children.length;)K.remove(K.children[0]);$r(oe);const W=[],J=[];k.position.set(f*.7,w*3.2,b*1.6),j.fog=new pl(988185,f*2,f*5);const Ge=new ai(f,w,b),Me=new Ma(Ge),ge=new ji({color:5231045,transparent:!0,opacity:.55}),Le=new Di(Me,ge);Le.position.set(f/2,w/2,b/2),K.add(Le),W.push(Ge,Me),J.push(ge);const nt=new Qa(f,b),Xe=new io({color:1449254,transparent:!0,opacity:.65,side:hi}),bt=new bn(nt,Xe);bt.rotation.x=-Math.PI/2,bt.position.set(f/2,0,b/2),K.add(bt),W.push(nt),J.push(Xe);const qe=b+P+L,kt=new Gh(Math.max(f,qe)*1.4,30,2765889,1844528);kt.position.set(f/2,-.01,qe/2),K.add(kt),W.push(kt.geometry),J.push(kt.material),V=b+P;const Wt=new Qa(f,L),Je=new io({color:1845788,transparent:!0,opacity:.7,side:hi}),xn=new bn(Wt,Je);xn.rotation.x=-Math.PI/2,xn.position.set(f/2,-.005,V+L/2),K.add(xn),W.push(Wt),J.push(Je);const en=new Ma(new ai(f,.01,L)),dt=new ji({color:2776106,transparent:!0,opacity:.8}),Cn=new Di(en,dt);Cn.position.set(f/2,0,V+L/2),K.add(Cn),W.push(en),J.push(dt);{const Rn=document.createElement("canvas");Rn.width=512,Rn.height=64;const zn=Rn.getContext("2d");zn.clearRect(0,0,512,64),zn.font="bold 28px JetBrains Mono, monospace",zn.fillStyle="#2a8c2a",zn.textAlign="center",zn.fillText("ZONA DE ESPERA",256,40);const li=new Rh(Rn),gi=new Kc({map:li,transparent:!0}),Pn=new Ah(gi);Pn.scale.set(f*.4,f*.04,1),Pn.position.set(f/2,.05,V+L*.15),K.add(Pn),J.push(gi)}oe={geoms:W,mats:J}}he();const Ie=new ji({color:16777215,linewidth:2}),ve=new ji({color:16755200,linewidth:2}),_t=new ji({color:4521864,linewidth:1,transparent:!0,opacity:.7}),Ft=new Ta;j.add(Ft);const Qe=new Map,ee=new Map,de=new Map;function le(W,J,Ge,Me){const ge=[],Le=[],nt=new Ta;nt.position.set(Ge,0,Me),nt.userData=J;const Xe=[...W].sort((bt,qe)=>bt.nivel-qe.nivel);for(let bt=0;bt<Xe.length;bt++){const qe=Xe[bt],kt=qe.z*Ot,Wt=t.get(qe.referenceId)??"#4fd1c5",Je=R==null?void 0:R.get(qe.referenceId),xn=qe.palletType,en=Math.abs(qe.anchoOcupadoMm-xn.anchoMm)>Math.abs(qe.anchoOcupadoMm-xn.largoMm),dt=(en?xn.anchoMm:xn.largoMm)*Ot,Cn=(en?xn.largoMm:xn.anchoMm)*Ot,Rn=(Je==null?void 0:Je.tipo)==="carga",zn=(Je==null?void 0:Je.tipo)==="foam",li=(Je==null?void 0:Je.laminaAltoMm)??(qe.unidades>0?qe.alturaMm/qe.unidades:qe.alturaMm),gi=Math.max(zn?qe.alturaMm*Ot:li*Ot,.01),Pn=!!l.truckProfile.capiculado,ca=Pn?(Je==null?void 0:Je.gananciaAMm)??0:0,er=Pn?(Je==null?void 0:Je.gananciaBMm)??0:0,S=ca>0||er>0,O=Mt=>Mt%2===0?ca:er,Y=qe.subunidadGlobalInicial??bt,G=zn?1:qe.unidades,H=[0];for(let Mt=1;Mt<G;Mt++)H.push(H[Mt-1]+Math.max(li-O(Y+Mt-1),1));const Ue=new ai(dt*.95,gi*.92,Cn*.95),ke=new Ma(Ue);ge.push(Ue,ke);const Ae=new io({color:Wt,roughness:.55,metalness:.05,transparent:J.enEspera,opacity:J.enEspera?.75:1}),Ye=new ji({color:660496,transparent:!0,opacity:.4});Le.push(Ae,Ye);const $e=A?Rn&&(Je!=null&&Je.paletBase)?M==null?void 0:M.get(Je.paletBase):M==null?void 0:M.get(qe.referenceId):null,gt=xn.largoMm===xn.anchoMm,St=(E==null?void 0:E.get(J.stackKey))??!1,ie=Rn?en:gt?St:en,ct=ie!==((Je==null?void 0:Je.intercambiado)??!1),Gt=Mt=>{const Ct=Mt.userData.recursos3d;Ct&&(ge.push(...Ct.geoms),Le.push(...Ct.mats))};if(Rn&&Je){const Mt=Je.laminaAltoMm/10*Ot*10,Ct=Je.paletBase?M==null?void 0:M.get(Je.paletBase):null,Ne=(Ct?Ka(Ct).alto:0)*Ot*10,dn=M==null?void 0:M.get(qe.referenceId),ht=Je.disposicion??{columnas:1,colsLargo:1,colsAncho:1,girado:!1},gn=ct?ht.colsAncho:ht.colsLargo,_n=ct?ht.colsLargo:ht.colsAncho,Jt=ht.girado!==ct,hn=dt/gn,Nt=Cn/_n,jt=pt=>{const ln=Math.floor(qe.unidades/ht.columnas),at=qe.unidades%ht.columnas;return ln+(pt<at?1:0)},kn=pt=>{const ln=Math.floor(pt/_n),at=pt%_n;return{x:hn*(ln+.5),z:Nt*(at+.5)}};if($e&&dn){const pt=xs(qs,$e,{colorBase:Wt,opacidad:J.enEspera?.75:1,conAristas:!0,rotar90:ct,escala:Ot});Gt(pt),pt.position.set(dt/2,kt,Cn/2),pt.traverse(Ke=>{(Ke.isMesh||Ke.isLineSegments)&&(Ke.userData={stackKey:J.stackKey,isCargo:Ke.isMesh})}),nt.add(pt);const at=Ka(dn).alto*Ot*10;for(let Ke=0;Ke<ht.columnas;Ke++){const{x:ci,z:ui}=kn(Ke),_i=jt(Ke);for(let Un=0;Un<_i;Un++){const Ln=xs(qs,dn,{colorBase:Wt,opacidad:J.enEspera?.75:1,conAristas:!0,rotar90:Jt,escala:Ot});Gt(Ln),Ln.position.set(ci,kt+Ne+at*Un,ui),Ln.traverse(ei=>{(ei.isMesh||ei.isLineSegments)&&(ei.userData={stackKey:J.stackKey,isCargo:ei.isMesh})}),nt.add(Ln)}}}else if($e){const pt=xs(qs,$e,{colorBase:Wt,opacidad:J.enEspera?.75:1,conAristas:!0,rotar90:ct,escala:Ot});Gt(pt),pt.position.set(dt/2,kt,Cn/2),pt.traverse(Ke=>{(Ke.isMesh||Ke.isLineSegments)&&(Ke.userData={stackKey:J.stackKey,isCargo:Ke.isMesh})}),nt.add(pt);const ln=(Jt?Je.laminaAnchoCm:Je.laminaLargoCm)/10,at=(Jt?Je.laminaLargoCm:Je.laminaAnchoCm)/10;for(let Ke=0;Ke<ht.columnas;Ke++){const{x:ci,z:ui}=kn(Ke),_i=jt(Ke);for(let Un=0;Un<_i;Un++){const Ln=new ai(ln*.95,Mt*.9,at*.95);ge.push(Ln);const ei=new bn(Ln,Ae);ei.position.set(ci,kt+Ne+Mt*(Un+.5),ui),ei.userData={stackKey:J.stackKey,isCargo:!0},nt.add(ei);const ua=new Ma(Ln);ge.push(ua);const Nn=new Di(ua,Ye);Nn.position.copy(ei.position),nt.add(Nn)}}}else{const pt=new ai(dt*.95,Ne*.98,Cn*.95);ge.push(pt);const ln=new bn(pt,Ae);ln.position.set(dt/2,kt+Ne/2,Cn/2),ln.userData={stackKey:J.stackKey,isCargo:!0},nt.add(ln);const at=new Ma(pt);ge.push(at);const Ke=new Di(at,Ye);Ke.position.copy(ln.position),nt.add(Ke);const ci=(Jt?Je.laminaAnchoCm:Je.laminaLargoCm)/10,ui=(Jt?Je.laminaLargoCm:Je.laminaAnchoCm)/10;for(let _i=0;_i<ht.columnas;_i++){const{x:Un,z:Ln}=kn(_i),ei=jt(_i);for(let ua=0;ua<ei;ua++){const Nn=new ai(ci*.95,Mt*.9,ui*.95);ge.push(Nn);const $n=new bn(Nn,Ae);$n.position.set(Un,kt+Ne+Mt*(ua+.5),Ln),$n.userData={stackKey:J.stackKey,isCargo:!0},nt.add($n);const Na=new Ma(Nn);ge.push(Na);const Pi=new Di(Na,Ye);Pi.position.copy($n.position),nt.add(Pi)}}}}else for(let Mt=0;Mt<G;Mt++){const Ct=S&&(Y+Mt)%2===1,on=Ct?((Je==null?void 0:Je.desplazamientoCapiculadoMm)??0)*Ot:0,dn=((Je==null?void 0:Je.desplazamientoCapiculadoEjeAncho)??!1)!==ie,ht=dt/2+(dn?0:on),gn=Cn/2+(dn?on:0),_n=H[Mt]*Ot;if($e){const Jt=xs(qs,$e,{colorBase:Wt,opacidad:J.enEspera?.75:1,conAristas:!0,rotar90:ct,escala:Ot,desmontado:!!(Je!=null&&Je.esDesmontado)});Gt(Jt),Jt.traverse(hn=>{(hn.isMesh||hn.isLineSegments)&&(hn.userData={stackKey:J.stackKey,isCargo:hn.isMesh})}),Ct?(Jt.rotation.x=Math.PI,Jt.position.set(ht,kt+_n+gi,gn)):Jt.position.set(ht,kt+_n,gn),nt.add(Jt)}else{const Jt=kt+_n+gi/2,hn=new bn(Ue,Ae);hn.position.set(ht,Jt,gn),hn.userData={stackKey:J.stackKey,isCargo:!0},nt.add(hn);const Nt=new Di(ke,Ye);Nt.position.copy(hn.position),Nt.userData={stackKey:J.stackKey},nt.add(Nt)}}}return ee.set(J.stackKey,{geoms:ge,mats:Le}),nt}let ze=null;function it(W){return W.bloqueado?ve:W.enEspera?_t:Ie}function je(W){const J=W.userData,Ge=J.largoMm*Ot+.06,Me=J.anchoMm*Ot+.06,ge=J.alturaTotal*Ot+.06,Le=new ai(Ge,ge,Me),nt=new Ma(Le);Le.dispose();const Xe=new Di(nt,it(J));Xe.position.set(Ge/2,ge/2,Me/2),Xe.userData={isOutline:!0},W.add(Xe)}function wt(W){W.children.filter(J=>J.userData.isOutline).forEach(J=>{W.remove(J),J instanceof Di&&J.geometry.dispose()})}function lt(W){ze!==W&&(ze&&wt(ze),ze=W,je(W),yt(W))}function Dt(){ze&&(wt(ze),ze=null),u==null||u(null)}function Rt(W){ze===W?(wt(W),je(W),yt(W)):lt(W)}function yt(W){const J=W.userData;u==null||u({refId:J.refId,paletIds:J.paletIds,stackKey:J.stackKey,largoMm:J.largoMm,anchoMm:J.anchoMm,alturaApilaMm:J.alturaTotal,unidades:J.unidades,niveles:J.niveles,posXcm:Math.round(J.truckX/10),posYcm:Math.round(J.truckY/10),enEspera:J.enEspera,bloqueado:J.bloqueado})}function Kt(W){return JSON.stringify([W.refId,W.largoMm,W.anchoMm,W.alturaTotal,W.niveles,W.unidades,W.enEspera,(E==null?void 0:E.get(W.stackKey))??!1,A])}function zt(){const W=new Map,J=new Map;for(const Me of c){const ge=`${Me.x}-${Me.y}`;J.set(ge,[...J.get(ge)??[],Me])}for(const[Me,ge]of J){const Le=ge.find(Xe=>Xe.nivel===0)??ge[0],nt={stackKey:Me,refId:Le.referenceId,paletIds:ge.map(Xe=>Xe.id),truckX:Le.x,truckY:Le.y,anchoMm:Le.anchoOcupadoMm,largoMm:Le.largoOcupadoMm,alturaTotal:Math.max(...ge.map(Xe=>Xe.z+Xe.alturaMm))-Math.min(...ge.map(Xe=>Xe.z)),unidades:ge.reduce((Xe,bt)=>Xe+bt.unidades,0),niveles:ge.length,enEspera:!1,bloqueado:d.has(Me)};W.set(Me,{sd:nt,palets:ge,threeX:Le.y*Ot,threeZ:Le.x*Ot})}let Ge=0;for(const Me of o){if(!Me.palets.length)continue;const ge=Me.palets.find(qe=>qe.nivel===0)??Me.palets[0],Le=`staged-${Me.id}`,nt={stackKey:Le,refId:ge.referenceId,paletIds:Me.palets.map(qe=>qe.id),truckX:-1,truckY:-1,anchoMm:ge.anchoOcupadoMm,largoMm:ge.largoOcupadoMm,alturaTotal:Math.max(...Me.palets.map(qe=>qe.z+qe.alturaMm))-Math.min(...Me.palets.map(qe=>qe.z)),unidades:Me.palets.reduce((qe,kt)=>qe+kt.unidades,0),niveles:Me.palets.length,enEspera:!0,bloqueado:!1,stagedId:Me.id,slotIdx:Me.slotIdx},Xe=Ge,bt=V+ge.anchoOcupadoMm*Ot/2;W.set(Le,{sd:nt,palets:Me.palets,threeX:Xe,threeZ:bt}),Ge+=ge.largoOcupadoMm*Ot+.1}for(const[Me,ge]of Array.from(Qe.entries()))W.has(Me)||(ze===ge&&(ze=null),Ft.remove(ge),$r(ee.get(Me)),ee.delete(Me),de.delete(Me),Qe.delete(Me));for(const[Me,ge]of W){const Le=Kt(ge.sd),nt=Qe.get(Me);if(!nt){const Xe=le(ge.palets,ge.sd,ge.threeX,ge.threeZ);Ft.add(Xe),Qe.set(Me,Xe),de.set(Me,Le);continue}if(de.get(Me)!==Le){ze===nt&&(ze=null),Ft.remove(nt),$r(ee.get(Me));const Xe=le(ge.palets,ge.sd,ge.threeX,ge.threeZ);Ft.add(Xe),Qe.set(Me,Xe),de.set(Me,Le)}else nt.userData=ge.sd,(nt.position.x!==ge.threeX||nt.position.z!==ge.threeZ)&&nt.position.set(ge.threeX,0,ge.threeZ)}}const Et=new kh;function Zt(W){const J=X.domElement.getBoundingClientRect();return new ot((W.clientX-J.left)/J.width*2-1,-((W.clientY-J.top)/J.height)*2+1)}function Bt(W){Et.setFromCamera(Zt(W),I);const J=[];Ft.traverse(ge=>{ge instanceof bn&&ge.userData.isCargo&&J.push(ge)});const Ge=Et.intersectObjects(J,!1);if(!Ge.length)return null;const Me=Ge[0].object.userData.stackKey;return Qe.get(Me)??null}const Ht=new Ni(new B(0,1,0),0);function U(W){Et.setFromCamera(Zt(W),I);const J=new B;return Et.ray.intersectPlane(Ht,J)?J:null}function sn(W,J,Ge,Me,ge){const{anchoInteriorMm:Le,largoInteriorMm:nt}=l.truckProfile;if(J<0||J+Me>Le||Ge<0||Ge+ge>nt)return!0;for(const Xe of c){if(Xe.nivel!==0||W.has(Xe.id))continue;const bt=J<Xe.x+Xe.anchoOcupadoMm&&J+Me>Xe.x,qe=Ge<Xe.y+Xe.largoOcupadoMm&&Ge+ge>Xe.y;if(bt&&qe)return!0}return!1}function Ut(W,J,Ge,Me,ge){let Le=null,nt=0;for(const qe of c){if(qe.nivel!==0||W.has(qe.id))continue;const kt=Math.min(J+Me,qe.x+qe.anchoOcupadoMm)-Math.max(J,qe.x),Wt=Math.min(Ge+ge,qe.y+qe.largoOcupadoMm)-Math.max(Ge,qe.y);if(kt<=0||Wt<=0)continue;const Je=kt*Wt;Je>nt&&(nt=Je,Le=qe)}if(!Le||nt<.6*Me*ge)return null;const Xe=c.filter(qe=>qe.x===Le.x&&qe.y===Le.y&&!W.has(qe.id));let bt=Xe[0];for(const qe of Xe)qe.nivel>bt.nivel&&(bt=qe);return{paletId:bt.id,refId:bt.referenceId,aterrizarX:Le.x,aterrizarY:Le.y,nuevoZ:bt.z+bt.alturaMm,nuevoNivel:bt.nivel+1,anchoOcupadoMm:bt.anchoOcupadoMm,largoOcupadoMm:bt.largoOcupadoMm}}function C(W,J,Ge=1){W.traverse(Me=>{if(Me instanceof bn&&Me.userData.isCargo){const ge=Me.material;ge.color.setHex(J),ge.emissive.setHex(J===16724821?4456465:0),ge.transparent=Ge<1,ge.opacity=Ge}})}function x(W){const J=W.userData,Ge=t.get(J.refId)??"#4fd1c5";W.traverse(Me=>{if(Me instanceof bn&&Me.userData.isCargo){const ge=Me.material;ge.color.set(Ge),ge.emissive.setHex(0),ge.transparent=J.enEspera,ge.opacity=J.enEspera?.75:1}})}let F=!1,N={x:0,y:0},z=null,pe=!1,se=0,q=0,Q=!1,Ee=!1,De=null;const Te=new B,re=new B;function Re(){if(!z)return;const W=z.userData;if(Q)x(z),W.enEspera||(W.enEspera=!0,W.truckX=-1,W.truckY=-1,_==null||_(W.paletIds),ze===z&&(wt(z),je(z)));else if(De){const J=De;W.truckX=se,W.truckY=q,W.enEspera=!1,x(z);const Ge=c.filter(Le=>W.paletIds.includes(Le.id)),Me=Math.min(...Ge.map(Le=>Le.z)),ge=Math.min(...Ge.map(Le=>Le.nivel));for(const Le of Ge)Le.x=se,Le.y=q,Le.z=J.nuevoZ+(Le.z-Me),Le.nivel=J.nuevoNivel+(Le.nivel-ge);v==null||v(W.paletIds,J.paletId,J.nuevoZ,J.nuevoNivel),yt(z)}else if(Ee)z.position.copy(re),x(z);else{const J=W.enEspera;W.truckX=se,W.truckY=q,W.enEspera=!1,x(z);for(const Ge of c)W.paletIds.includes(Ge.id)&&(Ge.x=se,Ge.y=q);J?m==null||m(W.paletIds,se,q):p==null||p(W.paletIds,se,q),yt(z)}}function tt(W){if(W.button!==0||(N={x:W.clientX,y:W.clientY},pe=!1,!F))return;const J=Bt(W);if(!J)return;W.stopImmediatePropagation(),lt(J),J.userData.bloqueado||(z=J,Z.enabled=!1)}function Ve(W){if(!F||!z)return;const J=Math.hypot(W.clientX-N.x,W.clientY-N.y);if(!pe&&J>Ed){pe=!0;const bt=U(W);bt&&Te.copy(bt),re.copy(z.position)}if(!pe)return;const Ge=U(W);if(!Ge)return;const Me=Ge.x-Te.x,ge=Ge.z-Te.z,Le=re.z+ge,nt=re.x+Me,Xe=z.userData;if(Q=Le>b+P/2,Q)z.position.set(nt,0,Le),Ee=!1,C(z,4500070,.75);else{const bt=nt/Ot,qe=Le/Ot,kt=Math.round(qe/Zs)*Zs,Wt=Math.round(bt/Zs)*Zs;se=kt,q=Wt;const Je=new Set(Xe.paletIds);if(Ee=sn(Je,kt,Wt,Xe.anchoMm,Xe.largoMm),De=null,Ee&&!Xe.bloqueado){const en=Ut(Je,kt,Wt,Xe.anchoMm,Xe.largoMm);if(en&&(g!=null&&g(Xe.refId,en.refId))){const dt=en.nuevoZ+Xe.alturaTotal,Cn=Xe.largoMm>en.largoOcupadoMm,Rn=Xe.anchoMm>en.anchoOcupadoMm,zn=!(Cn&&Rn),li=dt<=l.truckProfile.altoInteriorMm;zn&&li&&(se=en.aterrizarX,q=en.aterrizarY,De={paletId:en.paletId,refId:en.refId,nuevoZ:en.nuevoZ,nuevoNivel:en.nuevoNivel})}}z.position.set(q*Ot,0,se*Ot);const xn=De?3377407:Ee?16724821:parseInt((t.get(Xe.refId)??"#4fd1c5").slice(1),16);C(z,xn)}}function D(W){if(W.button!==0)return;Z.enabled=!0;const J=Math.hypot(W.clientX-N.x,W.clientY-N.y);if(pe){Re(),pe=!1,z=null;return}const Ge=Bt(W);Ge?lt(Ge):J<Ed&&Dt(),z=null}function Se(W){if(!F||!ze||!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(W.key))return;const J=document.activeElement;if(J&&(J.tagName==="INPUT"||J.tagName==="TEXTAREA"||J.isContentEditable))return;const Ge=ze.userData;if(Ge.bloqueado||Ge.enEspera)return;W.preventDefault();const Me=W.shiftKey?50:10;let ge=0,Le=0;W.key==="ArrowLeft"?Le=-Me:W.key==="ArrowRight"?Le=Me:W.key==="ArrowUp"?ge=-Me:W.key==="ArrowDown"&&(ge=Me);const nt=Ge.truckX+ge,Xe=Ge.truckY+Le,bt=new Set(Ge.paletIds);sn(bt,nt,Xe,Ge.anchoMm,Ge.largoMm)||(Ge.truckX=nt,Ge.truckY=Xe,ze.position.set(Xe*Ot,0,nt*Ot),p==null||p(Ge.paletIds,nt,Xe))}X.domElement.addEventListener("mousedown",tt),X.domElement.addEventListener("mousemove",Ve),X.domElement.addEventListener("mouseup",D),window.addEventListener("keydown",Se);const Z=new vx(I,X.domElement);if(Z.target.set(f/2,w/4,b/2),Z.enableDamping=!0,Z.dampingFactor=.08,Z.minDistance=3,Z.maxDistance=f*4,h.cameraState){const W=h.cameraState;Z.target.set(W.tx,W.ty,W.tz)}Z.update();const xe=new ResizeObserver(()=>{const W=s.clientWidth||y,J=s.clientHeight||T;I.aspect=W/J,I.updateProjectionMatrix(),X.setSize(W,J)});xe.observe(s);function Pe(W,J,Ge,Me,ge){const Le=ge??{};if(W!==s||X.domElement.parentElement!==W){s=W,s.innerHTML="",s.appendChild(X.domElement),xe.disconnect(),xe.observe(s);const Wt=s.clientWidth||y,Je=s.clientHeight||T;I.aspect=Wt/Je,I.updateProjectionMatrix(),X.setSize(Wt,Je)}l=J,c=l.pallets,o=Ge,d=Me,h=Le,u=Le.onSeleccion,p=Le.onMoverCamion,g=Le.onComprobarApilableManual,v=Le.onApilarManual,_=Le.onEnviarEspera,m=Le.onRecuperarDeEspera,M=Le.crateGeomPorRef,R=Le.crateInfoPorRef,E=Le.rotacionVisual,A=Le.detalle??!1;const nt=l.truckProfile.largoInteriorMm*Ot,Xe=l.truckProfile.anchoInteriorMm*Ot,bt=l.truckProfile.altoInteriorMm*Ot;(nt!==f||Xe!==b||bt!==w)&&(f=nt,b=Xe,w=bt,he()),zt();const qe=Le.reseleccionarStackKey,kt=qe?Qe.get(qe):void 0;kt?Rt(kt):Dt()}Pe(s,e,i,a,r);let te=!0,Be=0;function We(){te&&(Be=requestAnimationFrame(We),Z.update(),X.render(j,I))}return We(),{destruir(){te=!1,cancelAnimationFrame(Be),xe.disconnect(),X.domElement.removeEventListener("mousedown",tt),X.domElement.removeEventListener("mousemove",Ve),X.domElement.removeEventListener("mouseup",D),window.removeEventListener("keydown",Se),Z.dispose(),$r(oe);for(const W of ee.values())$r(W);Ie.dispose(),ve.dispose(),_t.dispose(),X.dispose(),X.forceContextLoss(),X.domElement.remove(),s.innerHTML=""},setModoManual(W){F=W,Z.enabled=!0,W||Dt()},getCameraState(){return{px:I.position.x,py:I.position.y,pz:I.position.z,tx:Z.target.x,ty:Z.target.y,tz:Z.target.z}},actualizar:Pe}}const Qh=[],ef={},Ia=new Map,qa=new Map,aa=new Map;let jo=[],Bi=[];function Vi(){return[...Qh,...jo,...Bi]}const Qo=["#4fd1c5","#ff8a3d","#9b8cff","#f2d544","#5aa9ff","#ff6fa8","#f87171","#34d399","#fb923c","#a78bfa"],wa=new Map(Qh.map((n,e)=>[n.id,Qo[e%Qo.length]]));function Da(n){return wa.has(n)||wa.set(n,Qo[wa.size%Qo.length]),wa.get(n)}let qt={...Dd,nombre:"Camión estándar",largoInteriorMm:12e3,anchoInteriorMm:2400,altoInteriorMm:2400},ta=!1,jn=null,wr=0,si=null,Si=!1,ds=!1,ea=null;const oi=new Map,Tc=new Map;let Ui=[],Vn={},Kn=null;function Nx(n,e){var t;return n===e?((t=Vi().find(i=>i.id===n))==null?void 0:t.apilable)??!1:(Vn[n]??[]).includes(e)}const Cr=new Map,Ca=new Map;let iu=0;document.getElementById("app").innerHTML=`
  <!-- Cabecera compacta -->
  <header class="app-header">
    <div class="app-header__left">
      <span class="app-header__eyebrow">Logística</span>
      <h1>Planificador de carga de camiones</h1>
    </div>
    <div class="app-header__meta" id="meta"></div>
  </header>

  <!-- Layout principal -->
  <div class="main-layout">

    <!-- ── Sidebar izquierda: solo el pedido ────────────── -->
    <aside class="sidebar">

      <!-- Pedido -->
      <div class="panel" id="panel-pedido">
        <h2>Pedido</h2>
        <label class="field field--wide" style="margin-bottom:8px;">
          <span>Buscar</span>
          <input type="text" id="order-buscar" placeholder="Filtra por SKU o nombre..." autocomplete="off"/>
        </label>
        <div id="order-rows"></div>
        <p class="auto-hint">Cada salto equivale a un palet completo. El plano se recalcula automáticamente.</p>
      </div>

      <!-- Avisos lote mínimo -->
      <div class="avisos" id="avisos-lote"></div>

    </aside>

    <!-- ── Área de resultados ─────────────────────────── -->
    <div class="results-area" id="results-area">
      <div class="empty-state" id="empty-state">
        Configura el pedido y espera el recálculo automático para ver el plano de carga.
      </div>
    </div>

    <!-- ── Sidebar derecha: todo lo demás ───────────────── -->
    <aside class="sidebar sidebar--right">

      <!-- Cargar referencias desde JSON del constructor -->
      <div class="panel">
        <h2>Cargar referencias (JSON)</h2>
        <label for="crate-files" class="btn-add-ref" style="display:inline-block;text-align:center;">
          📂 Añadir archivos .json
        </label>
        <input type="file" id="crate-files" accept=".json" multiple style="display:none"/>
        <p class="auto-hint">Envoltorios exportados desde el constructor. Cada uno añade una referencia al pedido.</p>
        <p class="custom-ref-error" id="crate-error"></p>
      </div>

      <!-- Añadir bulto a pelo (sin JSON, solo medidas) -->
      <div class="panel">
        <h2>Añadir bulto (sin JSON)</h2>
        <div class="custom-ref-form">
          <div class="custom-ref-row">
            <label class="field field--wide"><span>SKU</span><input type="text" id="mr-sku" placeholder="ref-001"/></label>
            <label class="field field--wide"><span>Nombre</span><input type="text" id="mr-nombre" placeholder="(opcional)"/></label>
          </div>
          <div class="custom-ref-row">
            <label class="field"><span>Largo (cm)</span><input type="number" id="mr-largo" min="0" step="any"/></label>
            <label class="field"><span>Ancho (cm)</span><input type="number" id="mr-ancho" min="0" step="any"/></label>
            <label class="field"><span>Alto (cm)</span><input type="number" id="mr-alto" min="0" step="any"/></label>
          </div>
          <div class="custom-ref-row">
            <label class="field"><span>Peso ud. (kg)</span><input type="number" id="mr-peso" min="0" step="any"/></label>
            <label class="field"><span>Ud./palet</span><input type="number" id="mr-unidades" min="1" step="1" value="1"/></label>
            <label class="field"><span>Lote mínimo</span><input type="number" id="mr-lote" min="1" step="1" value="1"/></label>
          </div>
          <label class="checkbox-field">
            <input type="checkbox" id="mr-apilable" checked/>
            <span>Apilable</span>
          </label>
          <button class="btn-add-ref" id="btn-add-manual">+ Añadir bulto</button>
          <p class="custom-ref-error" id="mr-error"></p>
        </div>
      </div>

      <!-- Apilado manual entre referencias distintas -->
      <div class="panel">
        <h2>Apilado manual entre referencias</h2>
        <p class="auto-hint">Declara qué referencia se puede arrastrar encima de cuál (no afecta al cálculo automático, solo a cuando arrastras una pila sobre otra ya puesta).</p>
        <p class="auto-hint">También puedes hacerlo con clics: selecciona una pila en el plano y usa los botones "Usar como arriba" / "Puede ir sobre esta" de su panel de info.</p>
        <div id="apilable-clic-estado"></div>
        <div class="custom-ref-row">
          <label class="field field--wide"><span>Arriba</span><input type="text" id="ap-arriba" list="ap-arriba-lista" placeholder="Busca por SKU o nombre..." autocomplete="off"/><datalist id="ap-arriba-lista"></datalist></label>
          <label class="field field--wide"><span>Puede ir sobre</span><input type="text" id="ap-abajo" list="ap-abajo-lista" placeholder="Busca por SKU o nombre..." autocomplete="off"/><datalist id="ap-abajo-lista"></datalist></label>
        </div>
        <button class="btn-add-ref" id="btn-add-apilable">+ Añadir regla</button>
        <div id="apilable-lista"></div>
      </div>

      <!-- Perfil camión -->
      <div class="panel">
        <h2>Perfil de camión</h2>
        <div class="truck-fields">
          <label class="field"><span>Largo interior (cm)</span><input type="number" id="truck-largo" value="${qt.largoInteriorMm/10}"/></label>
          <label class="field"><span>Ancho interior (cm)</span><input type="number" id="truck-ancho" value="${qt.anchoInteriorMm/10}"/></label>
          <label class="field"><span>Alto interior (cm)</span><input type="number" id="truck-alto" value="${qt.altoInteriorMm/10}"/></label>
          <label class="field"><span>Peso máx. (kg)</span><input type="number" id="truck-peso" value="${qt.pesoMaxKg}"/></label>
        </div>
        <label class="checkbox-field">
          <input type="checkbox" id="cb-carga-lateral"/>
          <span>Admite carga lateral (si no, solo por la puerta trasera)</span>
        </label>
        <label class="checkbox-field">
          <input type="checkbox" id="cb-capiculado"/>
          <span>Apilado capiculado (donde la construcción lo permita — bases de tacos)</span>
        </label>
        <label class="checkbox-field">
          <input type="checkbox" id="cb-varios"/>
          <span>Permitir repartir en varios camiones</span>
        </label>
        <label class="checkbox-field">
          <input type="checkbox" id="cb-detalle"/>
          <span>Detalle 3D (geometría real)</span>
        </label>
      </div>

      <!-- Persistencia local -->
      <div class="panel">
        <p class="auto-hint">💾 El pedido se guarda automáticamente en este navegador.</p>
        <button class="btn-reset-todo" id="btn-reset-todo" title="Borra lo guardado en este navegador y recarga la página">
          ↺ Borrar todo y empezar de nuevo
        </button>
      </div>

    </aside>

  </div>
`;const ya=document.getElementById("order-rows"),Zr=document.getElementById("order-buscar"),Td=document.getElementById("avisos-lote"),Ac=document.getElementById("results-area"),Ox=document.getElementById("meta");function au(){const n=qt;Ox.innerHTML=`<b>${n.nombre}</b> &nbsp;${n.largoInteriorMm/10}×${n.anchoInteriorMm/10}×${n.altoInteriorMm/10} cm · ${n.pesoMaxKg} kg`}au();function tf(n,e){let t;return(...i)=>{clearTimeout(t),t=setTimeout(()=>n(...i),e)}}const fi=tf(af,250),ru="planificador-carga:v1";function Fx(){const n={version:1,cantidades:nf(),truckProfile:qt,permitirVarios:ta,detalle3D:ds,crateRefsCrudas:Array.from(aa.values()),refsManuales:Bi,apilableSobre:Vn,unidadesCargaOverride:Object.fromEntries(Cr),columnasCargaOverride:Object.fromEntries(Ca),colores:Object.fromEntries(wa),stacksBloqueados:Array.from(oi.values()),stagedStacks:Ui,nextStagedSlot:iu};try{localStorage.setItem(ru,JSON.stringify(n))}catch{}}const Bn=tf(Fx,400);function Bx(){let n;try{n=localStorage.getItem(ru)}catch{return!1}if(!n)return!1;let e;try{e=JSON.parse(n)}catch{return!1}if(!e||typeof e!="object")return!1;for(const t of e.crateRefsCrudas??[])aa.set(t.id,t),Ia.set(t.id,t.crateJson);Bi=e.refsManuales??[],Vn=e.apilableSobre??{};for(const[t,i]of Object.entries(e.unidadesCargaOverride??{}))Cr.set(t,i);for(const[t,i]of Object.entries(e.columnasCargaOverride??{}))Ca.set(t,i);for(const t of Bi)Da(t.id);for(const[t,i]of Object.entries(e.colores??{}))wa.set(t,i);e.truckProfile&&(qt=e.truckProfile),ta=!!e.permitirVarios,ds=!!e.detalle3D;for(const t of e.stacksBloqueados??[]){const i=t;i.unidadesPorRef||(i.unidadesPorRef={[i.refId]:i.unidades??0}),oi.set(t.stackKey,t)}return Ui=e.stagedStacks??[],iu=e.nextStagedSlot??0,Object.assign(ef,e.cantidades??{}),document.getElementById("truck-largo").value=String(qt.largoInteriorMm/10),document.getElementById("truck-ancho").value=String(qt.anchoInteriorMm/10),document.getElementById("truck-alto").value=String(qt.altoInteriorMm/10),document.getElementById("truck-peso").value=String(qt.pesoMaxKg),document.getElementById("cb-carga-lateral").checked=!!qt.cargaLateral,document.getElementById("cb-capiculado").checked=!!qt.capiculado,document.getElementById("cb-varios").checked=ta,document.getElementById("cb-detalle").checked=ds,au(),aa.size>0||Bi.length>0||Object.keys(e.cantidades??{}).length>0}function zx(){try{localStorage.removeItem(ru)}catch{}location.reload()}function nf(){const n={};return ya.querySelectorAll("input[data-ref]").forEach(e=>{n[e.dataset.ref]=Number(e.value)}),n}function zi(){const n=nf(),e=new Map;for(const s of oi.values())for(const[l,c]of Object.entries(s.unidadesPorRef))e.set(l,(e.get(l)??0)+c);const t=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""),i=t((Zr==null?void 0:Zr.value)??""),a=s=>!i||t(s.sku).includes(i)||t(s.nombre).includes(i),r=Vi();ya.innerHTML=r.map(s=>{var g,v,_,m;const l=e.get(s.id)??0,c=l>0?l:0,o=n[s.id]??ef[s.id]??0,d=l>0?Math.max(o,l):o,h=jo.some(M=>M.id===s.id)||Bi.some(M=>M.id===s.id),u=(g=qa.get(s.id))==null?void 0:g.esDesmontado,p=((v=qa.get(s.id))==null?void 0:v.tipo)==="carga";return`
      <div class="order-row" data-refid="${s.id}" ${a(s)?"":'style="display:none"'}>
        <div class="order-row__color" style="background:${Da(s.id)}"></div>
        <div class="order-row__info">
          <span class="order-row__sku">${s.sku}${l>0?` <span class="lock-badge" title="${l} ud fijadas">🔒</span>`:""}${u?' <span class="lock-badge" title="Se transporta desmontada (paneles planos)">📦</span>':""}</span>
          <span class="order-row__nombre">${s.nombre}</span>
          <span class="order-row__detalle">${s.unidadesPorPalet}ud/pal · lote≥${s.loteMinimo} · ${s.palletType.largoMm/10}×${s.palletType.anchoMm/10}×${s.alturaPaletCompletoMm/10}cm${s.apilable?"":" · NO apilable"}</span>
          ${p?`
            <label style="display:flex; align-items:center; gap:4px; font-size:10px; color:var(--text-dim, #999); margin-top:2px;" title="Unidades por pack — sustituye al número fijo del JSON exportado">
              <span>ud/pack:</span>
              <input type="number" min="1" step="1" data-override-unidades="${s.id}" value="${Cr.get(s.id)??s.unidadesPorPalet}" style="width:52px; font-size:10px; padding:1px 4px;"/>
            </label>
            <label style="display:flex; align-items:center; gap:4px; font-size:10px; color:var(--text-dim, #999); margin-top:2px;" title="Nº de columnas en las que se reparten las unidades sobre el palet — automático por medidas si se deja vacío">
              <span>columnas:</span>
              <input type="number" min="1" step="1" data-override-columnas="${s.id}" value="${Ca.get(s.id)??((m=(_=qa.get(s.id))==null?void 0:_.disposicion)==null?void 0:m.columnas)??1}" style="width:52px; font-size:10px; padding:1px 4px;"/>
              ${Ca.has(s.id)?`<button data-reset-columnas="${s.id}" title="Volver a automático" style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:10px;padding:0;">↺</button>`:'<span style="opacity:0.6;">(auto)</span>'}
            </label>
          `:""}
        </div>
        <input type="number" min="${c}" step="${s.unidadesPorPalet}" data-ref="${s.id}" value="${d}"/>
        ${h?`<button class="btn-remove-ref" data-remove="${s.id}" title="Eliminar">×</button>`:"<span></span>"}
      </div>`}).join("")+(r.length===0?'<p class="auto-hint">Todavía no hay referencias cargadas.</p>':r.some(a)?"":`<p class="auto-hint">Ninguna referencia coincide con "${Zr.value}".</p>`),ya.querySelectorAll("input[data-override-unidades]").forEach(s=>{s.addEventListener("change",()=>{const l=s.dataset.overrideUnidades,c=Math.max(1,Math.round(Number(s.value)));Cr.set(l,c),Wa(),zi(),fi(),Bn()})}),ya.querySelectorAll("input[data-override-columnas]").forEach(s=>{s.addEventListener("change",()=>{const l=s.dataset.overrideColumnas,c=Math.max(1,Math.round(Number(s.value)));Ca.set(l,c),Wa(),zi(),fi(),Bn()})}),ya.querySelectorAll("[data-reset-columnas]").forEach(s=>{s.addEventListener("click",()=>{Ca.delete(s.dataset.resetColumnas),Wa(),zi(),fi(),Bn()})}),ya.querySelectorAll("input[data-ref]").forEach(s=>{s.addEventListener("input",()=>{const l=Number(s.min);l>0&&Number(s.value)<l&&(s.value=String(l)),fi()})}),ya.querySelectorAll(".btn-remove-ref").forEach(s=>{s.addEventListener("click",()=>{const l=s.dataset.remove;if(wa.delete(l),Bi.some(c=>c.id===l)){Bi=Bi.filter(c=>c.id!==l),zi(),fi(),Bn();return}aa.delete(l),Ia.delete(l),Wa()})}),vl()}const el=new Map;function su(){var e;const n=document.getElementById("apilable-clic-estado");if(n){if(!Kn){n.innerHTML="";return}n.innerHTML=`
    <div class="auto-hint" style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:var(--input-bg); border:1px solid var(--border); border-radius:6px; padding:6px 8px;">
      <span>📌 Arriba fijada: <strong>${Kn.sku}</strong> — selecciona otra pila en el plano y pulsa "Puede ir sobre esta".</span>
      <button id="btn-apilable-clic-cancelar" style="background:none; border:none; color:var(--accent); cursor:pointer; font-size:11px; flex-shrink:0;">cancelar</button>
    </div>`,(e=document.getElementById("btn-apilable-clic-cancelar"))==null||e.addEventListener("click",()=>{Kn=null,su()})}}function vl(){const n=Vi(),e=document.getElementById("ap-arriba-lista"),t=document.getElementById("ap-abajo-lista");el.clear();const i=[...n].sort((s,l)=>s.sku.localeCompare(l.sku)).map(s=>{const l=s.nombre&&s.nombre!==s.sku?`${s.sku} — ${s.nombre}`:s.sku;return el.set(l,s.id),`<option value="${l}"></option>`}).join("");e.innerHTML=i,t.innerHTML=i;const a=document.getElementById("apilable-lista"),r=[];for(const[s,l]of Object.entries(Vn)){const c=n.find(o=>o.id===s);for(const o of l){const d=n.find(h=>h.id===o);r.push(`
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:6px 8px; border:1px solid var(--border); border-radius:6px; margin-top:6px; background:var(--input-bg);">
          <span style="font-size:12px; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            <strong>${(c==null?void 0:c.sku)??s}</strong>
            <span style="opacity:0.6"> sobre </span>
            <strong>${(d==null?void 0:d.sku)??o}</strong>
          </span>
          <button class="btn-remove-ref" data-remove-apilable="${s}|${o}" title="Eliminar" style="flex-shrink:0;">×</button>
        </div>`)}}a.innerHTML=r.join("")||'<p class="auto-hint">Sin reglas todavía.</p>',a.querySelectorAll("[data-remove-apilable]").forEach(s=>{s.addEventListener("click",()=>{const[l,c]=s.dataset.removeApilable.split("|"),o=(Vn[l]??[]).filter(d=>d!==c);Vn={...Vn},o.length===0?delete Vn[l]:Vn[l]=o,vl(),Bn()})}),su()}document.getElementById("btn-add-apilable").addEventListener("click",()=>{const n=document.getElementById("ap-arriba"),e=document.getElementById("ap-abajo"),t=el.get(n.value),i=el.get(e.value);if(!t||!i){alert("Elige una referencia de la lista en los dos campos (empieza a escribir el SKU o el nombre).");return}if(t===i)return;const a=Vn[t]??[];a.includes(i)||(Vn={...Vn,[t]:[...a,i]},n.value="",e.value="",vl(),Bn())});Zr.addEventListener("input",()=>zi());zi();const cc=document.getElementById("crate-files"),tl=document.getElementById("crate-error");cc.addEventListener("change",async()=>{const n=Array.from(cc.files??[]);if(cc.value="",!n.length)return;const e=[];let t=0;for(const i of n){let a;try{a=await i.text()}catch{e.push(`${i.name}: no se pudo leer.`);continue}const{reference:r,error:s}=Od(a);if(!r){e.push(`${i.name}: ${s}`);continue}aa.set(r.id,r),Ia.set(r.id,r.crateJson),Da(r.id),t++}tl.textContent=e.length?`${t} anadida(s). Errores:
`+e.join(`
`):"",tl.style.display=e.length?"block":"none",t>0&&Wa()});function Wa(){var n;jo=[],qa.clear();for(const e of aa.values())try{const t=Zf(e,aa,Ia,Cr.get(e.id),Ca.get(e.id));jo.push(t);const i=e.tipo==="carga"&&e.paletBase?(n=aa.get(e.paletBase))==null?void 0:n.crateJson:e.crateJson;let a=null;if(e.tipo==="carga"&&e.paletBase){const r=Ia.get(e.paletBase);if(r){const s=Ka(r),l=Cr.get(e.id)??e.unidadesPorPack;a=Fd(e.largoMm,e.anchoMm,Math.round(s.largo*10),Math.round(s.ancho*10),l,Ca.get(e.id))}}qa.set(e.id,{tipo:e.tipo,paletBase:e.paletBase,unidades:e.unidadesPorPack,laminaAltoMm:t.altoUnidadMm??e.altoUnidadMm,laminaLargoCm:e.largoMm/10,laminaAnchoCm:e.anchoMm/10,esDesmontado:!!e.desmontado,intercambiado:js(i),disposicion:a,desplazamientoCapiculadoMm:t.desplazamientoCapiculadoMm??0,desplazamientoCapiculadoEjeAncho:t.desplazamientoCapiculadoEjeAncho??!1,gananciaAMm:t.alturaGanadaCapiculadoMm??0,gananciaBMm:t.alturaGanadaCapiculadoAltMm??0})}catch(t){console.warn(t)}zi(),fi()}const uc=document.getElementById("mr-sku"),Ad=document.getElementById("mr-nombre"),wd=document.getElementById("mr-largo"),Cd=document.getElementById("mr-ancho"),Rd=document.getElementById("mr-alto"),Pd=document.getElementById("mr-peso"),kx=document.getElementById("mr-unidades"),Gx=document.getElementById("mr-lote"),Hx=document.getElementById("mr-apilable"),dc=document.getElementById("mr-error");document.getElementById("btn-add-manual").addEventListener("click",()=>{const n=uc.value.trim(),e=Number(wd.value),t=Number(Cd.value),i=Number(Rd.value),a=Number(Pd.value),r=Math.max(1,Math.round(Number(kx.value)||1)),s=Math.max(1,Math.round(Number(Gx.value)||1)),l=d=>isFinite(d)&&d>0;let c="";if(n?Vi().some(d=>d.id===n)?c=`Ya existe una referencia con SKU "${n}".`:!l(e)||!l(t)||!l(i)?c="Largo/ancho/alto deben ser números > 0.":l(a)||(c="El peso debe ser un número > 0."):c="Falta el SKU.",c){dc.textContent=c,dc.style.display="block";return}dc.style.display="none";const o={id:n,sku:n,nombre:Ad.value.trim()||n,unidadesPorPalet:r,loteMinimo:s,apilable:Hx.checked,palletType:{id:`pt-${n}`,nombre:`Bulto ${n}`,largoMm:Math.round(e*10),anchoMm:Math.round(t*10),alturaBaseMm:0,pesoMaxKg:Js,pesoTaraKg:0},pesoUnitarioKg:a,alturaPaletCompletoMm:Math.round(i*10)};Bi.push(o),Da(o.id),uc.value="",Ad.value="",wd.value="",Cd.value="",Rd.value="",Pd.value="",uc.focus(),zi(),fi(),Bn()});async function Vx(){let n=[];try{const e=await fetch("/JsonRefs/index.json");if(!e.ok)throw new Error(`HTTP ${e.status}`);n=await e.json()}catch(e){console.warn("No se pudo cargar /JsonRefs/index.json",e),tl.textContent="No se pudieron cargar las referencias iniciales del catálogo. Puedes añadirlas manualmente con el botón de arriba.",tl.style.display="block";return}for(const e of n)try{const t=await(await fetch(`/JsonRefs/${e}`)).text(),{reference:i}=Od(t);if(!i)continue;aa.set(i.id,i),Ia.set(i.id,i.crateJson),Da(i.id)}catch{}Wa()}Bx()?Wa():Vx();["truck-largo","truck-ancho","truck-alto","truck-peso"].forEach(n=>{document.getElementById(n).addEventListener("input",()=>{qt={...qt,largoInteriorMm:Number(document.getElementById("truck-largo").value)*10,anchoInteriorMm:Number(document.getElementById("truck-ancho").value)*10,altoInteriorMm:Number(document.getElementById("truck-alto").value)*10,pesoMaxKg:Number(document.getElementById("truck-peso").value)},au(),fi()})});document.getElementById("cb-carga-lateral").addEventListener("change",n=>{qt={...qt,cargaLateral:n.target.checked},Bn(),fi()});document.getElementById("cb-capiculado").addEventListener("change",n=>{qt={...qt,capiculado:n.target.checked},Bn(),fi()});document.getElementById("cb-varios").addEventListener("change",n=>{ta=n.target.checked,fi()});document.getElementById("cb-detalle").addEventListener("change",n=>{ds=n.target.checked,Rr(!0),Bn()});var Ld;(Ld=document.getElementById("btn-reset-todo"))==null||Ld.addEventListener("click",()=>{confirm("Esto borra el pedido, las referencias cargadas y el perfil de camión guardados en este navegador, y recarga la página. ¿Seguro?")&&zx()});function Wx(){const n=[];return ya.querySelectorAll("input[data-ref]").forEach(e=>{const t=Number(e.value);t>0&&n.push({referenceId:e.dataset.ref,cantidadSolicitada:t})}),n}function af(){const n=Wx();if(Td.innerHTML="",Bn(),n.length===0&&oi.size===0){si&&(si.destruir(),si=null),jn=null,Ac.innerHTML='<div class="empty-state">Indica al menos una cantidad mayor que 0.</div>';return}const e=new Map,t=[];for(const c of oi.values()){for(const[o,d]of Object.entries(c.unidadesPorRef))e.set(o,(e.get(o)??0)+d);t.push({x:c.truckX,y:c.truckY,anchoMm:c.anchoMm,largoMm:c.largoMm})}const i=new Map;for(const c of Ui)i.set(c.refId,(i.get(c.refId)??0)+c.unidades);const a=n.map(c=>({...c,cantidadSolicitada:Math.max(0,c.cantidadSolicitada-(e.get(c.referenceId)??0)-(i.get(c.referenceId)??0))})).filter(c=>c.cantidadSolicitada>0),r=a.length>0?Uf(a,Vi(),qt,{permitirVariosCamiones:ta,posicionesBloqueadas:t}):{camiones:[],referenciasNoAsignadas:[],avisos:[]},s=Array.from(oi.values()).flatMap(c=>c.palets);if(s.length>0&&r.camiones.length===0&&r.camiones.push({numero:1,truckProfile:qt,pallets:[],pesoTotalKg:0,volumenUtilizadoM3:0,volumenTotalM3:qt.largoInteriorMm/1e3*(qt.anchoInteriorMm/1e3)*(qt.altoInteriorMm/1e3),ocupacionVolumen:0,ocupacionPeso:0,ocupacionSuelo:0,posicionesSueloUsadas:0}),r.camiones.length>0&&s.length>0){const c=r.camiones[0],o=[...s,...c.pallets];r.camiones[0]=wc(c.truckProfile,c.numero,o)}jn=r,wr=0;const l=jn.avisos.filter(c=>c.includes("lote mínimo"));if(Td.innerHTML=l.map(c=>`<div class="aviso aviso--warn">⚠ ${c}</div>`).join(""),jn.camiones.length===0){si&&(si.destruir(),si=null),Ac.innerHTML='<div class="empty-state">No se ha podido cargar ningún camión con este pedido.</div>';return}Xx()}function Xx(){var s;if(!jn)return;const n=jn.camiones,e=jn.referenciasNoAsignadas,t=e.length>0;let i="";t&&!ta&&(i=`
      <div class="overflow-banner">
        <div class="overflow-banner__icon">⚠️</div>
        <div class="overflow-banner__body">
          <div class="overflow-banner__title">Camión completo — parte del pedido no cabe</div>
          <div class="overflow-banner__desc">${e.map(c=>{const o=Vi().find(d=>d.id===c.referenceId);return`<b>${(o==null?void 0:o.sku)??c.referenceId}</b> — ${c.unidadesPendientes} unidades`}).join(" · ")}</div>
        </div>
        <label class="overflow-banner__cta" id="banner-cta">
          <input type="checkbox" id="banner-varios" ${ta?"checked":""}/>
          Repartir en varios camiones
        </label>
      </div>`);const a=n.map((l,c)=>`<button class="viewer3d-tab${c===wr?" viewer3d-tab--active":""}" data-idx="${c}">CAMIÓN ${l.numero}</button>`).join("");Ac.innerHTML=`
    ${i}
    <div class="viewer3d-panel">
      <div class="viewer3d-top">
        <div class="viewer3d-tabs" id="tabs">${a}</div>
        <div style="display:flex;gap:8px;align-items:center;">
          <button class="btn-modo-manual${Si?" btn-modo-manual--activo":""}" id="btn-modo-manual">
            ⬡ Manual
          </button>
          <span class="viewer3d-hint">${Si?"clic = seleccionar · arrastrar = mover · colisiones en rojo":"arrastra · zoom"}</span>
        </div>
      </div>
      <div class="viewer3d-row2">
        <div class="viewer3d-stats" id="v3d-stats"></div>
        <div class="viewer3d-legend" id="v3d-legend"></div>
      </div>
      <div class="viewer3d-canvas-wrap">
        <div class="viewer3d-canvas" id="v3d-canvas"></div>
        <div class="palet-info" id="palet-info"></div>
      </div>
    </div>
    <div class="plan-2d" id="plan-2d">
      <div class="plan-2d__header">
        <span class="plan-2d__title">Plano en planta (2D)</span>
        <div class="plan-2d__stats" id="plan-stats"></div>
      </div>
      <div class="truck-floor" id="plan-floor"></div>
    </div>
  `,document.querySelectorAll("#tabs .viewer3d-tab").forEach(l=>{l.addEventListener("click",()=>{wr=Number(l.dataset.idx),document.querySelectorAll(".viewer3d-tab").forEach(c=>c.classList.remove("viewer3d-tab--active")),l.classList.add("viewer3d-tab--active"),Rr()})});const r=document.getElementById("banner-varios");r&&r.addEventListener("change",()=>{ta=r.checked,document.getElementById("cb-varios").checked=ta,fi()}),(s=document.getElementById("btn-modo-manual"))==null||s.addEventListener("click",()=>{Si=!Si,si==null||si.setModoManual(Si);const l=document.getElementById("btn-modo-manual"),c=l==null?void 0:l.nextElementSibling;if(l&&(l.className=`btn-modo-manual${Si?" btn-modo-manual--activo":""}`),c&&(c.textContent=Si?"clic = seleccionar · arrastrar = mover · colisiones en rojo":"arrastra · zoom"),!Si){ea=null;const o=document.getElementById("palet-info");o&&(o.style.visibility="hidden")}}),Rr()}function Rr(n=!1){if(!jn)return;const e=jn.camiones[wr];if(!e)return;const t=n?ea==null?void 0:ea.stackKey:void 0;if(!n){ea=null;const o=document.getElementById("palet-info");o&&(o.style.visibility="hidden",o.innerHTML="")}const i=new Set(Array.from(oi.values()).filter(o=>e.pallets.some(d=>d.nivel===0&&d.x===o.truckX&&d.y===o.truckY)).map(o=>`${o.truckX}-${o.truckY}`)),a=Ui.map(o=>({id:o.id,palets:o.palets,slotIdx:o.slotIdx})),r={onSeleccion(o){var g,v,_,m;ea=o;const d=document.getElementById("palet-info");if(!d)return;if(!o){d.style.visibility="hidden",d.innerHTML="";return}const h=Vi().find(M=>M.id===o.refId),u=o.bloqueado,p=o.enEspera;d.style.visibility="visible",d.innerHTML=`
        <div class="palet-info__header">
          <span class="palet-info__color" style="background:${Da(o.refId)}"></span>
          <span class="palet-info__sku">${(h==null?void 0:h.sku)??o.refId} ${u?"🔒":""} ${p?"⏳":""}</span>
        </div>
        <div class="palet-info__body">
          <span class="palet-info__dims">${o.largoMm/10}×${o.anchoMm/10}×${o.alturaApilaMm/10} cm</span>
          <span class="palet-info__meta">${o.unidades} ud · ${o.niveles} nivel${o.niveles>1?"es":""} · pos. ${o.posYcm}cm, ${o.posXcm}cm</span>
          <span class="palet-info__roterror" id="palet-rot-error"></span>
        </div>
        ${Si?`
          <div class="palet-info__actions">
            ${!p&&!u&&((h==null?void 0:h.rotable)!==!1||qt.cargaLateral)?`
              <button class="palet-info__btn" id="btn-rotar-pila" title="Rotar la pila 90°">⟳ Rotar</button>
            `:""}
            <button class="palet-info__btn ${u?"palet-info__btn--activo":""}" id="btn-lock-pila">
              ${u?"🔒 Desfijar":"🔓 Fijar posición"}
            </button>
            ${u||!p?`
              <span class="palet-info__hint">
                ${u?"Posición fija — no se puede mover ni rotar":(h==null?void 0:h.rotable)===!1&&!qt.cargaLateral?"Base de dobles bases — no se puede rotar (el camión no admite carga lateral)":"Arrastra al área verde para aparcar"}
              </span>
            `:""}
          </div>
        `:""}
        <div class="palet-info__actions">
          <button class="palet-info__btn ${(Kn==null?void 0:Kn.id)===o.refId?"palet-info__btn--activo":""}" id="btn-apilable-arriba" title="Marca esta referencia como la que va ARRIBA para una regla de apilado manual">📌 Usar como arriba</button>
          ${Kn&&Kn.id!==o.refId?`
            <button class="palet-info__btn" id="btn-apilable-abajo" title="Crea la regla: ${Kn.sku} puede ir sobre ${(h==null?void 0:h.sku)??o.refId}">📌 Puede ir sobre esta</button>
          `:""}
        </div>
      `,(g=document.getElementById("btn-rotar-pila"))==null||g.addEventListener("click",()=>Yx(o)),(v=document.getElementById("btn-lock-pila"))==null||v.addEventListener("click",()=>$x(o)),(_=document.getElementById("btn-apilable-arriba"))==null||_.addEventListener("click",()=>{var M;Kn={id:o.refId,sku:(h==null?void 0:h.sku)??o.refId},(M=r.onSeleccion)==null||M.call(r,o),su()}),(m=document.getElementById("btn-apilable-abajo"))==null||m.addEventListener("click",()=>{var A;if(!Kn||Kn.id===o.refId)return;const M=Kn.id,R=o.refId,E=Vn[M]??[];E.includes(R)||(Vn={...Vn,[M]:[...E,R]},Bn()),Kn=null,vl(),(A=r.onSeleccion)==null||A.call(r,o)})},onMoverCamion(o,d,h){for(const u of e.pallets)o.includes(u.id)&&(u.x=d,u.y=h);vr(e)},onEnviarEspera(o){const d=e.pallets.filter(v=>o.includes(v.id));if(!d.length)return;const h=d.find(v=>v.nivel===0)??d[0],p={id:`staged-${Date.now()}-${h.referenceId}`,refId:h.referenceId,paletIds:o,palets:d,anchoMm:h.anchoOcupadoMm,largoMm:h.largoOcupadoMm,unidades:d.reduce((v,_)=>v+_.unidades,0),slotIdx:iu++};Ui.push(p);const g=new Set(o);for(let v=e.pallets.length-1;v>=0;v--)g.has(e.pallets[v].id)&&e.pallets.splice(v,1);vr(e),Bn()},onRecuperarDeEspera(o,d,h){const u=Ui.find(g=>g.paletIds.some(v=>o.includes(v)));if(!u)return;u.palets.map(g=>({...g,x:d,y:h})).forEach(g=>e.pallets.push(g)),Ui=Ui.filter(g=>g.id!==u.id),vr(e),Bn()},onComprobarApilableManual(o,d){return Nx(o,d)},onApilarManual(o,d,h,u){const p=e.pallets.find(g=>g.id===d);if(p){const g=e.pallets.filter(M=>M.x===p.x&&M.y===p.y),v=g.find(M=>M.nivel===0)??g[0],_=`${v.x}-${v.y}`,m={};for(const M of g)m[M.referenceId]=(m[M.referenceId]??0)+M.unidades;oi.set(_,{stackKey:_,refId:v.referenceId,truckX:v.x,truckY:v.y,anchoMm:v.anchoOcupadoMm,largoMm:v.largoOcupadoMm,unidadesPorRef:m,palets:g.map(M=>({...M}))})}vr(e),Bn(),Rr(!0),zi()}},s=document.getElementById("v3d-canvas");if(s){const o={...r,crateGeomPorRef:Ia,crateInfoPorRef:qa,detalle:ds,rotacionVisual:Tc,reseleccionarStackKey:t};si?si.actualizar(s,e,a,i,o):si=Ux(s,e,wa,a,i,o),Si&&si.setModoManual(!0)}const l=document.getElementById("v3d-stats");l&&(l.innerHTML=`
    <span>SUELO <b>${e.ocupacionSuelo}%</b></span>
    <span>VOL <b>${e.ocupacionVolumen}%</b></span>
    <span>PESO <b>${e.pesoTotalKg}/${e.truckProfile.pesoMaxKg} kg</b></span>
    <span>PALETS <b>${e.posicionesSueloUsadas}</b> en suelo</span>
    ${Ui.length?`<span>ESPERA <b>${Ui.length}</b></span>`:""}
    ${oi.size?`<span>🔒 <b>${oi.size}</b> fijadas</span>`:""}`);const c=document.getElementById("v3d-legend");if(c){const o=Array.from(new Set(e.pallets.map(d=>d.referenceId)));c.innerHTML=o.map(d=>{const h=Vi().find(u=>u.id===d);return`<div class="legend__item"><span class="legend__swatch" style="background:${Da(d)}"></span>${(h==null?void 0:h.sku)??d}</div>`}).join("")}vr(e)}function Yx(n){if(!jn||n.enEspera||n.bloqueado)return;const e=Vi().find(p=>p.id===n.refId);if((e==null?void 0:e.rotable)===!1&&!qt.cargaLateral)return;const t=jn.camiones[wr],i=t.pallets.filter(p=>n.paletIds.includes(p.id));if(!i.length)return;const a=i.find(p=>p.nivel===0)??i[0],r=a.largoOcupadoMm,s=a.anchoOcupadoMm,{anchoInteriorMm:l,largoInteriorMm:c}=t.truckProfile,o=p=>{const g=document.getElementById("palet-rot-error");g&&(g.textContent=`⚠ ${p}`,g.style.display="block",setTimeout(()=>{g.style.display="none"},3e3))};if(a.x+r>l){o(`Rotada necesita ${r/10} cm de ancho, pero solo quedan ${(l-a.x)/10} cm.`);return}if(a.y+s>c){o("Rotada no cabe en el largo del camión en esta posición.");return}const d=new Set(n.paletIds);if(t.pallets.some(p=>{if(p.nivel!==0||d.has(p.id))return!1;const g=a.x<p.x+p.anchoOcupadoMm&&a.x+r>p.x,v=a.y<p.y+p.largoOcupadoMm&&a.y+s>p.y;return g&&v})){o("La pila rotada colisiona con otra en esta posición. Muévela primero.");return}for(const p of i){const g=p.anchoOcupadoMm;p.anchoOcupadoMm=p.largoOcupadoMm,p.largoOcupadoMm=g}const u=`${a.x}-${a.y}`;Tc.set(u,!Tc.get(u)),Rr(!0),vr(t)}function $x(n){if(!jn||n.enEspera)return;const t=jn.camiones[wr].pallets.filter(r=>n.paletIds.includes(r.id));if(!t.length)return;const i=t.find(r=>r.nivel===0)??t[0],a=`${i.x}-${i.y}`;if(oi.has(a))oi.delete(a);else{const r={};for(const s of t)r[s.referenceId]=(r[s.referenceId]??0)+s.unidades;oi.set(a,{stackKey:a,refId:i.referenceId,truckX:i.x,truckY:i.y,anchoMm:i.anchoOcupadoMm,largoMm:i.largoOcupadoMm,unidadesPorRef:r,palets:t.map(s=>({...s}))})}Rr(!0),zi(),Bn()}function vr(n){const e=document.getElementById("plan-stats");e&&(e.innerHTML=`
    <span>SUELO <b>${n.ocupacionSuelo}%</b></span>
    <span>VOLUMEN <b>${n.ocupacionVolumen}%</b></span>
    <span>PESO <b>${n.pesoTotalKg} kg</b></span>`);const t=document.getElementById("plan-floor");t&&(t.innerHTML=qx(n))}function qx(n){var d,h;const{largoInteriorMm:e,anchoInteriorMm:t}=n.truckProfile,i=(((h=(d=document.getElementById("plan-floor"))==null?void 0:d.parentElement)==null?void 0:h.clientWidth)??700)-24,a=Math.min(i/e,140/t),r=Math.round(e*a),s=Math.round(t*a),l=new Map;n.pallets.forEach(u=>{const p=`${u.x}-${u.y}`;l.set(p,[...l.get(p)??[],u])});const c=[];for(let u=1e3;u<e;u+=1e3){const p=Math.round(u*a);c.push(`<line x1="${p}" y1="0" x2="${p}" y2="${s}" stroke="#1f2833" stroke-width="1"/>`)}const o=n.pallets.filter(u=>u.nivel===0).map(u=>{const p=Vi().find(f=>f.id===u.referenceId),g=Math.round(u.y*a),v=Math.round(u.x*a),_=Math.round(u.largoOcupadoMm*a),m=Math.round(u.anchoOcupadoMm*a),M=Da(u.referenceId),R=(p==null?void 0:p.sku)??"",E=`${u.largoOcupadoMm/10}×${u.anchoOcupadoMm/10}`,A=ea==null?void 0:ea.paletIds.some(f=>f===u.id),y=A?"white":M,T=A?2:1;return`
      <g>
        <rect x="${g}" y="${v}" width="${Math.max(_-1,1)}" height="${Math.max(m-1,1)}"
              fill="${M}" fill-opacity="0.85" stroke="${y}" stroke-width="${T}" rx="2"/>
        ${_>28&&m>14?`
          <text x="${g+_/2}" y="${v+m/2-4}" font-size="8" font-family="JetBrains Mono,monospace"
                text-anchor="middle" dominant-baseline="middle" fill="#0a1410">${R}</text>
          <text x="${g+_/2}" y="${v+m/2+6}" font-size="7" font-family="JetBrains Mono,monospace"
                text-anchor="middle" dominant-baseline="middle" fill="#0a1410" opacity="0.75">${E}cm</text>
        `:_>16?`
          <text x="${g+_/2}" y="${v+m/2}" font-size="7" font-family="JetBrains Mono,monospace"
                text-anchor="middle" dominant-baseline="middle" fill="#0a1410">${R}</text>
        `:""}
      </g>`}).join("");return`<svg width="${r}" height="${s}" viewBox="0 0 ${r} ${s}">
    <rect x="0" y="0" width="${r}" height="${s}" fill="none" stroke="#2a3441" stroke-width="1.5"/>
    ${c.join("")}${o}
  </svg>`}af();window.crateGeomPorRef=Ia;window.crateInfoPorRef=qa;window.getResultado=()=>jn;window.getTruckProfile=()=>qt;
