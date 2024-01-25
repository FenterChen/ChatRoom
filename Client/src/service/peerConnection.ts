import { Ref } from "vue";

export class PeerConnectionInstance {
  remoteUser: string = "";
  role: string | undefined = "";
  peerConnection: RTCPeerConnection | undefined;
  iceconfig: any;
  isLoading: Ref<{
    valueOf: () => boolean;
  }>;
  remoteVideoHTMLVideoElement?: HTMLVideoElement;
  remoteVideoHTMLCanvasElement?: HTMLCanvasElement;
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
      this.mediaStream.addTrack(event.track);
      console.log("ontrack");
      this.remoteVideoHTMLVideoElement?.play();
      this.isLoading.value = false;
    };
  }

  private useHtmlVideoElement() {
    this.remoteVideoHTMLVideoElement = document.createElement('video');
    this.remoteVideoHTMLVideoElement.srcObject = this.mediaStream;
    this.remoteVideoHTMLVideoElement.id = this.remoteUser;
    this.remoteVideoHTMLVideoElement.classList.add(
      'p-4',
      'max-h-screen-8rem',
      'object-fill'
    );
    this.remoteVideoHTMLVideoElement.autoplay = true;
    this.VideoWraps?.appendChild(this.remoteVideoHTMLVideoElement);
  }
  private useHtmlCanvasElement() {
    this.remoteVideoHTMLVideoElement = document.createElement('video');
    this.remoteVideoHTMLVideoElement.srcObject = this.mediaStream;
    this.remoteVideoHTMLVideoElement.id = this.remoteUser;
    this.remoteVideoHTMLVideoElement.classList.add(
      'p-4',
      'max-h-screen-8rem',
      'object-fill'
    );
    this.remoteVideoHTMLVideoElement.autoplay = true;
    this.remoteVideoHTMLCanvasElement = document.createElement('canvas');
    this.remoteVideoHTMLCanvasElement.id = this.remoteUser;
    this.remoteVideoHTMLCanvasElement.classList.add(
      'p-4',
      'max-h-screen-8rem',
      'object-fill'
    );
    this.VideoWraps?.appendChild(this.remoteVideoHTMLCanvasElement);

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
    if (this.remoteVideoHTMLVideoElement)
      this.VideoWraps?.removeChild(this.remoteVideoHTMLVideoElement);
    if (this.remoteVideoHTMLCanvasElement)
      this.VideoWraps?.removeChild(this.remoteVideoHTMLCanvasElement);
  }
}