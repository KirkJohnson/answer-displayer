jQuery(document).ready(function($){
    
    //listeners
    $(document).on('click','#filters input[type="checkbox"]', function(event){
        //is check or uncheck
        var isChecked = $( this ).is(":checked");
        var value = $( this ).val();
        
        //if category treat differently
        if( value == 'category' ){
            var cat = $(this).data('cat');
            if(isChecked){
                //check all items in check box with this category
                $('#filters input[data-cat="'+cat+'"]').each(function(){
                    $(this).prop('checked',true);
                });
                $('.answer.'+cat).each(function(){
                    $(this).fadeIn();
                })
            } else {
                $('#filters input[data-cat="'+cat+'"]').each(function(){
                    $(this).prop('checked',false);
                });
                $('.answer.'+cat).each(function(){
                    $(this).fadeOut();
                })
            }
        } else {
            if(isChecked){
                $('.answer.'+value).each(function(){
                    $(this).fadeIn();
                });
            } else {
                $('.answer.'+value).each(function(){
                    $(this).fadeOut();
                });
            }
        }
    });
});

