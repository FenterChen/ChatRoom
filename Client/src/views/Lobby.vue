<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useStore } from '../store';
import { Payload, EventType } from '../service/model/eventType';
import router from '../router';
const store = useStore();
const destinationRoom = ref();
const isLoading = ref(true);
store.state.roomIsSubscribe = false;

const subscribeEvents = {
  InitData: InitDataFunc,
  UpdateRoom: UpdateRoomFunc,
};
function onCancel() {
  console.log('User cancelled the loader.');
}

onMounted(() => {
  if (store.state.socketInstance && store.state.user.id != null) {
    Object.entries(subscribeEvents).forEach(([key, func]) => {
      store.state.socketInstance!.subscribe(key, func);
    });
    joinLobby();
    if (checkBrowser() && checkNvidia()) {
      store.state.useFirefoxAndNvidia = true;
    }
  } else {
    store.commit('m_createWebSocket');
    Object.entries(subscribeEvents).forEach(([key, func]) => {
      store.state.socketInstance?.subscribe(key, func);
    });
  }
});

function InitDataFunc(Data: any) {
  store.state.user.id = Data.Id;
  onOpen();
}
function UpdateRoomFunc(Data: any) {
  if (Data.RoomId == destinationRoom.value) {
    router.push({
      name: 'Room',
      query: { room: destinationRoom.value },
    });
  }
}

function onOpen() {
  joinLobby();
  if (checkBrowser() && checkNvidia()) {
    store.state.useFirefoxAndNvidia = true;
  }
}
function joinLobby() {
  const payload: Payload = {
    Type: EventType.joinRoom,
    Data: { RoomId: 'Lobby' },
  };
  store.state.socketInstance?.wsSend(payload);
}

function joinRoom(roomId: string) {
  destinationRoom.value = roomId;
  const payload: Payload = {
    Type: EventType.joinRoom,
    Data: { RoomId: destinationRoom.value },
  };
  store.state.socketInstance?.wsSend(payload);
}

function checkBrowser() {
  var userAgent = navigator.userAgent;
  if (userAgent.indexOf('Firefox') != -1 && userAgent.indexOf('Mobile') == -1) {
    return true;
  } else {
    return false;
  }
}

function checkNvidia() {
  let canvas = document.createElement('canvas');
  let gl: any;
  let debugInfo;
  let vendor;
  let keyword = 'NVIDIA';
  try {
    gl =
      canvas.getContext('webgl', { powerPreference: 'high-performance' }) ||
      canvas.getContext('experimental-webgl', {
        powerPreference: 'high-performance',
      });
    if (gl) {
      debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      vendor = gl.getParameter(debugInfo!.UNMASKED_VENDOR_WEBGL);
      if (vendor.toLowerCase().includes(keyword.toLowerCase())) {
        return true;
      } else {
        return false;
      }
    }
  } catch (e) { }
}
</script>

<template>
  <div class="bg-gradient-to-b from-gray-400 via-gray-800 to-black w-full min-h-screen">
    <div
      class="bg-gradient-to-t from-blue-200 to-gray-800 opacity-90 fixed w-full z-50 border-b-2 border-platinum h-header">
      <header class="flex p-3 max-w-8xl m-auto h-header">
        <div class="basis-1/3 sm:w-24 flex items-center">
          <img src="@/assets/account_circle.svg" alt="userImage" />
          <div>
            <p class="text-zinc-100 text-pretty w-full">
              {{ store.state.user.id }}
            </p>
          </div>
        </div>
      </header>
    </div>
    <loading v-model:active="isLoading" :can-cancel="true" :on-cancel="onCancel" :is-full-page="false" />
    <div class="py-20 max-w-8xl m-auto px-3 text-2xl" v-if="store.state.Lobby">
      <ul class="flex flex-wrap justify-center p-2">
        <li class="min-h-full w-full bg-slate-300 rounded px-2 py-1 mb-2" v-if="store.state.Lobby[0]">
          <p class="text-base font-bold underline">
            {{ store.state.Lobby[0].RoomId }}
          </p>
          <p class="font-thin text-sm inline" v-for="(userList, index) in store.state.Lobby[0].UserList" :key="index">
            {{ index + 1 }}.{{ userList }}&nbsp;
          </p>
        </li>
        <div class="w-full grid md:grid-cols-5 sm:grid-cols-2 gap-2">
          <li v-for="room in store.state.othersRoom" :key="room.RoomId" :class="{
            'cursor-pointer': !room.IsFull,
            'bg-slate-300': !room.IsFull,
            'bg-red-900': room.IsFull,
            'bg-white': room.UserList.length == 0,
          }" @click="joinRoom(room.RoomId)" class="rounded px-2 py-1">
            <div class="items-stretch">
              <p class="text-sm">
                RoomId:
                <span class="text-base font-bold underline">{{
                  room.RoomId
                }}</span>
              </p>
              <p class="font-thin text-sm md:my-4 sm:my-2">
                Full: {{ room.IsFull }}
              </p>
              <p class="font-thin text-sm md:my-4 sm:my-2">
                Type: {{ room.RoomType }}
              </p>
              <p class="font-thin text-sm">
                Number of people: {{ room.UserList.length }}
              </p>
            </div>
          </li>
        </div>
      </ul>
    </div>
  </div>
</template>
