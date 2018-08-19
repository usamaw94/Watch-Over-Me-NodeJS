$(document).ready(function () {

    $(window).scroll(function () {
        var scrollTop = $(window).scrollTop();
        if (scrollTop > 55) {
            $('.info-bar').fadeIn('slow');
        }else{
            clearTimeout($.data(this, 'scrollTimer'));
            $('.info-bar').fadeOut('slow');
        }
    });

    initialMap();
})



function initialMap() {
    //var lat = document.getElementById("latitude").value;
    //var long = document.getElementById("longitude").value;
    var wearerPosition = new google.maps.LatLng(-24.870193, 134.171259);
    var mapOptions = {
        center: wearerPosition,
        zoom: 4,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);
}

function myMap(lat,long) {
    //var lat = document.getElementById("latitude").value;
    //var long = document.getElementById("longitude").value;
    var wearerPosition = new google.maps.LatLng(lat,long);
    var mapOptions = {
        center: wearerPosition,
        zoom: 15,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);
    var marker = new google.maps.Marker({
        position: wearerPosition,
    });
    marker.setMap(map);
}

$(document).on("click", ".log", function(){
    var lat=$(this).attr('data-lat');
    var long=$(this).attr('data-long');


    $(".log-container").removeClass("bg-gray");

    $(this).parent().parent('.log-container').addClass('bg-gray');

    myMap(lat,long);
});