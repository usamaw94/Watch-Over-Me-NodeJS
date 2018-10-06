// Tooltips Initialization
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

// Steppers
$(document).ready(function () {
    var navListItems = $('div.setup-panel-2 div a'),
        allWells = $('.setup-content-2'),
        allNextBtn = $('#nextToWatchers'),
        allPrevBtn = $('.prevBtn-2');

    allWells.hide();

    navListItems.click(function (e) {
        e.preventDefault();
        var $target = $($(this).attr('href')),
            $item = $(this);

        if (!$item.hasClass('disabled')) {
            navListItems.removeClass('btn-amber').addClass('btn-blue-grey');
            $item.addClass('btn-amber');
            allWells.hide();
            $target.show();
            $target.find('input:eq(0)').focus();
        }
    });

    allPrevBtn.click(function(){
        var curStep = $(this).closest(".setup-content-2"),
            curStepBtn = curStep.attr("id"),
            prevStepSteps = $('div.setup-panel-2 div a[href="#' + curStepBtn + '"]').parent().prev().children("a");

        prevStepSteps.removeAttr('disabled').trigger('click');
    });


    $('#nextToWatchers').click(function(){
        if($("#wearerPhone").val() == '' || $("#wearerFName").val() == '' || $("#wearerLName").val() == ''){
            alert("Please fill all the necessary feilds\n(Phone Number ,First name ,Last name)");
        } else {
            var curStep = $(this).closest(".setup-content-2"),
            curStepBtn = curStep.attr("id"),
            nextStepSteps = $('div.setup-panel-2 div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
            curInputs = curStep.find("input[type='text'],input[type='url']"),
            isValid = true;

            $(".form-group").removeClass("has-error");
            for(var i=0; i< curInputs.length; i++){
                if (!curInputs[i].validity.valid){
                    isValid = false;
                    $(curInputs[i]).closest(".form-group").addClass("has-error");
                }
            }

            if (isValid)
                nextStepSteps.removeAttr('disabled').trigger('click');


                $('.wearer').removeClass('active-tab');
                $('.wearer').addClass('btn-circle-2');
            
                $('.watcher').removeClass('btn-circle-2');
                $('.watcher').addClass('active-tab');
        }
    });

    $('#nextToPharmacy').click(function(){

        if($("#watcher1Phone").val() == '' || $("#w1FName").val() == '' || $("#w1LName").val() == ''){
            alert("Please fill all the necessary feilds\n(Phone Number ,First name ,Last name)");
        } else {

            var curStep = $(this).closest(".setup-content-2"),
                curStepBtn = curStep.attr("id"),
                nextStepSteps = $('div.setup-panel-2 div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
                curInputs = curStep.find("input[type='text'],input[type='url']"),
                isValid = true;

            $(".form-group").removeClass("has-error");
            for(var i=0; i< curInputs.length; i++){
                if (!curInputs[i].validity.valid){
                    isValid = false;
                    $(curInputs[i]).closest(".form-group").addClass("has-error");
                }
            }

            if (isValid)
            nextStepSteps.removeAttr('disabled').trigger('click');

            $('.watcher').removeClass('active-tab');
            $('.watcher').addClass('btn-circle-2');
        
            $('.pharmacy').removeClass('btn-circle-2');
            $('.pharmacy').addClass('active-tab');
        }
    });

    $('#nextToCustomer').click(function(){
        var curStep = $(this).closest(".setup-content-2"),
            curStepBtn = curStep.attr("id"),
            nextStepSteps = $('div.setup-panel-2 div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
            curInputs = curStep.find("input[type='text'],input[type='url']"),
            isValid = true;

        $(".form-group").removeClass("has-error");
        for(var i=0; i< curInputs.length; i++){
            if (!curInputs[i].validity.valid){
                isValid = false;
                $(curInputs[i]).closest(".form-group").addClass("has-error");
            }
        }

        if (isValid)
            nextStepSteps.removeAttr('disabled').trigger('click');
    });

    $('#nextToConfirmation').click(function(){

        if($('#selectNew').is(':checked')){
            if($("#customerPhone").val() == '' || $("#customerFName").val() == '' || $("#customerLName").val() == '' ){
                alert("Please fill all the necessary feilds\n(Phone Number ,First name ,Last name)");
            } else {
                var curStep = $(this).closest(".setup-content-2"),
                curStepBtn = curStep.attr("id"),
                nextStepSteps = $('div.setup-panel-2 div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
                curInputs = curStep.find("input[type='text'],input[type='url']"),
                isValid = true;

                $(".form-group").removeClass("has-error");
                for(var i=0; i< curInputs.length; i++){
                    if (!curInputs[i].validity.valid){
                        isValid = false;
                        $(curInputs[i]).closest(".form-group").addClass("has-error");
                    }
                }

                if (isValid)
                    nextStepSteps.removeAttr('disabled').trigger('click');

                $('.customer').removeClass('active-tab');
                $('.customer').addClass('btn-circle-2');

                $('.confirmation').removeClass('btn-circle-2');
                $('.confirmation').addClass('active-tab');        
            }
        } else {

            var curStep = $(this).closest(".setup-content-2"),
            curStepBtn = curStep.attr("id"),
            nextStepSteps = $('div.setup-panel-2 div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
            curInputs = curStep.find("input[type='text'],input[type='url']"),
            isValid = true;

            $(".form-group").removeClass("has-error");
            for(var i=0; i< curInputs.length; i++){
                if (!curInputs[i].validity.valid){
                    isValid = false;
                    $(curInputs[i]).closest(".form-group").addClass("has-error");
                }
            }

            if (isValid)
                nextStepSteps.removeAttr('disabled').trigger('click');

                $('.customer').removeClass('active-tab');
                $('.customer').addClass('btn-circle-2');

                $('.confirmation').removeClass('btn-circle-2');
                $('.confirmation').addClass('active-tab');    

        }
    });

    //-------------------

    $('div.setup-panel-2 div a.btn-amber').trigger('click');
});

$("#prevToWearer").on("click", function(){

    $('.wearer').addClass('active-tab');
    $('.wearer').removeClass('btn-circle-2');

    $('.watcher').addClass('btn-circle-2');
    $('.watcher').removeClass('active-tab');
});

$("#nextToPharmacy").on("click", function(){

});

$("#prevToWatcher").on("click", function(){

    $('.watcher').addClass('active-tab');
    $('.watcher').removeClass('btn-circle-2');

    $('.pharmacy').addClass('btn-circle-2');
    $('.pharmacy').removeClass('active-tab');
});

$("#nextToCustomer").on("click", function(){

    $('.pharmacy').removeClass('active-tab');
    $('.pharmacy').addClass('btn-circle-2');

    $('.customer').removeClass('btn-circle-2');
    $('.customer').addClass('active-tab');

});

$("#prevToPharmacy").on("click", function(){

    $('.pharmacy').addClass('active-tab');
    $('.pharmacy').removeClass('btn-circle-2');

    $('.customer').addClass('btn-circle-2');
    $('.customer').removeClass('active-tab');
});

$("#prevToCustomer").on("click", function(){

    $('.customer').addClass('active-tab');
    $('.customer').removeClass('btn-circle-2');

    $('.confirmation').addClass('btn-circle-2');
    $('.confirmation').removeClass('active-tab');
});