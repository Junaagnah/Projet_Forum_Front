import {CommentModel} from "./commentModel";
import {ProfileModel} from "./profileModel";

export class PostModel {
    id: number;

    category: number;

    title: string;

    body: string;

    authorProfile: ProfileModel;

    authorUsername: string;

    locked: boolean;

    comments: Array<CommentModel>;

    image: string;
}
