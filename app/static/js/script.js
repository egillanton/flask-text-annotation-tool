var slot_tags = [];
var source_map = undefined;
var source_id = undefined;
var source_intent = undefined;
var source_tokens = undefined;
var source_labels = undefined;
var sample_is_completed = false;

/////////// GET ATIS Sample /////////////////////////////////////////////// 
function get_atis_sample(callback) {
    $.ajax({
        type: 'GET',
        url: '/sample',
        success: function (response) {
            source_id = response.sample_id;
            source_tokens = response.sample_tokens.split(" ");
            source_labels = response.sample_labels.split(" ");
            source_intent = response.sample_intent;
            callback();
        },
        error: function (request, error) {
            // alert("Request: " + JSON.stringify(request));
        }
    });
}

/////////// GET SLOT TAGS ///////////////////////////////////////////////// 
function get_all_slot_tags(callback) {
    if (slot_tags === undefined || slot_tags.length == 0) {
        $.ajax({
            type: 'GET',
            url: '/tags',
            success: function (response) {
                let data = response.labels;
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

/////////// TRANSLATE ////////////////////////////////////////////////////
function translate() {
    var source_tokens_str = $('#source_tokens').text();
    source_tokens_str = source_tokens_str.trim();

    var source_tokens = source_tokens_str.split(' '); 
    source_tokens.shift(); // Remove BOS
    source_tokens.pop(); // Remove EOS
    source_tokens = source_tokens.join(' ');

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

/////////// ANNOTATE ////////////////////////////////////////////////////// 
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
            scrool_to('#annotation_div');
           
        });
    });
}

/////////// CREATE ANNOTATE TABLE /////////////////////////////////////////
function create_annotate_table(callback) {
    var correct_tokens = $('#target_tokens').val().toLowerCase().replace(/\s+/g, ' ').trim();
    var arr = correct_tokens.split(" ");
    arr.unshift("BOS");
    arr.push("EOS");

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

/////////// CREATE SOURCE TAG TABLE ///////////////////////////////////////
function create_source_tag_table(callback) {

    // Populate Source Data
    source_map.forEach(function (item, index, arr) {
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

/////////// PREVIEW ///////////////////////////////////////////////////////
function preview() {

    var annotation_tbody = document.querySelector("#annotation_tbody");
    var data = annotation_tbody.querySelectorAll('select');
    var preview_labels = [];

    for (var i = 0; i < data.length; i++) {
        var select_picker = data[i];
        preview_labels.push(select_picker.value);
    }

    var correct_tokens = "".concat("BOS ", $('#target_tokens').val()," EOS" );
    var preview_tokens = correct_tokens.split(" ");

    preview = preview_tokens.map(function (e, i) {
        return [e, preview_labels[i]];
    });

    // Clear data if there is any
    document.getElementById("preview_tokens").innerHTML = "";
    document.getElementById("preview_labels").innerHTML = "";

    // Populate with data
    preview.forEach(function (item, index, arr) {
        document.getElementById("preview_tokens").innerHTML += `<span class="${index + source_length}">${item[0]} </span>`;
        document.getElementById("preview_labels").innerHTML += `<span class="${index + source_length}">${item[1]} </span>`;
    });

    refreash_hover_effect();

    $('#preview_div').css('visibility', 'visible');
    $('#save_button_div').css('visibility', 'visible');
}

/////////// Hover //////////////////////////////////////////////////////////////
function refreash_hover_effect() {
    // TODO: Fix Hover effect from ATIS DATA after Preview Card has been displayed.
    // Bug: ATIS Data Tokens wont toggle back to being normal after leaving hover 

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

function save(){
    if ($('#is_completed_checkbox').is(":checked")){
        sample_is_completed = true;
    }
    var preview_tokens = $("#preview_tokens").text().trim();
    var preview_labels = $("#preview_labels").text().trim();
    var preview_intent = $("#preview_intent").text().trim();
    $.ajax({
        type: 'POST',
        url: '/sample',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify({
            "sample_id": source_id,
            "sample_tokens": preview_tokens,
            "sample_labels": preview_labels,
            "sample_intent": source_intent,
            "sample_is_completed": sample_is_completed,
        }),
        success: function (response) {
            if(response.success){
                Swal.fire(
                    'Good Job!',
                    'Your sample has been recived!',
                    'success'
                ).then((result) =>{
                    document.location.reload(true);
                });
            }
        },
        error: function (request, error) {
            // alert("Request: " + JSON.stringify(request));
            Swal.fire(
                'Error!',
                'Your sample has not been recived!',
                'warning'
            );
        }
    });


}

/////////// Scroll to Tag //////////////////////////////////////////////////////////////
function scrool_to(tag){
    var position = $(tag).offset().top;

    $("body, html").animate({
        scrollTop: position
    });
}

/////////// MAIN //////////////////////////////////////////////////////////////
$('document').ready(function () {

    get_atis_sample(() => {
        // Get Single Instance of Source Data
        source_map = source_tokens.map(function (e, i) {
            return [e, source_labels[i]];
        });

        source_length = source_map.length;

        // Populate Source Data
        source_map.forEach(function (item, index, arr) {
            document.getElementById("source_tokens").innerHTML += `<span class="${index}">${item[0]} </span>`;
            document.getElementById("source_labels").innerHTML += `<span class="${index}">${item[1]} </span>`;
        });

        refreash_hover_effect();

        document.getElementById("source_intent").innerHTML = source_intent;
        document.getElementById("preview_intent").innerHTML = source_intent;

        // Map Buttons
        document.getElementById("translate_button").addEventListener("click", translate, false);
        document.getElementById("annotate_button").addEventListener("click", annotate, false);
        document.getElementById("preview_button").addEventListener("click", preview, false);
        document.getElementById("save_button").addEventListener("click", save, false);

        // Get Available Slot Tags
        get_all_slot_tags(() => {
            $('#main_content_div').css('visibility', 'visible');
            scrool_to('#main_content_div');
        });
    });
});