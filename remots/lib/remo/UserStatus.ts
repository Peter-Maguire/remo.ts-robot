export default class UserStatus {
    timeout: boolean;
    constructor(raw){
        this.timeout = raw.timeout;
    }
}