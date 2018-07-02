<?php

if ( ! class_exists('Question_Builder') ) {
  
        class Question_Builder {
                public static $question_set_key = 'answer_builder_quetion_object';
                /*
                 *  question_set_object looks like:
                 * 
                 * [
                 *      0 => [ 'questions' => [] ,
                 *            'responders' => [   'name',
                 *                                  'category',
                 *                                  'answers' => [ //answers in same order as questions]
                 *                              ]
                 *             'categories' ] => [ 
                 *                                      0 => 'name'
                 *                                 ],
                 *              'title' => title
                 *         ]
                 *                                  
                 * ]
                 * 
                 */
                public function __construct() {
                  
                }
                /*
                 * sets the hooks for the class is responsible for
                 */
                 public function set_hooks() {
                        add_action( 'admin_menu', array( $this, 'create_admin_page' ) );
                        //script and style enqueues
                        add_action( 'admin_enqueue_scripts', array($this, 'admin_script_and_styles' ) );
                        
                        //ajax
                        if (wp_doing_ajax()) {
                            add_action('wp_ajax_create_question_set', array($this, 'create_question_set'));
                            add_action('wp_ajax_delete_question_set', array($this, 'delete_question_set'));
                            add_action('wp_ajax_add_respondent_category', array($this, 'add_respondent_category'));
                            add_action('wp_ajax_delete_question_category', array($this, 'delete_question_category'));
                            add_action('wp_ajax_add_question_respondent', array($this, 'add_question_respondent'));
                            add_action('wp_ajax_delete_question_respondent', array($this, 'delete_question_respondent'));
                        }
                 }
                 /*
                  * admin script and styles
                  */
                 public function admin_script_and_styles () {
                        //only enequeue these for the admin question builder page
                        if ( isset($_REQUEST['page']) && $_REQUEST['page'] == 'question_builder' ) {
                                //register and enqueue bootstrap styles and scripts
                                wp_register_style( 'answer_displayer/bootstrap_css', 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css' );
                                wp_register_style( 'answer_displayer/font_awesome', 'https://use.fontawesome.com/releases/v5.1.0/css/all.css' );
                                wp_register_style( 'answer_displayer/style', plugin_dir_url('answer-displayer/answer-displayer.php').'css/style.css' );
                                wp_register_script( 'answer_displayer/bootstrap_js', 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js', ['jquery'] );
                                wp_register_script( 'answer_displayer/question_builder',plugin_dir_url( 'answer-displayer/answer-displayer.php' ) . "js/question_builder.js", ['jquery']  );
                                wp_enqueue_style( 'answer_displayer/bootstrap_css' );
                                wp_enqueue_style( 'answer_displayer/font_awesome' );
                                wp_enqueue_style( 'answer_displayer/style' );
                                wp_enqueue_script( 'answer_displayer/bootstrap_js' );
                                wp_enqueue_script( 'answer_displayer/question_builder' );
                                
                                //localize script for AJAX calls
                                $question_object = get_site_option(Question_Builder::$question_set_key);
                                $question_object = ($question_object == false ) ? [] : $question_object;
                                wp_localize_script( 'answer_displayer/question_builder', 'answer_object', array(
                                        'ajax_url' => admin_url('admin-ajax.php'),
                                        'nonce' => wp_create_nonce('answer_nonce'),
                                        'question_object' => $question_object
                                ));
                        }
                 }
                 /*
                  * creates admin page for building questions
                  */
                 public function create_admin_page () {
                        //only create page if user is admin
                        if ( current_user_can( 'administrator' ) ) {
                                //create page
                                add_menu_page('Question Builder', 'Question Builder', 'manage_options','question_builder',
                                        array( $this, 'question_builder') , 'dashicons-tickets', 6 );
                        }
                 }
                 /*
                  * delete a respondent from a question set
                  */
                 public function delete_question_respondent() {
                        $object = $this->verify_nonce_get_object();
                        //init values
                        $id = $_REQUEST['id'];
                        $index = $_REQUEST['index'];
                        $name = $_REQUEST['name'];
                        //if set exists remove respondent
                        if(isset($object[$id])){
                            //check if index cooresponds to respondent else find correct index
                            if( isset($object[$id]['responders'][$index]) && 
                                    $object[$id]['responders'][$index]['name'] != $name ){
                                foreach( $object[$id]['responders'] as $ind => $res ){
                                        if( $name == $res['name'] ) {
                                            $index = $ind;
                                            break;
                                        }
                                } 
                            }
                            //if all is correct unset and send
                            if( isset ($object[$id]['responders'][$index]) && 
                                    $object[$id]['responders'][$index]['name'] == $name){
                                    unset($object[$id]['responders'][$index]); //remove from set
                                    update_site_option(Question_Builder::$question_set_key, $object); //update
                                    $this->send_ajax_object($object); //send successful response
                            }
                        }
                        //if we got here send error
                        wp_send_json_error();
                        
                 }
                 /*
                  * add a respondent to a qeustion set
                  */
                 public function add_question_respondent() {
                        $object = $this->verify_nonce_get_object();
                        //init vars
                        $id = $_REQUEST['id'];
                        $name = sanitize_text_field($_REQUEST['name']);
                        $cat = sanitize_text_field($_REQUEST['category']);
                        
                        if(isset($object[$id])){
                            //add respondent
                            $object[$id]['responders'][] = array( 'name' => $name, 'category' => $cat );
                            update_site_option(Question_Builder::$question_set_key, $object);
                            $this->send_ajax_object($object); //successful call return
                        }
                        //if we got here send error
                        wp_send_json_error();
                 }
                 /*
                  * reformatted resuable part of code
                  */
                 private function verify_nonce_get_object() {
                         //verify nonce
                        if (!wp_verify_nonce($_REQUEST['nonce'], 'answer_nonce')) {
                            die(__('Busted.')); // Nonce check
                        }
                        //get object
                        $object = get_site_option(Question_Builder::$question_set_key);
                        return $object;
                 }
                 public function delete_question_category() {
                       $object = $this->verify_nonce_get_object();
                        //get cat index
                        $cat_index = $_REQUEST["cat_id"];
                        $cat = $_REQUEST['cat'];
                        $id = $_REQUEST['id'];
                        //verify cat is correct else get index by value
                        if( $object[$id]['categories'][$cat_index] != $cat ) {
                            $cat_index = array_search($cat, $object[$id]['categories'][$cat_index]);
                        }
                        
                        if(isset($object[$id]['categories'][$cat_index])){
                            unset($object[$id]['categories'][$cat_index]);
                            //unset all respondents category
                            foreach($object[$id]['responders'] as $index => $res ){
                                if( $res['category'] == $cat ){
                                    $object[$id]['responders'][$index]['category'] = '';
                                }
                            }
                            
                            update_site_option(Question_Builder::$question_set_key, $object);
                            $this->send_ajax_object($object);
                        }
                        wp_send_json_error();
                 }
                 public function delete_question_set(){
                         $object = $this->verify_nonce_get_object();
                        //unset questions set
                        unset($object[$_REQUEST['id']]);
                        //update object
                        update_site_option($object, Question_Builder::$question_set_key);
                        //return new object
                        $this->send_ajax_object($object);
                 }
                 
                 public function add_respondent_category() {
                        $object = $this->verify_nonce_get_object();
                        
                        $object[$_REQUEST['id']]['categories'][] = sanitize_text_field($_REQUEST['category']);
                        
                        update_site_option(Question_Builder::$question_set_key, $object);
                        
                        $this->send_ajax_object($object);
                 
                 }
                 /*
                  * AJAX call creates a questions set or adds a new one
                  * 
                  * @return json with a json object of the various quetion sets
                  */
                 public function create_question_set() {
                        $object = $this->verify_nonce_get_object();
                        //if nothing is set create an array
                        if ( ! $object ) {
                            $object = array();
                        }
                        
                        //sanitize input
                        $id = $_REQUEST['id'];
                        $title = sanitize_text_field($_REQUEST['title']);
                        $questions = array();
                        foreach( $_REQUEST['questions']  as $q ){
                            $questions[] = sanitize_textarea_field($q);
                        }
                        
                        //add questions to array and blank arrays for the rest of items
                        if( $id == 'new' || !isset($object[$id]) ) {
                            //create a string id so if qeustions get deleted indexes don't renumber
                            // and shortcodes won't be lost
                            if(count($object) == 0  ) {
                                $id = 'set_0';
                            } else {
                                end($object);
                                $id = "set_". (intval(str_replace("set_","",key($object))) + 1)."";
                            }
                            
                            $object[$id] = array(
                                'questions' => $questions,
                                'responders' => array(),
                                'categories' => array(),
                                'title' => $title
                                );
                        } else {
                            $object[$id]['questions'] = $questions;
                            $object[$id]['title'] = $title;
                        }
                        //update site option
                        update_site_option(Question_Builder::$question_set_key, $object);
                        
                        //send object
                        $this->send_ajax_object($object);
                 }
                 private function send_ajax_object($object) {
                        //send object back
                        wp_send_json( array("result"=>"success", "object" => $object));
                 }
                 /*
                  * create the admin question builder page
                  */
                 public function question_builder () {
                   ?>
    <div class="wrap container">
        <h1>Question Builder</h1>
        <div id="alerts"></div>
            <div id="questions">
                <div class="row">
                    <table id="quesiton_sets_table" class='table'>
                            <thead>
                                <th scope="col">Question Set Id</th>
                                <th scope="col">Number of Questions</th> 
                                <th scope="col">Number of Responders</th> 
                                <th scope="col">Actions</th>
                            </thead>
                            <tbody>
                                
                            </tbody>
                    </table>
               </div>
               <div class="row">
                   <a href="#" id="add_question_set" class="btn btn-success" >Add Question Set</a>
               </div>
            </div>
            <div id='question_builder' class='hidden'>
                 
            </div>
            <div id="user_builder" class='hidden' >
          
            </div>
    </div>

                  <?php
                 }
         
        }
        
        $question_builder = new Question_Builder();
        $question_builder->set_hooks();
}
