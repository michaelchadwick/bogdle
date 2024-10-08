/* lib/misc/audio */
/* sound playing mechanisms */
/* global Bogdle */

const BOGDLE_CACHE_AUDIO_KEY = 'bogdle-cache-audio'
const BOGDLE_ASSET_DATA_PATH = '/assets/audio'

// Try to get data from the cache, but fall back to fetching it live.
async function getAudio(cacheName, url) {
  let cachedAudio = await getCachedAudio(cacheName, url)

  if (cachedAudio) {
    return cachedAudio
  }

  const cacheStorage = await caches.open(cacheName)
  await cacheStorage.add(url)
  cachedAudio = await getCachedAudio(cacheName, url)
  await deleteOldCaches(cacheName)

  return cachedAudio
}

// Get data from the cache.
async function getCachedAudio(cacheName, url) {
  const cacheStorage = await caches.open(cacheName)
  const cachedResponse = await cacheStorage.match(url)

  if (!cachedResponse || !cachedResponse.ok) {
    return false
  }

  return await cachedResponse.arrayBuffer()
}

// Delete any old caches to respect user's disk space.
async function deleteOldCaches(currentCache) {
  const keys = await caches.keys()

  for (const key of keys) {
    const isOurCache = BOGDLE_CACHE_AUDIO_KEY

    if (currentCache === key || !isOurCache) {
      continue
    }

    caches.delete(key)
  }
}

// use CacheStorage to check cache
async function useCache(url) {
  const context = new AudioContext()
  const gainNode = context.createGain()
  const source = context.createBufferSource()

  try {
    const audioBuffer = await getAudio(BOGDLE_CACHE_AUDIO_KEY, url)

    gainNode.gain.value = 0.3
    source.buffer = await context.decodeAudioData(audioBuffer)

    source.connect(gainNode)
    gainNode.connect(context.destination)

    source.start()
  } catch (error) {
    console.error(error)
  }
}

// use direct fetch(url)
async function useFetch(url) {
  const context = new AudioContext()
  const gainNode = context.createGain()
  const source = context.createBufferSource()

  const audioBuffer = await fetch(url)
    .then((response) => response.arrayBuffer())
    .then((ArrayBuffer) => context.decodeAudioData(ArrayBuffer))

  gainNode.gain.value = 0.5
  source.buffer = audioBuffer

  source.connect(gainNode)
  gainNode.connect(context.destination)

  source.start()
}

Bogdle._initAudio = async function () {
  const path = BOGDLE_ASSET_DATA_PATH

  await caches.open(BOGDLE_CACHE_AUDIO_KEY).then((cache) => {
    cache.keys().then(function (keys) {
      if (!keys.length) {
        cache.addAll([
          `${path}/correct1.wav`,
          `${path}/correct2.wav`,
          `${path}/correct3.wav`,
          `${path}/pangram.wav`,
          `${path}/repeat1.wav`,
          `${path}/repeat2.wav`,
          `${path}/repeat3.wav`,
          `${path}/tile_click.wav`,
          `${path}/tile_delete.wav`,
          `${path}/wrong1.wav`,
          `${path}/wrong2.wav`,
          `${path}/wrong3.wav`,
        ])
      } else {
        // console.info(`${BOGDLE_CACHE_AUDIO_KEY} is full, so no need to initialize.`)
      }
    })
  })
}

Bogdle._audioPlay = async (soundId) => {
  if (Bogdle.settings.noisy) {
    const path = BOGDLE_ASSET_DATA_PATH
    const format = 'wav'
    const url = `${path}/${soundId}.${format}`

    if ('caches' in self) {
      useCache(url)
    } else {
      useFetch(url)
    }
  }
}
