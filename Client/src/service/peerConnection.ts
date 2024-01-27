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
  remoteWrap?: HTMLElement;
  mediaStream = new MediaStream();
  mediaStreamId: string = "";

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
      if (this.mediaStreamId != event.streams[0].id) {
        this.remoteWrap = document.getElementById(this.remoteUser) ?? undefined;
        if (this.remoteWrap && this.remoteVideoHTMLVideoElement) {
          this.remoteWrap.appendChild(this.remoteVideoHTMLVideoElement);
        } else if (this.remoteWrap && this.remoteVideoHTMLCanvasElement) {
          this.remoteWrap.appendChild(this.remoteVideoHTMLCanvasElement);
        }
        this.mediaStreamId = event.streams[0].id
        if (this.mediaStream.getTracks()) {
          this.mediaStream.getTracks().forEach((track) => {
            this.mediaStream.removeTrack(track);
          })
        }
      }
      this.mediaStream.addTrack(event.track);
      this.isOntrack = true;
      this.remoteVideoHTMLVideoElement?.play();
      this.isLoading.value = false;
    };
  }

  private useHtmlVideoElement() {
    this.remoteVideoHTMLVideoElement = document.createElement('video');
    this.remoteVideoHTMLVideoElement.srcObject = this.mediaStream;
    this.remoteVideoHTMLVideoElement.width = 500;
    this.remoteVideoHTMLVideoElement.height = 500;
    this.remoteVideoHTMLVideoElement.style.cssText = 'height:90%';
    this.remoteVideoHTMLVideoElement.id = this.remoteUser;
    this.remoteVideoHTMLVideoElement.autoplay = true;
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
  }
}