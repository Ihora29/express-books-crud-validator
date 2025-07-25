
const express = require('express')
const app = express()
const port = 3000
const fs = require('fs');
const path = require('path');

const { body, validationResult } = require('express-validator');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());


app.use('/books', (req, res, next) => {

    if (req.method === 'GET' || req.method === 'PUT' || req.method === 'DELETE') {
        next();
    };
    if (req.method === 'POST' && req.body) {
        fs.readFile('./data/data.json', 'utf-8', (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Не вдалося зчитати файл' });
            }

            let allBooks;
            try {
                allBooks = JSON.parse(data);
            } catch (error) {
                console.log(error);
                return
            }
            req.body.id = allBooks.length + 1;

            next();
        })
    }


});

app.post('/books', [body('title').notEmpty().isLength({ min: 4 }).withMessage('Title not VALID'),
body('year').isInt().withMessage('year is a integer'),
body('genre').notEmpty().isLength({ min: 4 }).withMessage('write genre'),

], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());;
        return
    } else {
        fs.readFile('./data/data.json', 'utf-8', (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Не вдалося зчитати файл' });
            }

            let allBooks;
            try {
                allBooks = JSON.parse(data);
            } catch (error) {
                console.log(error);
                return
            }

            allBooks.push(req.body);
            fs.writeFile('./data/data.json', JSON.stringify(allBooks, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Помилка запису файлу', err);
                    return res.status(500).json({ error: 'Не вдалося записати файл' });
                }

                res.status(201).json({ message: 'Книгу додано успішно', book: req.body });
            });
        });
    }
});

app.get('/books', (req, res) => {
    fs.readFile('./data/data.json', 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Не вдалося зчитати файл' });
        }

        let allBooks;
        try {
            allBooks = JSON.parse(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Помилка парсингу JSON' });
        }

        res.json(allBooks);
    });

});
app.get('/books/:id', (req, res) => {
    fs.readFile('./data/data.json', 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Не вдалося зчитати файл' });
        }

        let allBooks;
        try {
            allBooks = JSON.parse(data);
        } catch (error) {
            console.error(error);
            return
        }
        const idBook = allBooks.find(item => Number(item.id) == req.params.id);
        if (!idBook) {
            return res.status(404).json({ error: 'Книгу не знайдено' });
        }
        res.json(idBook);
    });


});

app.get('/index', (req, res) => {
    fs.readFile('./data/data.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send('Помилка читання книг');
        }

        let books;
        try {
            books = JSON.parse(data);
        } catch (e) {
            return res.status(500).send('Некоректний JSON');
        }

        res.render('index', { books });
    });
});

app.delete('/books', (req, res) => {

    fs.readFile('./data/data.json', 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Не вдалося зчитати файл' });
        }

        let allBooks;
        try {
            allBooks = JSON.parse(data);
        } catch (error) {
            console.error(error);
            return
        }
        const updAllBooks = allBooks.filter(book => book.title !== req.body.title && book.genre !== req.body.gendre)
        fs.writeFile('./data/data.json', JSON.stringify(updAllBooks, null, 2), 'utf-8', (err) => {
            if (err) {
                console.error(' Помилка ', err);
            } else {
                console.log(' Книги успішно записані ');
            }
        });


        //res.json(updAllBooks);
    });
});

app.put('/books', (req, res) => {
    const { id, title, author, genre } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'Не передано id книги для оновлення' });
    }
    fs.readFile('./data/data.json', 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Не вдалося зчитати файл' });
        }

        let allBooks;
        try {
            allBooks = JSON.parse(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Некоректний JSON у файлі' });
        }

        const index = allBooks.findIndex(book => book.id === id || book.id === Number(id));

        if (index === -1) {
            return res.status(404).json({ error: 'Книгу з таким id не знайдено' });
        }

        allBooks[index] = {
            ...allBooks[index],
            ...req.body
        };
        fs.writeFile('./data/data.json', JSON.stringify(allBooks, null, 2), 'utf-8', (err) => {
            if (err) {

                return res.status(500).json({ error: 'Не вдалося записати файл' });
            }

            res.json({ message: 'BOOK upd', book: allBooks[index] });
        });
    });
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
