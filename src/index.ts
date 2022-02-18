import express, { Request, Response, NextFunction } from 'express'

import jwt from 'jsonwebtoken';
import { jwtSecret } from './config';

import { port } from './config';
import login from './login';
import { IUserOut } from './types';

const app=  express()
app.use(express.json())



// on suppose qu'on vous fournit une fonction async findUserByUsername(username)
// User.findOne({ username })
// prisma.user.findUnique({ where: { username } })


//question hervé : 
app.get('/', checkToken, (req: any, res) => res.send(`Hello ${req.user.username}`));

// type RequestWithUser = Request & { user: IUserOut }

// régler pb de type !
async function checkToken (req: any, res: Response, next: NextFunction) {
  //recevoir le token

  const authorization = req.headers.authorization;  // Bearer JWT
  //check le token si undefined
  if(authorization===undefined){
    //unauthorized 401
    return res.status(401).send({
      error: "no token found"
    })
  }

  // Séparer "Bearer" et le token
  //on split avec espace
  const [, token] = authorization.split(' ') // ['Bearer', JWT]
  console.log('token', token)
  //decoder et vérifier : la signature du token si correcte (if token is generated with the server's jwt secret)
  //voir github jsonwebtoken
  
  try {
    req.user = jwt.verify(token, jwtSecret)
    next()
    // si c'est pas bon : retourner "invalid token"
  } catch (error) {
    console.error(error)
    return res.status(401).send({
      error: "invalid token"
    })
  }
  // si c'est bon => next()
  // si c'est pas bon : retourner "invalid token" ou 'expired token'

  
}


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
