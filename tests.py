from unittest import TestCase
from model import Book, Author, Award, Genre, BookAward, connect_to_db, db, example_data
from server import app


class FlaskTestsDatabase(TestCase):
    """Flask tests that test the database ."""

    def setUp(self):
        """Stuff to do before every test."""

        # Get the Flask test client
        self.client = app.test_client()
        app.config['TESTING'] = True

        # Connect to test database
        connect_to_db(app, "postgresql:///testdb")

        # Create tables and add sample data
        db.create_all()
        example_data()

    def tearDown(self):
        """Do at end of every test."""

        db.session.close()
        db.drop_all()

    def test_find_book_in_db(self):
        """Can we find a book in the sample data?"""

        book = Book.query.get(1)
        self.assertEqual(book.book_id, 1)
        self.assertEqual(book.title, "War and Peace")
        self.assertEqual(book.description, "A great art by Leo Tolstoy")

    def test_book_repr_method(self):
        """Is a book object represented according to _repr_ method?"""
        book = Book.query.get(1)
        self.assertEqual(repr(book), '<Book id=1 title=War and Peace>')

    def test_book_to_dict_method(self):
        """Is a book object represented as a dictionary?"""
        book = Book.query.get(1)
        self.assertEqual(book.to_dict(), {'id': 1,
                                          'title': 'War and Peace',
                                          'url': 'some url',
                                          'description': 'A great art by Leo Tolstoy',
                                          'pages': 230,
                                          'published': 2005,
                                          'language': 'en'})

    def test_find_author_in_db(self):
        """Can we find an authors in the sample data?"""

        author = Author.query.filter(Author.name == "Leo Tolstoy").first()
        self.assertEqual(author.name, "Leo Tolstoy")

    def test_author_repr_method(self):
        """Is an author object represented according to _repr_ method?"""
        author = Author.query.get(1)
        self.assertEqual(repr(author), '<Author author_id=1 name=Leo Tolstoy>')

    def test_author_to_dict_method(self):
        """Is an author object represented as a dictionary?"""
        author = Author.query.get(1)
        self.assertEqual(author.to_dict(), {'authorId': 1,
                                            'name': 'Leo Tolstoy',
                                            'biography': 'Leo Tolstoy is a famous Russian author'})

    def test_find_award_in_db(self):
        """Can we find an award in the sample data?"""

        award = Award.query.filter(Award.name == "The New York Times").first()
        self.assertEqual(award.name, "The New York Times")

    def test_award_repr_method(self):
        """Is an award object represented according to _repr_ method?"""
        award = Award.query.get(1)
        self.assertEqual(repr(award), '<Award id=1 name=The New York Times>')

    def test_award_to_dict_method(self):
        """Is an award object represented as a dictionary?"""
        award = Award.query.get(1)
        self.assertEqual(award.to_dict(), {'id': 1,
                                           'name': 'The New York Times',
                                           'description': 'The NYT newspaper is a big publication that every year sets the best 10 books of the year',
                                           'url': 'award_url'})

    def test_find_genre_in_db(self):
        """Can we find genre in the sample data?"""

        genre = Genre.query.filter(Genre.genre == "Fiction").first()
        self.assertEqual(genre.genre, "Fiction")

    def test_genre_repr_method(self):
        """Is a genre object represented according to _repr_ method?"""
        genre = Genre.query.get(1)
        self.assertEqual(repr(genre), '<Genre genre_id=1 genre=Fiction>')

    def test_find_book_award_in_db(self):
        """Can we find book award year in the sample data?"""

        bookAward = BookAward.query.filter(BookAward.book_id == 1, BookAward.award_id == 1).first()
        self.assertEqual(bookAward.year, 2010)

    def test_bookAward_repr_method(self):
        """Is a bookAward object represented according to _repr_ method?"""
        bookAward = BookAward.query.get(1)
        self.assertEqual(repr(bookAward), '<Book book_id=1 award_id=1 year=2010>')

    def test_bookAward_to_dict_method(self):
        """Is an bookAward object represented as a dictionary?"""
        bookAward = BookAward.query.get(1)
        self.assertEqual(bookAward.to_dict(), {'book': 'War and Peace',
                                               'award': 'The New York Times',
                                               'year': 2010})

class FlaskTestsBasic(TestCase):
    """Flask homepage server route test."""

    def setUp(self):
        """Stuff to do before every test."""

        # Get the Flask test client
        self.client = app.test_client()
        connect_to_db(app, "postgresql:///testdb")

        # Show Flask errors that happen during tests
        app.config['TESTING'] = True

        # Create tables and add sample data
        db.create_all()
        example_data()

    def test_index(self):
        """Test homepage page."""

        result = self.client.get("/")
        self.assertIn("Best Books!", result.data)


class AjaxServerTestCase(TestCase):
    """Flask ajax routes tests that use the database."""

    def setUp(self):
        """Stuff to do before every test."""

        # Get the Flask test client
        self.client = app.test_client()
        app.config['TESTING'] = True

        # Connect to test database
        connect_to_db(app, "postgresql:///testdb")

        # Create tables and add sample data
        db.create_all()
        example_data()

    def tearDown(self):
        """Do at end of every test."""

        db.session.close()
        db.drop_all()

    def test_book_autocomplete(self):
        """Test search by book title input field."""

        result = self.client.get('/book-auto-complete')

        self.assertEqual(result.status_code, 200)
        self.assertIn("titles_list", result.data)
        self.assertIn("War and Peace", result.data)
        # print result.data

    def test_author_autocomplete(self):
        """Test search by author name input field."""

        result = self.client.get('/author-auto-complete')

        self.assertEqual(result.status_code, 200)
        self.assertIn("names_list", result.data)
        self.assertIn("Leo Tolstoy", result.data)
        # print result.data

    def test_genre_autocomplete(self):
        """Test search by genre input field."""

        result = self.client.get('/genre-auto-complete')

        self.assertEqual(result.status_code, 200)
        self.assertIn("genres_list", result.data)
        self.assertIn("Fiction", result.data)
        # print result.data

    def test_search_by_title(self):
        """Test search by title."""

        result = self.client.get("/get-book-info?title=War and Peace")
        self.assertEqual(result.status_code, 200)
        self.assertIn("War and Peace", result.data)
        self.assertIn('A great art by Leo Tolstoy', result.data)
        self.assertIn("Leo Tolstoy", result.data)
        self.assertIn("The New York Times", result.data)
        self.assertIn("2010", result.data)

    def test_search_by_author(self):
        """Test search by author's name."""

        result = self.client.get("/get-author-books?name=Leo Tolstoy")
        self.assertEqual(result.status_code, 200)
        self.assertIn("books_list", result.data)
        self.assertIn('Leo Tolstoy', result.data)
        self.assertIn("War and Peace", result.data)
        self.assertIn("A great art by Leo Tolstoy", result.data)
        self.assertIn("2005", result.data)

    def test_search_by_genre(self):
        """Test search books by genre."""

        result = self.client.get("/get-genre-books?genre=Fiction")
        self.assertEqual(result.status_code, 200)
        self.assertIn("books_list", result.data)
        self.assertIn('Fiction', result.data)
        self.assertIn("War and Peace", result.data)
        self.assertIn("some url", result.data)
        self.assertIn("230", result.data)

    def test_search_years_by_award(self):
        """Test search award years by award id."""

        result = self.client.get("/get-award-year?id=1")
        self.assertEqual(result.status_code, 200)
        self.assertIn("award", result.data)
        self.assertIn("The NYT newspaper is a big publication that every year sets the best 10 books of the year", result.data)
        self.assertIn("years_list", result.data)
        self.assertIn("2010", result.data)
        self.assertIn("The New York Times", result.data)

    def test_search_books_by_year(self):
        """Test search books by award year."""

        result = self.client.get("/get-books?year=2010&award_id=1")
        self.assertEqual(result.status_code, 200)
        self.assertIn("books_list", result.data)
        self.assertIn("A great art by Leo Tolstoy", result.data)
        self.assertIn("2005", result.data)
        self.assertIn("some url", result.data)
        self.assertIn("en", result.data)

    def test_get_authors_bio(self):
        """Test get author's bio by the chosen book."""

        result = self.client.get("/get-authors-bio?author_id=1")
        self.assertEqual(result.status_code, 200)
        self.assertIn("author_bio", result.data)
        self.assertIn("Leo Tolstoy is a famous Russian author", result.data)

    def test_get_goodreads_reviews(self):
        """Test get goodreads review of the selected book."""

        result = self.client.get("/get-goodreads-reviews?title=War and Peace")
        self.assertEqual(result.status_code, 200)
        self.assertIn("goodreads_widget", result.data)


if __name__ == "__main__":
    import unittest

    unittest.main()
