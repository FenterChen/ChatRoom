import{E as x,_ as C}from"./eventType.1706283068327.js";import{d as N,r as m,c as j,w as D,o as U,a as i,b as n,t as r,u as c,e as A,F as y,f as v,g as I,h as S,i as B,j as O,k as l,n as T,l as V}from"./index.1706283068327.js";const z={class:"bg-gradient-to-b from-gray-400 via-gray-800 to-black w-full min-h-screen"},M={class:"bg-gradient-to-t from-blue-200 to-gray-800 opacity-90 fixed w-full z-50 border-b-2 border-platinum h-header"},P={class:"flex p-3 max-w-8xl m-auto h-header"},W={class:"basis-1/3 sm:w-24 flex items-center"},G=n("img",{src:C,alt:"userImage"},null,-1),q={class:"text-zinc-100 text-pretty w-full"},K={key:0,class:"py-20 max-w-8xl m-auto px-3 text-2xl"},$={class:"flex flex-wrap justify-center p-2"},H={key:0,class:"min-h-full w-full bg-slate-300 rounded px-2 py-1 mb-2"},J={class:"text-base font-bold underline"},Q={class:"w-full grid md:grid-cols-5 sm:grid-cols-2 gap-2"},X=["onClick"],Y={class:"items-stretch"},Z={class:"text-sm"},ee=V(" RoomId: "),te={class:"text-base font-bold underline"},se={class:"font-thin text-sm md:my-4 sm:my-2"},oe={class:"font-thin text-sm md:my-4 sm:my-2"},ne={class:"font-thin text-sm"},ce=N({__name:"Lobby",setup(ae){const t=S(),f=m(),u=m(),p=m(!0);t.state.roomIsSubscribe=!1;const _={InitData:k,UpdateRoom:L};function w(){console.log("User cancelled the loader.")}const R=j(()=>t.state.othersRoom.filter(s=>s));D(t.state.othersRoom,e=>{f.value=e},{immediate:!0}),U(()=>{t.state.socketInstance&&t.state.user.id!=null?(Object.entries(_).forEach(([e,s])=>{t.state.socketInstance.subscribe(e,s)}),b(),h()&&g()&&(t.state.useFirefoxAndNvidia=!0)):(t.commit("m_createWebSocket"),Object.entries(_).forEach(([e,s])=>{var a;(a=t.state.socketInstance)==null||a.subscribe(e,s)}))});function k(e){t.state.user.id=e.Id,E()}function L(e){e.RoomId==u.value&&B.push({name:"Room",query:{room:u.value}})}function E(){b(),h()&&g()&&(t.state.useFirefoxAndNvidia=!0)}function b(){var s;const e={Type:x.joinRoom,Data:{RoomId:"Lobby"}};(s=t.state.socketInstance)==null||s.wsSend(e)}function F(e){var a;u.value=e;const s={Type:x.joinRoom,Data:{RoomId:u.value}};(a=t.state.socketInstance)==null||a.wsSend(s)}function h(){var e=navigator.userAgent;return e.indexOf("Firefox")!=-1&&e.indexOf("Mobile")==-1}function g(){let e=document.createElement("canvas"),s,a,o,d="NVIDIA";try{if(s=e.getContext("webgl",{powerPreference:"high-performance"})||e.getContext("experimental-webgl",{powerPreference:"high-performance"}),s)return a=s.getExtension("WEBGL_debug_renderer_info"),o=s.getParameter(a.UNMASKED_VENDOR_WEBGL),!!o.toLowerCase().includes(d.toLowerCase())}catch{}}return(e,s)=>{const a=O("loading");return l(),i("div",z,[n("div",M,[n("header",P,[n("div",W,[G,n("div",null,[n("p",q,r(c(t).state.user.id),1)])])])]),A(a,{active:p.value,"onUpdate:active":s[0]||(s[0]=o=>p.value=o),"can-cancel":!0,"on-cancel":w,"is-full-page":!1},null,8,["active"]),f.value&&c(t).state.Lobby?(l(),i("div",K,[n("ul",$,[c(t).state.Lobby[0]?(l(),i("li",H,[n("p",J,r(c(t).state.Lobby[0].RoomId),1),(l(!0),i(y,null,v(c(t).state.Lobby[0].UserList,(o,d)=>(l(),i("p",{class:"font-thin text-sm inline",key:d},r(d+1)+"."+r(o)+"\xA0 ",1))),128))])):I("",!0),n("div",Q,[(l(!0),i(y,null,v(c(R),o=>(l(),i("li",{key:o.RoomId,class:T([{"cursor-pointer":!o.IsFull,"bg-slate-300":!o.IsFull,"bg-red-900":o.IsFull,"bg-white":o.UserList.length==0},"rounded px-2 py-1"]),onClick:d=>F(o.RoomId)},[n("div",Y,[n("p",Z,[ee,n("span",te,r(o.RoomId),1)]),n("p",se," Full: "+r(o.IsFull),1),n("p",oe," Type: "+r(o.RoomType),1),n("p",ne," Number of people: "+r(o.UserList.length),1)])],10,X))),128))])])])):I("",!0)])}}});export{ce as default};
