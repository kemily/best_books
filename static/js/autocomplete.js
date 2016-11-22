// AJAX for Best Books

///////////////////// LOADING BOOK AUTOCOMPLETE ////////////////////////

$(function () { // this is the jquery shortcut for document.ready()

    // when the page is loaded the list of books titles is loaded from the database
    // and will appear in the auto complete drop down manu
    function bookAutoComplete(evt) {
        console.log("doing book autocomplete magic!");

        $.get("/book-auto-complete", showAutoComplete);
    }

    function showAutoComplete(result) {

        console.log("YAY!");

        var titles = result.titles_list;

        $('#books-autocomplete').autocomplete({
            source: titles,
            minLength: 1
        }); // give our user auto complete

    }

    var functionCall = bookAutoComplete();



///////////////////// LOADING AUTHOR AUTOCOMPLETE ////////////////////////


    // when the page is loaded the list of books authors is loaded from the database
    // and will appear in the auto complete drop down manu
    function authorAutoComplete(evt) {
        console.log("doing author autocomplete magic!");

        $.get("/author-auto-complete", showAuthorAutoComplete);
    }

    function showAuthorAutoComplete(result) {

        console.log("Showing author's book");

        var names = result.names_list;

        $('#authors-autocomplete').autocomplete({
            source: names,
            minLength: 1
        }); // give our user auto complete
    }

    var authorCall = authorAutoComplete();

///////////////////// LOADING GENRES AUTOCOMPLETE ////////////////////////

    // when the page is loaded the list of genres is loaded from the database
    // and will appear in the auto complete drop down manu
    function genresAutoComplete(evt) {
        console.log("doing genres autocomplete magic!");

        $.get("/genre-auto-complete", showGenreAutoComplete);
    }

    function showGenreAutoComplete(result) {

        console.log("Genres are getting back from the server!");

        var genres = result.genres_list;

        $('#genres-autocomplete').autocomplete({
            source: genres,
            minLength: 1
        }); // give our user auto complete

    }

    var genresCall = genresAutoComplete();



//////////// SUBMITTING AND SHOWING BOOK INFO BASE ON SEARCH FROM AUTOCOMPLETE ///////////

    function submitSelectedResults(evt, result) {
        console.log("submitting the result to the server!");
        
        $('#book-info').show();
        $("#award-years").hide();
        $("#books").hide();

        var title = result.item.value;
        console.log(title);

        $.get("/get-book-info", {"title": title}, showBookInfo);
    }

    function showBookInfo(result) {

        console.log("Received book info from the server");


        var id = result.id;
        var title = result.title;
        var image = result.url;
        var description = result.description;
        var pages = result.pages;
        var published = result.published;
        var authors = result.author;
        var genre = result.genre;
        var awards = result.awards;

        if (image === null) {
            image = "https://placekitten.com/g/250/400";
        } else if (image.includes("/assets/nophoto/book/")) {
            image = "https://placekitten.com/g/250/400";
        }

        // creating an empty list to push our authors element to
        var author_list = [];
        // itterating over the authors list and getting the needed info
        for (var i = 0; i < authors.length; i++) {

            var author_name = authors[i].name;
            var biography = authors[i].biography;
            var author_id = authors[i].authorId;

            // checking if an author has bio
            // base on that, convirting each author name into html element and pushing them
            // to the author_list
            if (biography === null) {
                author_list.push("<em id= " + author_id + " class='authors'>"+ author_name +"</em>");
            } else {
                author_list.push("<a id= " + author_id + " class='authors'><b>" + author_name + "</b></a>");
            }
        }
        // joining all the authors elements from the author_list with comma,
        // so this way authors represented in nice format with commas in the right places
        var all_authors = author_list.join(", ");

        // creating an empty list to push our award element to
        var award_list = [];
        // itterating over the awards list and getting the needed info
        for (var j=0; j< awards.length; j++) {

            var year = awards[j].year;
            var book_award = awards[j].award;
            
            // checking if an author has bio
            // base on that, convirting each author name into html element and pushing them
            // to the author_list
            award_list.push("<em class='book_awards'>"+ year + " by " + book_award +"</em>");
        }

        // joining all the awards elements from the author_list with comma,
        // so this way award represented in nice format with commas in the right places
        var all_book_awards = award_list.join(", ");

        
        $('#book_image').attr('src', image);
        $('#book_title').html(title);
        $('#authors').html("by " + all_authors);
        $('#description').html(description);
        $('#pages').html("Handcover, " + pages + " pages");
        $('#published').html("Published in " + published);
        $('#genre').html("Genre: " + genre);
        $('#book_award').html("Book received an award in " + all_book_awards);
        
        $("#books-autocomplete").val("");
        $("#goodreads-reviews").empty();

        $('html,body').animate({scrollTop: $("#book_image").offset().top}, 1000,'swing');

        $('a.authors').on("click", getBio);
        $('#reviews').on("click", getReviews);
        
        // stop the click event from bubbling to the document click event that hides
        // all the data from the page
        $('#book-info').on('click', function(evt) {
            evt.stopPropagation();
        });
    }

    $("#books-autocomplete").on( "autocompleteselect", submitSelectedResults);

    // stop the click event from bubbling to the document click event that hides
    // all the data from the page
    $('#books-autocomplete').on('autocompleteselect', function(evt) {
        evt.stopPropagation();
    });


//////////// SUBMITTING AND SHOWING AUTHOR BIOGRAPHY BASE ON BOOK INFO ///////////

    function getBio(evt) {
        console.log("Getting bio of the author from the server");
        $("#bio").empty();

        var authorId = this.id; // this is the id of the author we clicked

        console.log("Author id is " + authorId);

        $.get("/get-authors-bio", {"author_id": authorId}, showAuthorBio);
    }

    function showAuthorBio(result) {

        var biography = result.author_bio;
        
        $("#bio").html("<em>" + biography + "</em>");
        $("#bio").toggle();

    }

//////////// SUBMITTING AND SHOWING REVIEWS BASE ON SELECTED BOOK ///////////

    function getReviews(evt) {

        evt.stopPropagation();
        
        $("#reviews").show();

        console.log("Getting goodreads reviews of the book from the server");
        $("#goodreads-reviews").empty();

        var title = $(this).parent().children('#book_title').html();

        console.log("Get review of the book "+ title);

        $.get("/get-goodreads-reviews", {"title": title}, showGoodreadsReview);
    }

    function showGoodreadsReview(result) {

        var widget = result.goodreads_widget;
        
        $("#goodreads-reviews").html(widget);

    }

//////////// SUBMITTING AND SHOWING BOOKS LIST BASE ON SEARCH FROM AUTHOR AUTOCOMPLETE ///////////

    function submitSelectedAuthor(evt, result) {
        
        console.log("submitting the author to the server!");
        
        $('#book-info').hide();
        $("#award-years").hide();
        $("#books").hide();
        $("#all-books").empty();

        var name = result.item.value;
        console.log(name);

        $.get("/get-author-books", {"name": name}, showAuthorBooks);
    }

    function showAuthorBooks(result) {
        console.log("Author's books are " + result);

        $("#books").show();

        // getting a list of author's books dictionaries
        var author_books = result.books_list;
        var author_name = result.name;

        for (var i = 0; i < author_books.length; i++) {
            var image = author_books[i].url;
            var title = author_books[i].title;
            var book_id = author_books[i].id;

            if (image === null) {
                image = "https://placekitten.com/g/100/150";
            } else if (image.includes("/assets/nophoto/book/")) {
                image = "https://placekitten.com/g/100/150";
            }

            console.log(title);

            $('#all-books').append("<div id= " + book_id + " class='col-md-2 books'><h5>" + title + "</h5><img src=" + image + " alt='Pretty book image' class='book-image'></div>");
        }

        $("#authors-autocomplete").val("");
        $('#by-info').html("<h4>Books that were written by "+ author_name +"</h4>");

        $('html,body').animate({scrollTop: $("#books").offset().top}, 1000,'swing');
        
        console.log( "authocomplete is empty - "  +  $("#authors-autocomplete").val(""));

        $('.books').on("click", getBook);

        // stop the click event from bubbling to the document click event that hides
        // all the data from the page
        $('.books').on('click', function(evt) {
            evt.stopPropagation();
        });

    }

    $("#authors-autocomplete").on( "autocompleteselect", submitSelectedAuthor);

    // stop the click event from bubbling to the document click event that hides
    // all the data from the page
    $('#authors-autocomplete').on('autocompleteselect', function(evt) {
        evt.stopPropagation();
    });

//////////// SUBMITTING AND SHOWING BOOKS LIST BASE ON SEARCH FROM GENRES AUTOCOMPLETE ///////////

    function submitSelectedGenre(evt, result) {
        
        console.log("submitting selected genre to the server!");
        
        $('#book-info').hide();
        $("#award-years").hide();
        $("#books").hide();
        $("#all-books").empty();

        var genre = result.item.value;
        console.log(genre);

        $.get("/get-genre-books", {"genre": genre}, showGenreBooks);
    }

    function showGenreBooks(result) {
        console.log("Genre books are " + result);

        $("#books").show();

        // getting a list of genre books dictionaries and genre 
        var genre_books = result.books_list;
        var genre_name = result.genre;

        $('#by-info').html("<h4>"+ genre_name +" books:</h4>");

        for (var i = 0; i < genre_books.length; i++) {
            var image = genre_books[i].url;
            var title = genre_books[i].title;
            var book_id = genre_books[i].id;

            if (image === null) {
                image = "https://placekitten.com/g/100/150";
            } else if (image.includes("/assets/nophoto/book/")) {
                image = "https://placekitten.com/g/100/150";
            }

            console.log(title);

            $('#all-books').append("<div id= " + book_id + " class='col-md-2 books'><h5>" + title + "</h5><img src=" + image + " alt='Pretty book image' class='book-image'></div>");
        }

        $("#genres-autocomplete").val("");

        $('html,body').animate({scrollTop: $("#books").offset().top}, 1000,'swing');

        $('.books').on("click", getBook);

        // stop the click event from bubbling to the document click event that hides
        // all the data from the page
        $('.books').on('click', function(evt) {
            evt.stopPropagation();
        });

    }

    $("#genres-autocomplete").on( "autocompleteselect", submitSelectedGenre);

    // stop the click event from bubbling to the document click event that hides
    // all the data from the page
    $('#genres-autocomplete').on('autocompleteselect', function(evt) {
        evt.stopPropagation();
    });

//////////// SUBMITTING AND SHOWING AWARD YEARS BASE ON CHOSEN AWARD ///////////


    function getAwardYears(evt) {
        evt.preventDefault();
        console.log("Getting years from the server");

        var id = this.id; // this is the id on the image we clicked
        console.log("the id is " + id);

        // if any of the info from the book search is 
        // still on the page, it should disappear when an eward is choosen 
        $("#book-info").hide();

        $("#books").hide();

        // since we are usuing append for the years buttons, every time when 
        // award is clicked we are cleaning the previous years from the div 
        // and appending the new ones
        $("#award-years").empty();

        $.get("/get-award-year", {'id': id}, showAwardYears);
    }

    function showAwardYears(result) {
        $("#award-years").show();

        var years = result.years_list;

        for (var i = 0; i < years.length -1; i++) {
            $('#award-years').append("<button id="+ years[i] + " data-award=" + years[years.length-1] + " class='year-button'>" + years[i] + "</button>" + "   ");
        }

        // $('html,body').animate({scrollTop: $("#award-years").offset().top}, 1000,'swing');

        // adding an event listener to the newly created buttons right away within
        // this current function, other wise JS will ignore it outside of the function
        // scope, since the buttons are existing in the html, but created as a result of 
        // award choosing
        $('.year-button').on("click", getBooks);

        // stop the click event from bubbling to the document click event that hides
        // all the data from the page
        $('.year-button').on('click', function(evt) {
            evt.stopPropagation();
        });

    }

    $('.award-image').click(getAwardYears);


/////// SUBMITTING AND SHOWING BOOKS LIST BASE ON CHOSEN YEAR WITHIN CHOSEN AWARD ////////


    function getBooks(evt) {

        console.log("Getting books from the server");

        $("#book-info").hide();
        $("#books").hide();
        
        var award_year = this.id; // this is the id on the year we clicked
        var award_id = $(this).attr("data-award");

        var awardInfo = {
            'year': award_year,
            'award_id': award_id
        };

        console.log(awardInfo);

        $.get("/get-books", awardInfo, showYearBooks);
    }


    function showYearBooks(result) {

        $("#all-books").empty();
        $("#books").show();
        
        var year_books = result.books_list;

        for (var i = 0; i < year_books.length; i++) {
            var image = year_books[i].url;
            var title = year_books[i].title;
            var book_id = year_books[i].id;

            if (image === null) {
                image = "https://placekitten.com/g/100/150";
            } else if (image.includes("/assets/nophoto/book/")) {
                image = "https://placekitten.com/g/100/150";
            }

            console.log(title);

            $('#all-books').append("<div id= " + book_id + " class='col-md-2 books'><h5>" + title + "</h5><img src=" + image + " alt='Pretty book image' class='book-image'></div>");
        }

        $('html,body').animate({scrollTop: $("#books").offset().top}, 1000,'swing');

        // adding an event listener to the newly created books list right away within
        // this current function, otherwise JS will ignore it outside of the function
        // scope, since the books are existing in the html, but created as a result of 
        // year choosing
        $('.books').on("click", getBook);

        // stop the click event from bubbling to the document click event that hides
        // all the data from the page
        $('.books').on('click', function(evt) {
            evt.stopPropagation();
        });

    }


///////// SUBMITTING AND SHOWING A BOOK INFO BASE ON SEARCH FROM BOOK LIST ///////////

    function getBook(evt) {
        console.log("Getting book from the server");
        $("#book-info").show();

        var book_title = $(this).text();

        console.log(book_title);

        $.get("/get-book-info", {"title": book_title}, showBookInfo);
    }


///////// HIDES ALL THE DATA IF THE DOCUMENT IS CLICKED OUTSIDE THE NEEDED DIVS ////////////


    function setToDefault(evt) {
        if(!$(evt.target).is('.award-image', '#book-info')) {

        $('#book-info').hide();
        $("#award-years").hide();
        $("#books").hide();
      }
    }

    $(document).on('click', setToDefault);

});
