<?php
  $tkn = file_get_contents("php://input");;

  if (isset($tkn)) {
    $key = '6LcMexAhAAAAAOncBYhSPqc1A0CD2zl5dvSlpv3j';

    $dec = json_decode($tkn);
    $tkn = $dec->token;

    $url = 'https://www.google.com/recaptcha/api/siteverify';

    $fields = [
      'secret' => $key,
      'response' => $tkn
    ];

    $ch = curl_init();

    curl_setopt($ch,CURLOPT_URL, $url);
    curl_setopt($ch,CURLOPT_POST, true);
    curl_setopt($ch,CURLOPT_POSTFIELDS, $fields);

    curl_setopt($ch,CURLOPT_RETURNTRANSFER, true); 

    $result = json_decode(curl_exec($ch));
    curl_close($ch);

    echo $result->success;
  }
?>