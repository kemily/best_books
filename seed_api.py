"""Utility file to seed bestbooks database from GoodReads API calls"""
import os
import sys

import xmltodict
import requests

from model import Book, Author, connect_to_db, db
from server import app

# If a file runs without GOODREADS KEY available in the env, it will give an error
# and the file will stop running
if 'GOODREADS_KEY' in os.environ:
    goodreads_key = os.environ['GOODREADS_KEY']
else:
    print "ERROR: You must supply a valid Goodreads API key in the 'GOODREADS_KEY' environment variable in order to use this script!"
    sys.exit(1)


def load_api_books():
    """Update Books table via Good Reads api."""

    print "Book!"

    # return list of books objects from books table, if they don't have publishing year
    books = Book.query.filter(Book.published.is_(None)).all()

    for book in books:
        # transform each title into api endpoint suitable format, by replacing
        # empty spaces with "+"
        title = book.title
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

    # getting list of authors objects from the authors table, if the authors don't have goodreads author id
    authors = Author.query.filter(Author.goodreads_author_id.is_(None)).all()

    for author in authors:

        #getting an author's name
        author_name = author.name
        # transform each name into api endpoint suitable format, by replacing
        # empty spaces with "%20"
        api_name = author_name.replace(" ", "%20")

        # using Goodreads author.search api method
        # using requests library making api calls base on author goodreads id
        response = requests.get("https://www.goodreads.com/api/author_url/%s?key=%s" % (api_name, goodreads_key))

        # using xmltodict to make xml responce into dict like object
        response = xmltodict.parse(response.content)
        # checking if goodreads response has any author id value with author dictionary key
        if response['GoodreadsResponse'].get('author'):

            # getting a goodreads autor id
            api_author_id = response['GoodreadsResponse']['author'].get('@id')

            #updating the author table row with api info
            author.goodreads_author_id = api_author_id

        db.session.commit()


def load_author_bio():
    """Update Author table with author bio via Good Reads api."""

    print "Author Bio!"

    # return list of authors objects from the authors table, which have good reads api id and
    # don't have biography
    authors = Author.query.filter(Author.goodreads_author_id.isnot(None), Author.biography.is_(None)).all()

    for author in authors:
        goodreads_id = author.goodreads_author_id

        # using Goodreads author.show api method
        # using requests library making api calls base on author goodreads id
        response = requests.get("https://www.goodreads.com/author/show/%s?format=xml&key=%s" % (goodreads_id, goodreads_key))
        # using xmltodict to make xml responce into dict like object
        response = xmltodict.parse(response.content)
        # checking if goodreads response has any value
        if response.get('GoodreadsResponse'):
            author_info = response['GoodreadsResponse']['author']
            about = author_info['about']

            # update an author biography base on api response
            if about:
                author.biography = about

        db.session.commit()




####################################

# FUNCTION CALLS

if __name__ == "__main__":
    connect_to_db(app)
    db.create_all()

    # load_api_books()
    # load_goodreads_author_id()
    # load_author_bio()
