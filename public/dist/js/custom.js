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

$(document).ready(function(){
    $("#wearerPhone").keyup(function(){
        $("#wearerFName").val('');
        $("#wearerLName").val('');
        $("#wearerEmail").val('');
        $("#wearerForm").slideUp();
    });
});  


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
                
                var watcher1PhoneValue =  $("#watcher1Phone").val();

                if(wearerPhoneValue == watcher1PhoneValue) {
                    alert('You already entered this number for a watcher \nWatcher cannot become wearer');
                } else if(data.existStatus == 'yes'){
                    $("#wearerExistStatus").val(data.existStatus);
                    $("#wearerExistId").val(data.id);

                    $("#wearerExistValue").val("yes");
                    $("#wearerForm").slideDown();
                    $("#textWearerAlreadyWearer").fadeOut('slow');
                    $("#textWearerAlreadyExist").fadeIn('slow');
                    $("#wearerFName").prop('readonly', true);
                    $("#wearerFName").val(data.fname);
                    $("#wearerLName").prop('readonly', true);
                    $("#wearerLName").val(data.lname);
                    $("#wearerEmail").prop('readonly', true);
                    $("#wearerEmail").val(data.email);
                    $("#nextToWatchers").fadeIn('slow');

                } else if(data.existStatus == 'wearer') {
                    $("#wearerExistStatus").val(data.existStatus);
                    $("#wearerExistId").val(data.id);

                    $("#wearerForm").slideDown();
                    $("#nextToWatchers").fadeOut('slow');
                    $("#textWearerAlreadyWearer").fadeIn('slow');
                    $("#textWearerAlreadyExist").fadeOut('slow');
                    $("#wearerFName").prop('readonly', true);
                    $("#wearerFName").val(data.fname);
                    $("#wearerLName").prop('readonly', true);
                    $("#wearerLName").val(data.lname);
                    $("#wearerEmail").prop('readonly', true);
                    $("#wearerEmail").val(data.email);
                    $("#nextToWatchers").fadeOut('slow');
                } else {
                    $("#wearerExistStatus").val(data.existStatus);
                    $("#wearerExistId").val(data.id);

                    $("#wearerForm").slideDown();
                    $("#wearerExistValue").val("no");
                    $("#textWearerAlreadyWearer").fadeOut('slow');
                    $("#wearerFName").prop('readonly', false);
                    $("#wearerLName").prop('readonly', false);
                    $("#wearerEmail").prop('readonly', false);

                    $("#wearerFName").val('');
                    $("#wearerLName").val('');
                    $("#wearerEmail").val('');
                    $("#textWearerAlreadyExist").fadeOut('slow');
                    $("#nextToWatchers").fadeIn('slow');
                }
            }
        });

    } else {
        alert("Enter phone number");
    }
    
});


//----------------------------------------------

$(document).ready(function(){
    $("#watcher1Phone").keyup(function(){
        $("#w1FName").val('');
        $("#w1LName").val('');
        $("#w1Email").val('');
        $("#watcher1Form").slideUp();
    });
});

$("#checkWatcher1Phone").on("click", function(){

    if($("#watcher1Phone").val() != ''){

        var watcher1PhoneValue =  $("#watcher1Phone").val();

        var url="checkWatcherPhoneNumber/"+ watcher1PhoneValue;
    
        $.ajax({
            url:url,
            data:{watcher1PhoneValue},
            datatype:"json",
            method:"GET",
            success:function(data){
                var wearerPhone = $("#wearerPhone").val()
                
                if(watcher1PhoneValue == wearerPhone) {
                    alert('You already entered this number for wearer \nWearer cannot become watcher');
                } else if(data.existStatus == 'yes'){

                    $('#watcherExistStatus').val(data.existStatus);
                    $('#watcherId').val(data.id);

                    $("#watcher1Form").slideDown();
                    $("#w1FName").prop('readonly', true);
                    $("#w1FName").val(data.fname);
                    $("#w1LName").prop('readonly', true);
                    $("#w1LName").val(data.lname);
                    $("#w1Email").prop('readonly', true);
                    $("#w1Email").val(data.email);
                } else {

                    $('watcherExistStatus').val(data.existStatus);

                    $("#w1FName").prop('readonly', false);
                    $("#w1FName").val('');
                    $("#w1LName").prop('readonly', false);
                    $("#w1LName").val('');
                    $("#w1Email").prop('readonly', false);
                    $("#w1Email").val('');
                    $("#watcher1Form").slideDown();
                }
            }
        });
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
    $("#customerForm").slideUp();
    $("#customerCheckValue").val('new');
});

//----------------------------------------------

$("#customerPhone").on("keyup",function(){
    $("#customerFName").val('');
    $("#customerLName").val('');
    $("#customerEmail").val('');
    $("#customerForm").slideUp();
});

$("#checkCustomerPhone").on("click", function(){

    if($("#customerPhone").val() != ''){

        var customerPhoneValue =  $("#customerPhone").val();

        var url="checkCustomerPhoneNumber/"+ customerPhoneValue;
    
        $.ajax({
            url:url,
            data:{customerPhoneValue},
            datatype:"json",
            method:"GET",
            success:function(data){
                var wearerPhone = $("#wearerPhone").val()
                
                var watcher1PhoneValue =  $("#watcher1Phone").val();

                if(customerPhoneValue == watcher1PhoneValue) {
                    alert('You already entered this number for a watcher \nSelect the watcher option to make choose watcher as a customer for the service');
                } else if(customerPhoneValue == wearerPhone) {
                    alert('You already entered this number for wearer \nSelect the watcher option to make choose watcher as a customer for the service');
                } else if(data.existStatus == 'yes'){

                    $('#customerExistStatus').val(data.existStatus);
                    $('#customerId').val(data.id);

                    $("#customerForm").slideDown();
                    $("#customerFName").prop('readonly', true);
                    $("#customerFName").val(data.fname);
                    $("#customerLName").prop('readonly', true);
                    $("#customerLName").val(data.lname);
                    $("#customerEmail").prop('readonly', true);
                    $("#customerEmail").val(data.email);
                } else {
                    $("#customerFName").prop('readonly', false);
                    $("#customerFName").val('');
                    $("#customerLName").prop('readonly', false);
                    $("#customerLName").val('');
                    $("#customerEmail").prop('readonly', false);
                    $("#customerEmail").val('');
                    $("#customerForm").slideDown();
                }
            }
        });
    } else {
        alert("Enter customer phone");
    }
});

//----------------------------------------------

$("#nextToConfirmation").on("click", function(){
    
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
    
    $("#cnfrmPharmacyName").text($('#pharmacyName').val());

    $("#cnfrmCustomerFName").text($('#customerFName').val());
    $("#cnfrmCustomerLName").text($('#customerLName').val());
    $("#cnfrmCustomerPhone").text($('#customerPhone').val());
    $("#cnfrmCustomerEmail").text($('#customerEmail').val());

    if($('#selectNew').is(':checked')){
        $('#cnfrmNewCustomer').show();
        $('#cnfrmTextCustomer').hide();
        $('#cnfrmTextWatcher').hide();
    } else if($('#selectWacther').is(':checked')) {
        $('#cnfrmNewCustomer').hide();
        $('#cnfrmTextCustomer').hide();
        $('#cnfrmTextWatcher').show();
    } else {
        $('#cnfrmNewCustomer').hide();
        $('#cnfrmTextCustomer').show();
        $('#cnfrmTextWatcher').hide();
    }
});

//----------------------------------------------

$(".showWearerDetails").on("click", function(){

    var wearerId=$(this).attr('data-id');

    var url="showWearerDetails/"+ wearerId;
    
        $.ajax({
            url:url,
            data:{wearerId},
            datatype:"json",
            method:"GET",
            success:function(data){
                $('#modalWearerId').text(data.person_id);
                $('#modalWearerName').text(data.person_first_name + " " + data.person_last_name);
                $('#modalWearerPhone').text(data.phone_number);
                $('#modalWearerEmail').text(data.email);
                $('#wearerDetails').modal('show');
            }
        });
});

//----------------------------------------------

$(".showCustomerDetails").on("click", function(){

    var customerId=$(this).attr('data-id');

    var url="showCustomerDetails/"+ customerId;
    
        $.ajax({
            url:url,
            data:{customerId},
            datatype:"json",
            method:"GET",
            success:function(data){
                $('#modalCustomerId').text(data.person_id);
                $('#modalCustomerName').text(data.person_first_name + " " + data.person_last_name);
                $('#modalCustomerPhone').text(data.phone_number);
                $('#modalCustomerEmail').text(data.email);
                $('#customerDetails').modal('show');
            }
        });
});

//----------------------------------------------

$(".showWatcherDetails").on("click", function(){


    var serviceId=$(this).attr('data-id');

    var numWatchers = $(this).attr('data-num-watcher');

    var url="/showWatcherDetails";
    
        $.ajax({
            url:url,
            data:{serviceId : serviceId},
            datatype:"json",
            method:"GET",
            success:function(data){

                $("#watcherDataRows").empty();

                var length = data.length;

                for(i=0; i<data.length; i++){
                    var personId = data[i].watcherDetails[0].person_id;
                    var personName = data[i].watcherDetails[0].person_first_name + " " 
                    + data[i].watcherDetails[0].person_last_name;
                    var personPhone = data[i].watcherDetails[0].phone_number;
                    var personEmail = data[i].watcherDetails[0].email;

                    var row = "<tr><td>"+ personId +"</td><td>" + personName + "</td><td>" + personPhone + "</td><td>" + personEmail + "</td></tr>";
                    $("#watcherDataRows").append(row);
                }

                $("#modalTotalWatchers").text(numWatchers);
            


                $('#watcherDetails').modal('show');
            }
        });
});

$(document).ready(function(){
    $("#watcherPhone").keyup(function(){     
        $("#watcherId").val('');
        $("#wFName").val('');
        $("#wLName").val('');
        $("#wEmail").val('');
        $("#wFName").prop('readonly', false);
        $("#wLName").prop('readonly', false);
        $("#wEmail").prop('readonly', false);
        $("#addWatcherForm").slideUp();
    });
});

$("#checkWatcherPhone").on("click", function(){

    if($("#watcherPhone").val() != ''){

        var watcherPhoneValue =  $("#watcherPhone").val();

        var serviceId = $("#serviceId").val();

        var url="/checkNewWatcherPhoneNumber";
    
        $.ajax({
            url:url,
            data:{ phone: watcherPhoneValue, serviceId: serviceId },
            datatype:"json",
            method:"GET",
            success:function(data){

                var wearerPhone = $("#wearerPhoneCheck").val();

                if(watcherPhoneValue == wearerPhone) {
                    alert('This number is already registered for wearer \nWearer cannot become watcher');
                } else if(data.existStatus == 'yes'){

                    if (data.watcherExist == 'yes'){
                        $("#newWatcherSubmit").fadeOut();
                        $("#addWatcherDsiable").fadeIn();
                        $("#addWatcherSubmit").fadeOut();
                        $("#addWatcherForm").slideDown();
                        
                        $("#watcherId").val(data.id);
                        $("#wFName").prop('readonly', true);
                        $("#wFName").val(data.fname);
                        $("#wLName").prop('readonly', true);
                        $("#wLName").val(data.lname);
                        $("#wEmail").prop('readonly', true);
                        $("#wEmail").val(data.email);
                    } else {
                        $("#newWatcherSubmit").fadeOut();
                        $("#addWatcherSubmit").fadeIn();
                        $("#addWatcherDsiable").fadeOut();
                        $("#addWatcherForm").slideDown();
                        
                        $("#watcherId").val(data.id);
                        $("#wFName").prop('readonly', true);
                        $("#wFName").val(data.fname);
                        $("#wLName").prop('readonly', true);
                        $("#wLName").val(data.lname);
                        $("#wEmail").prop('readonly', true);
                        $("#wEmail").val(data.email);
                    }

                } else {
                    $("#newWatcherSubmit").fadeIn();
                    $("#addWatcherSubmit").fadeOut();
                    $("#addWatcherDsiable").fadeOut();
                    $("#addWatcherForm").slideDown();
                }
            }
        });
    } else {
        alert("Enter watcher phone number");
    }
});

$("#addWatcherFormSubmition").on("submit", function(e){
    e.preventDefault();

    var serviceId = $("#serviceId").val();

    var reloadUrl = "/serviceDetails?serviceID=" + serviceId; 

    var url="/addNewWatcher";
    var data=$('#addWatcherFormSubmition').serialize();

    $.ajax({
        url:url,
        data:data,
        datatype:"json",
        method:"GET",
        success:function(data){
            alert(data);
            $('#reload').load(reloadUrl +" #reload");
            $("#addWatcherForm").slideUp();
        }
    });
    $('#addWatcherFormSubmition').trigger("reset");
});

//----------------------------------------------

$("#addDeviceForm").on("submit", function(e){
    e.preventDefault();

    var url="/addNewDevice";
    var data=$('#addDeviceForm').serialize();

    $.ajax({
        url:url,
        data:data,
        datatype:"json",
        method:"GET",
        success:function(data){
            alert(data);
            $('#reload').load("/devices #reload");
            $('#collapseOne').collapse('toggle');
        }
    });
    $('#addDeviceForm').trigger("reset");
});

//----------------------------------------------

$("#addSimForm").on("submit", function(e){
    e.preventDefault();
    var url="/addNewSIM";
    var data=$('#addSimForm').serialize();

    $.ajax({
        url:url,
        data:data,
        datatype:"json",
        method:"GET",
        success:function(data){
            alert(data);
            $('#reload').load("/sims #reload");
            $('#collapseOne').collapse('toggle');
        }
    });
    $('#addSimForm').trigger("reset");
});

//----------------------------------------------

$("#addOrganizationForm").on("submit", function(e){
    e.preventDefault();
    var url="/addNewOrganization";
    var data=$('#addOrganizationForm').serialize();

    $.ajax({
        url:url,
        data:data,
        datatype:"json",
        method:"GET",
        success:function(data){
            alert(data);
            $('#reload').load("/organizations #reload");
            $('#collapseOne').collapse('toggle');
        }
    });
    $('#addOrganizationForm').trigger("reset");
});

//----------------------------------------------

$("#activateServiceForm").on("submit", function(e){
    e.preventDefault();
    var url="/activateService";
    var serviceId = $('#modalServiceId').val();
    var data=$('#activateServiceForm').serialize();

    var reloadUrl = "/serviceDetails?serviceID=" + serviceId;

    // alert(data);

    $.ajax({
        url:url,
        data:data,
        datatype:"json",
        method:"GET",
        success:function(data){
            alert(data);
            $('#reloadContent').load(reloadUrl + " #reloadContent");
            $('#activateServiceModal').modal('toggle');
        }
    });
    $('#activateServiceForm').trigger("reset");
});

//----------------------------------------------

$("#viewLogs").on("click", function(){

    var id = $(this).attr('data-service-id');
    var status = $(this).attr('data-service-status');
    if(status == "Activated"){
        window.location.href = "/alllogs?serviceID=" + id;
    } else {
        alert("Service is not activated yet");
    }
});
