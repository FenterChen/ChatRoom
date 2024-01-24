function createSenderTransform() {
  let frames = 0;
  return new TransformStream({
    start() {
      // Called on startup.
    },

    async transform(chunk, controller) {
      const tmp = new DataView(chunk.data);
      if (tmp.getUint32(0) == 1) {
        //  h264 start code '0001'
        console.log('h264 =======');
      }
      const newData = new ArrayBuffer(chunk.data.byteLength + 2);

      let metadata = new ArrayBuffer(2);
      let metaView = new DataView(metadata);
      metaView.setUint16(0, frames++);
      console.log(frames);

      const data = new Uint8Array(newData);
      data.set(new Uint8Array(chunk.data));
      data.set(new Uint8Array(metadata), chunk.data.byteLength);
      chunk.data = newData;

      controller.enqueue(chunk);
    },

    flush() {
      // Called when the stream is about to be closed.
    }
  });
}

function createReceiverTransform() {
  return new TransformStream({
    start() {
      // Called on startup.
    },

    async transform(chunk, controller) {
      const view = new DataView(chunk.data);
      //last 2 bytes
      const count = view.getUint16(chunk.data.byteLength - 2);
      chunk.data = chunk.data.slice(0, chunk.data.byteLength - 2);
      controller.enqueue(chunk);

      console.log('Receive last 2 bytes ===', count);
      self.postMessage(count);
    },

    flush() {
      // Called when the stream is about to be closed.
    }
  });

}

// Code to instantiate transform and attach them to sender/receiver pipelines.
onrtctransform = (event) => {
  let transform;
  if (event.transformer.options.name == "senderTransform") {
    transform = createSenderTransform();
  }
  else if (event.transformer.options.name == "receiverTransform") {
    transform = createReceiverTransform();
  }
  else
    return;
  event.transformer.readable
    .pipeThrough(transform)
    .pipeTo(event.transformer.writable);
};