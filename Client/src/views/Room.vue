<script setup lang="ts">
import { useRoute } from 'vue-router';
import router from '../router';
import { useStore } from '../store';
import { ref, onUnmounted, onMounted, watch, computed } from 'vue';
import { SocketInstance } from '../service/socketInstance';
import { PeerConnectionInstance } from '../service/peerConnection';
import { Payload, EventType } from '../service/model/eventType';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';
import RabbitVideo from '../assets/h264_720p_60fps_2.5M.mp4';



const store = useStore();
const subscribeEvents = {
  IceServerList: IceServerListFunc,
  Offer: OfferFunc,
  Answer: AnswerFunc,
  Candidate: CandidateFunc,
  NewUser: NewUserFunc,
  UserLeaveFromRoom: UserLeaveFromRoomFunc
};
Object.entries(subscribeEvents).forEach(([key, func]) => {
  store.state.socketInstance?.subscribe(key, func);
});
store.state.roomIsSubscribe = true;

const socketInstance: SocketInstance | undefined = store.state.socketInstance;
const pcMap = new Map<string, PeerConnectionInstance>();
const route = useRoute();
const user = store.state.user;
const videoSource = ref<VideoElement>();
const useCanvas = ref<Boolean>(true);
const iceServerList = ref();
const isLoading = ref<Boolean>(false);
const useVideo = ref<Boolean>(false);
const videoStream = ref<MediaStream>();

interface VideoElement extends HTMLVideoElement {
  captureStream(frameRequestRate?: number): MediaStream;
}

if (socketInstance) {
  const payload: Payload = {
    Type: EventType.getIceServerlist,
    Data: {
      RoomId: route.query.room,
    },
  };
  socketInstance.wsSend(payload);
} else {
  router.push({
    name: 'Lobby',
  });
}
function IceServerListFunc(Data: any) {
  console.log("IceServerListFunc")
  iceServerList.value = Data;
}
async function OfferFunc(Data: any) {
  console.log("OfferFunc")
  while (iceServerList.value == null) {
    await new Promise((resolve) => setTimeout(resolve, 16));
  }
  if (!pcMap.has(Data.ReqId)) {
    const pc = new PeerConnectionInstance(
      Data.ReqId,
      iceServerList.value,
      store.state.useFirefoxAndNvidia,
      isLoading,
      route.query.room as string
    );
    pcMap.set(Data.ReqId, pc);
    await receiveOffer(pc, Data);
  } else if (
    pcMap.has(Data.ReqId)
  ) {
    await receiveOffer(pcMap.get(Data.ReqId)!, Data);
  }
}
async function AnswerFunc(Data: any) {
  console.log("AnswerFunc")
  while (iceServerList.value == null) {
    await new Promise((resolve) => setTimeout(resolve, 16));
  }
  if (pcMap.has(Data.ReqId)) {
    await receiveAnswer(pcMap.get(Data.ReqId)!, Data);
  }
}
async function CandidateFunc(Data: any) {
  console.log("CandidateFunc")
  while (iceServerList.value == null) {
    await new Promise((resolve) => setTimeout(resolve, 16));
  }
  const existPc = pcMap.get(Data.ReqId);
  existPc?.peerConnection?.addIceCandidate({
    sdpMid: Data.SdpMid,
    sdpMLineIndex: Data.SdpMLineIndex,
    candidate: Data.Candidate,
  });
}
async function NewUserFunc(Data: any) {
  console.log("NewUserFunc")
  if (useVideo.value) {
    while (iceServerList.value == null) {
      await new Promise((resolve) => setTimeout(resolve, 16));
    }
    if (!pcMap.has(Data.NewUser)) {
      await createOffer(Data.NewUser);
    }
  }
}
function UserLeaveFromRoomFunc(Data: any) {
  console.log("UserLeaveFromRoomFunc")
  if (pcMap.has(Data.LeaveUser)) {
    userLeaveFromRoom(pcMap.get(Data.LeaveUser)!, Data);
  }
}

async function receiveOffer(pc: PeerConnectionInstance, Data: any) {
  console.log("receiveOffer");
  isLoading.value = true;
  pc.peerConnection!.onicecandidate = (event) => {
    if (!event.candidate || !event.candidate.candidate) return;
    const payload: Payload = {
      Type: EventType.sendCandidate,
      Data: {
        RoomId: route.query.room,
        SdpMid: event.candidate.sdpMid || '0',
        SdpMLineIndex: event.candidate.sdpMLineIndex,
        RecvId: Data.ReqId,
        Candidate: event.candidate.candidate,
      },
    };
    socketInstance!.wsSend(payload);
  };

  await pc.peerConnection?.setRemoteDescription(
    new RTCSessionDescription({
      sdp: Data.Desc.Sdp,
      type: Data.Desc.Type,
    })
  );

  let answerDesc = await pc.peerConnection?.createAnswer();
  if (answerDesc?.sdp && store.state.useFirefoxAndNvidia && !useCanvas.value) {
    answerDesc.sdp = removeCodec(answerDesc.sdp, 'H264');
  }
  await pc.peerConnection?.setLocalDescription(answerDesc);

  const payload: Payload = {
    Type: EventType.answer,
    Data: {
      RoomId: route.query.room,
      RecvId: Data.ReqId,
      Desc: answerDesc,
    },
  };
  socketInstance!.wsSend(payload);
}

async function createOffer(pcId: string) {
  console.log("createOffer");
  if (!pcMap.has(pcId)) {
    const pc = new PeerConnectionInstance(
      pcId,
      iceServerList.value,
      store.state.useFirefoxAndNvidia,
      isLoading,
      route.query.room as string
    );
    pcMap.set(pcId, pc);
  }
  if (pcMap.has(pcId)) {
    if (pcMap.get(pcId)!.peerConnection?.signalingState == 'have-remote-offer')
      return;
    pcMap.get(pcId)!.peerConnection!.onicecandidate = (event) => {
      if (!event.candidate || !event.candidate.candidate) return;
      const payload: Payload = {
        Type: EventType.sendCandidate,
        Data: {
          RoomId: route.query.room,
          SdpMid: event.candidate.sdpMid || '0',
          SdpMLineIndex: event.candidate.sdpMLineIndex,
          RecvId: pcMap.get(pcId)!.remoteUser,
          Candidate: event.candidate.candidate,
        },
      };
      socketInstance!.wsSend(payload);
    };
    pcMap.get(pcId)!.peerConnection!.onnegotiationneeded = async function () {
      const offerDesc = await pcMap.get(pcId)!.peerConnection!.createOffer();
      await pcMap.get(pcId)!.peerConnection!.setLocalDescription(offerDesc);
      const payload: Payload = {
        Type: EventType.offer,
        Data: {
          RoomId: route.query.room,
          RecvId: pcMap.get(pcId)!.remoteUser,
          Desc: offerDesc,
        },
      };
      socketInstance!.wsSend(payload);
    };
    videoStream.value!.getTracks().forEach((track) => {
      pcMap.get(pcId)!.peerConnection!.addTrack(track, videoStream.value!);
    });
  }
}

async function receiveAnswer(pc: PeerConnectionInstance, Data: any) {
  const Desc = <RTCSessionDescriptionInit>{
    sdp: Data.Desc.Sdp,
    type: Data.Desc.Type,
  };
  pc.peerConnection?.setRemoteDescription(Desc);
}

async function playVideo() {
  useVideo.value = !useVideo.value;
  if (useVideo.value) {
    videoSource.value = <VideoElement>document.createElement('video');
    videoSource.value.autoplay;
    videoSource.value.src = RabbitVideo;
    videoSource.value.loop = true;
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    videoSource.value!.addEventListener('loadedmetadata', function () {
      canvas.width = videoSource.value!.videoWidth;
      canvas.height = videoSource.value!.videoHeight;
    });
    videoSource.value.oncanplay = () => {
      videoSource.value?.play();

      var $this = videoSource.value; //cache
      (function loop() {
        if (!$this!.paused && !$this!.ended) {
          ctx!.drawImage($this!, 0, 0);
          setTimeout(loop, 1000 / 60); // drawing at 60fps
        }
      })();
      videoStream.value = new MediaStream();
      videoStream.value!.addTrack(canvas.captureStream(60).getVideoTracks()[0]);
      videoStream.value!.addTrack(
        videoSource.value!.captureStream().getAudioTracks()[0]
      );
      pcMap.forEach(async (PeerConnection) => {
        await createOffer(PeerConnection.remoteUser);
      });
    };
  }
}

function userLeaveFromRoom(pc: PeerConnectionInstance, Data: any) {
  pc.close();
  pcMap.delete(Data.LeaveUser);
}

function removeCodec(orgsdp: string, codec: string) {
  var internalFunc = function (sdp: string): any {
    var codecre = new RegExp('(a=rtpmap:(\\d*) ' + codec + '\/90000\\r\\n)');
    var rtpmaps = sdp.match(codecre);
    if (rtpmaps == null || rtpmaps.length <= 2) {
      return sdp;
    }
    var rtpmap = rtpmaps[2];
    var modsdp = sdp.replace(codecre, '');
    var rtcpre = new RegExp('(a=rtcp-fb:' + rtpmap + '.*\r\n)', 'g');
    modsdp = modsdp.replace(rtcpre, '');
    var fmtpre = new RegExp('(a=fmtp:' + rtpmap + '.*\r\n)', 'g');
    modsdp = modsdp.replace(fmtpre, '');
    var aptpre = new RegExp('(a=fmtp:(\\d*) apt=' + rtpmap + '\\r\\n)');
    var aptmaps = modsdp.match(aptpre);
    var fmtpmap = '';
    if (aptmaps != null && aptmaps.length >= 3) {
      fmtpmap = aptmaps[2];
      modsdp = modsdp.replace(aptpre, '');
      var rtppre = new RegExp('(a=rtpmap:' + fmtpmap + '.*\r\n)', 'g');
      modsdp = modsdp.replace(rtppre, '');
    }
    var videore = /(m=video.*\r\n)/;
    var videolines = modsdp.match(videore);
    if (videolines != null) {
      //If many m=video are found in SDP, this program doesn't work.
      var videoline = videolines[0].substring(0, videolines[0].length - 2);
      var videoelem = videoline.split(' ');
      var modvideoline = videoelem[0];
      for (var i = 1; i < videoelem.length; i++) {
        if (videoelem[i] == rtpmap || videoelem[i] == fmtpmap) {
          continue;
        }
        modvideoline += ' ' + videoelem[i];
      }
      modvideoline += '\r\n';
      modsdp = modsdp.replace(videore, modvideoline);
    }
    return internalFunc(modsdp);
  };
  return internalFunc(orgsdp);
}
function backToHome() {
  router.push({ name: 'Lobby' });
}

onUnmounted(() => {
  Object.entries(subscribeEvents).forEach(([key, func]) => {
    store.state.socketInstance?.unSubscribe(key, func);
  });
  pcMap.forEach((pc) => {
    pc.peerConnection?.close();
  });
  videoSource.value?.pause();
  videoSource.value = undefined;
  pcMap.clear();
});
</script>
<template>
  <div class="bg-gradient-to-b from-gray-400 via-gray-800 to-black w-full min-h-screen">
    <div
      class="bg-gradient-to-t from-blue-200 to-gray-800 opacity-90 fixed w-full z-50 border-b-2 border-platinum max-h-header">
      <header class="flex p-3 max-w-8xl m-auto max-h-header">
        <div class="max-w-one-three w-full flex md:flex-column text-center items-center">
          <div class="flex w-full justify-start items-center">
            <img src="@/assets/account_circle.svg" class="max-w-one-three" alt="userImage" />
            <p class="text-zinc-100 px-1 text-xs sm:text-base max-w-one-three sm:max-w-one-two truncate">
              {{ user.id }}
            </p>
            <button @click="playVideo"
              class="bg-red-500 max-w-one-three hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-300 sm:text-sm active:bg-red-700 p-2 rounded-full">
              <img src="@/assets/play_arrow.svg" class="cursor-pointer" alt="userImage" />
            </button>
          </div>
        </div>
        <div class="max-w-one-three w-full flex justify-center items-center">
          <div>
            <p class="text-xs sm:text-base text-zinc-100 p-2 truncate">
              Room:{{ route.query.room }}
            </p>
          </div>
        </div>
        <div class="max-w-one-three w-full flex justify-end items-center">
          <button @click="backToHome"
            class="bg-sky-500 hover:bg-sky-700 focus:outline-none focus:ring focus:ring-sky-300 active:bg-sky-700 px-5 py-2 text-xs leading-5 sm:text-base rounded-full font-semibold text-white">
            Home
          </button>
        </div>
      </header>
    </div>
    <div class="box-border pt-20 max-w-8xl m-auto px-3 text-2xl min-h-screen flex items-center">
      <div class="text-2xl m-auto">
        <div id="LocalVideos" class="flex justify-center flex-col max-h-screen-5rem">
          <!-- <p class="text-center mr-2">Local videos</p> -->
        </div>
        <div id="RemoteVideos" class="flex justify-center flex-row max-h-screen-5rem">
          <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="false" />
          <!-- <p class="text-center mr-2">Remote videos</p> -->
        </div>
      </div>
    </div>
  </div>
</template>
