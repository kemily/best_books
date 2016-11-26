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

///////////////////// LOADING GENRES AUTOCOMPLETE ////////////////////////

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

//////////////// SUBMITTING AND SHOWING BOOK INFO BASE ON A SEARCH  ///////////////////
    
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

    
    function showBookInfo(result) {

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
                author_list.push("<a id= " + author_id + " class='authors'><b>" + author_name + " </b><i class='glyphicon glyphicon-plus'></i></b>");
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

        if (pages !== null) {
                $('#pages').html("Handcover, " + pages + " pages");
            }
        
        $('#book_image').attr('src', image);
        $('#book_title').html(title);
        $('#authors').html("by " + all_authors);
        $('#description').html(description);
        $('#published').html("Published in " + published);
        $('#genre').html("Genre: " + genre);
        $('#book_award').html("Book received an award in " + all_book_awards);
        
        $("#books-autocomplete").val("");
        $("#goodreads-reviews").empty();
        $("#bio").empty();
        $("#bio").hide();

        $('html,body').animate({scrollTop: $("#book_image").offset().top}, 1000,'swing');

        $('a.authors').on("click", getBio);
        $('#reviews').on("click", getReviews);
        
    }

    // from autocomplete on book title selection call submitSelectedResults function
    $("#books-autocomplete").on( "autocompleteselect", submitSelectedResults);

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
        $("#award-info").hide();

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

            $('#all-books').append("<div id= " + book_id + " class='col-md-2 books'><img src=" + image + " alt='Pretty book image' class='book-image'><h6>" + title + "</h6></div>");
        }

        $("#authors-autocomplete").val("");
        $('#by-info').html("<h4>Books that were written by "+ author_name +"</h4>");

        $('html,body').animate({scrollTop: $("#books").offset().top}, 1000,'swing');
        
        console.log( "authocomplete is empty - "  +  $("#authors-autocomplete").val(""));

        $('.books').on("click", getBook);

    }

    $("#authors-autocomplete").on( "autocompleteselect", submitSelectedAuthor);

//////////// SUBMITTING AND SHOWING BOOKS LIST BASE ON SEARCH FROM GENRES AUTOCOMPLETE ///////////

    function submitSelectedGenre(evt, result) {
        
        console.log("submitting selected genre to the server!");
        
        $('#book-info').hide();
        $("#award-years").hide();
        $("#books").hide();
        $("#all-books").empty();
        $("#award-info").hide();

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

            $('#all-books').append("<div id= " + book_id + " class='col-md-2 books'><img src=" + image + " alt='Pretty book image' class='book-image'><h6>" + title + "</h6></div>");
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

//////////// SUBMITTING AND SHOWING AWARD YEARS BASE ON CHOSEN AWARD ///////////


    function getAwardYears(evt) {
        evt.preventDefault();
        console.log("Getting years from the server");

        var id = this.id; // this is the id on the award we clicked
        console.log("the id is " + id);

        // if any of the info from the book search is 
        // still on the page, it should disappear when an eward is choosen 
        $("#book-info").hide();
        $("#books").hide();
        $("#award-info").hide();

        // since we are usuing append for the years buttons, every time when 
        // award is clicked we are cleaning the previous years from the div 
        // and appending the new ones
        $("#award-years").empty();

        $.get("/get-award-year", {'id': id}, showAwardYears);
    }

    function showAwardYears(result) {
        $("#award-years").show();
        $("#award-info").show();
    
        var years = result.years_list;
        var award = result.award.description;
        var awardName = result.award.name;

        for (var i = 0; i < years.length -1; i++) {
            $('#award-years').append("<button id="+ years[i] + " data-award=" + years[years.length-1] + " class='year-button'>" + years[i] + "</button>" + "   ");
        }

        $("#award-info").html(award + "<br> Choose any year under to check the books were awarded by " + awardName);
        
        $('html,body').animate({scrollTop: $("#award-info").offset().top}, 1000,'swing');

        // adding an event listener to the newly created buttons right away within
        // this current function, other wise JS will ignore it outside of the function
        // scope, since the buttons are existing in the html, but created as a result of 
        // award choosing
        $('.year-button').on("click", getBooks);

    }

    $('.award-image').click(getAwardYears);


/////// SUBMITTING AND SHOWING BOOKS LIST BASE ON CHOSEN YEAR WITHIN CHOSEN AWARD ////////


    function getBooks(evt) {

        console.log("Getting books from the server");
        
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
        $("#book-info").hide();
        
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

            $('#all-books').append("<div id= " + book_id + " class='col-sm-2 books'><img src=" + image + " alt='Pretty book image' class='book-image'><h6>" + title + "</h6></div>");
        }

        $('html,body').animate({scrollTop: $("#books").offset().top}, 1000,'swing');

        // adding an event listener to the newly created books list right away within
        // this current function, otherwise JS will ignore it outside of the function
        // scope, since the books are existing in the html, but created as a result of 
        // year choosing
        $('.books').on("click", getBook);
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

        $('#book-info').hide();
        $("#award-years").hide();
        $("#books").hide();
        $("#award-info").hide();
    }

    $('.navbar-brand').on('click', setToDefault);

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
    // or clicked on the arrow
    $('#top-scroll, #return-to-top').on('click', function(){
        $('html,body').animate({scrollTop: 0}, 1000,'swing');
    });

});
