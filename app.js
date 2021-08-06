const debug = require('debug')('app.inicio');
//const dbDebug = require('debug')('app:db');
const express = require('express');
const config = require('config');
//const logger = require('./logger');
const morgan = require('morgan');
const Joi = require('joi');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));//para colocar archivos, imágenes, etc.

//Configuración de entornos
console.log('Aplicación: ' + config.get('nombre'));
console.log('BD Server: ' + config.get('configDB.host'));

    //Para cambiar de entorno en la terminal: set NODE_ENV=production (o development)
    //https://www.npmjs.com/package/config


//Uso de middleware de terceros - Morgan
if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    //console.log('Morgan habilitado'); lo sustituí por iicioDebug
    debug('Morgan está habilitado.');
}

//Trabajos con la base de datos
debug('Conectando con la base de datos');

//app.use(logger); Lo sustituyo por morgan


const usuarios = [
    {id:1, nombre:'Lili'},
    {id:2, nombre:'Lucas'},
    {id:3, nombre:'Cesar'}
];

app.get('/', (req, res) =>{
    res.send('Hola, mundo desde Express.');
});

app.get('/api/usuarios', (req, res) => {
    res.send(usuarios);
});

app.get('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if(!usuario) res.status(404).send('El usuario no fue encontrado');
    res.send(usuario);
});

app.post('/api/usuarios', (req, res) => {

    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });

    const {error, value} = validarUsuario(req.body.nombre);
    if(!error){
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    }else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
   
});

app.put('/api/usuarios/:id', (req, res) =>{
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado');
        return;
    } 

    const {error, value} = validarUsuario(req.body.nombre);
    if(error){
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);

});

app.delete('/api/usuarios/:id', (req, res) =>{
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado');
        return;
    } 

    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);

    res.send(usuario);
});

//Ejecuta en terminal, en la carpeta de app.js: node app.js
//Escribe en el navegador algo como esto: http://localhost:5000/api/usuarios/1990/asas/?sea=44 

//En la terminal puedo cambiar la variable de entorno (PORT) usando el comando: set PORT=5000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}...`);
})

var existeUsuario = (id) =>{
    return(usuarios.find(u => u.id === parseInt(id)));
}

var validarUsuario = (nom) =>{
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    return (schema.validate({ nombre: nom }));
}