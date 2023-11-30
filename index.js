
import express from "express"; // setup server
import axios from "axios"; // connect to external API
import bodyParser from "body-parser"; // parse from forms from client
import pg from "pg" // connect to database

//Create an express app and set the port number.
const app = express();
const port = 3000;
const API_URL = "https://covers.openlibrary.org/b"; // external API to connect with 

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
function convertUTCToLocalTime(dateString){

  // Looks like "2015-05-21T05:05:35+00:00"
  let date = new Date(`${dateString}`);

  // Convert to Local time from UTC
  let formattedTime = date.toLocaleTimeString('en-US', { hour12: true }); // formatted in AM/PM

  return formattedTime;
}

 var books = []; // array of book titles
 var bookcovers = [];

// get request from client to show home page for website
app.get("/", async (req, res) => {

    const result = await db.query(`SELECT book.id, isbn, title, date_read, rating, notes 
                                   FROM book 
                                   JOIN book_review 
                                   ON book.id = book_review.id 
                                   ORDER BY rating ASC`);

    books = result.rows;
  
    console.log(result.rows);

    try {
    
        for (var i = 0; i < books.length; i++) {
            isbn = books[i].isbn;

            console.log(isbn);
            
            // const image = await axios.get(`${API_URL}/${isbn}-M.jpg`);

            // console.log(image);

            // bookcovers.push(image);
        } 

        res.render("index.ejs", {
            books: books, bookcovers: bookcovers
          });

        } catch (error) {
  
          // Test this server error
          res.render("index.ejs", { error: "Could not find cover for the book"});
        }


  });

app.post("/submit", async (req, res) => {

    // console.log(req.body.requested_display_order);
    var requested_display_order = req.body.requested_display_order; 

  });

// Listen on your predefined port and start the server.
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });