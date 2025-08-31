const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('inventory.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL
        )`);
    }
});

// Get all items
app.get('/items', (req, res) => {
    db.all('SELECT * FROM items', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get a single item
app.get('/items/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM items WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }
        res.json(row);
    });
});

// Create a new item
app.post('/items', (req, res) => {
    const { name, category, quantity, price } = req.body;
    if (!name || !category || quantity === undefined || price === undefined) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }
    db.run(
        'INSERT INTO items (name, category, quantity, price) VALUES (?, ?, ?, ?)',
        [name, category, quantity, price],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ id: this.lastID });
        }
    );
});

// Update an item
app.put('/items/:id', (req, res) => {
    const id = req.params.id;
    const { name, category, quantity, price } = req.body;
    if (!name || !category || quantity === undefined || price === undefined) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }
    db.run(
        'UPDATE items SET name = ?, category = ?, quantity = ?, price = ? WHERE id = ?',
        [name, category, quantity, price, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Item not found' });
                return;
            }
            res.status(200).json({ message: 'Item updated' });
        }
    );
});

// Delete an item
app.delete('/items/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM items WHERE id = ?', id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }
        res.status(200).json({ message: 'Item deleted' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});