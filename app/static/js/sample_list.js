var sample_list = undefined;

/////////// GET Samples /////////////////////////////////////////////// 
function get_atis_sample(callback) {
    $.ajax({
        type: 'GET',
        url: '/api/samples',
        success: function (data) {
            sample_list = data.samples;
            callback();
        },
        error: function (request, error) {
            // alert("Request: " + JSON.stringify(request));
        }
    });
}


$(document).ready(function () {
    get_atis_sample(()=>{
        $('#dtBasicExample').DataTable({
            data:sample_list,
            columns:[
                {title: "#", data:'id'},
                {title: "Intent", data:'source.intent'},
                {title: "Source Text", data:'source.tokens'},
                {title: "Target Text", data:'target.tokens'},
                {title: "Is Completed", data:'target.is_completed'},
            ],
        });
        $('.dataTables_length').addClass('bs-select');

        $("div#table_div table tr:has(td)").click(function () { 
            var tds = $(this).children();
            var sample_id = tds[0].textContent; 
            window.location.href = `/samples/${sample_id}` ;
        });
        $('#table_div').css('visibility', 'visible');
    });
});