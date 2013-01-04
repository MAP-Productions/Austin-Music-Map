	<?php
	
		$post_data = file_get_contents("php://input");
		$fields = json_decode($post_data,true);	
		
		
		$url = 'http://alpha.zeega.org/api/items';
		
		//url-ify the data for the POST
		/*foreach($fields as $key=>$value) { 
			$fields_string .= $key.'='.urlencode($value).'&'; 
		}
		rtrim($fields_string, '&');
		*/

		$fields['uri']=$fields['uri']."?consumer_key=lyCI2ejeGofrnVyfMI18VQ";

		//open connection
		$ch = curl_init();
		
		//set the url, number of POST vars, POST data
		curl_setopt($ch,CURLOPT_URL, $url);
		curl_setopt($ch,CURLOPT_POSTFIELDS, http_build_query($fields));
		
		//execute post
		$result = curl_exec($ch);
		print_r($result);	
		//close connection
		curl_close($ch);
		
	?>
