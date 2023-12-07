
import express from "express"; // setup server
import axios from "axios"; // connect to external API
import bodyParser from "body-parser"; // parse from forms from client
import pg from "pg" // connect to database
import methodOverride from "method-override";

//Create an express app and set the port number.
const app = express();
const port = 3000;
const API_URL = "https://covers.openlibrary.org/b/isbn"; // external API to connect with 

// So that we can send PATCH/PUT/DELETE requests from client sided
app.use(methodOverride('_method'));

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


app.get("/new", (req, res) => {
  res.render("modify.ejs", {heading: "Add New Note", submit: "Add"});
  });

// GET a specific book by id for editing
app.get("/edit/:id", async (req, res) => {

  const result = await db.query(`SELECT book.id, isbn, title, date_read, rating, notes 
                                  FROM book
                                  JOIN book_review 
                                  ON book.id = book_review.id 
                                  WHERE book.id = ($1)
                                  ORDER BY rating ASC`, [parseInt(req.params.id)]);

  var book = result.rows[0];
  
  if (!book) { return res.render("error.ejs", { message: "Error finding that book note."});}

  book.date_read = convertToDate(book.date_read);
  // console.log(convertToDate(book.date_read));

  res.render("modify.ejs", {heading: "Edit Note", submit: "Update", book: book});

});

// Add a new book note
app.post("/booknotes", async (req, res) => {

// console.log(req.body.title);
// console.log(req.body.isbn);

const book_insert = await db.query(`INSERT INTO book (title, isbn) VALUES ($1, $2) RETURNING id;`, [req.body.title, req.body.isbn]);

// console.log(book_insert.rows[0].id);

const book_review_insert = await db.query(`INSERT INTO book_review (id, date_read, rating, notes) 
                                           VALUES ($1, $2, $3, $4)`, 
                                          [book_insert.rows[0].id, req.body.date_read, parseInt(req.body.rating), req.body.notes]);
     
// Error handling - could not add that book
if (!book_insert || !book_review_insert) {return res.render("error.ejs", {message: "Error adding new book note."});}

res.redirect("/");
});

// Update the book note
app.post("/booknotes/:id", async (req, res) => {

  var book_id = parseInt(req.params.id);

  const result = await db.query(`SELECT book.id, isbn, title, date_read, rating, notes 
                                  FROM book
                                  JOIN book_review 
                                  ON book.id = book_review.id 
                                  WHERE book.id = ($1)
                                  ORDER BY rating ASC`, [book_id]);

  var book = result.rows[0];

  // Error handling - could not find that book
  if (!book) {return res.render("error.ejs", { message: "Error finding booknote that needs updating."});}

  // See what was submitted in the form from the client side
  if (req.body.notes) book.notes = req.body.notes;
  if (req.body.rating) book.rating = req.body.rating;
  if (req.body.date_read) book.date_read = req.body.date_read;

  // console.log(book.id);
  // console.log(book.notes);
  // console.log(book.rating);
  // console.log(book.date_read);

  const book_update = await db.query(`UPDATE book_review 
                                      SET notes = ($1), rating = ($2), date_read = ($3) 
                                      WHERE book_review.id = ($4)`, [book.notes, book.rating, book.date_read, book_id]);

 // Error handling - could not update that book
  if (!book_update) { return res.render("error.ejs", { message: "Error updating book note."});}
  res.redirect("/");
});


// Delete a post
app.get("/delete/:id", async (req, res) => {

    const bookreview_delete = await db.query(`DELETE FROM book_review
                                                WHERE book_review.id IN (SELECT id FROM book WHERE id = ($1));`, [parseInt(req.params.id)]);
    const book_delete = await db.query(`DELETE FROM book WHERE book.id = ($1)`, [parseInt(req.params.id)]);

    console.log(bookreview_delete);
    console.log(book_delete);
    

  // Error handling - could not delete that book
  if (!book_delete || !bookreview_delete) {return res.render("error.ejs", { message: "Error deleting book note."});}
  res.redirect("/");
});

// Listen on your predefined port and start the server.
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });