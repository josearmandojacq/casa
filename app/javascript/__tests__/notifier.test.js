/* eslint-env jest */

require('jest')
const Notifier = require('../src/async_notifier.js')

let asyncNotificationsElement
let notifier

beforeEach(() => {
  document.body.innerHTML =
    `<div id="async-notifications">
      <div id="async-waiting-indicator" style="display: none">
        Saving <div class="load-spinner"></div>
      </div>
      <div id="async-success-indicator" class="async-success-indicator" style="display: none">
        Saved
      </div>
    </div>`

  $(document).ready(() => {
    asyncNotificationsElement = $('#async-notifications')
    notifier = new Notifier(asyncNotificationsElement)
  })
})

test('notify should display a green notification when passed a message and level=\'info\'', (done) => {
  const notificationMessage = '\'Y$deH[|%ROii]jy'

  $(document).ready(() => {
    notifier.notify(notificationMessage, 'info')

    try {
      const successMessages = asyncNotificationsElement.find('.async-success-indicator')

      // Notifications contain the "Saved" message and the new message
      expect(successMessages.length).toBe(2)
      expect(successMessages[1].innerHTML).toContain(notificationMessage)
      done()
    } catch (error) {
      done(error)
    }
  })
})

test('notify should display a red notification when passed a message and level=\'error\'', (done) => {
  const notificationMessage = '\\+!h0bbH"yN7dx9.'

  $(document).ready(() => {
    notifier.notify(notificationMessage, 'error')

    try {
      const failureMessages = asyncNotificationsElement.find('.async-failure-indicator')

      expect(failureMessages.length).toBe(1)
      expect(failureMessages[0].innerHTML).toContain(notificationMessage)
      done()
    } catch (error) {
      done(error)
    }
  })
})

test('notify should append a dismissable message to the async-notifications widget', (done) => {
  $(document).ready(() => {
    notifier.notify('', 'error')
    notifier.notify('', 'info')

    try {
      let failureMessages = asyncNotificationsElement.find('.async-failure-indicator')
      let successMessages = asyncNotificationsElement.find('.async-success-indicator')

      expect(failureMessages.length).toBe(1)
      expect(successMessages.length).toBe(2)

      failureMessages.children('button').click()
      failureMessages = asyncNotificationsElement.find('.async-failure-indicator')

      expect(failureMessages.length).toBe(0)

      $(successMessages[1]).children('button').click()
      successMessages = asyncNotificationsElement.find('.async-success-indicator')

      expect(successMessages.length).toBe(1)

      done()
    } catch (error) {
      done(error)
    }
  })
})

test('notify should throw a RangeError when passed an unsupported message level', (done) => {
  $(document).ready(() => {
    try {
      expect(() => {
        notifier.notify('message', 'unsupported level')
      }).toThrow(RangeError)

      done()
    } catch (error) {
      done(error)
    }
  })
})

test('notify should throw a TypeError when param message is not a string', (done) => {
  $(document).ready(() => {
    try {
      expect(() => {
        notifier.notify(6, 'info')
      }).toThrow(TypeError)

      done()
    } catch (error) {
      done(error)
    }
  })
})
