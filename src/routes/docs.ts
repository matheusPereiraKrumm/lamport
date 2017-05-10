import {Router, Request, Response} from "express";
import {RxHR} from "@akanass/rx-http-request";
export class Docs {

    router:Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    public init() {
        this.router.post('/visualizar', this.visualizar);
        this.router.post('/editar', this.editar);
        this.router.post('/salvar', this.salvar);
    }

    private visualizar(request:Request, response:Response){
    
        setTimeout(() =>{
            response.status(200)
            .send({
                message: 'Success',
                status: response.status,
                data: {}
            });
        }, 3000);
    }

    private editar(request:Request, response:Response){
    
        setTimeout(() =>{
            response.status(200)
            .send({
                message: 'Success',
                status: response.status,
                data: {}
            });
        }, 4000);
    }

    private salvar(request:Request, response:Response){
    
        setTimeout(() =>{
            response.status(200)
            .send({
                message: 'Success',
                status: response.status,
                data: {}
            });
        }, 5000);
    }
}


const ser = new Docs();
ser.init();

export default ser.router;
