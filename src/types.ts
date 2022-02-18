// Fonction `login`
// en entrée : { "username": "...", "password": "..."}
// en sortie : besoin de sortir un JWT, mais aussi infos sur l'user
// { "user": { "id": 1, ...}, "jwt": "<JWT>" } 
export interface IUserIn {
  username: string;
  password: string;
}

export interface IUserOut {
  _id: string
  username: string;
  email: string;
}

export type IUserDB = IUserIn & IUserOut 