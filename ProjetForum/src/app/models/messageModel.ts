import {ProfileModel} from "./profileModel";

export class MessageModel {
  id: number;

  conversation: number;

  content: string;

  date: Date;

  dateString: string;

  sender: string;

  senderProfile: ProfileModel;

  receiver: string;
}
