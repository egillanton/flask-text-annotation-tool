/////////// GET STATISTICS /////////////////////////////////////////////// 
function get_stats(callback) {
    $.ajax({
        type: 'GET',
        url: '/api/stats',
        success: function (response) {
            callback();
        },
        error: function (request, error) {
            // alert("Request: " + JSON.stringify(request));
        }
    });
}


$(document).ready(function () {
    get_stats(()=>{
       
    });
});