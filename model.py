"""Models and database functions for Best Book project."""
import time
from flask_sqlalchemy import SQLAlchemy

# This is the connection to the PostgreSQL database; we're getting this through
# the Flask-SQLAlchemy helper library. On this, we can find the `session`
# object, where we do most of our interactions (like committing, etc.)
# when creating db make sure to create it with  code - createdb -E UTF8 -T template0 --locale=en_US.utf8 <name>

db = SQLAlchemy()


##############################################################################
# Model definitions

class Book(db.Model):
    """Book."""

    __tablename__ = 'books'

    book_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    title = db.Column(db.String(300), nullable=False)
    description = db.Column(db.Text)
    pages = db.Column(db.Integer, nullable=True)
    published = db.Column(db.Integer, nullable=True)
    language = db.Column(db.String(15), nullable=True)
    isbn10 = db.Column(db.String(15), nullable=True)
    isbn13 = db.Column(db.String(15), nullable=True)
    image_url = db.Column(db.String(300), nullable=True)

    # Define relationship to genre, through books_genres
    genres = db.relationship("Genre",
                             secondary="books_genres",
                             backref="books")

    # Define relationship to author table, through books_authors
    authors = db.relationship("Author",
                             secondary="books_authors",
                             backref="books")

    def __repr__(self):
        """Provide helpful representation when printed."""
        return "<Book id=%s title=%s>" % (self.book_id, self.title)

class Award(db.Model):
    """Book awards"""

    __tablename__ = "awards"

    award_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String(30), nullable=False)
    description = db.Column(db.Text)

    def __repr__(self):
        """Provide helpful representation when printed."""
        return "<Award id=%s name=%s>" % (self.award_id, self.name)

class BookAward(db.Model):
    """Awar of a specific book."""

    __tablename__ = 'books_awards'

    book_award_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    book_id = db.Column(db.Integer,
                        db.ForeignKey('books.book_id'),
                        nullable=False)
    award_id = db.Column(db.Integer,
                         db.ForeignKey('awards.award_id'),
                         nullable=False)
    year = db.Column(db.Integer, nullable=False)

    book = db.relationship("Book", backref="books_awards")
    award = db.relationship("Award", backref="books_awards")


    def __repr__(self):
        """Provide helpful representation when printed."""

        return "<BookA book_id=%s award_id=%s year=%s>" % (self.book_id, self.genre_id, self.year)


class Genre(db.Model):
    """Genre of books"""

    __tablename__ = "genres"

    genre_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    genre = db.Column(db.String(30), nullable=True)


class BookGenre(db.Model):
    """Genre of a specific book."""

    __tablename__ = 'books_genres'

    book_genre_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    book_id = db.Column(db.Integer,
                        db.ForeignKey('books.book_id'),
                        nullable=False)
    genre_id = db.Column(db.Integer,
                         db.ForeignKey('genres.genre_id'),
                         nullable=False)

    def __repr__(self):
        """Provide helpful representation when printed."""

        return "<BookGenre book_id=%s genre_id=%s>" % (self.book_id, self.genre_id)

class Author(db.Model):
    """Authors of books"""

    __tablename__ = "authors"

    author_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    goodreads_author_id = db.Column(db.Integer, nullable=True)
    name = db.Column(db.String(200), nullable=False)
    # last_name = db.Column(db.String(30), nullable=False)
    biography = db.Column(db.Text)

    def __repr__(self):
        """Provide helpful representation when printed."""

        return "<Author author_id=%s name=%s>" % (self.author_id, self.name)

class BookAuthor(db.Model):
    """Author of a specific book."""

    __tablename__ = 'books_authors'

    book_author_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    book_id = db.Column(db.Integer,
                        db.ForeignKey('books.book_id'),
                        nullable=False)
    author_id = db.Column(db.Integer,
                         db.ForeignKey('authors.author_id'),
                         nullable=False)

    def __repr__(self):
        """Provide helpful representation when printed."""

        return "<BookAuthor book_id=%s author_id=%s>" % (self.book_id, self.author_id)


##############################################################################
# Helper functions

def connect_to_db(app):
    """Connect the database to our Flask app."""

    # Configure to use our PostgreSQL database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///bestbooks'
    app.config['SQLALCHEMY_ECHO'] = True
    db.app = app
    db.init_app(app)


if __name__ == "__main__":
    # As a convenience, if we run this module interactively, it will leave
    # you in a state of being able to work with the database directly.

    from server import app
    connect_to_db(app)
    print "Connected to DB."
     # Create tables
    # db.create_all()
