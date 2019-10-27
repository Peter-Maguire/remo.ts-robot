import Role from "./Role";

export default class ServerSettings {
    roles: Role[];
    default_channel: string;


    constructor(obj){
        this.roles = obj.roles.map((r)=>new Role(r));
        this.default_channel = obj.default_channel;
    }
}