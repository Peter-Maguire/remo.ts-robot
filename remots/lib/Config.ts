export default class Config{

    //Temporary thing until i can load config properties from somewhere else
    config = {
        "port": 3000,
        "channelName": "Duke",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InJib3QtOTA4MWY3ODEtNTZiMS00YTNjLTg3OWEtM2M4ZGJhMTkzYWU4IiwiaWF0IjoxNTcyMzgwMzgyLCJleHAiOjE1NzQ5NzIzODIsInN1YiI6IiJ9.vDEjcthNcku67eAxAwsb0BDe0etuoF7IRq0rkrNrDh0",
    };

    private static configInstance: Config;


    constructor(){
        Config.configInstance = this;
    }

    static instance(): Config{
        return this.configInstance;
    }

    async get(property: string): Promise<any>{
        return this.config[property];
    }
}