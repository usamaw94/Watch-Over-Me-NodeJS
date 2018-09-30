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

$('#addServiceForm').on('keyup keypress', function(e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13) { 
      e.preventDefault();
      return false;
    }
  });

  //----------------------------------------------

$("#checkPhone").on("click", function(){

    if($("#wearerPhone").val() != ''){

        var wearerPhoneValue =  $("#wearerPhone").val();

        var url="checkWearerPhoneNumber/"+ wearerPhoneValue;
    
        $.ajax({
            url:url,
            data:{wearerPhoneValue},
            datatype:"json",
            method:"GET",
            success:function(data){
                
                alert(data);
            }
        });

        var check = 'true';

        if(check == 'true'){
            $("#wearerForm").slideDown();
            $("#wearerExistValue").val("no");
            $("#textWearerAlreadyWearer").fadeOut('slow');
            $("#textWearerAlreadyExist").fadeOut('slow');
            $("#nextToWatchers").fadeIn('slow');
        } else if(check == 'wearer') {
            $("#wearerForm").slideDown();
            $("#nextToWatchers").fadeOut('slow');
            $("#textWearerAlreadyWearer").fadeIn('slow');
            $("#textWearerAlreadyExist").fadeOut('slow');
            $("#wearerFName").prop('readonly', true);
            $("#wearerLName").prop('readonly', true);
            $("#wearerEmail").prop('readonly', true);
            $("#nextToWatchers").fadeOut('slow');
        } else {
            $("#wearerExistValue").val("yes");
            $("#wearerForm").slideDown();
            $("#textWearerAlreadyWearer").fadeOut('slow');
            $("#textWearerAlreadyExist").fadeIn('slow');
            $("#wearerFName").prop('readonly', true);
            $("#wearerLName").prop('readonly', true);
            $("#wearerEmail").prop('readonly', true);
            $("#nextToWatchers").fadeIn('slow');
        }
    } else {
        alert("Enter phone number");
    }
    
});


//----------------------------------------------

$("#checkWatcher1Phone").on("click", function(){

    if($("#watcher1Phone").val() != ''){
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
    } else {
        alert("Enter watcher1 phone");
    }
});


//----------------------------------------------

$("#addWatcher2").on("click", function(){

    $("#watcher2").slideDown();
    $("#addWatcher2").fadeOut('slow');
    $("#removeWatcher2").fadeIn('slow');

});

$("#removeWatcher2").on("click", function(){

    $("#watcher2").slideUp();
    $("#watcher2Phone").val('');
    $("#watcher2FName").val('');
    $("#watcher2LName").val('');
    $("#watcher2Email").val('');

    $("#addWatcher2").fadeIn('slow');
    $("#removeWatcher2").fadeOut('slow');

});

$("#checkWatcher2Phone").on("click", function(){

    if($("#watcher2Phone").val() != ''){

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
    } else {
        alert("Enter watcher2 phone");
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
    $("#customerCheckValue").val('wearer');
});

//----------------------------------------------

$("#selectWacther").on("click", function(){

    $("#watcher-customer").slideDown();
    $("#wearer-customer").slideUp();
    $("#new-customer").slideUp();
    $("#customerCheckValue").val('watcher');

});

//----------------------------------------------

$("#selectNew").on("click", function(){

    $("#new-customer").slideUp();
    $("#watcher-customer").slideUp();
    $("#new-customer").slideDown();
    $("#customerCheckValue").val('new');
});

//----------------------------------------------

$("#nextToConfirmation").on("click", function(){

    alert('confirmed');
    
    $("#cnfrmWearerFName").text($('#wearerFName').val());
    $("#cnfrmWearerLName").text($('#wearerLName').val());
    $("#cnfrmWearerPhone").text($('#wearerPhone').val());
    $("#cnfrmWearerEmail").text($('#wearerEmail').val());
    
    $("#cnfrmWatcher1FName").text($('#w1FName').val());
    $("#cnfrmWatcher1LName").text($('#w1LName').val());
    $("#cnfrmWatcher1Phone").text($('#watcher1Phone').val());
    $("#cnfrmWatcher1Email").text($('#w1Email').val());
    
    $("#cnfrmWatcher2FName").text($('#w2FName').val());
    $("#cnfrmWatcher2LName").text($('#w2LName').val());
    $("#cnfrmWatcher2Phone").text($('#watcher2Phone').val());
    $("#cnfrmWatcher2Email").text($('#w2Email').val());
    
    $("#cnfrmPharmacyName").text($('#pharmacy').val());
    
    $("#cnfrmCustomerFName").text($('#customerFName').val());
    $("#cnfrmCustomerLName").text($('#customerLName').val());
    $("#cnfrmCustomerPhone").text($('#customerPhone').val());
    $("#cnfrmCustomerEmail").text($('#customerEmail').val());
});
