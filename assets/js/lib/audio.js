const audioPlay = async sound => {
  if (this.bogdle.config.noisy) {
    const context = new AudioContext();
    const gainNode = context.createGain();
    const source = context.createBufferSource();
    const path = 'assets/audio';
    const format = 'wav';
    const audioBuffer = await fetch(`${path}/${sound}.${format}`)
      .then(res => res.arrayBuffer())
      .then(ArrayBuffer => context.decodeAudioData(ArrayBuffer));

    gainNode.gain.value = 0.1;
    source.buffer = audioBuffer;

    source.connect(gainNode);
    source.connect(context.destination);

    source.start();
  }
};
