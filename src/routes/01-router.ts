import {Router, Request, Response} from "express";
var http = require('http');
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
        console.log('test')
        // Inicializa lista de execução;
        for (var index = 0; index < 20; index++) {
            execucao.push(acoes.SALVAR);
            execucao.push(acoes.EDITAR);
            execucao.push(acoes.VISUALIZAR);
        }
        
        Server1.ExecutaProximo();
    }

    private static ExecutaProximo(){
        var acaoAtual:number = execucao.pop();
        if(acaoAtual){
            Server1.PedePermissaoDeAcesso();
            
            Server1.ValidaPermissaoUso(acaoAtual);
        }
    }

    private static ExecutaAcao(acaoAtual:number){
        Executando = true;
        var tempo:number = 5000;
        if(acaoAtual == acoes.EDITAR) tempo = 4000;
        else if (acaoAtual == acoes.VISUALIZAR) tempo = 3000;

        console.log('Executando acao '+ acaoAtual +', t:'+ Time);
        setTimeout(() =>{
            Executando = false;
            Esperando = false;
            Server1.LiberarRecurso();
            Server1.ExecutaProximo();
        },tempo)
    }

    private static LiberarRecurso(){
        console.log('Libera Recurso t:'+ Time);
        //TODO Avisar outros que o recurso pode ser utilizado.
    }

    private static ValidaPermissaoUso(acaoAtual:number){
        if(filaOk.length == filaServers.length){
            Server1.ExecutaAcao(acaoAtual);
        }else{
            setTimeout(Server1.ValidaPermissaoUso(acaoAtual),100);
        }
    }    

    private static PedePermissaoDeAcesso(){
        Time = Time + 1;
        TimeInterno = Time;
        Esperando = true;
        console.log('Pede acesso t:'+ Time);
        for (var key in filaServers) {
            if (filaServers.hasOwnProperty(key)) {
                var element = filaServers[key];
                if(element != myRoute){
                    //Remove da fila de OK
                    filaOk.splice(filaOk.indexOf(element), 1);
                    filaPendentes.push(element);
                    Server1.MandaReq(element);
                }
            }
        }
    }

    private static MandaReq(key:number){
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

        // // Start the request
        // request(options, function (error, response, body) {
        //     if (!error && response.statusCode == 200) {
        //         //TODO Utilizar resultado do body para trabalhar.
        //     }
        // })
    }

    private acesso(request:Request, response:Response){
        Server1.AtualizaTempo(request.body.time);
        console.log('Responde acesso t:'+ Time+ ' pdi:'+ request.body.pdi);
        if(Esperando){
            if(TimeInterno == request.body.time){
                if(myRoute < request.body.pdi){
                    Server1.envia(response, {liberado:false, time: Time, pdi: myRoute})
                }else {
                    if(Executando){
                        Server1.envia(response, {liberado:false, time: Time, pdi: myRoute})
                    }else Server1.envia(response, {liberado:true, time: Time, pdi: myRoute})
                }
            }else if(TimeInterno < request.body.time){
                Server1.envia(response, {liberado:false, time: Time, pdi: myRoute})
            }else{
                if(Executando){
                    Server1.envia(response, {liberado:false, time: Time, pdi: myRoute})
                }else {
                    if(filaOk.indexOf(request.body.pdi) > 0)
                        filaOk.splice(filaOk.indexOf(request.body.pdi), 1);
                    Server1.envia(response, {liberado:true, time: Time, pdi: myRoute})
                }
            }
        }else{
            TimeInterno = Time;
            Server1.envia(response, {liberado:true, time: Time, pdi: myRoute});
        }
    }

    private static AtualizaTempo(tempo:number){
        if(tempo >= Time){
            Time = tempo;
        }
        Time = Time +1;
    }

    private static envia(response:Response, data: any){
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
const filaOk:Array<number> = [1]
const filaServers:Array<number> = [1]

const myRoute:number = 1;

const server = new Server1();
server.init();

export default server.router;
