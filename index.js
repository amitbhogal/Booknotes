
import express from "express"; // setup server
import axios from "axios"; // connect to external API
import bodyParser from "body-parser"; // parse from forms from client
import pg from "pg" // connect to database

//Create an express app and set the port number.
const app = express();
const port = 3000;
const API_URL = "https://covers.openlibrary.org/b/isbn"; // external API to connect with 

// create connection to database and connect
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "booknotes",
    password: "Postgres731!",
    port: 5432,
  });
  
  db.connect();

// notify express app to access static files from public folder
app.use(express.static("public"));

// get express app to use body-parser
app.use(bodyParser.urlencoded({ extended: true }));


// simple function to give local time from UTC time
function convertToDate(dateString){

  // Looks like "2015-05-21T05:05:35+00:00"
  let dateWithTime = new Date(`${dateString}`);

  // Convert to Local time from UTC
  var dateWithoutTime = dateWithTime.toISOString().split('T')[0];
  
    // console.log(dateWithoutTime);

  return dateWithoutTime;
}

// get request from client to show home page for website
app.get("/", async (req, res) => {

    var books = []; // reset array of books
    var bookcovers = [];

    const result = await db.query(`SELECT book.id, isbn, title, date_read, rating, notes 
                                   FROM book 
                                   JOIN book_review 
                                   ON book.id = book_review.id 
                                   ORDER BY rating ASC`);

    books = result.rows;
  
    // console.log(result.rows);

    
    for (var i = 0; i < books.length; i++) 
    {
        // Convert to datetime to date
        books[i].date_read = convertToDate(books[i].date_read);

        // get isbn
        var isbn = books[i].isbn;
        
        // console.log(`${API_URL}/${isbn}-M.jpeg`);
        
        try {
            // Check if it is a valid path to image - a valid path won't be caught as an error
            var image = await axios.get(`${API_URL}/${isbn}-M.jpg`);

            // API seems to always provide an image (1 by 1 pixel) even if isbn is not correct
            if (image) {
                bookcovers.push(`${API_URL}/${isbn}-M.jpg`);
            } 
        }
        catch (error) {
            // If could not find book cover image for any other reason
            // Choose to do nothing in the meantime - on the client side there wont be an image except a frame for the image
            bookcovers.push(`Cover for ${book[i].title} unavailable`);
        }
        
    } 

    // console.log({ books: books, bookcovers: bookcovers});

    res.render("index.ejs", { books: books, bookcovers: bookcovers});

  });


// GET a specific book by id
app.get("/booknotes/:id", async (req, res) => {

  const result = await db.query(`SELECT book.id, isbn, title, date_read, rating, notes 
                                  FROM book
                                  JOIN book_review 
                                  ON book.id = book_review.id 
                                  WHERE book.id = ($1)
                                  ORDER BY rating ASC`, [parseInt(req.params.id)]);

  var book = result.rows[0];
  book.date_read = convertToDate(book.date_read);
  // console.log(convertToDate(book.date_read));
  
  if (!book) return  res.render("edit.ejs", { error: "Book not found"});

  res.render("edit.ejs", {book: book});

});

// POST a new book note
app.post("/booknote", (req, res) => {
  const newId = lastId += 1;
  const post = {
    id: newId,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    date: new Date(),
  };
  lastId = newId;
  posts.push(post);
  res.status(201).json(post);
});

// PATCH a post when you just want to update one parameter
// app.patch("/booknotes/:id", (req, res) => {
//   const post = posts.find((p) => p.id === parseInt(req.params.id));
//   if (!post) return res.status(404).json({ message: "Post not found" });

//   if (req.body.title) post.title = req.body.title;
//   if (req.body.content) post.content = req.body.content;
//   if (req.body.author) post.author = req.body.author;

//   res.json(post);
// });

// DELETE a specific post by providing the post id
// app.delete("/posts/:id", (req, res) => {
//   const index = posts.findIndex((p) => p.id === parseInt(req.params.id));
//   if (index === -1) return res.status(404).json({ message: "Post not found" });

//   posts.splice(index, 1);
//   res.json({ message: "Post deleted" });
// });
  
app.post("/submit", async (req, res) => {

    // console.log(req.body.requested_display_order);
    var requested_display_order = req.body.requested_display_order; 

  });

// Listen on your predefined port and start the server.
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });