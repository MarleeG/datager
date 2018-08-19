$(document).ready(function () {
    $(".delete-button").on("click", function () {
        var id = $(this).attr("data-id");
        console.log("button clicked!", id);


        $.ajax("/api/saved-notes/" + id, {
            type: "DELETE"
        }).then(
            function () {
                // Reload the page to get the updated list
                location.reload();
            }
        );
    });
});
