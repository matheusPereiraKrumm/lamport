import {Router, Request, Response} from "express";
import {RxHR} from "@akanass/rx-http-request";
export class Server4 {

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
        
        Server4.ExecutaProximo();

        Server4.envia(response, {})
    }

    private static ExecutaProximo(){
        var acaoAtual:number = execucao.pop();
        if(acaoAtual){
            Server4.PedePermissaoDeAcesso();
            
            Server4.ValidaPermissaoUso(acaoAtual);
        }
    }

    private static ExecutaAcao(acaoAtual:number){
        Executando = true;
        let acaoStr:string;
        switch(acaoAtual){
            case acoes.VISUALIZAR:
                acaoStr = "visualizar";
            break;
            case acoes.EDITAR:
                acaoStr = "editar";
            break;
            case acoes.SALVAR:
                acaoStr = "salvar";
            break;
        }
        console.log('Executando pdi:'+ myRoute+', acao:'+ acaoStr +', t:'+ Time);

        let options = {
            body: {time:Time, pdi: myRoute},
            json: true // Automatically stringifies the body to JSON 
        };
        
        RxHR.post('http://localhost:3000/api/docs/'+acaoStr, options).subscribe(
            (data) => {
                if (data.response.statusCode === 200) {
                    Executando = false;
                    Esperando = false;
                    Server4.LiberarRecurso();
                    Server4.ExecutaProximo();
                }
            },
            (err) => console.error(err) // Show error in console 
        );
    }

    private static LiberarRecurso(){
        console.log('Libera Recurso t:'+ Time);
        //TODO Avisar outros que o recurso pode ser utilizado.
        for (var key in filaServers) {
            if (filaServers.hasOwnProperty(key)) {
                var element = filaServers[key];
                if(element != myRoute){
                    let options = {
                        body: {time:Time, pdi: myRoute},
                        json: true // Automatically stringifies the body to JSON 
                    };
                    
                    RxHR.post('http://localhost:3000/api/'+element+'/libera', options).subscribe(
                        (data) => {
                            if (data.response.statusCode === 200) {

                                if(data.body.data.time > Time)
                                    Time = data.body.data.time;
                            }
                        },
                        (err) => console.error(err) // Show error in console 
                    );
                }
            }
        }
    }

    private static ValidaPermissaoUso(acaoAtual:number){
        if(filaOk.length == filaServers.length){
            Server4.ExecutaAcao(acaoAtual);
        }else{
            setTimeout(() => {Server4.ValidaPermissaoUso(acaoAtual)},100);
        }
    }    

    private static PedePermissaoDeAcesso(){
        Time = Time + 1;
        TimeInterno = Time;
        Esperando = true;
        for (var key in filaServers) {
            if (filaServers.hasOwnProperty(key)) {
                var element = filaServers[key];
                if(element != myRoute){
                    //Remove da fila de OK
                    filaOk.splice(filaOk.indexOf(element), 1);
                    filaPendentes.push(element);
                    Server4.MandaReq(element);
                }
            }
        }
    }

    private static MandaReq(key:number){
        let options = {
            body: {time:TimeInterno, pdi: myRoute},
            json: true // Automatically stringifies the body to JSON 
        };
        
        RxHR.post('http://localhost:3000/api/'+key+'/acesso', options).subscribe(
            (data) => {
        
                if (data.response.statusCode === 200) {
                    if(data.body.data.liberado){
                        filaPendentes.splice(filaPendentes.indexOf(key), 1);
                        filaOk.push(key);
                    }

                    if(data.body.data.time > Time)
                        Time = data.body.data.time;
                    //TODO Utilizar resultado do body para trabalhar.
                }
            },
            (err) => console.error(err) // Show error in console 
        );
    }

    private acesso(request:Request, response:Response){
        Server4.AtualizaTempo(request.body.time);
        if(Esperando){
            if(TimeInterno == request.body.time){
                if(myRoute < request.body.pdi){
                    Server4.envia(response, {liberado:false, time: Time, pdi: myRoute})
                }else {
                    if(Executando){
                        Server4.envia(response, {liberado:false, time: Time, pdi: myRoute})
                    }else Server4.envia(response, {liberado:true, time: Time, pdi: myRoute})
                }
            }else if(TimeInterno < request.body.time){
                Server4.envia(response, {liberado:false, time: Time, pdi: myRoute})
            }else{
                if(Executando){
                    Server4.envia(response, {liberado:false, time: Time, pdi: myRoute})
                }else {
                    if(filaOk.indexOf(request.body.pdi) > 0)
                        filaOk.splice(filaOk.indexOf(request.body.pdi), 1);
                    Server4.envia(response, {liberado:true, time: Time, pdi: myRoute})
                }
            }
        }else{
            TimeInterno = Time;
            Server4.envia(response, {liberado:true, time: Time, pdi: myRoute});
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
        if(filaPendentes.indexOf(request.body.pdi) >= 0)
        {
            filaPendentes.splice(filaPendentes.indexOf(request.body.pdi),1);
            filaOk.push(request.body.pdi);
        }

        Server4.AtualizaTempo(request.body.time);

        Server4.envia(response, {time: Time, pdi: myRoute})
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
const filaOk:Array<number> = [1, 2, 3, 4, 5]
const filaServers:Array<number> = [1, 2, 3, 4, 5]

const myRoute:number = 4;

const ser = new Server4();
ser.init();

export default ser.router;
