"""Best book awards."""

from jinja2 import StrictUndefined

from flask import Flask, render_template, request, flash, redirect, session
from flask_debugtoolbar import DebugToolbarExtension
from flask import jsonify

from sqlalchemy import func

from model import connect_to_db, db, Book, Award, BookAward, Genre, BookGenre, Author, BookAuthor


app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "ABC"

# Normally, if you use an undefined variable in Jinja2, it fails silently.
# This is horrible. Fix this so that, instead, it raises an error.
app.jinja_env.undefined = StrictUndefined

awards = [
    {"id": 1, "url": "/static/pictures/ManBookerPrize1.png"},
    {"id": 2, "url": "/static/pictures/theeconomist3.jpg"},
    {"id": 3, "url": "/static/pictures/ManBookerPrize2.png"},
    {"id": 4, "url": "/static/pictures/nationalbookaward3.jpg"},
    {"id": 5, "url": "/static/pictures/TheNewYorkTimes1.png"}
]

@app.route('/')
def index():
    """Homepage."""

    # get list of awards dictionaries from database
    # awards = [award.to_dict() for award in Award.query.all()]
    return render_template("homepage.html", images=awards)


@app.route("/book-auto-complete", methods=["GET"])
def book_auto_complete():
    """Return a list of all the book titles list that are currently in the database"""

    # gets all the title tuples from the books table
    titles = db.session.query(Book.title).all()
    # create an empty list to append titles from the tuples
    books_titles = []

    # iterate over the list and, make each tuple a list, append the fist element
    # which is book title, to the books_titles
    for item in titles:
        title = list(item)
        books_titles.append(title[0])

    # returning a books titles list
    return jsonify(titles_list=books_titles)

@app.route("/author-auto-complete", methods=["GET"])
def author_auto_complete():
    """Return a list of all authors list that are currently in the database"""

    # gets all the author tuples from the authors table
    authors = db.session.query(Author.name).all()
    # create an empty list to append authors names from the tuples
    authors_names = []

    # iterate over the list and, make each tuple a list, append the fist element
    # which is author's name, to the authors_names
    for item in authors:
        name = list(item)
        authors_names.append(name[0])

    # returning a books titles list
    return jsonify(names_list=authors_names)


@app.route("/get-book-info", methods=["GET"])
def get_book_info():
    """Return info about a book as JSON"""

    # gets a book title from the get request
    book_title = request.args.get("title")

    # # getting a book row from books table by current title
    book_info = Book.query.filter(func.lower(Book.title) == func.lower(book_title)).first()
    book = book_info.to_dict()

    # get list of authors objects
    book_authors = book_info.authors

    # converting authors objects into dictionaries
    authors = [author.to_dict() for author in book_authors]

    # adding author to the book dictionary
    book['author'] = authors

    return jsonify(book)

@app.route("/get-author-books", methods=["GET"])
def get_author_books():
    """Return list of the books byt the chosen author as JSON"""

    # gets choosen author name from the get request
    author_name = request.args.get("name")

    # getting an author object from authors table by the chosen name
    author = Author.query.filter(Author.name == author_name).first()
    # getting books written by the author
    author_books = author.books

    # getting list of books objects from the database
    books = [book.to_dict() for book in author_books]

    return jsonify(books_list=books, name=author_name)


@app.route("/get-award-year", methods=["GET"])
def get_award_year():
    """Return info about award years as JSON"""

    # gets award's id from the get request
    awardYear = request.args.get("id")

    # gets all the award's years tuples from the BooksAward table
    award_years = db.session.query(BookAward.year).filter(BookAward.award_id == awardYear).all()

    years = []

    # iterate over the list and, make each tuple a list, append the fist element
    # which is award, to the books_titles
    for item in award_years:
        year = list(item)
        years.append(year[0])

    years = list(set(years))

    # appending awardId as a last element of the list, so we can use it in future
    years.append(awardYear)

    # returning an award years list
    return jsonify(years_list=years)


@app.route("/get-books", methods=["GET"])
def get_books():
    """Return info about award books base on choosen year as JSON"""

    # gets choosen year from the get request
    awardYear = request.args.get("year")
    awardId = request.args.get("award_id")

    # getting a book row from books table by the chosen year and award
    award_books = BookAward.query.filter(BookAward.year == awardYear, BookAward.award_id == awardId).all()

    # getting list of books objects from the database
    books = [book_object.book.to_dict() for book_object in award_books]

    return jsonify(books_list=books)




if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension

    # Do not debug for demo
    app.debug = True

    connect_to_db(app)

    # Use the DebugToolbar
    DebugToolbarExtension(app)
    app.jinja_env.auto_reload = True

    # app.run()
    app.run(port=5000, host='0.0.0.0')
