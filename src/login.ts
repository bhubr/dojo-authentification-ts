import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import { jwtSecret } from './config';

import { IUserDB, IUserIn, IUserOut } from "./types";

const usersDb: IUserDB[] = [
  { _id: 'abcd000', username: 'johndoe', email: 'johndoe@toto.net', password: '$argon2i$v=19$m=4096,t=3,p=1$KaST0EiD7vfRwyTCTo7VzA$Q3kkOC+HpbbnhF5fGOuROkF6hrEh2/Bsxr5JFhaf9Dk' }
]

async function findUserByUsername(username: string) {
  const user = usersDb.find(user => user.username === username)
  return user
}

export default async function login({ username, password }:IUserIn): Promise<{ user: IUserOut, token: string }>{
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
    }, jwtSecret, { expiresIn: '1h' });

    return { user, token }
    
}