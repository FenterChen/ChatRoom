<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useStore } from '../store';
import { Payload, EventType } from '../service/model/eventType';
import router from '../router';

const store = useStore();
const roomList = ref();
const destinationRoom = ref();
const isLoading = ref(true);

function onCancel() {
  console.log('User cancelled the loader.');
}
const computedRoomList = computed(() => {
  const filteredRooms = store.state.othersRoom.filter((room) => {
    // return room.RoomType === 'Single' && room.IsFull != true;
    return room;
  });
  return filteredRooms;
});
const socketEvents = computed(() => {
  return store.state.socketEvents;
});
watch(
  computedRoomList,
  (newVal) => {
    roomList.value = newVal;
  },
  { immediate: true }
);

watch(
  socketEvents.value,
  (newVal) => {
    if (newVal != undefined) {
      newVal.forEach((ev) => {
        if (ev.Type == 'UpdateRoom') {
          if (ev.Data.RoomId == destinationRoom.value) {
            store.commit('m_removeSocketEvent', ev.Id);
            router.push({
              name: 'Room',
              query: { room: destinationRoom.value },
            });
          }
        } else if (ev.Type == 'InitData') {
          store.state.user.id = ev.Data.Id;
          store.commit('m_removeSocketEvent', ev.Id);
          onOpen();
        }
      });
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (store.state.socketInstance && store.state.user.id != null) {
    joinLobby();
    if (checkBrowser() && checkNvidia()) {
      store.state.useFirefoxAndNvidia = true;
    }
  } else {
    store.commit('m_createWebSocket');
  }
});

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
  } catch (e) {}
}
</script>

<template>
  <div
    class="bg-gradient-to-b from-gray-400 via-gray-800 to-black w-full min-h-screen"
  >
    <div
      class="bg-gradient-to-t from-blue-200 to-gray-800 opacity-90 fixed w-full z-50 border-b-2 border-platinum max-h-header"
    >
      <header class="flex p-3 max-w-8xl m-auto">
        <div class="basis-1/3 sm:w-24 flex items-center">
          <img src="@/assets/account_circle.svg" alt="userImage" />
          <div>
            <p class="text-zinc-100 truncate w-full">
              {{ store.state.user.id }}
            </p>
          </div>
        </div>
      </header>
    </div>
    <loading
      v-model:active="isLoading"
      :can-cancel="true"
      :on-cancel="onCancel"
      :is-full-page="false"
    />
    <div
      class="py-20 max-w-8xl m-auto px-3 text-2xl"
      v-if="roomList && store.state.Lobby"
    >
      <ul class="flex flex-wrap justify-center p-2">
        <li
          class="min-h-full w-full bg-slate-300 rounded px-2 py-1 mb-2"
          v-if="store.state.Lobby[0]"
        >
          <p class="text-base font-bold underline">
            {{ store.state.Lobby[0].RoomId }}
          </p>
          <p
            class="font-thin text-sm inline"
            v-for="(userList, index) in store.state.Lobby[0].UserList"
            :key="index"
          >
            {{ index + 1 }}.{{ userList }}&nbsp;
          </p>
        </li>
        <div class="w-full grid md:grid-cols-5 sm:grid-cols-2 gap-2">
          <li
            v-for="room in computedRoomList"
            :key="room.RoomId"
            :class="{
              'cursor-pointer': !room.IsFull,
              'bg-slate-300': !room.IsFull,
              'bg-red-900': room.IsFull,
              'bg-white': room.UserList.length == 0,
            }"
            @click="joinRoom(room.RoomId)"
            class="rounded px-2 py-1"
          >
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
