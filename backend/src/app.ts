import Express from "express";
import { Config } from "./Configs";
import * as Socket from "socket.io"
import * as http from "http";
import cors from "cors";


export class App {
    config: Config;
    app: Express.Application;
    http: http.Server;
    socket: Socket.Server;

    constructor(config: Config) {
        this.config = config;
        this.app = Express();
        this.http = http.createServer(this.app);
        this.socket = new Socket.Server(this.http);

        this.app.set('view engine', 'ejs');
        this.app.use(Express.static('static'));

        this.setupRoutes();
    }

    setupRoutes() {
        this.app.use(cors({
            origin: "*"
        }))

        // this.app.get('/', (req, res) => {
        //     res.render('index', { name: req.query.name });
        // });
    }

    start() {
        this.socket.on('connection', (socket) => {
            console.log('a user connected');
            socket.on('disconnect', () => {
                console.log('user disconnected');
            });

            socket.on('chat message', (msg) => {
                console.log('message: ' + msg);
                socket.emit('chat message: ', msg);
            });
        });

        // this.app.listen(80, () => {
        //     console.log(`Server is running on port 80`);
        // });
        // console.log("asd")
        this.socket.listen(333);
    }
}