import {Router, Request, Response} from "express";

export class Server1 {

    router:Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    public init() {
        this.router.get('/', this.start);
        this.router.post('/acesso', this.acesso);
        this.router.post('/libera', this.libera);
    }

    private start(request:Request, response:Response){
        // Inicializa lista de execução;
        for (var index = 0; index < 20; index++) {
            execucao.push(acoes.SALVAR);
            execucao.push(acoes.EDITAR);
            execucao.push(acoes.VISUALIZAR);
        }

        
    }

    private acesso(request:Request, response:Response){

        // let order:OrderStorage = request.body;

        // response.status(200)
        //         .send({
        //             message: 'Success',
        //             status: response.status,
        //             order
        //         });
    }

    private libera(request:Request, response:Response){
        
    }
}

const execucao: Array<number> = [];

enum acoes  {
    VISUALIZAR = 1,
    EDITAR,
    SALVAR
}

const server = new Server1();
server.init();

export default server.router;
