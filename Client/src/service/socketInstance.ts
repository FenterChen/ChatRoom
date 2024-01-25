import { Payload } from './model/eventType';
import { useStore } from '../store';
import router from '../router';
import EventBus from './EventBus';

export class SocketInstance extends EventBus {
  private ws: WebSocket | null = null;
  private url: string;

  constructor() {
    super();
    this.url = import.meta.env.VITE_WSS_URL;
    let UserKey: string[] = ["UserKey", "YYePXAUFQFM4c56f"];
    this.ws = new WebSocket(`${this.url}/ws/`, UserKey);
    const ws = this.ws;
    const store = useStore();
    ws.onerror = (event) => {
      console.log("WebSocket error: ", event);
    }
    ws.onopen = () => {
      console.log("connected %s", this.url);
      ws.onmessage = async (event) => {
        let Type: string, Data: any;
        try {
          const _parseData = JSON.parse(event.data);
          [Type, Data] = [_parseData.Type, _parseData.Data];
        } catch (error) {
          console.log(error);
          return;
        }
        switch (Type) {
          case 'UpdateLobby':
            this.dispatch(Type, Data);
            const Lobby = Data.filter((res: any) => res.RoomId == "Lobby")
            store.commit('m_lobby', Lobby);
            const others = Data.filter((res: any) => res.RoomId != "Lobby")
            others.sort(function (a: { RoomId: string; }, b: { RoomId: string; }) {
              var nameA = a.RoomId.toUpperCase();
              var nameB = b.RoomId.toUpperCase();

              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }
              return 0;
            });
            store.commit('m_othersRoom', others);
            break;
          case 'UpdateRoom':
            this.dispatch(Type, Data);
            store.state.Room = Data;
            break;
          case 'InitData':
            this.dispatch(Type, Data);
            break;
          default:
            while (!store.state.roomIsSubscribe) {
              await new Promise((resolve) => setTimeout(resolve, 16));
            }
            this.dispatch(Type, Data);
            break;
        }

      }
    }

  }
  public getWs() {
    if (this.ws != null) {
      return this.ws
    }
  }
  public wsSend(payload: Payload) {
    if (1 === this.ws!.readyState) this.ws!.send(JSON.stringify(payload));
  }

}