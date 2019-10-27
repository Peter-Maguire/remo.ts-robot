export default class Config{

    //Temporary thing until i can load config properties from somewhere else
    config = {

    };

    private static configInstance: Config;

    static instance(): Config{
        return this.configInstance;
    }

    async get(property: string): Promise<any>{
        return this.config[property];
    }
}