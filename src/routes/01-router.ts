import {Router, Request, Response} from "express";
var request = require('request');
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
        
        for (var ex in execucao) {
            if (execucao.hasOwnProperty(ex)) {
                var acaoAtual = execucao[ex];
                this.PedePermissaoDeAcesso();
                
                this.ValidaPermissaoUso();

                this.ExecutaAcao(acaoAtual);
            }
        }
    }

    private ExecutaAcao(acaoAtual:number){
        Executando = true;
        //TODO Implementar Sleep para executar acao.
        Executando = false;
        Esperando = false;
    }

    private ValidaPermissaoUso(){
        //TODO Implementar Sleep para esperar acesso ao recurso.
    }    

    private PedePermissaoDeAcesso(){
        Time = Time + 1;
        TimeInterno = Time;
        Esperando = true;
        for (var key in filaServers) {
            if (filaServers.hasOwnProperty(key)) {
                var element = filaServers[key];
                if(element != myRoute){
                    //Remove da fila de OK
                    filaOk.splice(filaOk.indexOf(element), 1);
                    this.MandaReq(element);
                }
            }
        }
    }

    private MandaReq(key:number){
        // Set the headers
        var headers = {
            'User-Agent':       'Super Agent/0.0.1',
            'Content-Type':     'application/x-www-form-urlencoded'
        }

        // Configure the request
        var options = {
            url: 'http://localhost:3000/api/'+key+'/acesso',
            method: 'POST',
            headers: headers,
            form: {time:TimeInterno, pdi: myRoute}
        }

        // Start the request
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //TODO Utilizar resultado do body para trabalhar.
            }
        })
    }

    private acesso(request:Request, response:Response){
        this.AtualizaTempo(request.body.time);
        if(Esperando){
            if(TimeInterno == request.body.time){
                if(myRoute < request.body.pdi){
                    this.envia(response, {liberado:false, time: Time, pdi: myRoute})
                }else {
                    if(Executando){
                        this.envia(response, {liberado:false, time: Time, pdi: myRoute})
                    }else this.envia(response, {liberado:true, time: Time, pdi: myRoute})
                }
            }else if(TimeInterno < request.body.time){
                this.envia(response, {liberado:false, time: Time, pdi: myRoute})
            }else{
                if(Executando){
                    this.envia(response, {liberado:false, time: Time, pdi: myRoute})
                }else {
                    if(filaOk.indexOf(request.body.pdi) > 0)
                        filaOk.splice(filaOk.indexOf(request.body.pdi), 1);
                    this.envia(response, {liberado:true, time: Time, pdi: myRoute})
                }
            }
        }else{
            TimeInterno = Time;
            this.envia(response, {liberado:true, time: Time, pdi: myRoute});
        }
    }

    private AtualizaTempo(tempo:number){
        if(tempo >= Time){
            Time = tempo;
        }
        Time = Time +1;
    }

    private envia(response:Response, data: any){
        response.status(200)
            .send({
                message: 'Success',
                status: response.status,
                data: data
            });
    }

    private libera(request:Request, response:Response){
        //Todo Implementar liberação de recurso.
    }
}

const execucao: Array<number> = [];

enum acoes  {
    VISUALIZAR = 1,
    EDITAR,
    SALVAR
}
var TimeInterno:number = 0;
var Time:number = 0;
var Esperando:boolean = false;
var Executando:boolean = false;

const filaPendentes:Array<number> = []
const filaOk:Array<number> = [1,2,3,4,5]
const filaServers:Array<number> = [1,2,3,4,5]

const myRoute:number = 1;
const routes:Array<number> = [1, 2, 3, 4, 5];

const server = new Server1();
server.init();

export default server.router;
