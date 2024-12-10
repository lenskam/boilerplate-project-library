'use strict';

const Book = require('../models/Book');

module.exports = function (app) {

  app.post('/api/books', async (req, res) => {
    const { title } = req.body;
    if (!title) return res.send('missing required field title');
    try {
        const book = new Book({ title });
        await book.save();
        res.json({ _id: book._id, title: book.title });
    } catch (err) {
        res.status(500).send('Server error');
    }
  });

  app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find();
        const response = books.map(book => ({
            _id: book._id,
            title: book.title,
            commentcount: book.comments.length,
        }));
        res.json(response);
    } catch (err) {
        res.status(500).send('Server error');
    }
  });

  app.get('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.send('no book exists');  // Change to 404
        }
        res.json({ _id: book._id, title: book.title, comments: book.comments });
    } catch (err) {
        res.status(404).send('no book exists');  // Ensure 404 on errors
    }
});

app.post('/api/books/:id', async (req, res) => {
  const { comment } = req.body;
  if (!comment) {
      return res.send('missing required field comment').status(400);  /// Change to 400
  }
  try {
      const book = await Book.findById(req.params.id);
      if (!book) {
          return res.send('no book exists');  // Change to 404
      }
      book.comments.push(comment);
      await book.save();
      res.json({ _id: book._id, title: book.title, comments: book.comments });
  } catch (err) {
      res.status(404).send('no book exists');  // Ensure 404 on errors
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
      const book = await Book.findByIdAndDelete(req.params.id);
      if (!book) {
          return res.send('no book exists');  // Change to 404
      }
      res.send('delete successful');
  } catch (err) {
      res.status(404).send('no book exists');  // Ensure 404 on errors
  }
});

  app.delete('/api/books', async (req, res) => {
    try {
        await Book.deleteMany(); // Delete all books
        res.send('complete delete successful'); // Success message
    } catch (err) {
        res.status(500).send('Server error');
    }
  });

};
