export class PeerConnectionInstance {
 remoteUser: string = "";
 role: string | undefined = "";
 peerConnection: RTCPeerConnection | undefined;
 iceconfig: any;
 constructor(remoteUser: string, iceconfig: any, role?: string) {
  this.remoteUser = remoteUser
  this.role = role
  this.iceconfig = iceconfig;
  this.init()
 }

 private init() {
  const configuration = {
   iceServers: this.iceconfig.iceServers,
   // encodedInsertableStreams: true
  };
  this.peerConnection = new RTCPeerConnection(configuration);
  // this.register();
 }
 // private register() {
 //  if (this.peerConnection) {
 //   this.peerConnection.onicecandidate = (event) => {
 //    if (!event.candidate || !event.candidate.candidate) return;
 //    // console.log("onicecandidate")
 //    // this.emit("sendCandidate", {
 //    //  Room: this.room,
 //    //  SdpMid: event.candidate.sdpMid || "0",
 //    //  SdpMLineIndex: event.candidate.sdpMLineIndex,
 //    //  Candidate: event.candidate.candidate,
 //    // });
 //   }

 //   // this.peerConnection.onnegotiationneeded = () => {
 //   //  
 //   // }

 //   this.peerConnection.ontrack = (event) => {

 //   }
 //  }
 // }
}