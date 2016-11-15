// AJAX for Best Books

$(function () { // this is the jquery shortcut for document.ready()

    // when the page is loaded the 
    function bookAutoComplete(evt) {
        console.log("doing autocomplete magic!");

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



    function submitSelectedResults(evt, result) {
        console.log("submitting the result to the server!");
        
        $('#book-info').show();
        var title = result.item.value;
        console.log(title);
        $.get("/get-book-info", {"title": title}, showBookInfo);
    }

    function showBookInfo(result) {
        console.log("Hey " + result.title);
        var id = result.id;
        var title = result.title;
        var image = result.url;
        var description = result.description;
        var pages = result.pages;
        var published = result.published;
        var authors = result.author;
        
    
        console.log(title, image, authors);

        $("#award-years").hide();
        // $("#award-years").css('display', 'none');
        $('#book_image').attr('src', image);
        $('#book_title').html(title);
        $('#authors').html("by " + authors);
        $('#description').html(description);
        $('#pages').html("Handcover, " + pages + " pages");
        $('#published').html("Published in " + published);
        
        $("#books-autocomplete").val("");

        console.log($("#books-autocomplete").val(""));
    }

    $("#books-autocomplete").on( "autocompleteselect", submitSelectedResults);



    function getAwardYears(evt) {
        evt.preventDefault();
        console.log("Getting years from the server");


        var id = this.id; // this is the id on the image we clicked
        console.log("the id is " + id);

        // if any of the info from the book search of books search by author is 
        // still on the page, it should disappear when an eward is choosen 
        $("#book-info").hide();
        // $("#book-info").css('display', '');

        $("#books").hide();
        // $("#books").css('display', 'none');

        // since we are usuing append for the years buttons, every time when 
        // award is clicked we are cleaning the previous years from the div 
        // and appending the new ones
        $("#award-years").empty();
        // $("#award-years").css('display', 'none');

        $.get("/get-award-year", {'id': id}, showAwardYears);
    }

    function showAwardYears(result) {
        $("#award-years").show();

        var years = result.years_list;

        for (var i = 0; i < years.length -1; i++) {
            $('#award-years').append("<button id="+ years[i] + " data-award=" + years[years.length-1] + " class='year-button'>" + years[i] + "</button>" + "   ");
        }

        // adding an event listener to the newly created buttons right away within
        // this current function, other wise JS will ignore it outside of the function
        // scope, since the buttons are existing in the html, but created as a result of 
        // award choosing
        $('.year-button').on("click", getBooks);

    }

    $('.award-image').click(getAwardYears);



    function getBooks(evt) {
        console.log("Getting books from the server");

        $("#books").empty();

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

        var books = result.books_list;

        for (var i = 0; i < books.length; i++) {
            var image = books[i].url;
            var title = books[i].title;
            var book_id = books[i].id;

            $('#books').append("<span id= " + book_id + "><img src=" + image + " alt=" + title + " class='book-image'><h5>" + title + "</h5></span>");
        }

        // adding an event listener to the newly created buttons right away within
        // this current function, other wise JS will ignore it outside of the function
        // scope, since the buttons are existing in the html, but created as a result of 
        // award choosing
        // $('.year-button').on("click", getBooks);

    }

    
});


// ///////////////////////////////// EXTRA STUFF ////////////////////////


