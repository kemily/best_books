"""Utility file to seed bestbooks database from bestbooks file in data/"""
import csv
import datetime
from sqlalchemy import func

from model import Book, Award, BookAward, Genre, BookGenre, Author, BookAuthor, connect_to_db, db
from server import app

import os
import sys

def load_books():
    """Load books from bestbooks.csv into database."""

    print "Book!"

    # open the csv file and unpack it
    with open("/home/vagrant/src/best_books/data/bestbooks.csv") as general:
        reader = csv.reader(general)

        #unpacking each row in the file and looping over it.
        #appending each title to the titles list

        for award, year, genre, title, author, author2, author3 in reader:

            # if title == "English Passengers" and "Hilary Mantel" in [author, author2, author3]:
            #     pdb.set_trace()
            # The date is in the file as year string;
            # we need to convert it to an actual datetime object.
            year = int(year)
            author = author.strip()
            award = award.strip()

            #create book object
            #first, we'll check if this current book title we already have in the book table
            #if we don't, then we have to create a book object
            #add it to session and commit it to the database
            #using func.lower helps to compare data without case sensitivity
            book = Book.query.filter(func.lower(Book.title) == func.lower(title)).first()
            if not book:
                book = Book(title=title)
                db.session.add(book)
                db.session.commit()

            #create award object
            book_award = Award.query.filter(func.lower(Award.name) == func.lower(award)).first()
            if not book_award:
                book_award = Award(name=award)
                db.session.add(book_award)
                db.session.commit()

            #create book award object
            get_book_award = BookAward.query.filter(BookAward.year == year,
                                                    BookAward.book_id == book.book_id,
                                                    BookAward.award_id == book_award.award_id).first()
            if not get_book_award:
                books_awards = BookAward(book_id=book.book_id,
                                          award_id=book_award.award_id,
                                          year=year)
                db.session.add(books_awards)
                db.session.commit()

            #create genre object
            if genre:
                new_genre = Genre.query.filter(func.lower(Genre.genre) == func.lower(genre)).first()
                if not new_genre:
                    new_genre = Genre(genre=genre)
                    db.session.add(new_genre)
                    db.session.commit()

            #create book genre object
            get_book_genre = BookGenre.query.filter(BookGenre.book_id == book.book_id,
                                                    BookGenre.genre_id == new_genre.genre_id).first()
            if not get_book_genre:
                books_genres = BookGenre(book_id=book.book_id,
                                          genre_id=new_genre.genre_id)
                db.session.add(books_genres)
                db.session.commit()

            #create first author object
            this_author = Author.query.filter(func.lower(Author.name) == func.lower(author)).first()
            if not this_author:
                this_author = Author(name=author)
                db.session.add(this_author)
                db.session.commit()

            #create book author object for the first author
            get_book_author = BookAuthor.query.filter(BookAuthor.book_id == book.book_id,
                                                    BookAuthor.author_id == this_author.author_id).first()
            if not get_book_author:
                books_authors = BookAuthor(book_id=book.book_id,
                                          author_id=this_author.author_id)
                db.session.add(books_authors)
                db.session.commit()


            # need to check if the book has a second author
            # if it does then we will check if this author is in the database
            # if it doesn't then we'll create a new author object,
            # add it to session and commit to the database.
            if author2:
                new_author2 = Author.query.filter(func.lower(Author.name) == func.lower(author2)).first()
                if not new_author2:
                    new_author2 = Author(name=author2)
                    db.session.add(new_author2)
                    db.session.commit()

                    # once we added this author to our database author table
                    # we can create a books author connection object to the books authors table
                    books_authors = BookAuthor(book_id=book.book_id,
                                                author_id=new_author2.author_id)

                # if we have this author in our database authors table, then
                # we have to check if we have this author book assossiation in our
                # books authors table.
                # if we don't, then we'll create this assossiation object in the
                # books authors table
                else:
                    get_book_author2 = BookAuthor.query.filter(BookAuthor.book_id == book.book_id,
                                                        BookAuthor.author_id == new_author2.author_id).first()
                    if not get_book_author2:
                        books_authors = BookAuthor(book_id=book.book_id,
                                                  author_id=new_author2.author_id)
                db.session.add(books_authors)
                db.session.commit()

            # need to check if the book has a third author
            # if it does then we will check if this author is in the database
            # if it doesn't then we'll create a new author object,
            # add it to session and commit to the database
            if author3:
                new_author3 = Author.query.filter(func.lower(Author.name) == func.lower(author3)).first()
                if not new_author3:
                    new_author3 = Author(name=author3)
                    db.session.add(new_author3)
                    db.session.commit()

                    # once we added this author to our database author table
                    # we can create a books author connection object to the books authors table
                    books_authors = BookAuthor(book_id=book.book_id,
                                                author_id=new_author3.author_id)

                # if we have this author in our database authors table, then
                # we have to check if we have this author book assossiation in our
                # books authors table.
                # if we don't, then we'll create this assossiation object in the
                # books authors table
                else:
                    get_book_author3 = BookAuthor.query.filter(BookAuthor.book_id == book.book_id,
                                                        BookAuthor.author_id == new_author3.author_id).first()
                    if not get_book_author3:
                        books_authors = BookAuthor(book_id=book.book_id,
                                                  author_id=new_author3.author_id)
                db.session.add(books_authors)
                db.session.commit()


if __name__ == "__main__":
    connect_to_db(app)
    db.create_all()

    BookAward.query.delete()
    BookGenre.query.delete()
    BookAuthor.query.delete()
    Book.query.delete()
    Award.query.delete()
    Genre.query.delete()
    Author.query.delete()

    load_books()
