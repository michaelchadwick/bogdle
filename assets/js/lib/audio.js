// Try to get data from the cache, but fall back to fetching it live.
async function getAudio(cacheName, url) {
  let cachedAudio = await getCachedAudio(cacheName, url);

  if (cachedAudio) {
    // console.log('Retrieved cached audio', cachedAudio);
    return cachedAudio;
  }

  // console.log('Fetching fresh data');

  const cacheStorage = await caches.open(cacheName);
  await cacheStorage.add(url);
  cachedAudio = await getCachedAudio(cacheName, url);
  await deleteOldCaches(cacheName);

  return cachedAudio;
}

// Get data from the cache.
async function getCachedAudio(cacheName, url) {
  const cacheStorage = await caches.open(cacheName);
  const cachedResponse = await cacheStorage.match(url);

  if (!cachedResponse || !cachedResponse.ok) {
    return false;
  }

  return await cachedResponse.arrayBuffer();
}

// Delete any old caches to respect user's disk space.
async function deleteOldCaches(currentCache) {
  const keys = await caches.keys();

  for (const key of keys) {
    const isOurCache = CACHE_AUDIO_KEY;

    if (currentCache === key || !isOurCache) {
      continue;
    }

    caches.delete(key);
  }
}

// use CacheStorage to check cache
async function useCache(url) {
  const context = new AudioContext();
  const gainNode = context.createGain();
  const source = context.createBufferSource();

  try {
    const audioBuffer = await getAudio(CACHE_AUDIO_KEY, url)
    console.log('audioBuffer', audioBuffer)

    gainNode.gain.value = 0.3;
    source.buffer = await context.decodeAudioData(audioBuffer);

    source.connect(gainNode);
    gainNode.connect(context.destination);

    source.start();
  } catch (error) {
    console.error(error)
  }
}

// use direct fetch(url)
async function useFetch(url) {
  const context = new AudioContext();
  const gainNode = context.createGain();
  const source = context.createBufferSource();

  const audioBuffer = await fetch(url)
    .then(response => response.arrayBuffer())
    .then(ArrayBuffer => context.decodeAudioData(ArrayBuffer));

    gainNode.gain.value = 0.3;
    source.buffer = audioBuffer;

    source.connect(gainNode);
    gainNode.connect(context.destination);

    source.start();
}

const audioPlay = async sound => {
  if (this.bogdle.settings.noisy) {
    const path = '/assets/audio';
    const format = 'wav';
    const url = `${path}/${sound}.${format}`

    // console.log('attempting audioPlay url', url);

    useCache(url)

    // useFetch(url)
  }
};
