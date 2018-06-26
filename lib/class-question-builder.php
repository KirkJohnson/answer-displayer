<?php

if ( ! class_exists('Question_Builder') ) {
  
        class Question_Builder {
                
          
                public function __construct() {
                  
                }
                /*
                 * sets the hooks for the class is responsible for
                 */
                 public function set_hooks() {
                        add_action( 'admin_menu', array( $this, 'create_admin_page' ) );
                        //script and style enqueues
                        add_action( 'admin_enqueue_scripts', array($this, 'admin_script_and_styles' ) );
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
                  * create the admin question builder page
                  */
                 public function question_builder () {
                   ?>
    <div class="wrap container">
        <h1>Question Builder</h1>
        <div id="alerts"></div>
            <div id="questions">
                <div class="row">
                    <table class='table'>
                            <thead>
                                <th scope="col">Question Set Id</th>
                                <th scope="col">Number of Questions</th> 
                                <th scope="col">Number of Responders</th> 
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
    </div>

                  <?php
                 }
         
        }
        
        $question_builder = new Question_Builder();
        $question_builder->set_hooks();
}
