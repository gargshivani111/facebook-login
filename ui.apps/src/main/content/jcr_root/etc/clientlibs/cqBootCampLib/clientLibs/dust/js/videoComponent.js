$(document).ready(function () {
    var data = {
        "names": []
    }

    var yearEnum = {
        "years": []
    }

    var searchNumber;
    var source = $("#video-template").html();
    var compiled = dust.compile(source, "intro");
    dust.loadSource(compiled);

    dust.render("intro", data, function (err, out) {
        $("#output").html(out);
    });

    // Apply fancybox to template
    $(".mediaVideo").fancybox();

    //create function to add data in jsonObject
    jQuery.fn.updateJSON = function (id, title, image, year) {
        data.names.push({ "image": image, "id": id, "title": title, "year": year});
    };
    //create function to add data in yearEnum
    jQuery.fn.updateYearSelectBox = function (year) {
        // first check that year doesn't already exists
        if ($.inArray(year, yearEnum.years) == -1) {
            $(".year").append("<option>" + year + "</option>");
            yearEnum.years.push(year);
        }
    };


    //renders the JSON object
    jQuery.fn.renderData = function () {
        // json array to be rendered
        var renderData = {
            "names": []
        };

        // iterate over array
        $(data.names).each(function (index) {
            // if year of video is same as the year displayed
            if (data.names[index].year == $(".year").val()) {
                // push it
                renderData.names.push(data.names[index]);
            }
        });

        // render the data
        dust.render("intro", renderData, function (err, out) {
            $("#output").html(out);
        });
    };

    // cleans the array
    jQuery.fn.flush = function () {
        data.names = []
    }

    //SHows the results on page
    jQuery.fn.showResultsOnPage = function (obj) {

        // initial case when channel is empty, provide default value
        if (obj.channel == "") {
            obj.channel = "TimeWarnerCable";
        }

        // initialize searchQuery with author name and json format info
        var searchQuery = 'http://gdata.youtube.com/feeds/api/videos?author=' + obj.channel + '&orderby=' + obj.orderBy + '&max-results=' + obj.videos + '&v=2.1&alt=jsonc';

        if (obj.search != "") {
            searchQuery = searchQuery + ("&q=" + obj.search);
        }

        $.ajax({
            type: "GET",
            url: searchQuery,
            success: function (response) {

                // error when zero items are fetched
                if (response.data.totalItems == 0) {
                    // if this undefined, then search term is culprit
                    if (response.data.items == undefined) {
                        $(".errorDiv").text("Error Fetching Videos - No Videos Found");
                    } else {
                        $(".errorDiv").text("Error Fetching Videos - Channel Doesn't Exist");
                    }
                    // flush json array
                    jQuery().flush();
                    // then render data - effectively emptying if their's anything on screen
                    jQuery().renderData();
                    // hides navigation as well
                    $(".page_navigation").html("");
                    // shows div for 5 seconds
                    $(".errorDiv").fadeIn(5000);
                    $(".errorDiv").fadeOut('slow');
                    return;
                }

                var items = response.data.items;

                //cleans JSON array before appending anything into it
                jQuery().flush();

                $(items).each(function (index) {
                    var title = items[index].title;
                    var desc = items[index].description;
                    var id = items[index].id;
                    var image = items[index].thumbnail.hqDefault;
                    var year = items[index].uploaded.substr(0, 4);

                    // update json with the data for each iteration
                    jQuery().updateJSON(id, title, image, year);

                    // update year enum
                    jQuery().updateYearSelectBox(year);
                });

                // renders JSON data on page
                jQuery().renderData();

                // apply pagination effect
                $("#page_container").pajinate({
                    items_per_page: 9,
                    show_first_last: false
                });
            },
            error: function () {
                $(".errorDiv").fadeIn(8000);
                $(".errorDiv").fadeOut('slow');
            }
        });
    };
});