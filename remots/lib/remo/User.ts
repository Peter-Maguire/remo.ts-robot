import UserStatus from "./UserStatus";

export default class User {
    username: string;
    id: string;
    created: Date;
    type: Array<any>; //???
    status: UserStatus;

    constructor(raw){
        this.username = raw.username;
        this.id = raw.id;
        this.created = new Date(raw.created);
        this.type = raw.type;
        this.status = new UserStatus(raw.status);
    }
}