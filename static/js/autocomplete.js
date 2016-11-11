// AJAX for Best Books

$(function () { // this is the jquery shortcut for document.ready()

    function bookAutoComplete(evt) {
        console.log("doing autocomplete magic!");

        $.get("/book-auto-complete", ShowAutoComplete);
    }

    function ShowAutoComplete(result) {

        console.log("YAY!");

        var titles = result.titles_list;

        $('#books-autocomplete').autocomplete({
            source: titles,
            minLength: 2
        }); // give our user auto complete

    }

    var functionCall = bookAutoComplete();
});

$(function () {
    $('#books-autocomplete').autocomplete({
         source: ;
    });
});



// ///////////////////////////////// EXTRA STUFF ////////////////////////


