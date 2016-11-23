import json
from unittest import TestCase
from model import connect_to_db, db, example_data
from server import app
import server


class FlaskTestsBasic(TestCase):
    """Flask tests."""

    def setUp(self):
        """Stuff to do before every test."""

        # Get the Flask test client
        self.client = app.test_client()
        connect_to_db(app)

        # Show Flask errors that happen during tests
        app.config['TESTING'] = True

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

    def test_book_autocomplete(self):
        """Test books page."""

        result = self.client.get('/book-auto-complete')

        self.assertEqual(result.status_code, 200)
        self.assertIn("titles_list", result.data)
        self.assertIn("War and Peace", result.data)
        # print result.data

    # def test_departments_details(self):
    #     """Test departments page."""

    #     result = self.client.get("/department/fin")
    #     self.assertIn("Phone: 555-1000", result.data)


    # def test_login(self):
    #     """Test login page."""

    #     result = self.client.post("/login",
    #                               data={"user_id": "rachel", "password": "123"},
    #                               follow_redirects=True)
    #     self.assertIn("You are a valued user", result.data)





if __name__ == "__main__":
    import unittest

    unittest.main()
