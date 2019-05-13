import ByteBuffer from 'bytebuffer'
import NodeWebUSBDevice from './nodeWebUSBDevice'
import Messages from './kkProto/messages_pb'
import Types from './kkProto/types_pb'

describe('NodeWebUSBDevice', () => {
  test('should return a Failure message if `read` throws an error', async () => {
    const config = { usbDevice: {
      transferIn: jest.fn().mockRejectedValueOnce(new Error('TEST'))
    }, events: { emit: jest.fn() } }
    // @ts-ignore
    const device = new NodeWebUSBDevice(config)
    const msg = new Messages.Cancel()
    const response = new Messages.Failure()
    response.setCode(Types.FailureType.FAILURE_UNEXPECTEDMESSAGE)
    response.setMessage('Error: TEST')
    const expected = ByteBuffer.wrap(response.serializeBinary())

    await expect(device.sendRaw(msg.serializeBinary())).resolves.toEqual(expected)
  })
})
