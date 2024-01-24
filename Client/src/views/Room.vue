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
import HRSVideo from '../assets/HRS.mp4';

interface VideoElement extends HTMLVideoElement {
  captureStream(frameRequestRate?: number): MediaStream;
}

const store = useStore();
const socketInstance: SocketInstance | undefined = store.state.socketInstance;
const pcMap = new Map<string, PeerConnectionInstance>();
const route = useRoute();
const user = store.state.user;
const remoteVideo = ref<HTMLVideoElement>();
const videoSource = ref<VideoElement>();
const remoteCanvas = ref<HTMLCanvasElement>();
const useCanvas = ref<Boolean>(true);
const dataChannel = ref<RTCDataChannel>();
const iceServerList = ref();
const isLoading = ref<Boolean>(false);
const useVideo = ref<Boolean>(false);
const timer = ref();
const mouseX = ref();
const mouseY = ref();
const VideoWraps = ref<HTMLElement | null>();
const videoStream = ref<MediaStream>();
const mediaStream = new MediaStream();

const socketEvents = computed(() => {
  return store.state.socketEvents;
});
onMounted(() => {
  VideoWraps.value = document.getElementById('RemoteVideos');
  remoteVideo.value = document.createElement('video');
  remoteVideo.value.srcObject = mediaStream;
  remoteVideo.value.autoplay = true;
  if (!store.state.useFirefoxAndNvidia) {
    //HtmlVideoElement and does not use the h.264 codec on firefox
    useHtmlVideoElement();
  } else {
    //HtmlCanvasElement
    useHtmlCanvasElement();
  }
});

watch(
  socketEvents.value,
  (newVal) => {
    if (newVal != undefined) {
      newVal.forEach(async (ev) => {
        switch (ev.Type) {
          case 'IceServerList':
            iceServerList.value = ev.Data;
            store.commit('m_removeSocketEvent', ev.Id);
            break;
          case 'Offer':
            while (iceServerList.value == null) {
              await new Promise((resolve) => setTimeout(resolve, 16));
            }
            if (!pcMap.has(ev.Data.ReqId)) {
              const pc = new PeerConnectionInstance(
                ev.Data.ReqId,
                iceServerList.value,
                route.query.room as string
              );
              pcMap.set(ev.Data.ReqId, pc);
              await receiveOffer(pc, ev.Data);
            }
            store.commit('m_removeSocketEvent', ev.Id);
            break;
          case 'Candidate':
            while (!pcMap.has(ev.Data.ReqId)) {
              await new Promise((resolve) => setTimeout(resolve, 16));
            }
            const existPc = pcMap.get(ev.Data.ReqId);
            existPc?.peerConnection?.addIceCandidate({
              sdpMid: ev.Data.SdpMid,
              sdpMLineIndex: ev.Data.SdpMLineIndex,
              candidate: ev.Data.Candidate,
            });
            store.commit('m_removeSocketEvent', ev.Id);
            break;
          case 'NewUser':
            if (useVideo.value) {
              while (iceServerList.value == null) {
                await new Promise((resolve) => setTimeout(resolve, 16));
              }
              if (!pcMap.has(ev.Data.NewUser)) {
                const pc = new PeerConnectionInstance(
                  ev.Data.NewUser,
                  iceServerList.value,
                  route.query.room as string
                );
                pcMap.set(ev.Data.NewUser, pc);
                await createOffer(pc, ev.Data);
              }
            }
            store.commit('m_removeSocketEvent', ev.Id);
            break;
          case 'Answer':
            if (pcMap.has(ev.Data.ReqId)) {
              await receiveAnswer(pcMap.get(ev.Data.ReqId)!, ev.Data);
            }
            store.commit('m_removeSocketEvent', ev.Id);
            break;
          case 'UserLeaveFromRoom':
            if (pcMap.has(ev.Data.LeaveUser)) {
              userLeaveFromRoom(pcMap.get(ev.Data.LeaveUser)!, ev.Data);
            }
            store.commit('m_removeSocketEvent', ev.Id);
            break;
        }
      });
    }
  },
  { immediate: true }
);

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

async function receiveOffer(pc: PeerConnectionInstance, Data: any) {
  isLoading.value = true;
  if (remoteCanvas.value) {
    VideoWraps.value?.appendChild(remoteCanvas.value);
  } else {
    if (remoteVideo.value) VideoWraps.value?.appendChild(remoteVideo.value);
  }
  pc.peerConnection!.ontrack = (event) => {
    mediaStream.addTrack(event.track);
    remoteVideo.value?.play();
  };
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
  // const newDa = Data.Desc.Sdp.replace(
  //   'a=fmtp:127 implementation_name=Internal',
  //   'a=fmtp:127 max-fs=12288;max-fr=60;implementation_name=Internal'
  // );

  await pc.peerConnection?.setRemoteDescription(
    new RTCSessionDescription({
      sdp: Data.Desc.Sdp,
      // sdp: newDa,
      type: Data.Desc.Type,
    })
  );
  //Firefox has a bug(lagging) in using h.264, so delete the h.264 codec.

  //Firefox isn't support setCodecPreferences.
  // const filterReceiveCodecs = RTCRtpReceiver.getCapabilities(
  //   'video'
  // )?.codecs.filter((codec) => {
  //   return codec.mimeType != 'video/H264';
  // });

  // pc.peerConnection?.getTransceivers().forEach((transceiver) => {
  //   if (filterReceiveCodecs && transceiver.receiver.track.kind == 'video') {
  //     transceiver.setCodecPreferences(filterReceiveCodecs);
  //   }
  // });

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
  pc.peerConnection!.ondatachannel = (ev) => {
    ev.channel.addEventListener('open', () => {
      dataChannel.value = ev.channel;
    });
  };
}

async function createOffer(pc: PeerConnectionInstance, Data: any) {
  pc.peerConnection!.onicecandidate = (event) => {
    if (!event.candidate || !event.candidate.candidate) return;
    const payload: Payload = {
      Type: EventType.sendCandidate,
      Data: {
        RoomId: route.query.room,
        SdpMid: event.candidate.sdpMid || '0',
        SdpMLineIndex: event.candidate.sdpMLineIndex,
        RecvId: Data.NewUser,
        Candidate: event.candidate.candidate,
      },
    };
    socketInstance!.wsSend(payload);
  };
  pc.peerConnection!.onnegotiationneeded = async function () {
    const offerDesc = await pc.peerConnection!.createOffer();
    await pc.peerConnection!.setLocalDescription(offerDesc);
    const payload: Payload = {
      Type: EventType.offer,
      Data: {
        RoomId: route.query.room,
        RecvId: Data.NewUser,
        Desc: offerDesc,
      },
    };
    socketInstance!.wsSend(payload);
  };
  videoStream.value!.getTracks().forEach((track) => {
    pc.peerConnection!.addTrack(track, videoStream.value!);
  });
}

async function receiveAnswer(pc: PeerConnectionInstance, Data: any) {
  // const removeVP8Sdp = removeCodec(Data.Desc.Sdp, 'VP8');
  // const adjustSdp = removeVP8Sdp.split('\r\n').map((str: string, _i: any) => {
  //   return /^a=fmtp:\d*/.test(str)
  //     ? str +
  //         ';x-google-max-bitrate=2500;x-google-min-bitrate=2500;x-google-start-bitrate=2500'
  //     : /^a=mid:(1|video)/.test(str)
  //     ? str + '\r\nb=AS:2500'
  //     : str;
  // });
  // const Sdp = adjustSdp.join('\r\n');

  const Desc = <RTCSessionDescriptionInit>{
    // sdp: Sdp,
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
    videoSource.value.src = HRSVideo;
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
    };
  }
}

function userLeaveFromRoom(pc: PeerConnectionInstance, Data: any) {
  pc.peerConnection?.close();
  pcMap.delete(Data.LeaveUser);
}

function trownCoin(
  offsetWidth: number,
  offsetHeight: number,
  x: number,
  y: number
) {
  if (dataChannel.value != null) {
    dataChannel.value.send(`position,${x},${y},${offsetWidth},${offsetHeight}`);
  }
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
function useHtmlVideoElement() {
  if (remoteVideo.value) {
    remoteVideo.value.id = 'RemoteVideo';
    remoteVideo.value.classList.add(
      'cursor-pointer',
      'max-h-screen-8rem',
      'w-full'
    );
    remoteVideo.value!.onplay = () => {
      isLoading.value = false;
    };

    remoteVideo.value.addEventListener('click', function (event) {
      trownCoin(
        remoteVideo.value!.offsetWidth,
        remoteVideo.value!.offsetHeight,
        event.offsetX,
        remoteVideo.value!.offsetHeight - event.offsetY
      );
    });
    remoteVideo.value.addEventListener('mousedown', () => {
      timer.value = setInterval(
        () =>
          trownCoin(
            remoteVideo.value!.offsetWidth,
            remoteVideo.value!.offsetHeight,
            mouseX.value,
            remoteVideo.value!.offsetHeight - mouseY.value
          ),
        200
      );
    });

    remoteVideo.value.addEventListener('mousemove', (event) => {
      if (timer) {
        mouseX.value = event.offsetX;
        mouseY.value = event.offsetY;
      }
    });
    remoteVideo.value.addEventListener('mouseup', (event) => {
      if (timer.value != null) clearTimeout(timer.value);
    });
  }
}
function useHtmlCanvasElement() {
  if (remoteVideo.value) {
    remoteCanvas.value = document.createElement('canvas');
    let ctx = remoteCanvas.value.getContext('2d');
    remoteVideo.value.addEventListener('loadedmetadata', function () {
      remoteCanvas.value!.width = remoteVideo.value!.videoWidth;
      remoteCanvas.value!.height = remoteVideo.value!.videoHeight;
    });
    remoteCanvas.value.classList.add(
      'cursor-pointer',
      'max-h-screen-8rem',
      'w-full'
    );
    remoteVideo.value!.onplay = () => {
      var $this = remoteVideo.value!;
      (function loop() {
        if (!$this!.paused && !$this!.ended) {
          ctx!.drawImage($this!, 0, 0);
          setTimeout(loop, 1000 / 60); // drawing at 60fps
        }
      })();
      isLoading.value = false;
    };

    remoteCanvas.value.addEventListener('click', function (event) {
      trownCoin(
        remoteCanvas.value!.offsetWidth,
        remoteCanvas.value!.offsetHeight,
        event.offsetX,
        remoteCanvas.value!.offsetHeight - event.offsetY
      );
    });
    remoteCanvas.value.addEventListener('mousedown', () => {
      timer.value = setInterval(
        () =>
          trownCoin(
            remoteCanvas.value!.offsetWidth,
            remoteCanvas.value!.offsetHeight,
            mouseX.value,
            remoteCanvas.value!.offsetHeight - mouseY.value
          ),
        200
      );
    });

    remoteCanvas.value.addEventListener('mousemove', (event) => {
      if (timer) {
        mouseX.value = event.offsetX;
        mouseY.value = event.offsetY;
      }
    });
    remoteCanvas.value.addEventListener('mouseup', (event) => {
      if (timer.value != null) clearTimeout(timer.value);
    });
  }
}
function backToHome() {
  router.push({ name: 'Lobby' });
}

onUnmounted(() => {
  var element = document.getElementById('RemoteVideo');
  if (element) {
    element.parentNode?.removeChild(element);
  }
  pcMap.forEach((res) => {
    res.peerConnection?.close();
  });
  pcMap.clear();
  videoSource.value?.pause();
  videoSource.value = undefined;
  pcMap.clear();
});
</script>
<template>
  <div
    class="bg-gradient-to-b from-gray-400 via-gray-800 to-black w-full min-h-screen"
  >
    <div
      class="bg-gradient-to-t from-blue-200 to-gray-800 opacity-90 fixed w-full z-50 border-b-2 border-platinum max-h-header"
    >
      <header class="flex p-3 max-w-8xl m-auto max-h-header">
        <div
          class="max-w-one-three w-full flex md:flex-column text-center items-center"
        >
          <div class="flex w-full justify-start items-center">
            <img
              src="@/assets/account_circle.svg"
              class="max-w-one-three"
              alt="userImage"
            />
            <p
              class="text-zinc-100 px-1 text-xs sm:text-base max-w-one-three sm:max-w-one-two truncate"
            >
              {{ user.id }}
            </p>
            <button
              @click="playVideo"
              class="bg-red-500 max-w-one-three hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-300 sm:text-sm active:bg-red-700 p-2 rounded-full"
            >
              <img
                src="@/assets/play_arrow.svg"
                class="cursor-pointer"
                alt="userImage"
              />
            </button>
          </div>
        </div>
        <div class="max-w-one-three w-full flex justify-center items-center">
          <div>
            <p class="text-xs sm:text-base text-zinc-100 p-2 truncate">
              Machine:{{ route.query.room }}
            </p>
          </div>
        </div>
        <div class="max-w-one-three w-full flex justify-end items-center">
          <button
            @click="backToHome"
            class="bg-sky-500 hover:bg-sky-700 focus:outline-none focus:ring focus:ring-sky-300 active:bg-sky-700 px-5 py-2 text-xs leading-5 sm:text-base rounded-full font-semibold text-white"
          >
            Home
          </button>
        </div>
      </header>
    </div>
    <div
      class="box-border pt-20 max-w-8xl m-auto px-3 text-2xl min-h-screen flex items-center"
    >
      <div class="text-2xl m-auto">
        <div
          id="LocalVideos"
          class="flex justify-center flex-col max-h-screen-5rem"
        >
          <!-- <p class="text-center mr-2">Local videos</p> -->
        </div>
        <div
          id="RemoteVideos"
          class="flex justify-center flex-col max-h-screen-5rem"
        >
          <loading
            v-model:active="isLoading"
            :can-cancel="false"
            :is-full-page="false"
          />
          <!-- <p class="text-center mr-2">Remote videos</p> -->
        </div>
      </div>
    </div>
  </div>
</template>
