var _e=Object.defineProperty;var ye=(f,n,r)=>n in f?_e(f,n,{enumerable:!0,configurable:!0,writable:!0,value:r}):f[n]=r;var x=(f,n,r)=>(ye(f,typeof n!="symbol"?n+"":n,r),r);import{E as we,R as xe,l as Ce,m as Se,p as Me,q as Ee,s as Te,v as Le,w as Ve,x as ke,y as Re,z as He,A as Ie,B as Ne,C as Pe,D as Be,r as E,G as je,H as Fe,I as Oe,J as Ue,K as $e,L as Ae,M as De,N as qe,u as B,O as ze,P as We,n as Xe,Q as Ke,S as Ge,t as j,T as Je,U as Qe,V as Ye,F as se,W as Ze,X as et,Y as tt,Z as at,_ as st,$ as ot,a0 as nt,a1 as it,a2 as rt,a3 as lt,a4 as dt,f as ct,c as F,a as l,a5 as ut,a6 as mt,a7 as pt,a8 as ft,a9 as ht,k as ue,b as me,aa as vt,d as pe,ab as gt,ac as bt,ad as _t,ae as yt,af as wt,ag as xt,ah as Ct,ai as St,aj as Mt,ak as Et,al as Tt,am as Lt,an as Vt,ao as kt,ap as Rt,aq as Ht,ar as It,as as Nt,at as Pt,au as Bt,av as jt,aw as Ft,ax as Ot,o as Ut,ay as $t,az as At,aA as Dt,aB as fe,aC as qt,j as O,aD as zt,aE as Wt,aF as Xt,aG as Kt,aH as Gt,e as oe,aI as Jt,i as Qt,aJ as Yt,aK as Zt,aL as ea,aM as ta,aN as aa,aO as sa,aP as oa,aQ as na,aR as ia,aS as ra,aT as la,aU as da,aV as ca,aW as ua,aX as ma,aY as pa,aZ as fa,a_ as ha,a$ as va,b0 as ga,b1 as ba,b2 as _a,b3 as ya,b4 as wa,b5 as he,b6 as xa,b7 as Ca,b8 as Sa,b9 as Ma,ba as Ea,bb as Ta,bc as La,bd as Va,be as ka,bf as Ra,bg as Ha,bh as Ia,bi as Na,bj as Pa,bk as Ba,bl as ja,bm as Fa,bn as Oa,bo as ve,bp as Ua,bq as $a,br as Aa,h as le,g as Da,bs as qa}from"./index.1710863917078.js";import{E as P,_ as za}from"./eventType.1710863917078.js";const Wa=()=>{},Xa=Object.freeze(Object.defineProperty({__proto__:null,compile:Wa,EffectScope:we,ReactiveEffect:xe,customRef:Ce,effect:Se,effectScope:Me,getCurrentScope:Ee,isProxy:Te,isReactive:Le,isReadonly:Ve,isRef:ke,isShallow:Re,markRaw:He,onScopeDispose:Ie,proxyRefs:Ne,reactive:Pe,readonly:Be,ref:E,shallowReactive:je,shallowReadonly:Fe,shallowRef:Oe,stop:Ue,toRaw:$e,toRef:Ae,toRefs:De,triggerRef:qe,unref:B,camelize:ze,capitalize:We,normalizeClass:Xe,normalizeProps:Ke,normalizeStyle:Ge,toDisplayString:j,toHandlerKey:Je,BaseTransition:Qe,Comment:Ye,Fragment:se,KeepAlive:Ze,Static:et,Suspense:tt,Teleport:at,Text:st,callWithAsyncErrorHandling:ot,callWithErrorHandling:nt,cloneVNode:it,compatUtils:rt,computed:lt,createBlock:dt,createCommentVNode:ct,createElementBlock:F,createElementVNode:l,createHydrationRenderer:ut,createPropsRestProxy:mt,createRenderer:pt,createSlots:ft,createStaticVNode:ht,createTextVNode:ue,createVNode:me,defineAsyncComponent:vt,defineComponent:pe,defineEmits:gt,defineExpose:bt,defineProps:_t,get devtools(){return yt},getCurrentInstance:wt,getTransitionRawChildren:xt,guardReactiveProps:Ct,h:St,handleError:Mt,initCustomFormatter:Et,inject:Tt,isMemoSame:Lt,isRuntimeOnly:Vt,isVNode:kt,mergeDefaults:Rt,mergeProps:Ht,nextTick:It,onActivated:Nt,onBeforeMount:Pt,onBeforeUnmount:Bt,onBeforeUpdate:jt,onDeactivated:Ft,onErrorCaptured:Ot,onMounted:Ut,onRenderTracked:$t,onRenderTriggered:At,onServerPrefetch:Dt,onUnmounted:fe,onUpdated:qt,openBlock:O,popScopeId:zt,provide:Wt,pushScopeId:Xt,queuePostFlushCb:Kt,registerRuntimeCompiler:Gt,renderList:oe,renderSlot:Jt,resolveComponent:Qt,resolveDirective:Yt,resolveDynamicComponent:Zt,resolveFilter:ea,resolveTransitionHooks:ta,setBlockTracking:aa,setDevtoolsHook:sa,setTransitionHooks:oa,ssrContextKey:na,ssrUtils:ia,toHandlers:ra,transformVNodeArgs:la,useAttrs:da,useSSRContext:ca,useSlots:ua,useTransitionState:ma,version:pa,warn:fa,watch:ha,watchEffect:va,watchPostEffect:ga,watchSyncEffect:ba,withAsyncContext:_a,withCtx:ya,withDefaults:wa,withDirectives:he,withMemo:xa,withScopeId:Ca,Transition:Sa,TransitionGroup:Ma,VueElement:Ea,createApp:Ta,createSSRApp:La,defineCustomElement:Va,defineSSRCustomElement:ka,hydrate:Ra,initDirectivesForSSR:Ha,render:Ia,useCssModule:Na,useCssVars:Pa,vModelCheckbox:Ba,vModelDynamic:ja,vModelRadio:Fa,vModelSelect:Oa,vModelText:ve,vShow:Ua,withKeys:$a,withModifiers:Aa},Symbol.toStringTag,{value:"Module"}));class de{constructor(n,r,h,u,i){x(this,"remoteUser","");x(this,"role","");x(this,"peerConnection");x(this,"iceconfig");x(this,"isOntrack",!1);x(this,"isOffer",!1);x(this,"isLoading");x(this,"remoteVideoHTMLVideoElement");x(this,"remoteVideoHTMLCanvasElement");x(this,"remoteWrap");x(this,"mediaStream",new MediaStream);x(this,"mediaStreamId","");this.remoteUser=n,this.role=i,this.iceconfig=r,this.isLoading=u,h?this.useHtmlCanvasElement():this.useHtmlVideoElement(),this.init()}init(){const n={iceServers:this.iceconfig.iceServers};this.peerConnection=new RTCPeerConnection(n),this.peerConnection.ontrack=r=>{var h,u;this.mediaStreamId!=r.streams[0].id&&(this.remoteWrap=(h=document.getElementById(this.remoteUser))!=null?h:void 0,this.remoteWrap&&this.remoteVideoHTMLVideoElement?this.remoteWrap.appendChild(this.remoteVideoHTMLVideoElement):this.remoteWrap&&this.remoteVideoHTMLCanvasElement&&this.remoteWrap.appendChild(this.remoteVideoHTMLCanvasElement),this.mediaStreamId=r.streams[0].id,this.mediaStream.getTracks()&&this.mediaStream.getTracks().forEach(i=>{this.mediaStream.removeTrack(i)})),this.mediaStream.addTrack(r.track),this.isOntrack=!0,(u=this.remoteVideoHTMLVideoElement)==null||u.play(),this.isLoading.value=!1}}useHtmlVideoElement(){this.remoteVideoHTMLVideoElement=document.createElement("video"),this.remoteVideoHTMLVideoElement.srcObject=this.mediaStream,this.remoteVideoHTMLVideoElement.width=500,this.remoteVideoHTMLVideoElement.height=500,this.remoteVideoHTMLVideoElement.style.cssText="height:90%",this.remoteVideoHTMLVideoElement.id=this.remoteUser,this.remoteVideoHTMLVideoElement.muted=!0,this.remoteVideoHTMLVideoElement.setAttribute("playsinline",""),this.remoteVideoHTMLVideoElement.playsInline=!0,this.remoteVideoHTMLVideoElement.autoplay=!0;const n=this;this.remoteVideoHTMLVideoElement.onplay=()=>{n.remoteVideoHTMLVideoElement.muted=!1}}useHtmlCanvasElement(){this.remoteVideoHTMLVideoElement=document.createElement("video"),this.remoteVideoHTMLVideoElement.srcObject=this.mediaStream,this.remoteVideoHTMLVideoElement.id=this.remoteUser,this.remoteVideoHTMLVideoElement.autoplay=!0,this.remoteVideoHTMLCanvasElement=document.createElement("canvas"),this.remoteVideoHTMLCanvasElement.width=500,this.remoteVideoHTMLCanvasElement.height=500,this.remoteVideoHTMLCanvasElement.id=this.remoteUser;let n=this.remoteVideoHTMLCanvasElement.getContext("2d");const r=this;r.remoteVideoHTMLVideoElement&&(r.remoteVideoHTMLVideoElement.onplay=()=>{var h=this.remoteVideoHTMLVideoElement;(function u(){!h.paused&&!h.ended&&(r.remoteVideoHTMLCanvasElement&&(r.remoteVideoHTMLCanvasElement.width=r.remoteVideoHTMLVideoElement.videoWidth,r.remoteVideoHTMLCanvasElement.height=r.remoteVideoHTMLVideoElement.videoHeight),n.drawImage(h,0,0),setTimeout(u,1e3/60))})()})}close(){var n;(n=this.peerConnection)==null||n.close()}}var Ka=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function Ga(f){return f&&f.__esModule&&Object.prototype.hasOwnProperty.call(f,"default")?f.default:f}function Ja(f){var n=f.default;if(typeof n=="function"){var r=function(){return n.apply(this,arguments)};r.prototype=n.prototype}else r={};return Object.defineProperty(r,"__esModule",{value:!0}),Object.keys(f).forEach(function(h){var u=Object.getOwnPropertyDescriptor(f,h);Object.defineProperty(r,h,u.get?u:{enumerable:!0,get:function(){return f[h]}})}),r}var ge={exports:{}};const Qa=Ja(Xa);(function(f,n){(function(h,u){f.exports=u(Qa)})(Ka,r=>(()=>{var h={657:(a,g)=>{Object.defineProperty(g,"__esModule",{value:!0}),g.default=(d,k)=>{const M=d.__vccOpts||d;for(const[b,T]of k)M[b]=T;return M}},976:a=>{a.exports=r}},u={};function i(a){var g=u[a];if(g!==void 0)return g.exports;var d=u[a]={exports:{}};return h[a](d,d.exports,i),d.exports}i.d=(a,g)=>{for(var d in g)i.o(g,d)&&!i.o(a,d)&&Object.defineProperty(a,d,{enumerable:!0,get:g[d]})},i.o=(a,g)=>Object.prototype.hasOwnProperty.call(a,g),i.r=a=>{typeof Symbol<"u"&&Symbol.toStringTag&&Object.defineProperty(a,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(a,"__esModule",{value:!0})};var S={};return(()=>{i.r(S),i.d(S,{Component:()=>$,LoadingPlugin:()=>D,default:()=>q,useLoading:()=>A});var a=i(976);function g(t){var p;typeof t.remove<"u"?t.remove():(p=t.parentNode)==null||p.removeChild(t)}function d(t,p,y){let C=arguments.length>3&&arguments[3]!==void 0?arguments[3]:{};const w=(0,a.h)(t,p,C),v=document.createElement("div");return v.classList.add("vld-container"),y.appendChild(v),(0,a.render)(w,v),w.component}function k(){return typeof window<"u"}const M=k()?window.HTMLElement:Object,b=["aria-busy"],T={class:"vl-icon"};function U(t,p,y,C,w,v){return(0,a.openBlock)(),(0,a.createBlock)(a.Transition,{name:t.transition},{default:(0,a.withCtx)(()=>[(0,a.withDirectives)((0,a.createElementVNode)("div",{tabindex:"0",class:(0,a.normalizeClass)(["vl-overlay vl-active",{"vl-full-page":t.isFullPage}]),"aria-busy":t.isActive,"aria-label":"Loading",style:(0,a.normalizeStyle)({zIndex:t.zIndex})},[(0,a.createElementVNode)("div",{class:"vl-background",onClick:p[0]||(p[0]=(0,a.withModifiers)(function(){return t.cancel&&t.cancel(...arguments)},["prevent"])),style:(0,a.normalizeStyle)(t.bgStyle)},null,4),(0,a.createElementVNode)("div",T,[(0,a.renderSlot)(t.$slots,"before"),(0,a.renderSlot)(t.$slots,"default",{},()=>[((0,a.openBlock)(),(0,a.createBlock)((0,a.resolveDynamicComponent)(t.loader),{color:t.color,width:t.width,height:t.height},null,8,["color","width","height"]))]),(0,a.renderSlot)(t.$slots,"after")])],14,b),[[a.vShow,t.isActive]])]),_:3},8,["name"])}const H={mounted(){this.enforceFocus&&document.addEventListener("focusin",this.focusIn)},methods:{focusIn(t){if(!this.isActive||t.target===this.$el||this.$el.contains(t.target))return;let p=this.container?this.container:this.isFullPage?null:this.$el.parentElement;(this.isFullPage||p&&p.contains(t.target))&&(t.preventDefault(),this.$el.focus())}},beforeUnmount(){document.removeEventListener("focusin",this.focusIn)}},L=["width","height","stroke"],X=[(0,a.createStaticVNode)('<g fill="none" fill-rule="evenodd"><g transform="translate(1 1)" stroke-width="2"><circle stroke-opacity=".25" cx="18" cy="18" r="18"></circle><path d="M36 18c0-9.94-8.06-18-18-18"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.8s" repeatCount="indefinite"></animateTransform></path></g></g>',1)];function K(t,p,y,C,w,v){return(0,a.openBlock)(),(0,a.createElementBlock)("svg",{viewBox:"0 0 38 38",xmlns:"http://www.w3.org/2000/svg",width:t.width,height:t.height,stroke:t.color},X,8,L)}const G=(0,a.defineComponent)({name:"spinner",props:{color:{type:String,default:"#000"},height:{type:Number,default:64},width:{type:Number,default:64}}});var N=i(657);const J=(0,N.default)(G,[["render",K]]),z=["fill","width","height"],Y=[(0,a.createStaticVNode)('<circle cx="15" cy="15" r="15"><animate attributeName="r" from="15" to="15" begin="0s" dur="0.8s" values="15;9;15" calcMode="linear" repeatCount="indefinite"></animate><animate attributeName="fill-opacity" from="1" to="1" begin="0s" dur="0.8s" values="1;.5;1" calcMode="linear" repeatCount="indefinite"></animate></circle><circle cx="60" cy="15" r="9" fill-opacity="0.3"><animate attributeName="r" from="9" to="9" begin="0s" dur="0.8s" values="9;15;9" calcMode="linear" repeatCount="indefinite"></animate><animate attributeName="fill-opacity" from="0.5" to="0.5" begin="0s" dur="0.8s" values=".5;1;.5" calcMode="linear" repeatCount="indefinite"></animate></circle><circle cx="105" cy="15" r="15"><animate attributeName="r" from="15" to="15" begin="0s" dur="0.8s" values="15;9;15" calcMode="linear" repeatCount="indefinite"></animate><animate attributeName="fill-opacity" from="1" to="1" begin="0s" dur="0.8s" values="1;.5;1" calcMode="linear" repeatCount="indefinite"></animate></circle>',3)];function Z(t,p,y,C,w,v){return(0,a.openBlock)(),(0,a.createElementBlock)("svg",{viewBox:"0 0 120 30",xmlns:"http://www.w3.org/2000/svg",fill:t.color,width:t.width,height:t.height},Y,8,z)}const ee=(0,a.defineComponent)({name:"dots",props:{color:{type:String,default:"#000"},height:{type:Number,default:240},width:{type:Number,default:60}}}),te=(0,N.default)(ee,[["render",Z]]),ae=["height","width","fill"],o=[(0,a.createStaticVNode)('<rect x="0" y="13" width="4" height="5"><animate attributeName="height" attributeType="XML" values="5;21;5" begin="0s" dur="0.6s" repeatCount="indefinite"></animate><animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0s" dur="0.6s" repeatCount="indefinite"></animate></rect><rect x="10" y="13" width="4" height="5"><animate attributeName="height" attributeType="XML" values="5;21;5" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate><animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate></rect><rect x="20" y="13" width="4" height="5"><animate attributeName="height" attributeType="XML" values="5;21;5" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate><animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate></rect>',3)];function s(t,p,y,C,w,v){return(0,a.openBlock)(),(0,a.createElementBlock)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 30 30",height:t.height,width:t.width,fill:t.color},o,8,ae)}const c=(0,a.defineComponent)({name:"bars",props:{color:{type:String,default:"#000"},height:{type:Number,default:40},width:{type:Number,default:40}}}),V={Spinner:J,Dots:te,Bars:(0,N.default)(c,[["render",s]])},m=(0,a.defineComponent)({name:"VueLoading",mixins:[H],props:{active:Boolean,programmatic:Boolean,container:[Object,Function,M],isFullPage:{type:Boolean,default:!0},enforceFocus:{type:Boolean,default:!0},lockScroll:Boolean,transition:{type:String,default:"fade"},canCancel:Boolean,onCancel:{type:Function,default:()=>{}},color:String,backgroundColor:String,opacity:Number,width:Number,height:Number,zIndex:Number,loader:{type:String,default:"spinner"}},components:V,emits:["hide","update:active"],data(){return{isActive:this.active}},mounted(){document.addEventListener("keyup",this.keyPress)},methods:{cancel(){!this.canCancel||!this.isActive||(this.hide(),this.onCancel.apply(null,arguments))},hide(){this.$emit("hide"),this.$emit("update:active",!1),this.programmatic&&(this.isActive=!1,setTimeout(()=>{const t=this.$el.parentElement;(0,a.render)(null,t),g(t)},150))},disableScroll(){this.isFullPage&&this.lockScroll&&document.body.classList.add("vl-shown")},enableScroll(){this.isFullPage&&this.lockScroll&&document.body.classList.remove("vl-shown")},keyPress(t){t.keyCode===27&&this.cancel()}},watch:{active(t){this.isActive=t},isActive(t){t?this.disableScroll():this.enableScroll()}},computed:{bgStyle(){return{background:this.backgroundColor,opacity:this.opacity}}},beforeUnmount(){document.removeEventListener("keyup",this.keyPress)}}),$=(0,N.default)(m,[["render",U]]);function A(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},p=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};return{show(){let y=arguments.length>0&&arguments[0]!==void 0?arguments[0]:t,C=arguments.length>1&&arguments[1]!==void 0?arguments[1]:p;const v={...t,...y,...{programmatic:!0,lockScroll:!0,isFullPage:!1,active:!0}};let R=v.container;v.container||(R=document.body,v.isFullPage=!0);const be={...p,...C};return{hide:d($,v,R,be).ctx.hide}}}}const D=function(t){let p=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},y=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};const C=A(p,y);t.config.globalProperties.$loading=C,t.provide("$loading",C)},q=$})(),S})())})(ge);const Ya=Ga(ge.exports);const Za="/ChatRoom/assets/close.1710863917078.svg",ce="/ChatRoom/assets/play_arrow.1710863917078.svg",es={class:"bg-gradient-to-b from-gray-400 via-gray-800 to-black w-full min-h-screen"},ts={class:"bg-gradient-to-t from-blue-200 to-gray-800 opacity-90 fixed w-full z-40 border-b-2 border-platinum h-header"},as={class:"flex p-3 max-w-8xl m-auto h-header"},ss={class:"max-w-one-three w-full flex md:flex-column text-center items-center"},os={class:"flex w-full justify-start items-center"},ns=l("img",{src:za,class:"max-w-one-three"},null,-1),is={class:"text-zinc-100 px-1 text-xs sm:text-base max-w-one-three sm:max-w-one-two truncate md:max-w-full"},rs=["src"],ls={class:"max-w-one-three w-full flex justify-center items-center"},ds={class:"text-xs sm:text-base text-zinc-100 p-2 truncate"},cs={class:"box-border pt-20 max-w-8xl m-auto px-3 text-2xl min-h-screen flex"},us={class:"text-2xl mx-auto w-full"},ms=l("div",{id:"LocalVideo",class:"z-50 fixed top-0 left-0 md:w-250 md:h-250 w-100 h-100"},null,-1),ps={id:"RemoteVideos",class:"flex justify-center flex-row flex-wrap"},fs=["id"],hs={class:"text-white text-sm text-center"},vs={id:"MessageWrap",class:"fixed z-50 left-0 bottom-0 w-full flex justify-start"},gs={class:"rounded-md max-w-one-two bg-slate-600 p-3"},bs={id:"Message",class:"flex flex-col text-sm text-yellow-900"},_s={class:"my-1 rounded-md inline bg-white p-2"},ys=l("div",{class:"bg-slate-400 h-1 my-2"},null,-1),ws={class:"flex justify-center"},Es=pe({__name:"Room",setup(f){const n=Da(),r={IceServerList:ne,Offer:X,Answer:K,Candidate:G,NewUser:N,UserLeaveFromRoom:J,BroadcastMessage:ie};Object.entries(r).forEach(([e,o])=>{var s;(s=n.state.socketInstance)==null||s.subscribe(e,o)}),n.state.roomIsSubscribe=!0;const h={audio:!0,video:{width:{ideal:1280},height:{ideal:720}}},u=n.state.socketInstance,i=new Map,S=qa(),a=n.state.user,g=E(!0),d=E(),k=E(!1),M=E(),b=E(),T=E(!1),U=E(ce),H=E(),L=E([]);if(u){const e={Type:P.getIceServerlist,Data:{RoomId:S.query.room}};u.wsSend(e)}else le.push({name:"Lobby"});function ne(e){d.value=e}async function X(e){for(;d.value==null&&Date.now()-Date.now()<3e3;)await new Promise(o=>setTimeout(o,16));if(d.value==null){console.error("Failed to get iceServerList.value within the maximum wait time");return}if(i.has(e.ReqId))i.has(e.ReqId)&&await z(i.get(e.ReqId),e);else{const o=new de(e.ReqId,d.value,n.state.useFirefoxAndNvidia,k);i.set(e.ReqId,o),await z(o,e)}}async function K(e){for(;d.value==null&&Date.now()-Date.now()<3e3;)await new Promise(o=>setTimeout(o,16));if(d.value==null){console.error("Failed to get iceServerList.value within the maximum wait time");return}i.has(e.ReqId)&&await Y(i.get(e.ReqId),e)}async function G(e){var s;for(;d.value==null&&Date.now()-Date.now()<3e3;)await new Promise(c=>setTimeout(c,16));if(d.value==null){console.error("Failed to get iceServerList.value within the maximum wait time");return}const o=i.get(e.ReqId);(s=o==null?void 0:o.peerConnection)==null||s.addIceCandidate({sdpMid:e.SdpMid,sdpMLineIndex:e.SdpMLineIndex,candidate:e.Candidate})}async function N(e){for(;d.value==null&&Date.now()-Date.now()<3e3;)await new Promise(o=>setTimeout(o,16));if(d.value==null){console.error("Failed to get iceServerList.value within the maximum wait time");return}!i.has(e.NewUser)&&T.value&&await Q(e.NewUser)}function ie(e){L.value.push({MessageSender:e.MessageSender,Message:e.Message}),L.value.length>=10&&L.value.splice(0,1)}function J(e){i.has(e.LeaveUser)&&(i.get(e.LeaveUser).close(),i.delete(e.LeaveUser))}async function z(e,o){var _,I,V;e.peerConnection.onicecandidate=m=>{if(!m.candidate||!m.candidate.candidate)return;const W={Type:P.sendCandidate,Data:{RoomId:S.query.room,SdpMid:m.candidate.sdpMid||"0",SdpMLineIndex:m.candidate.sdpMLineIndex,RecvId:o.ReqId,Candidate:m.candidate.candidate}};u.wsSend(W)},await((_=e.peerConnection)==null?void 0:_.setRemoteDescription(new RTCSessionDescription({sdp:o.Desc.Sdp,type:o.Desc.Type})));let s=await((I=e.peerConnection)==null?void 0:I.createAnswer());(s==null?void 0:s.sdp)&&n.state.useFirefoxAndNvidia&&!g.value&&(s.sdp=te(s.sdp,"H264")),await((V=e.peerConnection)==null?void 0:V.setLocalDescription(s));const c={Type:P.answer,Data:{RoomId:S.query.room,RecvId:o.ReqId,Desc:s}};u.wsSend(c)}async function Q(e){var o;if(!i.has(e)){const s=new de(e,d.value,n.state.useFirefoxAndNvidia,k);i.set(e,s)}if(i.has(e)){const s=i.get(e);if(((o=s.peerConnection)==null?void 0:o.signalingState)=="have-remote-offer")return;s.peerConnection.onicecandidate=c=>{if(!c.candidate||!c.candidate.candidate)return;const _={Type:P.sendCandidate,Data:{RoomId:S.query.room,SdpMid:c.candidate.sdpMid||"0",SdpMLineIndex:c.candidate.sdpMLineIndex,RecvId:s.remoteUser,Candidate:c.candidate.candidate}};u.wsSend(_)},s.peerConnection.onnegotiationneeded=async function(){const c=await s.peerConnection.createOffer();s.isOffer=!0,await s.peerConnection.setLocalDescription(c);const _={Type:P.offer,Data:{RoomId:S.query.room,RecvId:i.get(e).remoteUser,Desc:c}};u.wsSend(_)},M.value.getTracks().forEach(c=>{s.peerConnection.addTrack(c,M.value)})}}async function Y(e,o){var c;const s={sdp:o.Desc.Sdp,type:o.Desc.Type};(c=e.peerConnection)==null||c.setRemoteDescription(s)}async function Z(){return navigator.mediaDevices.getUserMedia(h).then(e=>{M.value=e,b.value=document.createElement("video"),b.value.srcObject=M.value,b.value.classList.add("rounded-full","aspect-square","border-8","bg-black","border-slate-600"),b.value.muted=!0,b.value.setAttribute("playsinline",""),b.value.playsInline=!0,b.value.autoplay=!0;const o=document.getElementById("LocalVideo");o==null||o.appendChild(b.value)}).catch(e=>{alert("Browser doesn't support or there is some errors."+e)})}async function ee(){var e;if(T.value=!T.value,T.value?U.value=Za:U.value=ce,T.value)await Z(),n.state.Room.UserList.forEach(async o=>{o!=a.id&&await Q(o)});else{(e=M.value)==null||e.getTracks().forEach(s=>{s.stop()});const o=document.getElementById("LocalVideo");o==null||o.removeChild(b.value)}}function re(){const e={Type:P.broadcastMessage,Data:{RoomId:S.query.room,Message:H.value}};u.wsSend(e),L.value.push({MessageSender:"me",Message:H.value}),L.value.length>=10&&L.value.splice(0,1),H.value=""}function te(e,o){var s=function(c){var _=new RegExp("(a=rtpmap:(\\d*) "+o+"/90000\\r\\n)"),I=c.match(_);if(I==null||I.length<=2)return c;var V=I[2],m=c.replace(_,""),W=new RegExp("(a=rtcp-fb:"+V+`.*\r
)`,"g");m=m.replace(W,"");var $=new RegExp("(a=fmtp:"+V+`.*\r
)`,"g");m=m.replace($,"");var A=new RegExp("(a=fmtp:(\\d*) apt="+V+"\\r\\n)"),D=m.match(A),q="";if(D!=null&&D.length>=3){q=D[2],m=m.replace(A,"");var t=new RegExp("(a=rtpmap:"+q+`.*\r
)`,"g");m=m.replace(t,"")}var p=/(m=video.*\r\n)/,y=m.match(p);if(y!=null){for(var C=y[0].substring(0,y[0].length-2),w=C.split(" "),v=w[0],R=1;R<w.length;R++)w[R]==V||w[R]==q||(v+=" "+w[R]);v+=`\r
`,m=m.replace(p,v)}return s(m)};return s(e)}function ae(){le.push({name:"Lobby"})}return fe(()=>{var o;Object.entries(r).forEach(([s,c])=>{var _;(_=n.state.socketInstance)==null||_.unSubscribe(s,c)}),i.forEach(s=>{s.close()}),(o=M.value)==null||o.getTracks().forEach(s=>{s.stop()});const e=document.getElementById("LocalVideo");e==null||e.removeChild(b.value),b.value=null,i.clear()}),(e,o)=>(O(),F("div",es,[l("div",ts,[l("header",as,[l("div",ss,[l("div",os,[ns,l("p",is,j(B(a).id),1),l("button",{onClick:ee,class:"bg-red-500 max-w-one-three hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-300 sm:text-sm active:bg-red-700 p-2 rounded-full"},[l("img",{src:U.value,class:"cursor-pointer",alt:"userImage"},null,8,rs)])])]),l("div",ls,[l("div",null,[l("p",ds," Room:"+j(B(S).query.room),1)])]),l("div",{class:"max-w-one-three w-full flex justify-end items-center"},[l("button",{onClick:ae,class:"bg-sky-500 hover:bg-sky-700 focus:outline-none focus:ring focus:ring-sky-300 active:bg-sky-700 px-5 py-2 text-xs leading-5 sm:text-base rounded-full font-semibold text-white"}," Home ")])])]),l("div",cs,[l("div",us,[ms,l("div",ps,[me(B(Ya),{active:k.value,"onUpdate:active":o[0]||(o[0]=s=>k.value=s),"can-cancel":!1,"is-full-page":!1},null,8,["active"]),(O(!0),F(se,null,oe(B(n).state.Room.UserList.filter(s=>s!==B(n).state.user.id),s=>(O(),F("div",{id:s,class:"m-4 border-8 border-slate-400 rounded-md flex flex-col justify-center",style:{width:"500px",height:"500px"}},[l("p",hs,j(s),1)],8,fs))),256))]),l("div",vs,[l("div",gs,[l("div",bs,[(O(!0),F(se,null,oe(L.value,s=>(O(),F("div",_s,[l("p",null,[l("span",null,j(s.MessageSender)+": ",1),ue(j(s.Message),1)])]))),256))]),ys,l("div",ws,[he(l("input",{class:"max-w-one-two md:max-w-full rounded-full text-base px-2 my-1 mx-1","onUpdate:modelValue":o[1]||(o[1]=s=>H.value=s)},null,512),[[ve,H.value]]),l("button",{onClick:re,class:"bg-gray-500 hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300 active:bg-gray-700 px-3 py-2 leading-5 text-sm rounded-full font-semibold text-white"}," Send ")])])])])])]))}});export{Es as default};
