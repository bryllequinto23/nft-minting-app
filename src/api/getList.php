<?php
  if (!isset($_SERVER['HTTP_REFERER']) ) {        
    header( 'HTTP/1.0 403 Forbidden', TRUE, 403 );
  } else{
    $binID = '62f0ff2c5c146d63ca647990';
    $key = '$2b$10$pC5WO8HVYid9mbSFiYI11eXP.mEI0l9cHbWwSGDHTwzYmbK72rDt6';
  
    $url = 'https://api.jsonbin.io/v3/b/'.$binID.'/latest';
  
    $fields = [
      'X-Access-Key:'.$key
    ];
  
    $ch = curl_init();
  
    curl_setopt($ch,CURLOPT_URL, $url);
    curl_setopt($ch,CURLOPT_HTTPHEADER, $fields);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER, true); 
  
    $result = json_decode(curl_exec($ch));
    curl_close($ch);
  
    echo json_encode($result->record);
  }
  
?>