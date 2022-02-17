import argon2 from 'argon2';



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
  { _id: 'abcd000', username: 'johndoe', email: 'johndoe', password: '$argon2i$v=19$m=4096,t=3,p=1$KaST0EiD7vfRwyTCTo7VzA$Q3kkOC+HpbbnhF5fGOuROkF6hrEh2/Bsxr5JFhaf9Dk' }
]

async function findUserByUsername(username: string) {
  const user = usersDb.find(user => user.username === username)
  return user
}

async function login({ username, password }:IUserIn): Promise<{ user: IUserOut, jwt: string }>{
    const user = await findUserByUsername(username);

    // user : { "password": "<chiffré>" }
    
    if (!user) {
        throw new Error("User not found");
    }

    const isValid: boolean = await argon2.verify(user.password, password);

    if (!isValid) {
        throw new Error("User not found");
    }

    const jwt = jwt.sign({
        exp: Math.floor(Date.now()/1000) + (60*60),
        data:  { ...user, user._id}
    })

    return { user, jwt }
    
}
//question hervé : 

app.post('/login', async (req, res) => {
  try {
    const { user, jwt } = await login(req.body)
    res.send({ user })
  } catch (err) {
      if (err.message === 'User not found') {
        return res.sendStatus(404)
      }
  }
})