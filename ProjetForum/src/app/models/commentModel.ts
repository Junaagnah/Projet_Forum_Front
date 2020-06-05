import { ProfileModel } from "./profileModel";

export class CommentModel {
  id: number;

  body: string;

  authorProfile: ProfileModel;
}
