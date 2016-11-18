"""Utility file to seed bestbooks database from award_info file in data/"""
import csv
import datetime
from sqlalchemy import func

from model import Award, connect_to_db, db
from server import app

import os
import sys

def load_award_info():
    """Load books from awardInfo.csv into database."""

    print "Award!"

    # open the csv file and unpack it
    with open("/home/vagrant/src/best_books/data/awardsInfo.csv") as general:
        reader = csv.reader(general)
        #unpacking each row in the file and looping over it.
        for award, description, image in reader:

            # taking off all the white spaces
            image = image.strip()
            award = award.strip()

            # getting an award from the awards table with the current award name
            get_award = Award.query.filter(func.lower(Award.name) == func.lower(award)).first()

            # if we have current award in the database
            # add description and image url to it
            if get_award:
                get_award.description = description
                get_award.image_url = image

        db.session.commit()


if __name__ == "__main__":
    connect_to_db(app)
    db.create_all()


load_award_info()
