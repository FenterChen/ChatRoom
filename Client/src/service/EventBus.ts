export default class EventBus {
    private event: { [key: string]: Function[] };

    constructor() {
        this.event = {};
    }

    subscribe(eventName: string, callback: Function): void {
        if (!this.event[eventName]) {
            this.event[eventName] = [];
        }
        this.event[eventName].push(callback);
    }

    unSubscribe(eventName: string, callback: Function): void {
        if (!this.event[eventName]) return;
        this.event[eventName] = this.event[eventName].filter(cb => cb !== callback);
    }

    dispatch(eventName: string, payload: any): void {
        if (!this.event[eventName]) return;
        this.event[eventName].forEach(cb => cb(payload));
    }
}