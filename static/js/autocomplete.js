// JS, JQuery and AJAX calls for Best Books

///////////////////// LOADING BOOK AUTOCOMPLETE ////////////////////////

$(function () { // this is the jquery shortcut for document.ready()

    // when the page is loaded the list of current books titles is loaded from the database
    // and will appear in the auto complete drop down menu
    function bookAutoComplete(evt) {

        // get request for the current books' titles list from the server
        $.get("/book-auto-complete", showAutoComplete);
    }

    // show user auto complete
    function showAutoComplete(result) {

        // list of books' titles from the server
        var titles = result.titles_list;

        // using jquery autocomplete widget to represent book search autocomplete
        $('#books-autocomplete').autocomplete({
            autoFocus: true,
            source: titles,
            minLength: 1
        });
    }

    var functionCall = bookAutoComplete();

///////////////////// LOADING AUTHOR AUTOCOMPLETE ////////////////////////

    // when the page is loaded the list of current authors' names is loaded from the database
    // and will appear in the auto complete drop down menu
    function authorAutoComplete(evt) {

        // get request for the current authors' names list from the server
        $.get("/author-auto-complete", showAuthorAutoComplete);
    }

    // show user auto complete
    function showAuthorAutoComplete(result) {

        // list of authors' names from the server
        var names = result.names_list;

        // using jquery autocomplete widget to represent author's books search autocomplete
        $('#authors-autocomplete').autocomplete({
            autoFocus: true,
            source: names,
            minLength: 1
        });
    }

    var authorCall = authorAutoComplete();

/////////////////////// LOADING GENRES AUTOCOMPLETE /////////////////////////////

    // when the page is loaded the list of genres is loaded from the database
    // and will appear in the auto complete drop down manu
    function genresAutoComplete(evt) {
        
        // get request for the available genres list from the server
        $.get("/genre-auto-complete", showGenreAutoComplete);
    }

    // show user auto complete
    function showGenreAutoComplete(result) {

        // list of genres from the server
        var genres = result.genres_list;

        // using jquery autocomplete widget to represent books by genre search autocomplete
        $('#genres-autocomplete').autocomplete({
            autoFocus: true,
            source: genres,
            minLength: 1
        });
    }

    var genresCall = genresAutoComplete();

//////////////////////// SHOWING BOOK INFO BASE ON A SEARCH  /////////////////////////
    
    // send request to the server to get info about selected book
    function submitSelectedResults(evt, result) {
        
        // adding some user experience functionality
        // so user will see only book information only
        $('#book-info').show();
        $("#award-years").hide();
        $("#books").hide();
        $("#award-info").hide();

        // getting value of the chosen title from the autocomplete
        var title = result.item.value;

        // get request for the chosen book information from the server
        $.get("/get-book-info", {"title": title}, showBookInfo);
    }

    // show book information 
    function showBookInfo(result) {

        // information received from the server
        var id = result.id;
        var title = result.title;
        var image = result.url;
        var description = result.description;
        var pages = result.pages;
        var published = result.published;
        var authors = result.author;
        var genre = result.genre;
        var awards = result.awards;

        // if a book has no image or has a default noimage cover from goodreads
        // replace it with the kitten image
        if (image === null) {
            image = "https://placekitten.com/g/250/400";
        } else if (image.includes("/assets/nophoto/book/")) {
            image = "https://placekitten.com/g/250/400";
        }

        // creating an empty list to push our authors element to
        var author_list = [];
        // itterating through the authors list and getting the needed info
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
                author_list.push("<a id= " + author_id + " class='authors'><b>" + author_name + " </b><i class='glyphicon glyphicon-plus'></i></b>");
            }
        }

        // joining all the authors elements from the author_list with comma,
        // so this way authors represented in nice format with commas in the right places
        var all_authors = author_list.join(", ");

        // creating an empty list to push our award element to
        var award_list = [];
        // itterating through the awards list and getting the needed info
        for (var j=0; j< awards.length; j++) {

            var year = awards[j].year;
            var book_award = awards[j].award;
            // convirting each award into html element and pushing it
            // to the award_list
            award_list.push("<em class='book_awards'>"+ year + " by " + book_award +"</em>");
        }

        // joining all the awards elements from the award_list with comma,
        // so this way awards are represented in nice format with commas in the right places
        var all_book_awards = award_list.join(", ");

        // if a book doesn't have pages information, then it won't be added to the DOM
        if (pages !== null) {
                $('#pages').html("Handcover, " + pages + " pages");
            }
        // adding all the selected book info to the DOM
        $('#book_image').attr('src', image);
        $('#book_title').html(title);
        $('#authors').html("by " + all_authors);
        $('#description').html(description);
        $('#published').html("Published in " + published);
        $('#genre').html("Genre: " + genre);
        $('#book_award').html("Book received an award in " + all_book_awards);
        
        // adding DOM changes when the book info is shown  
        $("#books-autocomplete").val("");
        $("#goodreads-reviews").empty();
        $("#bio").empty();
        $("#bio").hide();

        // adding animation to scroll to the newly shown book information
        $('html,body').animate({scrollTop: $("#book_image").offset().top}, 1000,'swing');

        // adding click events to the newly created html elements 
        $('a.authors').on("click", getBio);
        $('#reviews').on("click", getReviews);
    }

    // from autocomplete on book title selection call submitSelectedResults function
    $("#books-autocomplete").on( "autocompleteselect", submitSelectedResults);

/////////////////// SHOWING AUTHOR BIOGRAPHY BASE ON THE BOOK INFO ////////////////////
    
    // getting biography info from the server
    function getBio(evt) {
        
        // empty gio div in case there was previously added info
        $("#bio").empty();

        // this is the id of the author we clicked
        var authorId = this.id;

        // requesting author's bio from the server base on author's id
        $.get("/get-authors-bio", {"author_id": authorId}, showAuthorBio);
    }

    function showAuthorBio(result) {

        // author's bio returned from the server
        var biography = result.author_bio;
        
        // adding bio info to the DOM
        $("#bio").html("<em>" + biography + "</em>");
        $("#bio").toggle();
    }

///////////////// SHOWING REVIEWS BASE ON SELECTED BOOK ///////////////////
    
    // getting goodreads reviews widget from the server
    function getReviews(evt) {
        
        // adding UX functionality, so user can see reviews button
        // empty goodreads-reviews div in case there was previously added info
        $("#reviews").show();
        $("#goodreads-reviews").empty();

        // get the currently selected book title 
        var title = $(this).parent().children('#book_title').html();

        // requesting current book goodreads reviews from the server base on the book title
        $.get("/get-goodreads-reviews", {"title": title}, showGoodreadsReview);
    }

    function showGoodreadsReview(result) {

        // goodreads book reviews widget returned from the server
        var widget = result.goodreads_widget;
        
        // adding the widget to the DOM
        $("#goodreads-reviews").html(widget);
    }

////////////////// SHOWING BOOKS LIST BASE ON SEARCH FROM AUTHOR AUTOCOMPLETE //////////////

    function submitSelectedAuthor(evt, result) {
        
        // adding UX functionality to the page
        $('#book-info').hide();
        $("#award-years").hide();
        $("#books").hide();
        $("#all-books").empty();
        $("#award-info").hide();

        // getting author's name value from the autocomplete
        var name = result.item.value;

        // requesting all the books from the server base 
        // on the author's name 
        $.get("/get-author-books", {"name": name}, showAuthorBooks);
    }

    function showAuthorBooks(result) {

        // getting a list of author's books dictionaries and author's name
        var author_books = result.books_list;
        var author_name = result.name;

        // adding UX functionality when showing author's books
        $("#books").show();
        $("#authors-autocomplete").val("");
        $('#by-info').html("<h4>Books that were written by "+ author_name +"</h4>");

        // itterating through the author's books list and getting the needed info
        for (var i = 0; i < author_books.length; i++) {
            var image = author_books[i].url;
            var title = author_books[i].title;
            var book_id = author_books[i].id;
            // if a book has no image or has a default no-image cover from goodreads
            // replace it with a kitten image
            if (image === null) {
                image = "https://placekitten.com/g/100/150";
            } else if (image.includes("/assets/nophoto/book/")) {
                image = "https://placekitten.com/g/100/150";
            }
            // creating book html elements and adding them to the DOM
            $('#all-books').append("<div id= " + book_id + " class='col-md-2 books'><img src=" + image + " alt='Pretty book image' class='book-image'><h6>" + title + "</h6></div>");
        }

        // adding animation to scroll to the chosen author's books 
        $('html,body').animate({scrollTop: $("#books").offset().top}, 1000,'swing');
        // adding click events to the newly created html books elements 
        $('.books').on("click", getBook);
    }

    // on submitting author's name from autocomplete search, call submitSelectedAuthor function 
    $("#authors-autocomplete").on( "autocompleteselect", submitSelectedAuthor);

///////////////// SHOWING BOOKS LIST BASE ON SEARCH FROM GENRES AUTOCOMPLETE //////////////

    function submitSelectedGenre(evt, result) {
        
        // adding UX functionality on the genre select
        $('#book-info').hide();
        $("#award-years").hide();
        $("#books").hide();
        $("#all-books").empty();
        $("#award-info").hide();

        // getting genre value from the autocomplete
        var genre = result.item.value;

        // requesting all the books from the server base 
        // on the selected genre
        $.get("/get-genre-books", {"genre": genre}, showGenreBooks);
    }

    function showGenreBooks(result) {

        // getting a list of genre books dictionaries and genre from the server
        var genre_books = result.books_list;
        var genre_name = result.genre;
        
        // adding UX functionality when showing the books
        $("#books").show();
        $("#genres-autocomplete").val("");
        $('#by-info').html("<h4>"+ genre_name +" books:</h4>");

        // itterating through the books by genre list and getting the needed info
        for (var i = 0; i < genre_books.length; i++) {
            var image = genre_books[i].url;
            var title = genre_books[i].title;
            var book_id = genre_books[i].id;
            // if a book has no image or has a default no-image cover from goodreads
            // replace it with a kitten image
            if (image === null) {
                image = "https://placekitten.com/g/100/150";
            } else if (image.includes("/assets/nophoto/book/")) {
                image = "https://placekitten.com/g/100/150";
            }

            $('#all-books').append("<div id= " + book_id + " class='col-md-2 books'><img src=" + image + " alt='Pretty book image' class='book-image'><h6>" + title + "</h6></div>");
        }

        // adding animation to scroll to the chosen books by genre 
        $('html,body').animate({scrollTop: $("#books").offset().top}, 1000,'swing');
        // adding click events to the newly created html books elements 
        $('.books').on("click", getBook);
    }

    // on submitting genre from autocomplete search, call submitSelectedGenre function 
    $("#genres-autocomplete").on( "autocompleteselect", submitSelectedGenre);

////////////////// SHOWING AWARD YEARS BASE ON CHOSEN AWARD /////////////////////

    function getAwardYears(evt) {

        // this is the id on the award we clicked
        var id = this.id;

        // if any of the info from the book search is 
        // still on the page, it should disappear when an eward is choosen 
        $("#book-info").hide();
        $("#books").hide();
        $("#award-info").hide();
        // since we are usuing append for the years buttons, every time when 
        // award is clicked we are cleaning the previous years from the div 
        // and appending the new ones
        $("#award-years").empty();

        // requesting years from the server base on the selected award id
        $.get("/get-award-year", {'id': id}, showAwardYears);
    }

    function showAwardYears(result) {
        $("#award-years").show();
        $("#award-info").show();
        
        // getting a list of years, award name and award description from the server
        var years = result.years_list;
        var award = result.award.description;
        var awardName = result.award.name;

        // Adding award description and further instructions to the DOM
        $("#award-info").html(award + "<br> Choose any year under to check the books were awarded by " + awardName);
        // itterating through the years list and adding them as buttons to the DOM
        for (var i = 0; i < years.length -1; i++) {
            $('#award-years').append("<button id="+ years[i] + " data-award=" + years[years.length-1] + " class='year-button'>" + years[i] + "</button>" + "   ");
        }
        
        // adding animation to scroll to the chosen books by genre 
        $('html,body').animate({scrollTop: $("#award-info").offset().top}, 1000,'swing');

        // adding an event listener to the newly created buttons right away within
        // this current function, otherwise JS will ignore it outside of the function
        // scope, since the buttons are existing in the html, but created as a result of 
        // award choosing
        $('.year-button').on("click", getBooks);

    }

    // award years are shown only if an award image is clicked
    $('.award-image').click(getAwardYears);

///////////// SHOWING BOOKS LIST BASE ON CHOSEN YEAR WITHIN CHOSEN AWARD //////////////

    function getBooks(evt) {
        
        var award_year = this.id; // this is the id on the year we clicked
        var award_id = $(this).attr("data-award"); //current award id

        // creating a dictionary of the variables so it will be passed to the server
        var awardInfo = {
            'year': award_year,
            'award_id': award_id
        };
        // requesting books from the server base on the selected award years
        $.get("/get-books", awardInfo, showYearBooks);
    }

    function showYearBooks(result) {

        // adding UX functionality to the page
        $("#all-books").empty();
        $("#books").show();
        $("#book-info").hide();
        
        // getting a list of books dictionaries from the server
        var year_books = result.books_list;
        // itterating through the books list
        for (var i = 0; i < year_books.length; i++) {
            var image = year_books[i].url;
            var title = year_books[i].title;
            var book_id = year_books[i].id;
            // if a book has no image or has a default no-image cover from goodreads
            // replace it with a kitten image
            if (image === null) {
                image = "https://placekitten.com/g/100/150";
            } else if (image.includes("/assets/nophoto/book/")) {
                image = "https://placekitten.com/g/100/150";
            }
            // adding each book as an html element to the DOM
            $('#all-books').append("<div id= " + book_id + " class='col-sm-2 books'><img src=" + image + " alt='Pretty book image' class='book-image'><h6>" + title + "</h6></div>");
        }

        // adding animation to scroll to the chosen books by chosen award year 
        $('html,body').animate({scrollTop: $("#books").offset().top}, 1000,'swing');

        // adding an event listener to the newly created books list right away within
        // this current function, otherwise JS will ignore it outside of the function
        // scope, since the books are existing in the html, but created as a result of 
        // year choosing
        $('.books').on("click", getBook);
    }


///////// REQUESTING A BOOK INFO BASE ON SEARCH FROM BOOK LIST ///////////

    function getBook(evt) {
        
        $("#book-info").show();

        // get book title of the clicked book
        var book_title = $(this).text();

        // requesting book info from the server base on the selected book title
        // responce from the server will be shown by showBookInfo function that was
        // defined earlier on 
        $.get("/get-book-info", {"title": book_title}, showBookInfo);
    }


////////////////////// EXTRA UX AND UI FUNCTIONALITY ///////////////////////////

    // clear all the data from the input box if it's unfocused
    $('input').focusout(function(){
        $(this).val('');
    });


    // ===== Scroll to Top ==== 
    $(window).scroll(function() {
        if ($(this).scrollTop() >= 50) {       // If page is scrolled more than 50px
            $('#return-to-top').fadeIn(200);    // Fade in the arrow
        } else {
            $('#return-to-top').fadeOut(200);   // Else fade out the arrow
        }
    });

    // goes to the top if clicked on the "Top" link in the nav bar
    // or clicked on the side arrow button
    $('#top-scroll, #return-to-top').on('click', function(){
        $('html,body').animate({scrollTop: 0}, 1000,'swing');
    });

});
