/////////// TRANSLATE ////////////////////////////////////////////////// 
function translate() {
    var source_tokens = $('#source_tokens').text();
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

/////////// TAG ////////////////////////////////////////////////////////////// 
function annotate() {
    var correct_tokens = $('#target_tokens').val().toLowerCase();

    $('#annotate_button_div').css('display', 'none');
    $('#tokens_div').css('display', 'none');
    $('#correct_text').text(correct_tokens);
    $('#correct_text_div').css('visibility', 'visible');
    $('#annotation_div').css('visibility', 'visible');
    $('#save_button_div').css('visibility', 'visible');
}


var selected_token_index = -1;

function save_token_selected() {
    if (window.getSelection) {
        var selection = window.getSelection();
        var selectedText = selection.toString();
        var range = selection.getRangeAt(0);
        var rangeStart = range.startOffset;
        var rangeEnd = range.endOffset;
        console.log("Selected: " + selectedText);
        console.log("Start: " + rangeStart + ", End: " + rangeEnd);





        // var selectedText = selection.extractContents();
        // console.log("Selected: " + { selectedText });
        // var span = $("<span class='highlight'>" + selectedText.textContent + "</span>");
        // selection.insertNode(span[0]);

        // var target_tokens = document.getElementById("target_tokens");

        // if (selection.rangeCount === 1) {
        //     const currentRange = selection.getRangeAt(0)
        //     var selectedToken = currentRange.extractContents();

        //     let currentSelectionStart = selection.anchorOffset;
        //     let currentSelectionEnd = selection.focusOffset;


        //     var range = new Range();
        //     range.setStart(target_tokens, 0);
        //     range.setEnd(target_tokens, currentSelectionStart)

        //     var textPrecedingSelection = range.toString();
        //     selected_token_index = textPrecedingSelection.split(/\s+/).length - 1;
        //     console.log("Word index: " + selected_token_index);
        // }
    }
}

function clearSelection() {
    if (document.selection) {
        document.selection.empty();
    } else if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
}

$('document').ready(function () {
    document.getElementById("translate_button").addEventListener("click", translate, false);
    document.getElementById("annotate_button").addEventListener("click", annotate, false);
    document.getElementById("target_tokens").addEventListener("select", save_token_selected, false);
});