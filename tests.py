import json
from unittest import TestCase
from model import Book, connect_to_db, db, example_data
from server import app
import server


class FlaskTestsBasic(TestCase):
    """Flask tests."""

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


class FlaskTestsDatabase(TestCase):
    """Flask tests that use the database."""

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

    def test_find_book(self):
        """Can we find a book in the sample data?"""

        book = Book.query.filter(Book.title == "War and Peace").first()
        self.assertEqual(book.title, "War and Peace")


class AjaxServerTestCase(TestCase):
    """Flask tests that use the database."""

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

        result = self.client.get("/get-book-info", data={"title": "War and Peace"})
        print result
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.content_type, 'application/json')
        data = json.loads(result.data)
        self.assertEqual(data, {'title': 'War and Peace',
                                'description': "A great art by Leo Tolstoy",
                                'pages': 230,
                                'published': 2005,
                                'language': 'en',
                                'author': 'Leo Tolstoy',
                                'genre': 'Fiction',
                                'awards': "The New York Times"})

    #     # AssertionError: 404 != 200
    #     # AttributeError: 'NoneType' object has no attribute 'authors'






if __name__ == "__main__":
    import unittest

    unittest.main()
