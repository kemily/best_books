"""Utility file to seed bestbooks database from GoodReads API calls"""
import os
import sys
import xmltodict
import requests

from sqlalchemy import func

from model import Book, Award, BookAward, Genre, BookGenre, Author, BookAuthor, connect_to_db, db
from server import app

goodreads_key = os.environ['GOODREADS_KEY']

def load_api_books():
    """Update Books table via Good Reads api."""

    print "Book!"

    # return list of title tuples from the Book table
    titles = db.session.query(Book.title).filter(Book.published == None).all()

    # create an empty list to append titles from the tuples
    books_titles = []

    # iterate over the list and, make each tuple a list, append the fist element
    # which is book title, to the books_titles
    for item in titles:
        title = list(item)
        # print title[0]
        books_titles.append(title[0])

    # etarate over the books_titles list
    # transform each title into more api endpoint suitable format, by replacing
    # empty spaces with "+"
    for title in books_titles:
        api_title = title.replace(" ", "+")
        api_title = api_title.replace("'", "%27")

        # using Goodreads book.title api method
        # using requests library making api calls base on book api title we formated
        response = requests.get("https://www.goodreads.com/book/title.xml?key=%s&title=%s" % (goodreads_key, api_title))
        # using xmltodict to make xml responce into dict like object
        response = xmltodict.parse(response.content)

        # checking if goodreads response has any value
        if response.get('GoodreadsResponse'):
            book_info = response['GoodreadsResponse']['book']
            isbn = book_info['isbn13']
            image_url = book_info['image_url']
            info = book_info['description']
            pages = book_info['num_pages']

            year = book_info['publication_year']
            if year:
                year = int(year)

            # book_info['work']['original_publication_year'] is an Ordered dictionary -
            # OrderedDict([(u'@type', u'integer'), ('#text', u'2001')])
            original_pub_year = book_info['work']['original_publication_year'].get('#text')
            print original_pub_year
            print type(original_pub_year)

            if original_pub_year:
                original_pub_year = int(original_pub_year)

            language = book_info['language_code']

            # getting a book row from books table by current title
            # and checking if this book has already api info
            book = Book.query.filter(func.lower(Book.title) == func.lower(title)).first()

            #updating the book table row with api info
            book.description = info
            book.pages = pages
            book.published = original_pub_year
            book.language = language
            book.isbn13 = isbn
            book.image_url = image_url

            db.session.commit()


def load_goodreads_author_id():
    """Update Author table with goodreads author id via Good Reads api."""

    print "Author ID!"

    # return list of names tuples from the Author table, if the authors don't have goodreads author id
    names = db.session.query(Author.name).filter(Author.goodreads_author_id == None).all()

    # create an empty list to append names from the tuples
    author_names = []

    # iterate over the list and, make each tuple a list, append the fist element
    # which is author name, to the author names list
    for name in names:
        author_name = list(name)
        # print title[0]
        author_names.append(author_name[0])

    for goodreads_name in author_names:
        api_goodreads_name = goodreads_name.replace(" ", "%20")

        # using Goodreads author.search api method
        # using requests library making api calls base on author goodreads id
        response = requests.get("https://www.goodreads.com/api/author_url/%s?key=%s" % (api_goodreads_name, goodreads_key))

        # using xmltodict to make xml responce into dict like object
        response = xmltodict.parse(response.content)
        # checking if goodreads response has any author id value with author dictionary key
        if response['GoodreadsResponse'].get('author'):

            # getting a goodreads autor id
            api_author_id = response['GoodreadsResponse']['author'].get('@id')

            # getting an author from the authors table with the current name
            get_author = Author.query.filter(func.lower(Author.name) == func.lower(goodreads_name)).first()
            if get_author:
                get_author.goodreads_author_id = api_author_id

            db.session.commit()



def load_author_bio():
    """Update Author table with author bio via Good Reads api."""

    print "Author Bio!"

    # return list of ids tuples from the Author table
    ids = db.session.query(Author.goodreads_author_id).filter(Author.biography == None).all()

    # create an empty list to append ids from the tuples
    author_ids = []

    # iterate over the list and, make each tuple a list, append the fist element
    # which is goodreads author id, to the author_ids
    for item in ids:
        goodreads_ids = list(item)
        if goodreads_ids[0] is not None:
            author_ids.append(goodreads_ids[0])

    # etarate over the author_ids list
    for goodreads_id in author_ids:

        # getting an author  from the authors table with the current goodreads id
        author = Author.query.filter(Author.goodreads_author_id == goodreads_id).first()
        if author:
            # using Goodreads author.show api method
            # using requests library making api calls base on author goodreads id
            response = requests.get("https://www.goodreads.com/author/show/%s?format=xml&key=%s" % (goodreads_id, goodreads_key))
            # using xmltodict to make xml responce into dict like object
            response = xmltodict.parse(response.content)
            # checking if goodreads response has any value
            if response.get('GoodreadsResponse'):
                author_info = response['GoodreadsResponse']['author']
                about = author_info['about']

                if about:
                    author.biography = about

            db.session.commit()


####################################

# FUNCTION CALLS

if __name__ == "__main__":
    connect_to_db(app)
    db.create_all()

    #load_api_books()
    # load_goodreads_author_id()
    load_author_bio()
