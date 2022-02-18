import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import express from 'express'

const app=  express()
app.use(express.json())
//lire le fichier env
dotenv.config()

// Fonction `login`
// en entrée : { "username": "...", "password": "..."}
// en sortie : besoin de sortir un JWT, mais aussi infos sur l'user
// { "user": { "id": 1, ...}, "jwt": "<JWT>" } 
interface IUserIn {
    username: string;
    password: string;
}

interface IUserOut {
    _id: string
    username: string;
    email: string;
}

type IUserDB = IUserIn & IUserOut 

// on suppose qu'on vous fournit une fonction async findUserByUsername(username)
// User.findOne({ username })
// prisma.user.findUnique({ where: { username } })

const usersDb: IUserDB[] = [
  { _id: 'abcd000', username: 'johndoe', email: 'johndoe@toto.net', password: '$argon2i$v=19$m=4096,t=3,p=1$KaST0EiD7vfRwyTCTo7VzA$Q3kkOC+HpbbnhF5fGOuROkF6hrEh2/Bsxr5JFhaf9Dk' }
]

async function findUserByUsername(username: string) {
  const user = usersDb.find(user => user.username === username)
  return user
}

async function login({ username, password }:IUserIn): Promise<{ user: IUserOut, token: string }>{
    // Récupérer l'user depuis la BDD
    // IMPORTANT : ce code doit être adapté pour votre "moteur" de BDD ou ORM (Prisma, TypeORM, etc.)
    const user = await findUserByUsername(username);

    // user : { "password": "<chiffré>" }
    
    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isValid: boolean = await argon2.verify(user.password, password);

    if (!isValid) {
        throw new Error("Invalid credentials");
    }

    // const { password: x, ...rest } = user
    const { _id, email } = user
    const token = jwt.sign({
      _id, email, username,
        // data:  { _id: user._id, username, email: user.email }
    }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    return { user, token }
    
}

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
app.listen(process.env.PORT || 5000 ,()=>console.log('server is running'))
