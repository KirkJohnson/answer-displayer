<?php
/*
Plugin Name: Answer Displayer
Plugin URI: 
GitHub Plugin URI: 
Description: Allows you to display answers from multiple peopel to questions you have created.  
             Very useful if displaying a comparison of answers to a questionnaire.
Version: 0.0.1
*/

//files to include

$plugin_includes = [
  '/lib/class-question-builder.php',    // Scripts and stylesheets
  '/lib/class-answer-displayer.php',    //for displaying questions sets on the front page
  
];

foreach ($plugin_includes as $file) {
  $filepath = dirname(__FILE__).$file;
  if (! file_exists($filepath) ) {
    trigger_error(sprintf(__('Error locating %s for inclusion', 'answer_displayer'), $file), E_USER_ERROR);
  }

  require_once $filepath;
}
unset($file, $filepath);
