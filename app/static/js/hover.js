function apply_hover_effect() {
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