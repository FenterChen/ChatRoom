<script setup lang="ts">
import { useRoute } from 'vue-router';
import router from '../router';
import { useStore } from '../store';
import { ref, onUnmounted } from 'vue';
import { SocketInstance } from '../service/socketInstance';
import { PeerConnectionInstance } from '../service/peerConnection';
import { Payload, EventType } from '../service/model/eventType';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';
import closeIcon from '@/assets/close.svg';
import playArrowIcon from '@/assets/play_arrow.svg';

const store = useStore();
const subscribeEvents = {
  IceServerList: IceServerListFunc,
  Offer: OfferFunc,
  Answer: AnswerFunc,
  Candidate: CandidateFunc,
  NewUser: NewUserFunc,
  UserLeaveFromRoom: UserLeaveFromRoomFunc,
  BroadcastMessage: BroadcastMessageFunc,
};
Object.entries(subscribeEvents).forEach(([key, func]) => {
  store.state.socketInstance?.subscribe(key, func);
});
store.state.roomIsSubscribe = true;
const constraints = {
  audio: true,
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
};
const socketInstance: SocketInstance | undefined = store.state.socketInstance;
const pcMap = new Map<string, PeerConnectionInstance>();
const route = useRoute();
const user = store.state.user;
const useCanvas = ref<Boolean>(true);
const iceServerList = ref();
const isLoading = ref<Boolean>(false);
const videoStream = ref<MediaStream>();
const localvideo = ref();
const isPush = ref<Boolean>(false);
const pushIcon = ref(playArrowIcon);
const inputText = ref();
type message = { MessageSender: string; Message: string };
const messageArr = ref<Array<message>>([]);

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
  iceServerList.value = Data;
}
async function OfferFunc(Data: any) {
  while (iceServerList.value == null && Date.now() - Date.now() < 3000) {
    await new Promise((resolve) => setTimeout(resolve, 16));
  }

  if (iceServerList.value == null) {
    console.error('Failed to get iceServerList.value within the maximum wait time');
    return;
  }

  if (!pcMap.has(Data.ReqId)) {
    const pc = new PeerConnectionInstance(
      Data.ReqId,
      iceServerList.value,
      store.state.useFirefoxAndNvidia,
      isLoading
    );
    pcMap.set(Data.ReqId, pc);
    await receiveOffer(pc, Data);
  } else if (pcMap.has(Data.ReqId)) {
    await receiveOffer(pcMap.get(Data.ReqId)!, Data);
  }
}
async function AnswerFunc(Data: any) {
  while (iceServerList.value == null && Date.now() - Date.now() < 3000) {
    await new Promise((resolve) => setTimeout(resolve, 16));
  }

  if (iceServerList.value == null) {
    console.error('Failed to get iceServerList.value within the maximum wait time');
    return;
  }

  if (pcMap.has(Data.ReqId)) {
    await receiveAnswer(pcMap.get(Data.ReqId)!, Data);
  }
}
async function CandidateFunc(Data: any) {
  while (iceServerList.value == null && Date.now() - Date.now() < 3000) {
    await new Promise((resolve) => setTimeout(resolve, 16));
  }

  if (iceServerList.value == null) {
    console.error('Failed to get iceServerList.value within the maximum wait time');
    return;
  }

  const existPc = pcMap.get(Data.ReqId);
  existPc?.peerConnection?.addIceCandidate({
    sdpMid: Data.SdpMid,
    sdpMLineIndex: Data.SdpMLineIndex,
    candidate: Data.Candidate,
  });
}
async function NewUserFunc(Data: any) {
  while (iceServerList.value == null && Date.now() - Date.now() < 3000) {
    await new Promise((resolve) => setTimeout(resolve, 16));
  }

  if (iceServerList.value == null) {
    console.error('Failed to get iceServerList.value within the maximum wait time');
    return;
  }

  if (!pcMap.has(Data.NewUser) && isPush.value) {
    await createOffer(Data.NewUser);
  }
}
function BroadcastMessageFunc(Data: any) {
  messageArr.value.push({
    MessageSender: Data.MessageSender as string,
    Message: Data.Message as string,
  });
  if (messageArr.value.length >= 10) {
    messageArr.value.splice(0, 1);
  }
}
function UserLeaveFromRoomFunc(Data: any) {
  if (pcMap.has(Data.LeaveUser)) {
    const pc = pcMap.get(Data.LeaveUser)!;
    pc.close();
    pcMap.delete(Data.LeaveUser);
  }
}

async function receiveOffer(pc: PeerConnectionInstance, Data: any) {
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
  if (!pcMap.has(pcId)) {
    const pc = new PeerConnectionInstance(
      pcId,
      iceServerList.value,
      store.state.useFirefoxAndNvidia,
      isLoading
    );
    pcMap.set(pcId, pc);
  }
  if (pcMap.has(pcId)) {
    const pc = pcMap.get(pcId);
    if (pc!.peerConnection?.signalingState == 'have-remote-offer') return;
    pc!.peerConnection!.onicecandidate = (event) => {
      if (!event.candidate || !event.candidate.candidate) return;
      const payload: Payload = {
        Type: EventType.sendCandidate,
        Data: {
          RoomId: route.query.room,
          SdpMid: event.candidate.sdpMid || '0',
          SdpMLineIndex: event.candidate.sdpMLineIndex,
          RecvId: pc!.remoteUser,
          Candidate: event.candidate.candidate,
        },
      };
      socketInstance!.wsSend(payload);
    };
    pc!.peerConnection!.onnegotiationneeded = async function () {
      const offerDesc = await pc!.peerConnection!.createOffer();
      pc!.isOffer = true;
      await pc!.peerConnection!.setLocalDescription(offerDesc);
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
      pc!.peerConnection!.addTrack(track, videoStream.value!);
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

async function Camera() {
  return navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      videoStream.value = stream;
      localvideo.value = document.createElement('video');
      localvideo.value.srcObject = videoStream.value;
      localvideo.value.classList.add(
        'rounded-full',
        'aspect-square',
        'border-8',
        'bg-black',
        'border-slate-600'
      )
      localvideo.value.autoplay = true;
      const localVideoWrap = document.getElementById('LocalVideo');
      localVideoWrap?.appendChild(localvideo.value);
    })
    .catch((error) => {
      alert("Browser doesn't support or there is some errors." + error);
    });
}

async function pushOrNot() {
  isPush.value = !isPush.value;
  if (isPush.value) {
    pushIcon.value = closeIcon;
  } else {
    pushIcon.value = playArrowIcon;
  }
  if (isPush.value) {
    await Camera();
    store.state.Room.UserList.forEach(async (remote: string) => {
      if (remote != user.id) {
        await createOffer(remote);
      }
    });
  } else {
    videoStream.value?.getTracks().forEach((track) => {
      track.stop();
    });
    const localVideoWrap = document.getElementById('LocalVideo');
    localVideoWrap?.removeChild(localvideo.value);
  }
}



function send() {
  const payload: Payload = {
    Type: EventType.broadcastMessage,
    Data: {
      RoomId: route.query.room,
      Message: inputText.value,
    },
  };
  socketInstance!.wsSend(payload);
  messageArr.value.push({
    MessageSender: 'me',
    Message: inputText.value,
  });
  if (messageArr.value.length >= 10) {
    messageArr.value.splice(0, 1);
  }
  inputText.value = '';
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
    pc.close();
  });
  videoStream.value?.getTracks().forEach((track) => {
    track.stop();
  });
  const localVideoWrap = document.getElementById('LocalVideo');
  localVideoWrap?.appendChild(localvideo.value);
  localvideo.value=null;
  pcMap.clear();
});
</script>
<template>
  <div class="bg-gradient-to-b from-gray-400 via-gray-800 to-black w-full min-h-screen">
    <div
      class="bg-gradient-to-t from-blue-200 to-gray-800 opacity-90 fixed w-full z-40 border-b-2 border-platinum h-header">
      <header class="flex p-3 max-w-8xl m-auto h-header">
        <div class="max-w-one-three w-full flex md:flex-column text-center items-center">
          <div class="flex w-full justify-start items-center">
            <img src="@/assets/account_circle.svg" class="max-w-one-three" />
            <p class="text-zinc-100 px-1 text-xs sm:text-base max-w-one-three sm:max-w-one-two truncate md:max-w-full">
              {{ user.id }}
            </p>
            <button @click="pushOrNot"
              class="bg-red-500 max-w-one-three hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-300 sm:text-sm active:bg-red-700 p-2 rounded-full">
              <img :src="pushIcon" class="cursor-pointer" alt="userImage" />
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
    <div class="box-border pt-20 max-w-8xl m-auto px-3 text-2xl min-h-screen flex">
      <div class="text-2xl mx-auto w-full">
        <div id="LocalVideo" class="z-50 fixed top-0 left-0 md:w-250 md:h-250 w-100 h-100">
        </div>
        <div id="RemoteVideos" class="flex justify-center flex-row flex-wrap">
          <loading v-model:active="isLoading" :can-cancel="false" :is-full-page="false" />
          <div v-for="user in store.state.Room.UserList.filter(u => u !== store.state.user.id)" :id=user
            class="m-4 border-8 border-slate-400 rounded-md flex flex-col justify-center"
            style="width:500px ;height:500px">
            <p class="text-white text-sm text-center">{{ user }}</p>
          </div>
        </div>
        <div id="MessageWrap" class="fixed z-50 left-0 bottom-0 w-full flex justify-start">
          <div class="rounded-md max-w-one-two bg-slate-600 p-3">
            <div id="Message" class="flex flex-col text-sm text-yellow-900">
              <div v-for="message in messageArr" class="my-1 rounded-md inline bg-white p-2">
                <p>
                  <span>{{ message.MessageSender }}: </span>{{ message.Message }}
                </p>
              </div>
            </div>
            <div class="bg-slate-400 h-1 my-2"></div>
            <div class="flex justify-center">
              <input class="max-w-one-two md:max-w-full rounded-full text-base px-2 my-1 mx-1" v-model="inputText" />
              <button @click="send"
                class="bg-gray-500 hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300 active:bg-gray-700 px-3 py-2 leading-5 text-sm rounded-full font-semibold text-white">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
