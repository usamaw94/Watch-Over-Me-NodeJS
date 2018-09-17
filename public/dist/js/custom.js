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
});


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

//----------------------------------------------

$("#checkPhone").on("click", function(){

    var check = 'true';

    if(check == 'true'){
        $("#wearerForm").slideDown();
        $("#exist").val("no");
        $("#nextToWatchers").fadeIn('slow');
    } else if(check == 'wearer') {
        $("#nextToWatchers").fadeOut('slow');
        $("#wearerAlreadyWearer").slideDown();
    } else {
        $("#exist").val("yes");
        $("#wearerExist").slideDown();
        $("#nextToWatchers").fadeIn('slow');
    }
});


//----------------------------------------------

$("#checkWatcher1Phone").on("click", function(){

    var check = '';

    if(check == 'true'){
        $("#watcher1Form").slideDown();
        $("#w1FName").prop('readonly', true);
        $("#w1LName").prop('readonly', true);
        $("#w1Email").prop('readonly', true);
        //$("#nextToWatchers").fadeIn('slow');
    } else {
        $("#watcher1Form").slideDown();
    }
});


//----------------------------------------------

$("#addWatcher2").on("click", function(){

    $("#watcher2").slideDown();

});

$("#checkWatcher2Phone").on("click", function(){

    var check = '';

    if(check == 'true'){
        $("#watcher2Form").slideDown();
        $("#w2FName").prop('readonly', true);
        $("#w2LName").prop('readonly', true);
        $("#w2Email").prop('readonly', true);
        //$("#nextToWatchers").fadeIn('slow');
    } else {
        $("#watcher2Form").slideDown();
    }
});

//----------------------------------------------

$("#customerPhone").on("click", function(){

    $("#customerForm").slideDown();

});

//----------------------------------------------

$("#selectWearer").on("click", function(){

    $("#customerForm").slideDown();

});

//----------------------------------------------

$("#selectWacther").on("click", function(){

    $("#customerForm").slideDown();

});

//----------------------------------------------

$("#selectNew").on("click", function(){

    $("#customerForm").slideDown();

});

//----------------------------------------------

$("#selectWearer").on("click", function(){

    $("#wearer-customer").slideDown();
    $("#watcher-customer").slideUp();
    $("#new-customer").slideUp();
});

//----------------------------------------------

$("#selectWacther").on("click", function(){

    $("#watcher-customer").slideDown();
    $("#wearer-customer").slideUp();
    $("#new-customer").slideUp();

});

//----------------------------------------------

$("#selectNew").on("click", function(){

    $("#new-customer").slideUp();
    $("#watcher-customer").slideUp();
    $("#new-customer").slideDown();

});

