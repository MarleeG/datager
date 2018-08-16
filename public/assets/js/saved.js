$(document).ready(function () {
    console.log("ready!");

    $("#home-link").removeClass("active");

    // db.articles.find()

    $.get("/saved-notes", function (){

    });



    $("#notes").empty();
        // Save the id from the p tag
        // var thisId = $(this).attr("data-id");

        // Now make an ajax call for the Article



        $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
            // With that done, add the note information to the page
            .then(function (data) {

                console.log(data);
                // The title of the article
                $("#notes").append("<h2>" + data.title + "</h2>");
                // An input to enter a new title
                $("#notes").append("<p id='titleinput' name='title' > </p>");
                // A textarea to add a new note body
                $("#notes").append("<p id='bodyinput' name='body'></p>");
                // A button to submit a new note, with the id of the article saved to it
                $("#notes").append(`<button type="button" class="btn btn-outline-dark btn-sm" data-id=${data._id} id='savenote'>Save Note</button>`);
                $("#notes").append(`<button type="button" class="btn btn-outline-info btn-sm ml-3" data-id=${data._id} id='savearticle'>Save Article</button>`)

                // If there's a note in the article
                if (data.note) {
                    // Place the title of the note in the title input

                    $("#titleinput").val(data.note.title);
                    // Place the body of the note in the body textarea
                    $("#bodyinput").val(data.note.body);
                }

    });
});
