
export enum Sender {
  User,
  AI,
}

export interface Message {
  id: number;
  text: string;
  sender: Sender;
}
