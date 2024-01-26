import { Ref } from "vue";

export class PeerConnectionInstance {
 remoteUser: string = "";
 role: string | undefined = "";
 peerConnection: RTCPeerConnection | undefined;
 iceconfig: any;
 isOntrack: Boolean = false;
 isOffer: Boolean = false;
 isLoading: Ref<{
  valueOf: () => boolean;
 }>;
 remoteVideoHTMLVideoElement?: HTMLVideoElement;
 remoteVideoHTMLCanvasElement?: HTMLCanvasElement;
 remoteWrap: HTMLDivElement = document.createElement('div');
 VideoWraps = document.getElementById('RemoteVideos');
 mediaStream = new MediaStream();

 constructor(remoteUser: string, iceconfig: any, useFirefoxAndNvidia: Boolean, isLoading: Ref<{
  valueOf: () => boolean;
 }>, role?: string) {
  this.remoteUser = remoteUser
  this.role = role
  this.iceconfig = iceconfig;
  this.isLoading = isLoading;

  if (!useFirefoxAndNvidia) {
   this.useHtmlVideoElement();
  } else {
   this.useHtmlCanvasElement();
  }
  this.init()
 }

 private init() {
  const configuration = {
   iceServers: this.iceconfig.iceServers,
  };
  this.peerConnection = new RTCPeerConnection(configuration);
  this.peerConnection.ontrack = (event) => {
   this.mediaStream.getTracks().forEach((track) => {
    this.mediaStream.removeTrack(track);
   })
   this.mediaStream.addTrack(event.track);
   this.isOntrack = true;
   this.remoteVideoHTMLVideoElement?.play();
   this.isLoading.value = false;
   this.VideoWraps?.appendChild(this.remoteWrap);
  };
 }

 private useHtmlVideoElement() {
  this.remoteVideoHTMLVideoElement = document.createElement('video');
  this.remoteVideoHTMLVideoElement.srcObject = this.mediaStream;
  this.remoteVideoHTMLVideoElement.width = 500;
  this.remoteVideoHTMLVideoElement.height = 500;
  this.remoteVideoHTMLVideoElement.id = this.remoteUser;
  const p = document.createElement('p');
  p.textContent = this.remoteUser;
  p.style.cssText = 'position: absolute; top: 5%; left: 5%;';
  p.classList.add(
   'text-slate-500',
   'text-transparent',
   'text-sm'
  )
  this.remoteWrap.classList.add(
   'p-4',
   'relative'
  );
  this.remoteVideoHTMLVideoElement.autoplay = true;
  this.remoteWrap.appendChild(this.remoteVideoHTMLVideoElement);
  this.remoteWrap.appendChild(p);
 }
 private useHtmlCanvasElement() {
  this.remoteVideoHTMLVideoElement = document.createElement('video');
  this.remoteVideoHTMLVideoElement.srcObject = this.mediaStream;
  this.remoteVideoHTMLVideoElement.id = this.remoteUser;
  this.remoteVideoHTMLVideoElement.autoplay = true;
  this.remoteVideoHTMLCanvasElement = document.createElement('canvas');
  this.remoteVideoHTMLCanvasElement.width = 500;
  this.remoteVideoHTMLCanvasElement.height = 500;
  this.remoteVideoHTMLCanvasElement.id = this.remoteUser;
  const p = document.createElement('p');
  p.textContent = this.remoteUser;
  p.style.cssText = 'position: absolute; top: 5%; left: 5%;';
  p.classList.add(
   'text-slate-500',
   'text-transparent',
   'text-sm'
  )
  this.remoteWrap.classList.add(
   'relative',
   'p-4',
  );
  this.remoteWrap.appendChild(this.remoteVideoHTMLCanvasElement);
  this.remoteWrap.appendChild(p);

  let ctx = this.remoteVideoHTMLCanvasElement.getContext('2d');
  const that = this;
  if (that.remoteVideoHTMLVideoElement) {
   that.remoteVideoHTMLVideoElement.onplay = () => {
    var $this = this.remoteVideoHTMLVideoElement!;
    (function loop() {
     if (!$this!.paused && !$this!.ended) {
      if (that.remoteVideoHTMLCanvasElement) {
       that.remoteVideoHTMLCanvasElement.width = that.remoteVideoHTMLVideoElement!.videoWidth;
       that.remoteVideoHTMLCanvasElement.height = that.remoteVideoHTMLVideoElement!.videoHeight;
      }
      ctx!.drawImage($this!, 0, 0);
      setTimeout(loop, 1000 / 60); // drawing at 60fps
     }
    })();
   }
  };
 }
 public close() {
  this.peerConnection?.close();
  if (this.isOntrack) {
   this.VideoWraps?.removeChild(this.remoteWrap);
  }
 }
}