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
});

$(function (){

    function submitSelectedREsults(evt, result) {
        console.log("submitting the result to the server!");

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
        
        // Array.isArray(authors);
        console.log(title, image, authors);

        $('#book_image').attr('src', image);
        $('#book_title').html(title);
        $('#authors').html("by " + authors);
        $('#description').html(description);
        $('#pages').html("Handcover, " + pages + " pages");
        $('#published').html("Published in " + published);
        $('#book-info').css('display', 'block');
    }

    $("#books-autocomplete").on( "autocompleteselect", submitSelectedREsults);
});

$(function (){

    function getAwardYears(evt) {
        evt.preventDefault();
        console.log("Getting years from the server");

        var id = this.id; // this is the id on the image we clicked
        console.log("the id is " + id);

        $.get("/get-award-year", {'id': id}, showAwardYears);
    }

    function showAwardYears(result) {

        console.log("Here is the result");

        var years = result.years_list;
        $('#award-years').html('Years: ' + years);
    }

    $('.award-image').click(getAwardYears);
});

// $("#book-info").html(title);

// ///////////////////////////////// EXTRA STUFF ////////////////////////


