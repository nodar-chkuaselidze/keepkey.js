import WebUSBDevice  from '../src/webUSBDevice'
import KeepKeyManager from '../src/keepkeyManager'

let keepkey;
const loggers = {}
const manager = new KeepKeyManager({
  onConnectCallback: (deviceID) => {
    console.log('Device Connected: ' + deviceID)
    loggers[deviceID] = console.log
  },
  onDisconnectCallback: (deviceID) => {
    console.log('Device Disconnected: ' + deviceID)
    delete loggers[deviceID]
  }
})

function connectWebUSB() {
  manager.initializeWebUSBDevices()
    .then(() => {
      console.log(`Found ${Object.keys(manager.keepkeys).length} KeepKey(s)`)
      if (manager.initializedCount) {
        const k = manager.get()
        console.log('Putting first keepkey on window as window.keepkey: ', k)
        keepkey = k
        //k.device.events.on('write', data => console.log('Event: write', data))
        //k.device.events.on('read', data => console.log('Event: read', data))
        //k.device.events.on('reading', () => console.log('Event: reading'))
      }
      return manager.exec('getFeatures')
    })
    .then(featuresByDeviceID => {
      console.log('Features by device ID:')
      console.log(featuresByDeviceID)
    })
    .then(() => {
      Object.keys(manager.keepkeys).forEach((deviceID) => {
        loggers[deviceID] = console.log
      })
      //manager.deviceEvents.offAny()
      manager.deviceEvents.onAny((_, [deviceID, msg]) => {
        //loggers[deviceID](msg)
      })
    })
    .catch(e => {
      console.error('ConnectWebUSB Error');
      console.error(e);
    })
}

// So we can see which commands aren't resolving
const allPings = []

const log = (name, p) => {
  console.log('sending', name)
  const details = { name, state: 'pending', p: null }
  details.p = p
    .then(res => {
      console.log(`${name} response:`, res)
      details.state = 'resolved'
    })
    .catch(e => {
      console.error(`${name} error:`, e)
      details.state = 'rejected'
    })
  allPings.push(details)
  return p
}

let pingCount = 0
function pingWithButton() {
  log(`ping ${++pingCount} with button`, manager.exec('ping', { message: 'ping' + pingCount, buttonProtection: true }))
}

function pingWithPIN () {
  log(`ping ${++pingCount} with PIN`, manager.exec('ping', { message: 'ping' + pingCount, pinProtection: true }))
}

function ping() {
  log(`ping ${++pingCount}`, manager.exec('ping', { message: 'ping' + pingCount }))
}

function cancelPending() {
  log('cancelPending', keepkey.cancel())
}

WebUSBDevice.requestPair().then(() => {
  // start stuff
  connectWebUSB()

  // ping device
  setTimeout(() => {
    ping()
  }, 10000)
}).catch(e => {
  console.error(e);
})
