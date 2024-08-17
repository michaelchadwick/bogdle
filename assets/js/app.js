// Bogdle object init
if (typeof Bogdle === 'undefined') var Bogdle = {}

const BOGDLE_ENV_PROD_URL = ['bogdle.fun', 'bogdle.neb.host']

Bogdle.env = BOGDLE_ENV_PROD_URL.includes(document.location.hostname) ? 'prod' : 'local'

Bogdle._logStatus = function (msg, arg = null) {
  if (Bogdle.env == 'local') {
    if (arg) {
      console.log(msg, arg)
    } else {
      console.log(msg)
    }
  }
}

Bogdle._logStatus('[LOADED] /Bogdle')