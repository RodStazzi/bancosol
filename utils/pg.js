const { Pool } = require('pg');
require('dotenv').config();
// DDBB local
// const config = {
//   user: 'postgres',
//   password: 'postgre',
//   host: 'localhost',
//   port: 5432,
//   database: 'bancosolar'
// }


// DDBB cloud
const config = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE
}

const pool = new Pool(config);

const insertarUsuario = async (values) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query({
      text: 'INSERT INTO usuarios(nombre, balance) VALUES ($1, $2) RETURNING *;',
      values
    });
    return result.rows;
  } catch (error) {
    return { code, message };
  } finally {
    if (client) client.release(pool.end);
  }
}

const usuarios = async () => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query({
      text: 'SELECT * FROM usuarios WHERE activo = true;'
    });
    return result.rows;
  } catch ({ code, message }) {
    return { code, message };
  } finally {
    if (client) client.release(pool.end);
  }
}

const actualizarUsuario = async (values) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query({
      text: 'UPDATE usuarios SET nombre = $2, balance = $3 WHERE id = $1 RETURNING *;',
      values
    });
    return result.rows;
  } catch ({ code, message }) {
    return { code, message };
  } finally {
    if (client) client.release(pool.end);
  }
}

const eliminarUsuario = async (values) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query({
      // text: 'DELETE FROM usuarios WHERE id = $1 RETURNING *;',
      text: 'UPDATE usuarios SET activo = false WHERE id = $1 RETURNING *;',
      values
    });
    return result;
  } catch ({ code, message }) {
    return { code, message };
  } finally {
    if (client) client.release(pool.end);
  }
}

const insertarTransaccion = async (values) => {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN;');

    await client.query({
      text: 'UPDATE usuarios SET balance = balance - $2 WHERE id = (SELECT id FROM usuarios WHERE nombre = $1)',
      values: [values[0], values[2]]
    });

    await client.query({
      text: 'UPDATE usuarios SET balance = balance + $2 WHERE id = (SELECT id FROM usuarios WHERE nombre = $1)',
      values: [values[1], values[2]]
    });

    const result = await client.query({
      text: 'INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ((SELECT id FROM usuarios WHERE nombre = $1), (SELECT id FROM usuarios WHERE nombre = $2), $3, now()) RETURNING *;',
      values: [values[0], values[1], values[2]]
    });

    await client.query('COMMIT;');
    return result;
  } catch ({ code, message }) {
    return { code, message };
  } finally {
    if (client) client.release(pool.end);
  }
}

//SELECT tra.id, us.nombre emisor, usu.nombre receptor, tra.monto, tra.fecha FROM transferencias tra INNER JOIN usuarios us ON (tra.emisor = us.id) INNER JOIN usuarios usu ON (tra.receptor = usu.id) ORDER BY tra.fecha DESC;
const transferencias = async () => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query({
      text: 'SELECT tra.id, us.nombre emisor, usu.nombre receptor, tra.monto, tra.fecha FROM transferencias tra INNER JOIN usuarios us ON (tra.emisor = us.id) INNER JOIN usuarios usu ON (tra.receptor = usu.id) ORDER BY tra.fecha DESC;',
      rowMode: 'array'
    });
    return result.rows
  } catch ({ code, message }) {
    return { code, message };
  } finally {
    if (client) client.release(pool.end);
  }
}

module.exports = { insertarUsuario, usuarios, actualizarUsuario, eliminarUsuario, insertarTransaccion, transferencias };