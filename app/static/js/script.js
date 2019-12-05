var slot_tags = [];


/////////// GET SLOT TAGS ////////////////////////////////////////////////// 
function get_slot_tags(callback) {
    if (slot_tags === undefined || slot_tags.length == 0) {
        $.ajax({
            type: 'GET',
            url: '/tags',
            success: function (response) {
                let data = response.lables;
                $.each(data, function (index, tag) {
                    slot_tags.push(tag[0])
                });
                slot_tags.sort().filter(function (el, i, a) { return i == a.indexOf(el); })
            },
            error: function (request, error) {
                // alert("Request: " + JSON.stringify(request));
            }
        });
    }
    callback();
}

/////////// TRANSLATE ////////////////////////////////////////////////// 
function translate() {
    let source_tokens = $('#source_tokens').text();


    if (source_tokens) {
        $.ajax({
            type: 'POST',
            url: '/translate',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify({
                'source_text': source_tokens,
            }),
            success: function (response) {

                $('#translated_text').text(response.translation);
                $('#target_tokens').val(response.translation);
                $('#translated_div').css('visibility', 'visible');
                $('#tokens_div').css('visibility', 'visible');
                $('#translate_button_div').css('display', 'none');
                $('#annotate_button_div').css('visibility', 'visible');
                $("#target_tokens").focus();

            },
            error: function (request, error) {
                // alert("Request: " + JSON.stringify(request));
            }
        });
    }
}

/////////// ANNOTATE ////////////////////////////////////////////////////////////// 
function annotate() {
    let correct_tokens = $('#target_tokens').val().toLowerCase().replace(/\s+/g, ' ').trim();;
    create_annotate_table(() => {
        create_source_tag_table(() => {
            window.$('.selectpicker').selectpicker();
            $('#annotate_button_div').css('display', 'none');
            $('#tokens_div').css('display', 'none');
            $('#correct_text').text(correct_tokens);
            $('#correct_text_div').css('visibility', 'visible');
            $('#annotation_div').css('visibility', 'visible');
            $('#preview_button_div').css('visibility', 'visible');
            $(document).on('keypress', 'select', function (e) {
                let enter_key = 13;
                let tab_key = 9;
                if (e.which == enter_key || e.which == tab_key) {
                    e.preventDefault();
                    // Get all focusable elements on the page
                    var $canfocus = $(':focusable');
                    var index = $canfocus.index(document.activeElement) + 1;
                    if (index >= $canfocus.length) index = 0;
                    $canfocus.eq(index).focus();
                }
            });
            window.location.hash = '#annotation_div';
            window.location.hash = '';
        });
    });
}

/////////// CREATE ANNOTATE TABLE ////////////////////////////////////////////////////////////// 
function create_annotate_table(callback) {
    var correct_tokens = $('#target_tokens').val().toLowerCase().replace(/\s+/g, ' ').trim();
    var arr = correct_tokens.split(" ");

    arr.forEach(function (item, index, arr) {
        var annotation_tbody_html = "";

        var table_head = `
        <tr>
            <th scope="row">${index}</th>
            <td>${item}</td>
            <td>
                <select class="selectpicker" data-size="6" data-live-search="true" tabindex="${index}" id="select_${index}">`;

        var table_rows = `
                <option data-tokens="0">O</option>`;


        slot_tags.forEach(function (tag, ind, arrr) {
            var option = ""
            if (tag === "O") {
                // Continue
            } else {
                table_rows = table_rows.concat(`
                <option data-tokens="${ind + 1}">${tag}</option>`);
            }
        });
        let close_tags = `
                </select>
            </td>
        </tr>`;
        annotation_tbody_html = annotation_tbody_html.concat(table_head, table_rows, close_tags);
        document.getElementById("annotation_tbody").innerHTML += annotation_tbody_html;
    });

    callback();
}


var source = undefined;

function create_source_tag_table(callback) {

    // Populate Source Data
    source.forEach(function (item, index, arr) {
        if (item[1] !== "O") {

            var table_row = `
            <tr>
                <th scope="row">${index}</th>
                <td>${item[0]}</td>
                <td>${item[1]}</td>
                <td>${slot_tags.indexOf(item[1]) + 1}</td>
            </tr>`;
            document.getElementById("tags_found_tbody").innerHTML += table_row;
        }
        else {
            var table_row = `
            <tr>
                <th scope="row">${index}</th>
                <td>${item[0]}</td>
                <td>${item[1]}</td>
                <td>0</td>
            </tr>`;
            document.getElementById("tags_found_tbody").innerHTML += table_row;
        }
    });

    callback();
}


/////////// Preview //////////////////////////////////////////////////////////////
function preview() {

    var annotation_tbody = document.querySelector("#annotation_tbody");
    var data = annotation_tbody.querySelectorAll('select');
    var preview_lables = [];

    for (var i = 0; i < data.length; i++) {
        var select_picker = data[i];
        preview_lables.push(select_picker.value);
    }

    var correct_tokens = $('#target_tokens').val().toLowerCase();
    var preview_tokens = correct_tokens.split(" ");

    preview = preview_tokens.map(function (e, i) {
        return [e, preview_lables[i]];
    });

    // Clear data if there is any
    document.getElementById("preview_tokens").innerHTML = "";
    document.getElementById("preview_lables").innerHTML = "";

    // Populate with data
    preview.forEach(function (item, index, arr) {
        document.getElementById("preview_tokens").innerHTML += `<span class="${index + source_length}">${item[0]} </span>`;
        document.getElementById("preview_lables").innerHTML += `<span class="${index + source_length}">${item[1]} </span>`;
    });

    document.getElementById("preview_intent").innerHTML = source_intent;
    refreash_hover_effect();

    $('#preview_div').css('visibility', 'visible');
}

/////////// Hover //////////////////////////////////////////////////////////////
function refreash_hover_effect() {
    $(function () {
        $("p>span").hover(function () {
            var id = $(this).attr('class');
            $("." + id).toggleClass('text-primary');
        }, function () {
            var id = $(this).attr('class');
            $("." + id.split(" ")[0]).toggleClass('text-primary');
        });
    });
}

// TEST
var source_tokens = "a listing of all flights from boston to baltimore before 10 am on thursday".split(" ");
var source_lables = "O O O O O O B-fromloc.city_name O B-toloc.city_name B-depart_time.time_relative B-depart_time.time I-depart_time.time O B-depart_date.day_name".split(" ");
var source_intent = "atis_flight";
var source_length = 0;

/////////// MAIN //////////////////////////////////////////////////////////////
$('document').ready(function () {
    // Get Single Instance of Source Data
    source = source_tokens.map(function (e, i) {
        return [e, source_lables[i]];
    });

    source_length = source.length;

    // Populate Source Data
    source.forEach(function (item, index, arr) {
        document.getElementById("source_tokens").innerHTML += `<span class="${index}">${item[0]} </span>`;
        document.getElementById("source_lables").innerHTML += `<span class="${index}">${item[1]} </span>`;
    });

    refreash_hover_effect();

    document.getElementById("source_intent").innerHTML = source_intent;

    // Map Buttons
    document.getElementById("translate_button").addEventListener("click", translate, false);
    document.getElementById("annotate_button").addEventListener("click", annotate, false);
    document.getElementById("preview_button").addEventListener("click", preview, false);

    // Get Available Slot Tags
    get_slot_tags(() => {
        // Already, Now display Source Data
        $('#main_content_div').css('visibility', 'visible');
    });
});