//●  GET: Devuelve la aplicación cliente disponible en el apoyo de la prueba.
//● /usuario POST: Recibe los datos de un nuevo usuario y los almacena en PostgreSQL.
//● /usuarios GET: Devuelve todos los usuarios registrados con sus balances.
//● /usuario PUT: Recibe los datos modificados de un usuario registrado y los actualiza.
//● /usuario DELETE: Recibe el id de un usuario registrado y lo elimina .
//● /transferencia POST: Recibe los datos para realizar una nueva transferencia. Se debe
//ocupar una transacción SQL en la consulta a la base de datos.
//● /transferencias GET: Devuelve todas las transferencias almacenadas en la base de
//datos en formato de arreglo.

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const url = require('url');
const port = process.env.PORT || 3000;

const { insertarUsuario, usuarios, actualizarUsuario, eliminarUsuario, insertarTransaccion, transferencias } = require('./pg.js');

const server = http.createServer( async(request, response) => {

  if(request.url === '/'){
    const file = fs.readFileSync('public/index.html', 'utf8');
    response.writeHead(200, { 'Content-Type' : 'utf8' });
    response.end(file);
  } else if (request.url === '/usuario' && request.method === 'POST') {
    let body = '';
    request.on('data', (chunk) => body += chunk);
    request.on('end', async () => {
      const data = JSON.parse(body);

      const result = await insertarUsuario(Object.values(data));
      console.log(result);
      response.writeHead(result?.code ? 500 : 200, { 'Content-Type' : 'application/json' });
      response.end(JSON.stringify(result));
    });
  } else if (request.url === '/usuarios' && request.method === 'GET') {
    const result = await usuarios();
    response.writeHead(result?.code ? 500 : 200, { 'Content-Type' : 'application/json' });
    response.end(JSON.stringify(result));
  } else if (request.url.startsWith('/usuario?id=') && request.method === 'PUT') {
    const  { id }  = url.parse(request.url, true).query;
    console.log(id);
    let body = '';
    request.on('data', (chunk) => body += chunk);
    request.on('end', async () => {
      const bodyJson = JSON.parse(body);
      const data = {"id": id, "name": bodyJson.name, "balance": bodyJson.balance};
      const result = await actualizarUsuario(Object.values(data));
      console.log(result);
      response.writeHead(result?.code ? 500 : 200, { 'Content-Type' : 'application/json' });
      response.end(JSON.stringify(result));
    });
  } else if (request.url.startsWith('/usuario?id=') && request.method === 'DELETE') {
    const  { id }  = url.parse(request.url, true).query;
    const result = await eliminarUsuario([id]);
    console.log(result);
    response.writeHead(result?.code ? 500 : 200, { 'Content-Type' : 'application/json' });
    response.end(JSON.stringify(result));
  } else if (request.url === '/transferencia' && request.method === 'POST') {
    let body = '';
    request.on('data', (chunk) => body += chunk);
    request.on('end', async () => {
      const data = JSON.parse(body);
      const result = await insertarTransaccion(Object.values(data));
      console.log(result);
      response.writeHead(result?.code ? 500 : 200, { 'Content-Type' : 'application/json' });
      response.end(JSON.stringify(result));
    });
  } else if (request.url === '/transferencias' && request.method === 'GET') {
    const result = await transferencias();
    // console.log(result);
    response.writeHead(result?.code ? 500 : 200, { 'Content-Type' : 'application/json' });
    response.end(JSON.stringify(result));
  }

});

server.listen(port);

module.exports = { server };