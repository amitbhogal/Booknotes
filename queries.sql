DROP TABLE IF EXISTS book, book_review;

CREATE TABLE book (
  id SERIAL PRIMARY KEY,
  title TEXT,
  isbn CHAR(10),
);

-- One to One --
CREATE TABLE book_review (
  id INTEGER REFERENCES book(id) UNIQUE,
  date_read DATE,
  rating SMALLINT,
  notes TEXT
);

INSERT INTO book (title)
VALUES ('Fuzzy bee and friends.', '0312491506'), ('The very hungry caterpillar' , '0399227539');
INSERT INTO book_review (id, date_read, rating, notes)
VALUES (1, '2016-04-26', 6, 'A good cloth book for infants to see colors and touch and feel different textures.'), (2, '2018-02-21', 7, 'A good book to introduce basic words, colors and storytelling to infants.') ;

-- Join --
SELECT book.id, isbn, title, date_read, rating, notes
FROM book
JOIN book_review
ON book.id = book_review.id