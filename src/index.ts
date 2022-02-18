import express from 'express'

import { port } from './config';
import login from './login';

const app=  express()
app.use(express.json())



// on suppose qu'on vous fournit une fonction async findUserByUsername(username)
// User.findOne({ username })
// prisma.user.findUnique({ where: { username } })


//question hervé : 
app.get('/', (req, res) => res.send('Hello'));

app.post('/login', async (req, res) => {
  try {
    const { user, token } = await login(req.body)
    res.send({ user, token })
  } 
  //previlegier unknown : no garanti (sur le type de err)
  catch (err: unknown) {
    console.error(err)
    if (err instanceof Error) {
      if (err.message === 'Invalid credentials') {
        return res.sendStatus(401)
      } else {
        return  res.status(500).send({
          error: err.message
        })
      }
    } else {
     return res.sendStatus(500)
    }
  }
})
//eviter les ports en dessous de 1024
app.listen(port, ()=>console.log('server is running'))
