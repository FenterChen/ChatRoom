export interface Payload {
 Type: EventType;
 Data: any;
}

export enum EventType {
 joinRoom = "JoinRoom",
 offer = "Offer",
 answer = "Answer",
 sendCandidate = "SendCandidate",
 getIceServerlist = "GetIceServerlist",
 broadcastMessage = "BroadcastMessage"
}