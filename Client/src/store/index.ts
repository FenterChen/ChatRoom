import { InjectionKey } from "vue";
import { createStore, useStore as baseUseStore, Store } from "vuex";
import { SocketInstance } from "../service/socketInstance";
export interface State {
  socketInstance: SocketInstance | undefined;
  useFirefoxAndNvidia: Boolean;
  roomIsSubscribe: Boolean;
  user: User;
  Lobby: Array<Lobby>;
  othersRoom: Array<Lobby>;
  Room: RoomObj;
}
interface Lobby {
  RoomId: string,
  RoomType: string,
  IsFull: boolean,
  UserList: []
}
interface RoomObj {
  RoomId: string,
  NewUser: string,
  UserList: never[]
}
export interface User {
  id: string | null;
}

export interface onOfferObj {
  reqUid: string;
  uid: string;
  sdp: object;
}

export interface onCandidateObj {
  sdpMLineIndex: number;
  candidate: string;
}

export interface RoomUsers {
  name: string;
  uid: string;
  socketId: object;
}

export enum WebSocketState {
  init = 0,
  connection = 1,
  close = 2,
}



export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state: {
    socketInstance: undefined,
    user: {
      id: null
    },
    useFirefoxAndNvidia: false,
    roomIsSubscribe: false,
    Lobby: [],
    othersRoom: [],
    Room: { RoomId: "", NewUser: "", UserList: [] },
  },
  mutations: {
    m_createWebSocket(state) {
      if (state.socketInstance == null) {
        state.socketInstance = new SocketInstance();
      }
    },

    m_lobby(state, data) {
      state.Lobby = data;
    },
    m_othersRoom(state, data) {
      state.othersRoom = data;
    }
  },
  actions: {},
});

export function useStore() {
  return baseUseStore(key);
}
