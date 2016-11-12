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
        $.get("/get-book-info", {"title": title}, showBookInfo);

        // $.get("/book-auto-complete", ShowAutoComplete);
    }

    function showBookInfo(result) {

    }

    $("#books-autocomplete").on( "autocompleteselect", submitSelectedREsults);
});

// $(function () {

//     $( "#books-autocomplete" ).on( "autocompleteresponse", function (a, b) {
//                             alert("response");
//                         });

// });

// $("#book-info").html(title);

// ///////////////////////////////// EXTRA STUFF ////////////////////////


