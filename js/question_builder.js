jQuery(document).ready(function($){
    //templates
    var questionBuilderTemplate = '<form>'+
                  '<input id="q_set_id" type="hidden" />'+
                  '<div class="form-group start">'+
                    '<label for="title">Title</label>'+
                    '<input type="text" class="form-control" id="title" aria-describedby="titleHelp" placeholder="Enter title">'+
                    '<small id="titleHelp" class="form-text text-muted">Enter a title for your set</small>'+
                  '</div>'+
                  '<div id="set_questions"></div>'+
                  '<div class="form-check mb-2">'+
                      '<a id="add_question" class="btn btn-outline-secondary"><i class="fas fa-plus"></i>Add Question</a>'+
                  '</div>'+
                    '<a id="create_set" class="btn btn-primary">Create</a>'+
                '</form>';
    
    /*** CONTROL LISTENERS  ***/
    //add question set hit
    $(document).on('click','#add_question_set', function(event) {
        event.preventDefault();
        
        //slider question table up
        $('#questions').slideUp();
        //display question builder form
        create_question_builder();
    });
    
    //add question to set hit
    $(document).on('click', '#add_question', function(event) {
        event.preventDefault();
        //add to set_questions div
        //get number of questions in set
        var count = $('#set_questions div').length;
        var question = '<div class="form-group start">'+
                        '<label for="question_'+count+'">Question '+(count+1)+'</label>'+
                        '<textarea  class="form-control" id="question_'+count+'"  placeholder="Enter your quesiton here"></textarea>'+
                      '</div>';
        $('#set_questions').append(question);
    });
    
    //question set create button clicked
    $(document).on( 'click', '#create_set', function() {
        //see if this is from an edited set
        var id = $('#q_set_id').val();
        id = (id === '' ) ? 'new' : id;
        
        //do validation
        if( validate_q_set()){
            
        }
    });
    
    //remove red borders if area gets filled
    $(document).on( 'keypress', '#question_builder form .border.border-danger', function(){
        if( $( this ).val() !== '' ){
            $( this ).removeClass( 'border-danger');
            $( this ).removeClass( 'border' );
        }
    })
    
    /*** FUNCTIONS  ***/
    function create_question_builder ( id = false ) {
        
        if( id !== false ){
            //build out form based on response
        } else {
            //build out blank template
            build_questions();
        }
    }
    
    function build_questions( questions = '' ) {
        
        //set template
        $('#question_builder').html(questionBuilderTemplate)
        $('#question_builder').removeClass('hidden').slideDown();
        
        if( questions !== '' ) {
            //build out questions based on json object
        }
    }
    /*
     * @returns bool
     */
    function validate_q_set(){
        var errors = [];
        var errorClasses = 'border border-danger';
        if( $('#title').val() == '' ){
            errors.push('Title element missing.' );
            $('#title').addClass(errorClasses);
        }
        
        if( $('#set_questions textarea' ).length == 0 ){
            errors.push('You must create some questions in order to save a set.' );
        } else {
            var count = 1;
            $('#set_questions textarea' ).each(function(){
                    if( $( this ).val() === '' ) {
                        errors.push('Question '+count+ ' missing value.');
                        $( this ).addClass(errorClasses);
                    }
            });
        }
        
        if( errors.length > 0 ) {
            var msg = '<ul>';
            for( var i =0; i < errors.length; i++ ){
                msg += '<li>'+errors[i]+'</li>';
            }
            msg += '</ul>';
            
            make_alert('danger', '<p>You have the following errors you must fix before proceeding</p>'+msg);
            return false;
        }
        
        return true;
    }
    function make_alert( type, message ){
        var alert = '<div class="alert alert-'+type+' alert-dismissible fade show" role="alert">'+
                    message +
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'+
                        '<span aria-hidden="true">&times;</span>'+
                    '</button>'+
                    '</div>';
        $('#alerts').append(alert);
    }
});


