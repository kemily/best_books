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
        # print title[0]
        books_titles.append(title[0])

    # returning a books titles list
    return jsonify(titles_list=books_titles)

@app.route("/get-book-info", methods=["GET"])
def get_book_info():
    """Return info about a book as JSON"""

    # gets a book title from the get request
    book_title = request.args.get("title")

    # # getting a book row from books table by current title
    # book = Book.query.filter(func.lower(Book.title) == func.lower(book_title)).first()
    # return jsonify(book.to_dict())

    # getting a book row from books table by current title
    book_info = Book.query.filter(func.lower(Book.title) == func.lower(book_title)).first()

    title = book_info.title
    url = book_info.image_url

    book = {
        "title": title,
        'url': url
    }

    # creating a current book dictionary with the corresponding data,
    # so it can be returned as JSON
    # book = {
    #     "id": book_info.book_id,
    #     'title': book_info.title,
    #     'url': book_info.image_url,
    #     'description': book_info.description,
    #     'pages': book_info.pages,
    #     'published': book_info.published,
    #     'language': book_info.language
    # }

    return jsonify(book)



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
