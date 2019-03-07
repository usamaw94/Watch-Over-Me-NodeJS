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
                $('#customerDetailsModal').modal('show');
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
            


                $('#watcherDetailsModal').modal('show');
            }
        });
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
                $('#wearerDetailsModal').modal('show');
            }
        });
});

//----------------------------------------------
