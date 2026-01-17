const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // Agregado para permitir conexión desde Expo

const app = express();
app.use(cors()); // Habilitar CORS
const jsonParser = bodyParser.json();

const db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) console.error(err.message);
    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`);
});

// --- ENDPOINTS ---

// d) Endpoint para insertar (POST)
app.post('/insert', jsonParser, function (req, res) {
    const { todo } = req.body;
    if (!todo) return res.status(400).send({ error: 'Falta información' });

    const stmt = db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, CURRENT_TIMESTAMP)');
    stmt.run(todo, function(err) {
        if (err) return res.status(500).send(err);
        res.status(201).json({ id: this.lastID, message: 'Insert successful' });
    });
    stmt.finalize();
});

// b) Endpoint para leer (GET) - Necesario para el FlatList
app.get('/list', (req, res) => {
    db.all('SELECT * FROM todos ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.status(200).json(rows);
    });
});

app.get('/', (req, res) => res.status(200).json({ status: 'ok' }));

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Servidor en puerto ${port}`);
    });
}

module.exports = { app, db };