export default class Role {
    name: string;
    members: string[];

    constructor(obj){
        this.name = obj.name;
        this.members = obj.members;
    }
}