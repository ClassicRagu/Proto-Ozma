const commandError = (message, reply) => {
  message
    .reply(reply)
    .then((msg) => {
      setTimeout(() => msg.delete(), 120000)
    })
    .catch((error) => console.log(error))
  setTimeout(() => message.delete(), 120000)
}

module.exports = { commandError }
