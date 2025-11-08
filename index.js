const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('server working!')
})

app.listen(port, () => {
  console.log(`rent-wheels-server runnig on port: ${port}`)
})
