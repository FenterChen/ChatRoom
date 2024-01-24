let frames = 0;
function encodeFunction(chunk, controller) {
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
}

function decodeFunction(chunk, controller) {
  const view = new DataView(chunk.data);
  //last 2 bytes
  const count = view.getUint16(chunk.data.byteLength - 2);
  chunk.data = chunk.data.slice(0, chunk.data.byteLength - 2);
  controller.enqueue(chunk);

  console.log('Receive last 2 bytes ===', count);
}

function handleTransform(operation, readable, writable) {
  if (operation === 'encode') {
    const transformStream = new TransformStream({
      transform: encodeFunction,
    });
    readable
      .pipeThrough(transformStream)
      .pipeTo(writable);
  } else if (operation === 'decode') {
    const transformStream = new TransformStream({
      transform: decodeFunction,
    });
    readable
      .pipeThrough(transformStream)
      .pipeTo(writable);
  }
}

// Handler for messages, including transferable streams.
onmessage = (event) => {
  if (event.data.operation === 'encode' || event.data.operation === 'decode') {
    return handleTransform(event.data.operation, event.data.readable, event.data.writable);
  }
};