var slot_tags = [];
var source_map = undefined;
var sample_nr = undefined;
var source_intent = undefined;
var source_tokens = undefined;
var source_labels = undefined;
var sample_is_completed = false;

/////////// GET ATIS Sample /////////////////////////////////////////////// 
function get_atis_sample(callback) {
    source_tokens = $('#source_tokens span').map(function () {
        return $(this).text();
    }).get();

    source_labels = $('#source_labels span').map(function () {
        return $(this).text();
    }).get();

    source_intent = $("#source_intent").text();

    sample_nr = document.title;

    callback();
}


/////////// GET SLOT TAGS ///////////////////////////////////////////////// 
function get_all_slot_tags(callback) {
    if (slot_tags === undefined || slot_tags.length == 0) {
        $.ajax({
            type: 'GET',
            url: '/api/tags',
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
    // Get Source Text
    let source_tokens_tmp = source_tokens;
    source_tokens_tmp.shift(); // Remove BOS
    source_tokens_tmp.pop(); // Remove EOS
    source_tokens_tmp = source_tokens_tmp.join(' ');

    // Use Google Translate
    if (source_tokens_tmp) {
        $.ajax({
            type: 'POST',
            url: '/api/translate',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify({
                'source_text': source_tokens_tmp,
            }),
            success: function (response) {
                // Display results
                $('#translated_text').text(response.translation); // display fixed text
                $('#translated_tokens_input').val(response.translation); // set value to input field
                $('#translated_div').css('visibility', 'visible');
                $('#start_button_div').css('display', 'none');

            },
            error: function (request, error) {
                // alert("Request: " + JSON.stringify(request));
            }
        });
    }
}


/////////// ANNOTATE ////////////////////////////////////////////////////// 
function annotate() {
    let correct_tokens = $('#translated_tokens_input').val().toLowerCase().replace(/\s+/g, ' ').trim();;
    document.getElementById("annotation_tbody").innerHTML = ""
    document.getElementById("tags_found_tbody").innerHTML = ""
    create_annotate_table(() => {
        create_source_tag_table(() => {
            window.$('.selectpicker').selectpicker();
            $('#annotation_div').css('visibility', 'visible');
            $('#save_button_div').css('visibility', 'visible');
        });
    });
}


/////////// CREATE ANNOTATE TABLE /////////////////////////////////////////
function create_annotate_table(callback) {
    var correct_tokens = $('#translated_tokens_input').val().toLowerCase().replace(/\s+/g, ' ').trim();
    var arr = correct_tokens.split(" ");
    arr.unshift("BOS");
    arr.push("EOS");

    arr.forEach(function (item, index, arr) {
        var annotation_tbody_html = "";

        var table_head = `
        <tr>
            <th scope="row" class="align-middle">${index}</th>
            <td class="align-middle">${item}</td>
            <td class="py-0">
                <select class="selectpicker" data-size="6" data-live-search="true" tabindex="${index}" id="select_${index}">`;


        var table_rows = source_map.reduce((result, label_pair) => {
            if (item === label_pair[0]) {
                if (label_pair[1] != "O") {
                    result = `
                <option data-tokens="${slot_tags.indexOf(label_pair[1]) + 1}">${label_pair[1]}</option>
                <option data-tokens="0">O</option>`;
                }
                else {
                    result = `
                    <option data-tokens="0">O</option>
                `;
                }


                slot_tags.forEach(function (tag, ind, arrr) {
                    var option = ""
                    if (tag === "O" || tag === label_pair[1]) {
                        // Continue
                    } else {
                        result = result.concat(`
                <option data-tokens="${ind + 1}">${tag}</option>`);
                    }
                });
            }
            return result
        }, null)


        if (table_rows === null) {
            table_rows = `
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
        }

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


///////////// GET DATE FROM ANNOTATE TABLE ///////////////////////////////
function get_annotated_data(){
    var annotation_tbody = document.querySelector("#annotation_tbody");
    var data = annotation_tbody.querySelectorAll('select');
    var labels = [];

    for (var i = 0; i < data.length; i++) {
        var select_picker = data[i];
        labels.push(select_picker.value);
    }

    var correct_tokens = "".concat("BOS ", $('#translated_tokens_input').val(), " EOS");
    var tokens = correct_tokens.split(" ");

    annotated_data = tokens.map(function (e, i) {
        return [e, labels[i]];
    });

    return annotated_data;
}


/////////// SAVE //////////////////////////////////////////////////////////
function save() {
    data = get_annotated_data();

    tokens = [];
    labels = [];
    
    data.forEach(function (item, index, arr) {
        tokens.push(item[0]);
        labels.push(item[1]);
    });

    $.ajax({
        type: 'POST',
        url: `/api/samples/${sample_nr}`,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify({
            "sample_id": sample_nr,
            "sample_tokens": tokens.join(" ").trim(),
            "sample_labels": labels.join(" ").trim(),
            "sample_intent": source_intent,
            "sample_is_completed": false,
        }),
        success: function (response) {
            if (response.success) {
                Swal.fire(
                    'Good Job!',
                    'Your sample has been recived!',
                    'success'
                ).then((result) => {
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

/////////// CONFRIM //////////////////////////////////////////////////////////
function confirm() {
    $.ajax({
        type: 'POST',
        url: `/api/samples/${sample_nr}`,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify({
            "sample_id": sample_nr,
            "sample_is_completed": true,
        }),
        success: function (response) {
            if (response.success) {
                Swal.fire(
                    'Good Job!',
                    'Your sample has been marked completed!',
                    'success'
                ).then((result) => {
                    document.location.reload(true);
                });
            }
        },
        error: function (request, error) {
            // alert("Request: " + JSON.stringify(request));
            Swal.fire(
                'Error!',
                'Your sample has not been updated!',
                'warning'
            );
        }
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

        // Map Buttons
        document.getElementById("start_button").addEventListener("click", translate, false);
        document.getElementById("label_button").addEventListener("click", annotate, false);
        document.getElementById("save_button").addEventListener("click", save, false);
        document.getElementById("confirm_button").addEventListener("click", confirm, false);

        // Get Available Slot Tags
        get_all_slot_tags(() => {
            $('#main_content_div').css('visibility', 'visible');
        });
    });
});