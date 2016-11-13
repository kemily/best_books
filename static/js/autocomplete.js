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
        alert("submitting the result to the server!");

        var title = result.item.value;
        console.log(title);
        $.get("/get-book-info", {"title": title}, showBookInfo);
    }

    function showBookInfo(result) {
        console.log("Hey " + result.title);
        var id = result.id;
        var title = result.title;
        var image = result.url;
        console.log(image);
        
        $('#book_image').attr('src', image);
        $('#book_title').append(title);
        $('#book-info').css('display', 'block');
    }

    $("#books-autocomplete").on( "autocompleteselect", submitSelectedREsults);
});



// $("#book-info").html(title);

// ///////////////////////////////// EXTRA STUFF ////////////////////////


