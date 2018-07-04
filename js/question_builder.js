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
    var respondentFormTemplate = '<h5>Categories</h5>'+
                    '<form>'+
                        '<input id="question_set_id" type="hidden" />'+
                            '<div class="form-group">'+
                            '<label for="category_title">Category Name</label>'+
                            '<input type="text" class="form-control" id="category_title" aria-describedby="titleHelp" placeholder="Enter your category">'+
                          '</div>'+
                          '<div class="form-check mb-2">'+
                            '<a id="add_category" class="btn btn-outline-secondary"><i class="fas fa-plus"></i>Add Category</a>'+
                        '</div>'+
                        '<ul id="categories_holder"></ul>'+
                    '</form>'+
                         '<div><h5>Add Respondent</h5>'+
                    '<form>'+
                       '<div class="form-group">'+
                          '<label for="respondent_name">Respondent Name</label>'+
                          '<input type="text" class="form-control" id="respondent_name" aria-describedby="titleHelp" placeholder="Enter respondent name" />'+
                        '</div>'+
                        '<div class="form-group">'+
                          '<label for="category">Category</label>'+
                          '<select  class="form-control" id="category" ></select>'+
                        '</div>'+
                        '<div class="form-check mb-2">'+
                          '<a id="add_respondent" class="btn btn-outline-secondary"><i class="fas fa-plus"></i>Add Respondent</a>'+
                      '</div>'+
                      '<ul id="respondents_holder"></ul>'+
                   '</form></div>'+
                           '<div><h5>Add Answers</h5>'+
                   '<form>'+
                         '<div class="form-group">'+
                          '<label for="respondent">Select Respondent</label>'+
                          '<select  class="form-control" id="respondent" ></select>'+
                        '</div>'+ 
                        '<div id="question_entries"></div>'+
                        '<div class="form-check mb-2">'+
                            '<a id="save_answers" class="btn btn-outline-secondary">Save Answers</a>'+
                        '</div>'+
                    '</form>'+
                    '<a id="close_answer_screen" class="btn btn-primary">View Question Set Table</a>'+
                    '</div>';
    //init with questions
    var question_sets = answer_object.question_object;
    build_question_table(question_sets);
    /*** CONTROL LISTENERS  ***/
    //add question set hit
    $(document).on('click','#add_question_set', function(event) {
        event.preventDefault();
        
        //display question builder form
        create_question_builder();
    });
    
    //add question to set hit
    $(document).on('click', '#add_question', function(event) {
        event.preventDefault();
        //add to set_questions div
        //get number of questions in set
        add_question();
    });
    
    //question set create button clicked
    $(document).on( 'click', '#create_set', function() {
        //see if this is from an edited set
        var id = $('#q_set_id').val();
        id = (id === '' ) ? 'new' : id;
        
        //do validation
        if( validate_q_set()){
            //get questions
            var questions = [];
            $('#set_questions textarea' ).each(function(){
                    questions.push($( this ).val());  
            });
            var data = {
                'questions' : questions,
                'id' : id,
                'action' : 'create_question_set',
                'title'  : $( '#title' ).val(),
                'nonce' : answer_object.nonce
            };
            make_post_call_get_new_questions(data);
            
        }
    });
    //edit question set hit
    $(document).on('click','.edit_set', function(event){
        event.preventDefault();
        
        var q_set_id = $( this ).data('id');
        
        if( q_set_id != '' ){
            create_question_builder( q_set_id );
            
        } else {
            make_alert('danger', 'An error occurred.  Not able to edit set.');
        }
    });
    
    //delete a question set
    $(document).on('click', '.delete_set', function(event){
        var id = $( this ).data('id');
        var data = {
            id: id,
            action: 'delete_question_set',
            nonce: answer_object.nonce
        }
        if(id !== ''  && typeof id !== 'undefined' ){
            var cnf = confirm('Do you really want to delete this set and all it\'s data?');
            
            if( cnf == true ){
                make_post_call_get_new_questions(data);
            }
            
        } else {
            make_alert('danger', 'Error cannot delete set');
        }
    });
    //open user screen
    $(document).on('click',  '.add_user', function(){
        var id = $( this ).data('id');
        create_user_screen(id);
    });
    //close user screen
    $(document).on('click','#close_answer_screen', function(event) {
        event.preventDefault();
        $('#user_builder').addClass('hidden');
        $('#user_builder').html('');
        $('#questions').slideDown();
    });
    
    //add category
    $(document).on('click','#add_category', function(event) {
        event.preventDefault();
        var cat = $('#category_title').val().trim();
        var errors = [];
        
        //validate
        if( $('#category_title').val() == '' ){
            errors.push("Cannot add a blank category");
        }
        $('#category option').each(function(){
            var op_cat = $(this).val().trim().toLowerCase();
            var cat_format = cat.trim().toLowerCase();
            if( op_cat == cat_format && cat !== '' ){
                errors.push("Category "+cat+" already exists");
            }
        });
        
        if( errors.length > 0 ) {
            $.each(errors, function(index, value) {
                make_alert('danger', value );
            })
        } else {
            //add category
            var id = $('#question_set_id').val();
            var data = {
                id: id,
                nonce: answer_object.nonce,
                action: 'add_respondent_category',
                category: cat
            }
            //update question set
            var made = make_post_call_get_new_questions(data, true);
            
            if( made == true ) {
                $('#category_title').val('');
                //add to category select
                add_category( cat );
                sortSelect(document.getElementById('category'));
            }
        }
    });
    
    //delete category
    $(document).on('click','.delete_category', function(){
        var cnf = confirm("Are you sure you want to delete this category?");
        
        if( cnf == true){
            var cat = $( this ).data('cat');
            var data = {
                id: $('#question_set_id').val(),
                cat_id: $( this ).data('id'),
                cat: cat,
                nonce: answer_object.nonce,
                action: 'delete_question_category'
            }
            
            var delete_cat = make_post_call_get_new_questions(data, true );
            
            if( delete_cat == true ){
                $('#category option').each( function() {
                    var value = $( this ).val();
                    if(  value == cat ){
                        $( this ).remove();
                    }
                });
                
                $( this ).parent('li').remove();
            }
        }
    });
    
    //add respondent
    $(document).on('click', '#add_respondent', function(event){
        event.preventDefault();
        
        //validate
        var name = $('#respondent_name').val().trim();
        var cat = $('#category').val();
        var errors = [];
        if( name == '' ){
            errors.push('Can not add a blank name');
        }
        $('#respondent option').each(function(){
            var op_name = $( this ).text().trim().toLowerCase();
            var f_name = name.toLowerCase();
            if( f_name === op_name && op_name !== '' ){
                errors.push("There is already a respondent with this name");
            } 
        });
        
        if( errors.length > 0 ){
            $.each(errors, function(index, value){
               make_alert('danger',value); 
            });
        } else {
            var q_id = $('#question_set_id').val();
            //add respondent
            var data = {
                id: q_id,
                name: name,
                category: cat,
                nonce: answer_object.nonce,
                action: 'add_question_respondent'
            }
            
            var made = make_post_call_get_new_questions(data, true);
            
            if( made == true ){
                $('#respondent_name').val('');
                add_respondent(q_id, name);
                sortSelect(document.getElementById('respondent'));
            } else {
                make_alert('danger', 'Error occurred and respondent was not added');
            }
        }
    });
    
    //delete respondent
    $(document).on('click',  '.delete_respondent', function(event) {
        event.preventDefault();
        var cnf = confirm('Are you sure you want to remove this respondent and all their data?');
        
        if( cnf == true ){
            //init values
            var name = $( this ).data('name');
            var r_id = $( this ).data('id');
            var q_id = $('#question_set_id').val();
            //create data object
            var data = {
                id: q_id,
                index: r_id,
                name: name,
                nonce: answer_object.nonce,
                action: 'delete_question_respondent'
            }
            //send data object
            var make = make_post_call_get_new_questions(data, true);
            //if success remove from ul and select
            if( make == true ){
               remove_and_create_respondents(q_id);
            } else {
                make_alert('danger', 'An error occurred and respondent was not deleted');
            }
        }
    });
    
    //switch categories on respondent
    $(document).on('click', '.change_category', function (event) {
        event.preventDefault();
        var q_id = $('#question_set_id').val();
        var r_id = $( this ).data('id');
        
        switch_category(q_id, r_id);
    });
    //edit respondent name
    $(document).on('click','.edit_respondent', function(event){
        event.preventDefault();
        var q_id = $('#question_set_id').val();
        var r_id = $( this ).data('id');
        var name = $( this ).data('name');
        
        edit_respondent_name(q_id, r_id, name );
    });
    //switch to respondents answers
    $(document).on('change', '#respondent', function(event){
        var q_id = $('#question_set_id').val();
        var r_id = $( this ).val();
        
        var count = 0;
        
        //fill all textareas with blank
        $('#question_entries textarea').each(function(){
            var t_id = $(this).attr('id');
            if( r_id == '' || typeof question_sets[q_id].responders[r_id].answers[count] == 'undefined' ){
                $( this ).val('');
                tmce_setContent('',t_id);
            } else {
                $( this ).val(question_sets[q_id].responders[r_id].answers[count]);
                tmce_setContent(question_sets[q_id].responders[r_id].answers[count],t_id);
            }
            count++;
        });
        
    });
    //save answer to respondent
    $(document).on('click','#save_answers', function(event){
        //validate
        var q_id = $('#question_set_id').val();
        var r_id = $('#respondent').val(); 
        
        if( r_id == '' ){
            make_alert('danger', "You must select a user before entering answers");
        } else {
            var answers = [];
            $('#question_entries textarea').each(function(){
                var t_id = $(this).attr('id');
                answers.push(tmce_getContent(t_id));
            });
            var data ={
                id: q_id,
                r_id: r_id,
                answers: answers,
                nonce: answer_object.nonce,
                action: 'edit_respondent_answers'
            }
            //send data object
            var make = make_post_call_get_new_questions(data, true);
            
            if( make !== true ){
                make_alert('danger', 'Failed to save questions');
            } else {
                make_alert('success', 'Questions saved successfully');
            }
        }
    });
    //remove red borders if area gets filled for validation
    $(document).on( 'keypress', '#question_builder form .border.border-danger', function(){
        if( $( this ).val() !== '' ){
            $( this ).removeClass( 'border-danger');
            $( this ).removeClass( 'border' );
        }
    });
    
    /*** FUNCTIONS  ***/
    function add_category( cat ){
        $('#category').append('<option value="'+cat+'">'+cat+'</option>');
        var cat_id = $('#category_holder li').length;
        $('#categories_holder').append(
                '<li>'+
                    cat+
                    '<span class="delete_category" data-cat="'+cat+'" data-id="'+cat_id+'" title="Delete Category"><i class="fas fa-minus-circle"></i></span>'+
                '</li>'
                );
    }
    function add_respondent( id, name ){
        //find respondent index by name
        var r_id = -1;
        $.each(question_sets[id].responders, function( index, value){
            if ( value.name == name ){
                r_id = index;
            }
        });
        
        if( r_id != -1 ){
            //add
            $('#respondent').append('<option value="'+r_id+'">'+name+'</option>');
            var cat_id = $('#respondent_holder li').length;
            $('#respondents_holder').append(
                    '<li>'+
                        name+
                        '<span class="delete_respondent" title="Delete Respondent" data-name="'+name+'" data-id="'+r_id+'" title="Delete Respondent"><i class="fas fa-minus-circle"></i></span>'+
                        '<span class="change_category" title="Change Category" data-name="'+name+'" data-id="'+r_id+'" title="ChangeRespondent"><i class="fas fa-exchange-alt"></i></span>'+
                        '<span class="edit_respondent" title="Change Category" data-name="'+name+'" data-id="'+r_id+'" title="ChangeRespondent"><i class="fas fa-pencil-alt"></i></span>'+
                    '</li>'
                    );
        }
    }
    function make_post_call_get_new_questions(data, update_only = false) {
       var result = false;
                    $.ajax({
                        method: 'post',
                        url: answer_object.ajax_url, 
                        data: data, 
                        dataType: 'json',
                        async: false,
                        success: function(response){
                                console.log( response );
                                if( response.result === 'success' ){
                                    question_sets = response.object //update question set object
                                    if( !update_only ){
                                        build_question_table(question_sets);
                                    }
                                    result = true;
                                } else {
                                    make_alert('danger', 'Data not saved.' );
                                }
                        },
                        error: function() {
                                make_alert('danger', 'Data not saved.' );
                                result = false;
                            }
                        });
        return result;
    }
    function create_user_screen(id) {
        //build template
        $('#user_builder').html(respondentFormTemplate);
        //set question id
        $('#question_set_id').val(id);
        //fill different select buttons
        $('#category').find('option').remove();
        $('#category').append('<option value=""></option>');
        $.each(question_sets[id].categories, function(index, value){
            add_category( value );
        });
        $('#respondent').find('option').remove();
        $('#respondent').append('<option value=""></value>');
        $.each(question_sets[id].responders, function(index, value){
            add_respondent(id, value.name );
        });
        
        //build out questions
        var id_counter = 0;
        $.each(question_sets[id].questions, function(index, value){
            $('#question_entries').append(
                    '<div class="form-group">'+
                        '<label>'+(id_counter+1)+'. '+value+'</label>'+
                        '<textarea id="'+id_counter+'" class="form-control" data-question="'+index+'"></textarea>'+
                    '</div>'
                    );
            id_counter++;
        });
        
        $('#question_entries textarea').each(function(){
            
            add_tinymce( $(this).attr('id') );
        })
        //close question table screen
        //slider question table up
        $('#questions').slideUp();
        $('#user_builder').removeClass('hidden').slideDown();
    }
    /*
     * Hide Question Set Table and create Question set Builder form
     * @param {type} id
     * @returns {undefined}
     */
    function create_question_builder ( id = false ) {
        
        //slider question table up
        $('#questions').slideUp();
        
        if( id !== false ){
            //build out form based on response
            build_questions(question_sets[id], id);
        } else {
            //build out blank template
            build_questions();
        }
    }
    /*
     * Add question to question set creator form
     * @param {type} value
     * @returns {undefined}
     */
    function add_question( value = '' ){
        var count = $('#set_questions div').length;
        var question = '<div class="form-group start">'+
                        '<label for="question_'+count+'">Question '+(count+1)+'</label>'+
                        '<textarea  class="form-control" id="question_'+count+'"  placeholder="Enter your quesiton here">'+value+'</textarea>'+
                      '</div>';
        $('#set_questions').append(question);
    }
    
    /*
     * Builds questions in question set creator screen
     * @param {type} qObject
     * @param {type} id
     * @returns {undefined}
     */
    function build_questions( qObject = '', id = '' ) {
        
        //set template
        $('#question_builder').html(questionBuilderTemplate)
        $('#question_builder').removeClass('hidden').slideDown();
        $('#q_set_id').val(id);
        
        if( qObject !== '' ) {
            //make create button edit
            $('#create_set').text('Save');
            $('#create_set').removeClass('btn-primary');
            $('#create_set').addClass('btn-info');
            //build out questions based on json object
            $('#title').val(qObject.title);
            $.each(qObject.questions, function (index,value)  {
                    add_question(value);
            });
        }
    }
    /*
     * validate if the question set has all fields filled in
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
    /*
     * builds question set table
     */
    function build_question_table( question_object ) {
        if( ! $('#question_builder').hasClass('hidden') ) {
            $('#question_builder').addClass('hidden');
            $('#questions').slideDown();
        }
        
        var html = '';
        //add questions in qeusiton object to tbody
        for( var id in question_object ) {
            if( question_object.hasOwnProperty(id) ) {
                html += '<tr>' +
                            '<td>'+id+'</td>'+
                            '<td>'+question_object[id].title+'</td>'+
                            '<td> [answer_display id="'+id+'"]</td>'+
                            '<td>'+
                                '<span class="edit_set" data-id="'+id+'" title="Edit Set"><i class="fas fa-pencil-alt"></i></span>'+
                                '<span class="delete_set" data-id="'+id+'" title="Delete Set"><i class="fas fa-minus-circle"></i></span>'+
                                '<span class="add_user" data-id="'+id+'" title="Add Respondent"><i class="fas fa-user-plus"></i></span>'+
                            '</td>'
                         '</tr>';
            }
        }
        //set questions
        $('#quesiton_sets_table tbody').html(html);
        
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
    async function edit_respondent_name(q_id, r_id, name ){
        const {value: new_name} = await swal({
        title: 'What is the new name?',
        input: 'text',
        inputPlaceholder: name,
        showCancelButton: true,
        inputValidator: (value) => {
          return !value && 'You need to write something!'
        }
      })

      if (new_name && new_name != '') {
            //put together data and send to update
            var data = {
                id: q_id,
                r_id: r_id,
                name: name,
                new_name: new_name,
                nonce: answer_object.nonce,
                action: 'edit_respondent_name'
            };
            
            var make = make_post_call_get_new_questions(data, true);
            
            if( make !== true ){
                make_alert('danger', 'Error occurred and name was not changed');
            } else {
                //remove old li an make new one
                remove_and_create_respondents(q_id);
            }
      }
    }
    function remove_and_create_respondents(q_id){
        $('#respondents_holder').html('');
        $('#respondent option').each( function () {
            if( $( this ).val() !== '' ){
                $( this ).remove();
            }
        });
        $.each(question_sets[q_id].responders, function(index, value){
            add_respondent(q_id, value.name);
        });
        sortSelect(document.getElementById('respondent'));
    }
    async function switch_category (q_id, r_id) {
        var options = {};
        $('#category option').each(function(index, value) {
            options[$(this).val()] = $(this).text();
        })
        const {value: category} = await swal({
          title: 'Select Category',
          input: 'select',
          inputOptions: options,
          inputPlaceholder: 'Select cateegory',
          showCancelButton: true,
          inputValidator: (value) => {
            return new Promise((resolve) => {
              
                resolve()
            })
          }
        });

        //put together data
        var data = {
            id: q_id,
            r_id: r_id,
            cat: category,
            nonce: answer_object.nonce,
            action: 'switch_respondent_category' 
        }
        var make = make_post_call_get_new_questions(data, true);
        
        if( make !== true ) {
            make_alert('danger', 'Switching categories failed' );
        }
    }
    function sortSelect(selElem) {
        var tmpAry = new Array();
        for (var i=0;i<selElem.options.length;i++) {
            tmpAry[i] = new Array();
            tmpAry[i][0] = selElem.options[i].text;
            tmpAry[i][1] = selElem.options[i].value;
        }
        tmpAry.sort();
        while (selElem.options.length > 0) {
            selElem.options[0] = null;
        }
        for (var i=0;i<tmpAry.length;i++) {
            var op = new Option(tmpAry[i][0], tmpAry[i][1]);
            selElem.options[i] = op;
        }
        return;
    }
    
    function add_tinymce(id){
        wp.editor.initialize(
            id,
            { 
              tinymce: { 
                wpautop:true, 
                plugins : 'charmap colorpicker compat3x directionality fullscreen hr image lists media paste tabfocus textcolor wordpress wpautoresize wpdialogs wpeditimage wpemoji wpgallery wplink wptextpattern wpview', 
                toolbar1: 'formatselect bold italic | bullist numlist | blockquote | alignleft aligncenter alignright | link unlink | wp_more | spellchecker' 
              }, 
              quicktags: true 
            }
          );
    }
    
    function tmce_getContent(editor_id, textarea_id) {
        if ( typeof editor_id == 'undefined' ) editor_id = wpActiveEditor;
        if ( typeof textarea_id == 'undefined' ) textarea_id = editor_id;

        if ( jQuery('#wp-'+editor_id+'-wrap').hasClass('tmce-active') && tinyMCE.get(editor_id) ) {
          return tinyMCE.get(editor_id).getContent();
        }else{
          return jQuery('#'+textarea_id).val();
        }
      }
      function tmce_setContent(content, editor_id, textarea_id) {
        if ( typeof editor_id == 'undefined' ) editor_id = wpActiveEditor;
        if ( typeof textarea_id == 'undefined' ) textarea_id = editor_id;

        if ( jQuery('#wp-'+editor_id+'-wrap').hasClass('tmce-active') && tinyMCE.get(editor_id) ) {
          return tinyMCE.get(editor_id).setContent(content);
        }else{
          return jQuery('#'+textarea_id).val(content);
        }
      }
});


