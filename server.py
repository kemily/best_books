"""Best book awards."""

from jinja2 import StrictUndefined

from flask import Flask, render_template, request, flash, redirect, session
from flask_debugtoolbar import DebugToolbarExtension
from flask import jsonify

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
    # search = request.args.get('value')

    #titles = db.session.query(Book.title).filter(Book.title.contains(search)).all()
    titles = db.session.query(Book.title).all()
    # create an empty list to append titles from the tuples
    books_titles = []

    # iterate over the list and, make each tuple a list, append the fist element
    # which is book title, to the books_titles
    for item in titles:
        title = list(item)
        # print title[0]
        books_titles.append(title[0])

    return jsonify(titles_list=books_titles)

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
