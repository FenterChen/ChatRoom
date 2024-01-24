import { Payload } from './model/eventType';
import { useStore } from '../store';
import uuid4 from "uuid4";

export class SocketInstance {
  private ws: WebSocket | null = null;
  private url: string;

  constructor() {
    this.url = import.meta.env.VITE_WSS_URL;
    let MachineKey: string[] = ["MachineKey", "kmPm2kGTz72PWzg3"];
    this.ws = new WebSocket(`${this.url}/ws/`, MachineKey);
    const ws = this.ws;
    const store = useStore();
    ws.onerror = (event) => {
      console.log("WebSocket error: ", event);
    }
    ws.onopen = () => {
      console.log("connected %s", this.url);
      ws.onmessage = (event) => {
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
            store.state.Room = Data;
            store.commit('m_addSocketEvent', { Id: uuid4(), Type: 'UpdateRoom', Data: Data });
            break;
          case 'NewUser':
            store.state.Room = Data;
            store.commit('m_addSocketEvent', { Id: uuid4(), Type: 'NewUser', Data: Data });
            break;
          case 'UserLeaveFromRoom':
            store.state.Room.UserList = store.state.Room.UserList.filter((res: any) => res != Data.LeaveUser);
            store.commit('m_addSocketEvent', { Id: uuid4(), Type: 'UserLeaveFromRoom', Data: Data });
            break;
          case 'Offer':
            store.commit('m_addSocketEvent', { Id: uuid4(), Type: 'Offer', Data: Data });
            break;
          case 'Answer':
            store.commit('m_addSocketEvent', { Id: uuid4(), Type: 'Answer', Data: Data });
            break;
          case 'Candidate':
            store.commit('m_addSocketEvent', { Id: uuid4(), Type: 'Candidate', Data: Data });
            break;
          case 'IceServerList':
            store.commit('m_addSocketEvent', { Id: uuid4(), Type: 'IceServerList', Data: Data });
            break;
          case 'InitData':
            store.commit('m_addSocketEvent', { Id: uuid4(), Type: 'InitData', Data: Data });
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