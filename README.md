# Booknotes
An app that uses node.js, express.js, axiom, PostgreSQL, REST architecture and API to display, add, edit, delete notes on books read by a user.

1. Things to do to install and launch app on the local server (port 3000) after cloning it from Git:

2. From Terminal, CD to the folder containing the project, do:
- npm i

3.Setup database 'booknotes' after downloading and using pgadmin. Go to the top of index.js (server file) and replace "XXXXXX" with the password for your pgadmin account.

4.Add necessary tables to the booknotes database in pgadmin using the commands listed in queries.sql of the project folder.

5.Run the local server using the following command:
-nodemon index.js

6.Add your own books with ISBNs obtained online, from the library or from https://openlibrary.org/dev/docs/api/covers.
Note: The book covers for the books on the website are being pulled from the API specified here: https://openlibrary.org/dev/docs/api/covers If a book cover image does not show up, its ISBN is either incorrect or not available at https://openlibrary.org/dev/docs/api/covers.


