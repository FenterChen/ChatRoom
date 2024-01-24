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
const count = ref();
const videoSenderStreams = ref();
const audioSenderStreams = ref();
const worker = new Worker(new URL('../service/myWorker', import.meta.url), {
  type: 'module',
});

const socketEvents = computed(() => {
  return store.state.socketEvents;
});
onMounted(() => {
  VideoWraps.value = document.getElementById('RemoteVideos');
  remoteVideo.value = document.createElement('video');
  remoteVideo.value.srcObject = mediaStream;
  remoteVideo.value.autoplay = true;
  remoteVideo.value.playsInline = true;
  remoteVideo.value.preload = 'auto';
  // remoteVideo.value.muted = true;
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
                iceServerList.value
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
                  'streamer'
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
      Room: route.query.room,
    },
  };
  socketInstance.wsSend(payload);
} else {
  router.push({
    name: 'Lobby',
  });
}
function setupSenderTransform(sender: RTCRtpSender) {
  // const supportsEncodedTransforms =
  //   window.RTCRtpSender && 'transform' in RTCRtpSender.prototype;
  // if (supportsEncodedTransforms) {
  //   const worker = new Worker(new URL('../service/worker', import.meta.url), {
  //     type: 'module',
  //   });
  //   //@ts-ignore
  //   sender.transform = new RTCRtpScriptTransform(worker, {
  //     name: 'senderTransform',
  //   });
  //   // worker.addEventListener('rtctransform', (event) => {
  //   //   console.log(event);
  //   //   const transform = new TransformStream({
  //   //     transform: encodeFunction,
  //   //   });
  //   //   //@ts-ignore
  //   //   event.transformer.readable
  //   //     .pipeThrough(transform)
  //   //     //@ts-ignore
  //   //     .pipeTo(event.transformer.writable);
  //   // });
  //   return;
  // }
  if (sender.track?.kind == 'video') {
    if (videoSenderStreams.value != null) return;
    // @ts-ignore
    videoSenderStreams.value = sender.createEncodedStreams();
    const { readable, writable } = videoSenderStreams.value;
    // const transformStream = new TransformStream({
    //   transform: encodeFunction,
    // });
    // readable.pipeThrough(transformStream).pipeTo(writable);
    worker.postMessage(
      {
        operation: 'encode',
        readable,
        writable,
      },
      [readable, writable]
    );
  } else {
    if (audioSenderStreams.value != null) return;
    // @ts-ignore
    audioSenderStreams.value = sender.createEncodedStreams();
    const { readable, writable } = audioSenderStreams.value;
    // const transformStream = new TransformStream({
    //   transform: encodeFunction,
    // });
    // readable.pipeThrough(transformStream).pipeTo(writable);
    worker.postMessage(
      {
        operation: 'encode',
        readable,
        writable,
      },
      [readable, writable]
    );
  }
}

async function receiveOffer(pc: PeerConnectionInstance, Data: any) {
  //todo
  isLoading.value = true;
  if (remoteCanvas.value) {
    VideoWraps.value?.appendChild(remoteCanvas.value);
  } else {
    if (remoteVideo.value) VideoWraps.value?.appendChild(remoteVideo.value);
  }
  pc.peerConnection!.ontrack = (event) => {
    mediaStream.addTrack(event.track);
    isLoading.value = false;
    remoteVideo.value?.play();
  };
  pc.peerConnection!.onicecandidate = (event) => {
    if (!event.candidate || !event.candidate.candidate) return;
    const payload: Payload = {
      Type: EventType.sendCandidate,
      Data: {
        Room: route.query.room,
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
  answerDesc!.sdp = removeCodec(answerDesc!.sdp!, 'VP8');
  // if (answerDesc?.sdp && store.state.useFirefoxAndNvidia && !useCanvas.value) {
  //   answerDesc.sdp = removeCodec(answerDesc.sdp, 'H264');
  // }
  await pc.peerConnection?.setLocalDescription(answerDesc);

  const payload: Payload = {
    Type: EventType.answer,
    Data: {
      Room: route.query.room,
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
  pc.peerConnection?.getReceivers().forEach((res) => {
    setupReceiverTransform(res);
  });
}

async function createOffer(pc: PeerConnectionInstance, Data: any) {
  pc.peerConnection!.onicecandidate = (event) => {
    if (!event.candidate || !event.candidate.candidate) return;
    const payload: Payload = {
      Type: EventType.sendCandidate,
      Data: {
        Room: route.query.room,
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
        Room: route.query.room,
        RecvId: Data.NewUser,
        Desc: offerDesc,
      },
    };
    socketInstance!.wsSend(payload);
  };
  videoStream.value!.getTracks().forEach((track) => {
    pc.peerConnection?.addTrack(track, videoStream.value!);
    //todo
    pc.peerConnection?.getSenders().forEach((res) => {
      if (pc && res.track != null) {
        setupSenderTransform(res);
      }
    });
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
// const frameTypeToCryptoOffset = {
//   key: 10,
//   delta: 3,
//   undefined: 1,
// };
// let currentKeyIdentifier = 0;
// let useCryptoOffset = true;

// function dump(encodedFrame: any, direction: any, max = 16) {
//   const data = new Uint8Array(encodedFrame.data);
//   let bytes = '';
//   for (let j = 0; j < data.length && j < max; j++) {
//     bytes += (data[j] < 16 ? '0' : '') + data[j].toString(16) + ' ';
//   }
//   const metadata = encodedFrame.getMetadata();
//   console.log(
//     performance.now().toFixed(2),
//     direction,
//     bytes.trim(),
//     'len=' + encodedFrame.data.byteLength,
//     'type=' + (encodedFrame.type || 'audio'),
//     'ts=' + encodedFrame.timestamp,
//     'ssrc=' + metadata.synchronizationSource,
//     'pt=' + (metadata.payloadType || '(unknown)'),
//     'mimeType=' + (metadata.mimeType || '(unknown)')
//   );
// }

// let scount = 0;
let frames = 0;
function encodeFunction(chunk: any, controller: any) {
  // let str = 'D';
  // let encoder = new TextEncoder();
  // let buffer = encoder.encode(str);
  const tmp = new DataView(chunk.data);
  if (tmp.getUint32(0) == 1) {
    //  h264 start code '0001'
    console.log('h264 =======');
  }
  const newData = new ArrayBuffer(chunk.data.byteLength + 2);
  // const newView = new DataView(newData);

  let metadata = new ArrayBuffer(2);
  // let metaView = new DataView(buffer.buffer);
  let metaView = new DataView(metadata);
  metaView.setUint16(0, frames++);
  console.log(frames);

  const data = new Uint8Array(newData);
  data.set(new Uint8Array(chunk.data));
  data.set(new Uint8Array(metadata), chunk.data.byteLength);
  // data.set(new Uint8Array(buffer.buffer), chunk.data.byteLength);
  chunk.data = newData;

  controller.enqueue(chunk);
  // console.log('Send frame index ===', frames);

  // if (scount++ < 30) {
  //   // dump the first 30 packets.
  //   dump(chunk, 'send');
  // }
  // if (currentCryptoKey) {
  //   const view = new DataView(chunk.data);
  //   // Any length that is needed can be used for the new buffer.
  //   const newData = new ArrayBuffer(chunk.data.byteLength + 5);
  //   const newView = new DataView(newData);
  //   const cryptoOffset = useCryptoOffset
  //     ? // @ts-ignore
  //       frameTypeToCryptoOffset[chunk.type]
  //     : 0;
  //   for (let i = 0; i < cryptoOffset && i < chunk.data.byteLength; ++i) {
  //     newView.setInt8(i, view.getInt8(i));
  //   }
  //   // This is a bitwise xor of the key with the payload. This is not strong encryption, just a demo.
  //   for (let i = cryptoOffset; i < chunk.data.byteLength; ++i) {
  //     const keyByte = currentCryptoKey.charCodeAt(i % currentCryptoKey.length);
  //     newView.setInt8(i, view.getInt8(i) ^ keyByte);
  //   }
  //   // Append keyIdentifier.
  //   newView.setUint8(chunk.data.byteLength, currentKeyIdentifier % 0xff);
  //   // Append checksum
  //   newView.setUint32(chunk.data.byteLength + 1, 0xdeadbeef);
  //   chunk.data = newData;
  // }
  // controller.enqueue(chunk);
}
// let rcount = 0;
function decodeFunction(chunk: any, controller: any) {
  const view = new DataView(chunk.data);
  //last 2 bytes
  const count = view.getUint16(chunk.data.byteLength - 2);
  // const strBuffer = chunk.data.slice(
  //   chunk.data.byteLength - 2,
  //   chunk.data.byteLength
  // );
  // const decoder = new TextDecoder();
  // const str = decoder.decode(strBuffer);
  // console.log(str);
  chunk.data = chunk.data.slice(0, chunk.data.byteLength - 2);
  controller.enqueue(chunk);

  console.log('Receive last 2 bytes ===', count);
  // if (rcount++ < 30) {
  //   // dump the first 30 packets
  //   dump(chunk, 'recv');
  // }
  // const view = new DataView(chunk.data);
  // const checksum =
  //   chunk.data.byteLength > 4
  //     ? view.getUint32(chunk.data.byteLength - 4)
  //     : false;
  // if (currentCryptoKey) {
  //   if (checksum !== 0xdeadbeef) {
  //     console.log(
  //       'Corrupted frame received, checksum ' + checksum.toString(16)
  //     );
  //     return; // This can happen when the key is set and there is an unencrypted frame in-flight.
  //   }
  //   const keyIdentifier = view.getUint8(chunk.data.byteLength - 5);
  //   if (keyIdentifier !== currentKeyIdentifier) {
  //     console.log(
  //       `Key identifier mismatch, got ${keyIdentifier} expected ${currentKeyIdentifier}.`
  //     );
  //     return;
  //   }
  //   const newData = new ArrayBuffer(chunk.data.byteLength - 5);
  //   const newView = new DataView(newData);
  //   const cryptoOffset = useCryptoOffset
  //     ? // @ts-ignore
  //       frameTypeToCryptoOffset[chunk.type]
  //     : 0;
  //   for (let i = 0; i < cryptoOffset; ++i) {
  //     newView.setInt8(i, view.getInt8(i));
  //   }
  //   for (let i = cryptoOffset; i < chunk.data.byteLength - 5; ++i) {
  //     const keyByte = currentCryptoKey.charCodeAt(i % currentCryptoKey.length);
  //     newView.setInt8(i, view.getInt8(i) ^ keyByte);
  //   }
  //   chunk.data = newData;
  // } else if (checksum === 0xdeadbeef) {
  //   return; // encrypted in-flight frame but we already forgot about the key.
  // }
  // controller.enqueue(chunk);
}
async function playVideo() {
  useVideo.value = !useVideo.value;
  if (useVideo.value) {
    videoSource.value = <VideoElement>document.createElement('video');
    videoSource.value.autoplay;
    videoSource.value.src = HRSVideo;
    videoSource.value.loop = true;
    // let canvas = document.createElement('canvas');
    // let ctx = canvas.getContext('2d');
    // videoSource.value!.addEventListener('loadedmetadata', function () {
    //   canvas.width = videoSource.value!.videoWidth;
    //   canvas.height = videoSource.value!.videoHeight;
    // });
    videoSource.value.oncanplay = () => {
      videoSource.value?.play();

      // var $this = videoSource.value; //cache
      // (function loop() {
      //   if (!$this!.paused && !$this!.ended) {
      //     ctx!.drawImage($this!, 0, 0);
      //     setTimeout(loop, 1000 / 60); // drawing at 60fps
      //   }
      // })();
      videoStream.value = new MediaStream();
      // videoStream.value!.addTrack(canvas.captureStream(60).getVideoTracks()[0]);
      //todo
      videoStream.value!.addTrack(
        //@ts-ignore
        // videoSource.value!.mozCaptureStream().getVideoTracks()[0]
        videoSource.value!.captureStream().getVideoTracks()[0]
      );
      videoStream.value!.addTrack(
        //@ts-ignore
        // videoSource.value!.mozCaptureStream().getAudioTracks()[0]
        videoSource.value!.captureStream().getAudioTracks()[0]
      );

      //Insertable streams for MediaStreamTrack
      // const trackProcessor = new MediaStreamTrackProcessor({
      //   track: videoSource.value!.captureStream().getVideoTracks()[0],
      // });
      // const trackGenerator = new MediaStreamTrackGenerator({ kind: 'video' });
      // const canvas_ = new OffscreenCanvas(1, 1);
      // const ctx_ = /** @type {?CanvasRenderingContext2D} */ canvas_.getContext(
      //   '2d',
      //   {
      //     alpha: false,
      //     desynchronized: true,
      //   }
      // );
      // const transformer = new TransformStream({
      //   async transform(frame, controller) {
      //     const timestampInSeconds = frame.timestamp / 1000000;
      //     if (!canvas_ || !ctx_) {
      //       frame.close();
      //       return;
      //     }
      //     const width = frame.displayWidth;
      //     const height = frame.displayHeight;
      //     canvas_.width = width;
      //     canvas_.height = height;
      //     const timestamp = frame.timestamp;
      //     ctx_.drawImage(frame, 0, 0);
      //     frame.close();
      //     if (timestampInSeconds >= 10 && timestampInSeconds <= 20) {
      //       ctx_.shadowColor = '#000';
      //       ctx_.shadowBlur = 20;
      //       ctx_.lineWidth = 50;
      //       ctx_.strokeStyle = '#000';
      //       ctx_.strokeRect(0, 0, width, height);
      //     }

      //     // alpha: 'discard' is needed in order to send frames to a PeerConnection.
      //     controller.enqueue(
      //       new VideoFrame(canvas_, { timestamp, alpha: 'discard' })
      //     );
      //   },
      // });
      // trackProcessor.readable
      //   .pipeThrough(transformer)
      //   .pipeTo(trackGenerator.writable);
      // const streamAfter = new MediaStream([trackGenerator]);
      // videoStream.value!.addTrack(streamAfter.getVideoTracks()[0]);
    };
  }
}

function setupReceiverTransform(receiver: RTCRtpReceiver) {
  const supportsEncodedTransforms =
    window.RTCRtpSender && 'transform' in RTCRtpSender.prototype;
  if (supportsEncodedTransforms) {
    const worker = new Worker(new URL('../service/worker', import.meta.url), {
      type: 'module',
    });
    //@ts-ignore
    receiver.transform = new RTCRtpScriptTransform(worker, {
      name: 'receiverTransform',
    });
    worker.onmessage = function (e) {
      console.log('Message received from worker', e.data);
      count.value = e.data;
    };
    // worker.addEventListener('rtctransform', (event) => {
    //   console.log(event);
    //   const transform = new TransformStream({
    //     transform: encodeFunction,
    //   });
    //   //@ts-ignore
    //   event.transformer.readable
    //     .pipeThrough(transform)
    //     //@ts-ignore
    //     .pipeTo(event.transformer.writable);
    // });
    return;
  }
  // @ts-ignore
  const receiverStreams = receiver.createEncodedStreams();
  const { readable, writable } = receiverStreams;
  worker.postMessage(
    {
      operation: 'decode',
      readable,
      writable,
    },
    [readable, writable]
  );
  // const transformStream = new TransformStream({
  //   transform: decodeFunction,
  // });
  // readable.pipeThrough(transformStream).pipeTo(writable);
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
      'max-w-full'
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
      'max-w-full'
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
              class="text-zinc-100 px-1 text-xs max-w-one-three sm:text-base truncate"
            >
              {{ user.id }}
            </p>
            <button
              @click="playVideo"
              class="bg-red-500 hover:bg-red-700 max-w-one-three focus:outline-none focus:ring focus:ring-red-300 sm:text-sm active:bg-red-700 p-2 rounded-full"
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
      <div class="text-2xl w-full">
        <div
          id="LocalVideos"
          class="flex justify-center flex-col max-h-screen-5rem"
        >
          <!-- <p class="text-center mr-2">Local videos</p> -->
        </div>
        <div
          id="RemoteVideos"
          class="flex justify-center w-full flex-col max-h-screen-5rem items-center"
        >
          <loading
            v-model:active="isLoading"
            :can-cancel="false"
            :is-full-page="false"
          />
          <p>{{ count }}</p>
          <!-- <p class="text-center mr-2">Remote videos</p> -->
        </div>
      </div>
    </div>
  </div>
</template>
