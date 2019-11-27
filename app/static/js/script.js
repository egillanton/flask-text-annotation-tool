/////////// TRANSLATE ////////////////////////////////////////////////// 
function translate() {
    var source_tokens = $('#source_tokens').val();
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
                $('#target_tokens').val(response.translation);
            },
            error: function (request, error) {
                // alert("Request: " + JSON.stringify(request));
            }
        });
    }
}

/////////// AUTOFILL LABELS ////////////////////////////////////////////////// 
function autofill_lables() {
    var target_lables = ""
    var target_tokens = $('#target_tokens').val();
    var arr = target_tokens.split(" ").forEach(function (word) {
        target_lables += "O ";
    });

    target_lables = target_lables.trim();
    if (target_lables) {
        $('#target_lables').val(target_lables);
    }
}

/////////// AUTOFILL INTENT ////////////////////////////////////////////////// 
function autofill_intent() {
    var source_intent = $('#source_intent').val();
    if (source_intent) {
        $('#target_intent').val(source_intent);
    }
}

$('document').ready(function () {
    document.getElementById("translate_button").addEventListener("click", translate, false);
    document.getElementById("autofill_lables_button").addEventListener("click", autofill_lables, false);
    document.getElementById("autofill_intent_button").addEventListener("click", autofill_intent, false);
});

