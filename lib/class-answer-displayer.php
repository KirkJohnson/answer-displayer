<?php

if ( ! class_exists('Answer_Displayer') ) {
  
        class Answer_Displayer {
            
            public function __construct() {
              
            }
            
            public function set_hooks(){
                    add_action( 'wp_enqueue_scripts', array($this, 'load_front_end_scripts') );
                    add_shortcode( 'answer_display', array($this, 'render_answers_displayer') );
            }
            
            public function load_front_end_scripts(){
                global $post;
                if( is_a( $post, 'WP_Post' ) && has_shortcode( $post->post_content, 'answer_display') ) {
                      wp_enqueue_style('displayer/front', plugin_dir_url( 'answer-displayer/answer-displayer.php' ) ."css/front.css");
                      wp_enqueue_script('displayer/frontjs', plugin_dir_url( 'answer-displayer/answer-displayer.php' ) ."js/answer_controller.js", ['jquery']);
                      wp_enqueue_script( 'answer_displayer/bootstrap_js', 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js', ['jquery'] );
                      wp_enqueue_style( 'answer_displayer/bootstrap_css', 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css' );
                      wp_enqueue_style( 'answer_displayer/font_awesome', 'https://use.fontawesome.com/releases/v5.1.0/css/all.css' );
                }
                    
            }
            
            public function render_answers_displayer( $atts ){
              if ( is_admin() ){
                return;  //do nothing on admin page
              }
                $object = get_site_option(Question_Builder::$question_set_key);
                $id = $atts["id"];
                $colors = [ 'blime','bred', 'bblue', 'byellow', 'bpurple', 'bdpink', 'bpeach', 'bturq'];
                
                //assign border color to candidate
                $bcolors = 0;
                foreach($object[$id]['responders'] as $index => $resp ) {
                    $bcolors = (count($colors) == $bcolors ) ? 0 : $bcolors;
                    $object[$id]['responders'][$index]['border'] = $colors[$bcolors];
                    $bcolors++;
                }
                
                if( !isset($object[$id]) ) {
                    echo "<h5>No Data to display</h5>";
                } else { 
                    //init values
                    $title = $object[$id]['title'];
                    
                    //organize respondent filters
                    $filters = array();
                    sort($object[$id]['categories']);
                    
                    //sort by title
                    foreach($object[$id]['categories'] as $cat ){
                        $filters[$cat] = array();
                    }
                    
                    $filters['No Category'] = array();
                    
                    //put users in these
                    foreach($object[$id]['responders'] as $resp){
                        if(isset($filters[$resp['category']])) {
                            $filters[$resp['category']][] = $resp;
                        } else {
                            $filters['No Category'][] = $resp;
                        }
                    }
                    
                    
                  ?>
<h5><?php echo $title; ?></h5>
    
      <div id='filters' class=" row col-md-12">
          <?php foreach( $filters as $category => $responders ) { ?>
              <div class="col-md-3">
                  <div class="form-check">
                    <input class="form-check-input cat_checkbox" type="checkbox" name="cat_checkbox" data-cat="<?php echo sanitize_title($category);?>"  value="category" >
                    <label class="form-check-label" for="exampleRadios1">
                        <b><?php echo $category;?></b>
                    </label>
                  </div>
                  <?php foreach ($responders as $res) { ?>
                  <div class="form-check">
                    <input class="form-check-input respondent_checkbox" type="checkbox" name="respondent_checkbox" data-cat="<?php echo sanitize_title($category);?>"  value="<?php echo sanitize_title($res['name']);?>" >
                    <label class="form-check-label" for="exampleRadios1">
                        <?php echo $res['name'];?>
                    </label>
                  </div>
                  <?php } ?>
              </div>
        <?php  } ?>
      </div>
    <div id="questions" class="row">
            <?php 
            $count = 0;
            
            foreach($object[$id]['questions'] as  $q_number => $question) { 
             
?>
            <div class="col-md-12 question">
                <p><b><?php echo ($q_number+1).". ". $question;?></b></p>
            </div>
              <?php foreach($object[$id]['responders'] as $index => $resp ) { 
                $answer = (isset($resp['answers'][$count])) ? $resp['answers'][$count] : "";
                $user = sanitize_title($resp['name']);
                $category = (isset($resp['category'])) ? sanitize_title($resp['category']) : sanitize_title('No Category');
                ?>
        <div class="col-md-12 answer <?php echo $user.' '.$category.' '.$resp['border']; ?>">
                <div class="user_name">
                    <?php echo $resp['name'];?>
                </div>
            <?php echo $answer; $bcolors++;?> 
        </div>
              <?php } 
              $count++;
              ?>
         <?php } ?>
    </div>
</div>
    
                  <?php
                }
            }
         
        }
        
        $answer_displayer = new Answer_Displayer();
        $answer_displayer->set_hooks();
}
