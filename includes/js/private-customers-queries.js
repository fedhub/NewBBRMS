$(document).ready(function() {

    var $rows = $('.row');
    var issue_class = '';

    $('select').on('change', function(){
        var val = $(this).val();
        if(val == 'non'){
            $('.filter-tool, .datepicker-cont, .sub-selection, .sub-filter-tool').css('display', 'none');
            $('.row').css('display', 'table');
            fix_row_data();
        }
        if(val == 'phone'){
            $('.filter-tool, .datepicker-cont, .sub-selection, .sub-filter-tool').css('display', 'none');
            $('.phone-input').css('display', 'block');
            $('.phone-input').val('');
            $('.sub-filter-tool').val('');
            issue_class = '.phone-number';
        }
        if(val == 'first-name'){
            $('.filter-tool, .datepicker-cont, .sub-selection, .sub-filter-tool').css('display', 'none');
            $('.first-name-input').css('display', 'block');
            $('.first-name-input').val('');
            $('.sub-filter-tool').val('');
            issue_class = '.first-name';
        }
        if(val == 'last-name'){
            $('.filter-tool, .datepicker-cont, .sub-selection, .sub-filter-tool').css('display', 'none');
            $('.last-name-input').css('display', 'block');
            $('.last-name-input').val('');
            $('.sub-filter-tool').val('');
            issue_class = '.last-name';
        }
        if(val == 'date'){
            $('.filter-tool, .datepicker-cont, .sub-selection, .sub-filter-tool').css('display', 'none');
            $('.datepicker-cont').css('display', 'block');
            $('.datepicker-cont').find('input').val('');
            $('.sub-filter-tool').val('');
        }
        if(val == 'library-usage' || val == 'orders-amount' || val == 'orders-cost'){
            $('.filter-tool, .datepicker-cont, .sub-selection, .sub-filter-tool').css('display', 'none');
            if($('#sub-select').val() == 'by-phone') $('.sub-filter-tool').css('display', 'block');
            $('.sub-selection').css('display', 'block');
        }
    });

    $('#sub-select').on('change', function() {
        var val = $(this).val();
        if(val == 'by-phone') $('.sub-filter-tool').css('display', 'block');
        else {
            $('.sub-filter-tool').val('');
            $('.sub-filter-tool').css('display', 'none');
        }
    });

    $('#datepicker-from, #datepicker-to').datepicker();
    $('#datepicker-from').datepicker("option", "isRTL", true);
    $('#datepicker-from, #datepicker-to').click(function(){
        $('body').find('.ui-datepicker-rtl').css('direction', 'ltr');
    });
    $('#datepicker-from, #datepicker-to').datepicker( "option", "dateFormat", "dd/mm/yy" );

    $('.filter-tool').on('keyup', function(){
        var val  = $(this).val();
        var val_length = val.length;
        $('.row').css('display', 'table');
        $rows.each(function(i){
            var text = $(this).find(issue_class).text();
            if(text.substring(0,val_length) != val){
                $('.row:eq('+i+')').css('display', 'none');
            }
        });
        fix_row_data();
    });

    $('#datepicker-search').click(function(e){
        var from = $('#datepicker-from').val();
        var to = $('#datepicker-to').val();
        var msg = '';
        if(from.length != 10 && to.length != 10) msg = 'הזן תאריך  תקני';
        if(msg.length > 0) alert(msg);
        else {
            var dates_search_type = '';
            if (from.length == 10 && to.length == 10) dates_search_type = 'from-to';
            if (from.length == 10 && to.length != 10) dates_search_type = 'from';
            if (from.length != 10 && to.length == 10) dates_search_type = 'to';
            get_by_dates(dates_search_type, from, to, $rows);
        }
    });

    $('#sub-selection-search').click(function(){
        var main_val = $('#main-select').val();
        var sub_val = $('#sub-select').val();
        if(main_val == 'library-usage'){
            if(sub_val == 'less') libraries('less', $rows);
            if(sub_val == 'most') libraries('most', $rows);
            if(sub_val == 'by-phone') libraries('phone-number', $rows);
        }
    });

});

function get_by_dates(type, from, to, $rows){
    from = from.split('/');
    parseInt(from[0]);
    parseInt(from[1]);
    parseInt(from[2]);
    to = to.split('/');
    parseInt(to[0]);
    parseInt(to[1]);
    parseInt(to[2]);
    $('.row').css('display', 'none');
    $rows.each(function(i){
        var date = $(this).find('.registration-date').text().split('.');
        parseInt(date[0]);
        parseInt(date[1]);
        parseInt(date[2]);
        if(type == 'from'){
            if(date_from(date, from))
                $('.row:eq('+i+')').css('display', 'table');
        }
        if(type == 'to'){
            if(date_to(date, to)) $('.row:eq('+i+')').css('display', 'table');
        }
        if(type == 'from-to'){
            if(date_from(date, from) && date_to(date, to)) $('.row:eq('+i+')').css('display', 'table');
        }
    });
    fix_row_data();
}

function date_from(date, from){
    if(date[2] >= from[2] && date[1] >= from[1] && date[0] >= from[0]) return true;
    return false;
}

function date_to(date, to){
    if(date[2] < to[2]) return true;
    if(date[2] == to[2]){
        if(date[1] < to[1]) return true;
        if(date[1] == to[1]){
            if(date[0] <= to[0]) return true;
        }
    }
    return false;
}

function fix_row_data(){
    $('.row:visible').each(function(i){
        $(this).find('.serial-number p').html((i+1));
        if(i % 2 == 0){
            $(this).css('background-color', '#EEF3F5');
            $(this).hover(
                function() {
                    $(this).css('background-color', '#D0DFE5')
                }, function() {
                    $(this).css('background-color', '#EEF3F5')
                });
        }
        else{
            $(this).css('background-color', '#FFF');
            $(this).hover(
                function() {
                    $(this).css('background-color', '#D9D9D9')
                }, function() {
                    $(this).css('background-color', '#FFF')
                });
        }
    });
    var total = 'סה"כ: ';
    total += $('.row:visible').length;
    $('.total p').html(total);
}

function libraries(type, $rows){
    var url = '';
    if(type == 'most') url = base_url + '/get-most-libraries';
    if(type == 'less') url = base_url + '/get-libraries-phones';
    if(type == 'phone-number') url = base_url + '/libraries-by-phone&phone_number='+$('.sub-filter-tool').val();

    $.ajax({
        url: url,
        type: 'POST'
    }).done(function(res){
        if(!res.status) alert(res.msg);
        else{
            $('.row').css('display', 'table');
            $rows.each(function(j){
                var text = $(this).find('.phone-number').text();
                for(var i = 0; i < res.phones.length; i++){
                    if(type == 'less'){
                        if(text == res.phones[i].phone_number){
                            $('.row:eq('+j+')').css('display', 'none');
                        }
                    }
                    if(type == 'most' || type == 'phone-number'){
                        if(text != res.phones[i].phone_number){
                            $('.row:eq('+j+')').css('display', 'none');
                        }
                    }
                }
            });
            fix_row_data_libraries(res.sum);
        }
    });
}

function fix_row_data_libraries(sum){
    $('.row:visible').each(function(i){
        $(this).find('.serial-number p').html((i+1));
        if(i % 2 == 0){
            $(this).css('background-color', '#EEF3F5');
            $(this).hover(
                function() {
                    $(this).css('background-color', '#D0DFE5')
                }, function() {
                    $(this).css('background-color', '#EEF3F5')
                });
        }
        else{
            $(this).css('background-color', '#FFF');
            $(this).hover(
                function() {
                    $(this).css('background-color', '#D9D9D9')
                }, function() {
                    $(this).css('background-color', '#FFF')
                });
        }
    });
    var total = 'סה"כ: ';
    total += $('.row:visible').length;
    total += ', ';
    total += 'כמות ספריות: ';
    total += sum;
    $('.total p').html(total);
}