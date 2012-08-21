	$(function(){

	  var inAjaxCall = false;
	  var blockUI = function()
				  {
					  inAjaxCall = true;
				  }
	  var unblockUI = function()
				  {
					  inAjaxCall = false;
				  }
	  var isUIBlocked = function()
				  {
					  return inAjaxCall == true;
				  }
	  var showMessage = function (stringToShow)
				  {
  					  return drawToast1(stringToShow, 60000, false); // dont start Toast Timer
				  }
  	  var hideMessage = function ()
				  {
					  hideToast();
				  }

	  var toastDrawn = false;
	  
	  var hideToast = function(){
			if (toastDrawn)
			{
				var toastAlert = document.getElementById("toast");
				if (toastAlert)
					toastAlert.style.opacity = 0;
				$('#toast').remove();
				toastDrawn = false;
			}
		  }
		  
	  var toastTimer = $.timer(function() {
			hideToast();
			toastTimer.stop();
	  });

	  var drawToast = function (message, timerval){
			return drawToast1(message, timerval, true);
	  }

	  var drawToast1 = function (message, timerval, starttimer){
		  if (toastDrawn)
		  {
				var toastAlert = document.getElementById("toast");
				if (toastAlert)
				{
					toastAlert.innerHTML = message; // Update the message
					return;
				}
		  }
		  
		  toastDrawn = true;
		  var toastAlert = document.getElementById("toast");
		  if (toastAlert == null){
			  var toastHTML = '<div id="toast">' + message + '</div>';
			  $('body').append(toastHTML);
		  }
		  else{
			  toastAlert.style.opacity = 0.9;
		  }
		  if (starttimer)
		  {
			  toastTimer.once(timerval);
		  }
	  }
	  
	  var timer = $.timer(function() {
			unblockUI();
			hideMessage();
			timer.stop();
            drawToast("Heyy. I did try. Honestly :'-(", 3000);
       });

	var busyMessageCounter = 0;
	var busyMessage = function ()
	 {
		var messages = 
			["Looking up the best deals<br>Please wait", 
			 "Still Hopping<br>Please wait",
			 "Gimme a sec !!",
			 "Bite me :X"
			]
		return messages[(busyMessageCounter++)%messages.length];
	 }

	/*var hideInputDiv = function()
	  {
	  	$('#input-overlay').css("display", "none");
	  }
	  $('#searchInput').live('blur', function(){
		  if($('#searchInput').val()==''){
			  $('#searchInput').val("");
			  var position = $("#searchInput").offset();
			  $('#input-overlay').css("left", position.left + 6);
		  	  $('#input-overlay').css("top", 6);
			  $('#input-overlay').css("display", "block");
		  }	
	  });
	  */
	  $('#searchInput').live('blur', function(){
		  $(this).css('font-weight', 'lighter');
		  if ($(this).val() == ''){
			  $(this).val('Book / Author / ISBN');
		  }
	  });
	  
	  $('#searchInput').live('focus', function(){
		  	$(this).css('font-weight', 'bolder');
			if($(this).val() == 'Book / Author / ISBN'){
				$(this).val('');
			}
	  });

/*	  $('#input-overlay').live('click',function(){
		  if (isUIBlocked())
			{
				  drawToast(busyMessage(), 3000);
				  return;
			}
		$('#input-overlay').css("display", "none");
		$('#searchInput').trigger('focus');
	  });

	  var position = $("#searchInput").offset();
	  $('#input-overlay').css("left", position.left + 6);
  	  $('#input-overlay').css("top", 6);*/
	  
	  $('#invokeBarcodeScanner').click(function(){
		  if (navigator.network.connection.type == Connection.NONE)
		  {
			 drawToast("Heyy! Connect to the Internet first!", 3000); 
			 return;
		  }
		  if (isUIBlocked())
		  {				
			drawToast(busyMessage(), 3000);
		  	return;
		  }
		  try{
			window.plugins.barcodeScanner.scan( 
				function(result) {
							   if (!result.cancelled)
							   {
								  $('#inputISBN').val(result.text);
  						  		 // hideInputDiv();
								  $('#getBestDeals').click();
								  if (isUIBlocked()) // if valid ISBN - UI would have been blocked
								  {
									  $('#searchInput').val(result.text);
								  }
								  else
								  {
									  drawToast("I don't chew invalid ISBN", 3000);
								  }
							   }
							   else
							   {
							   		// Do Nothing. User cancelled it himself.
							   }
  
				}, function(error) {
								drawToast("Scanning failed: " + error, 3000);
				}
			);	
		  } catch(e)
		  {
				drawToast("Scanning failed: " + e, 3000);
		  }
	  });

	  $('#getBestDeals').click(function(){
		  if (navigator.network.connection.type == Connection.NONE)
		  {
			 drawToast("Heyy! Connect to the Internet first!", 3000); 
			 return;
		  }
		  if (isUIBlocked())
		  {
				drawToast(busyMessage(), 3000);
		  		return;
		  }

		  var inputISBN = $('#inputISBN').val();
		  var validInput = false;
		  inputISBN = inputISBN.trim();
		  if (inputISBN.length && (inputISBN.length == 10 || inputISBN.length == 13))
		  {
			  if (is_int(inputISBN))
			  {
				 if (inputISBN.length == 10)
				 {
     				 if (is_ISBN_valid(inputISBN))
					 {
		  			 	inputISBN = ISBN10to13(inputISBN);
					 }
					 else
					 {
						 inputISBN = '978' + inputISBN;
					 }
				 }

				 if (is_ISBN_valid(inputISBN))
				  {	
				  	//hideInputDiv();
		  			showMessage("Searching Deals...");
					blockUI();
					timer.set({ time : 60000, autostart : true });
					var serverURL = 'http://bestonlinedealsindia.appspot.com/?isbn=' + inputISBN + '&rand=' + Math.random();
					$("#RabbitHome").trigger('keydown');
					
					$('#contentDivResultsPage').ajaxError(function(event, request, settings){
						unblockUI();
						hideMessage();
						timer.stop();
					    busyMessageCounter= 0;
						drawToast("No Response<br>Check your data connection", 3000);
						$("#RabbitHome").trigger('keyup');
					});

					$('#contentDivResultsPage').load( serverURL,
									function(response, status, xhr) {
										if (status == 'success')
										{
										  unblockUI();
										  hideMessage();
										  timer.stop();
										  AddEntryToLocalStorage(inputISBN);
										  busyMessageCounter= 0;
				  						  $("#RabbitHome").trigger('keyup');
										  window.location = $('a#bestDeals').attr('href');
										}
								  });
				  }
			  }
		  }
	  });
	  
	  $('#searchInput').keyup(function(event){
			if(event.keyCode == 13)
			{
				 $('#getSearchResults').click();
			}
	  });

	$('#getSearchResults').click(function(){
		
		if($('#searchInput').val() !=''){ // valid input string
			var searchData = $('#searchInput').val();
			$('#inputISBN').val(searchData);
			$('#getBestDeals').click(); // if it is an ISBN let it be handled directly
			
			if (!isUIBlocked()) { // not an ISBN. Search for results
				$('#inputISBN').val(""); // reset the value back.
				
				searchData = searchData.replace(' ', '+');
				
				// start search procedure
				//hideInputDiv();
		  		showMessage("Searching ...");
				blockUI();
				timer.set({ time : 60000, autostart : true });
				var serverURL = 'http://bestonlinedealsindia.appspot.com/search?q=' + searchData + '&rand=' + Math.random();
				$("#RabbitHome").trigger('keydown');
				
				$('#contentDivSearchPage').ajaxError(function(event, request, settings){
					unblockUI();
					hideMessage();
					timer.stop();
				    busyMessageCounter= 0;
					drawToast("No Response<br>Check your data connection", 3000);
					$("#RabbitHome").trigger('keyup');
				});

				$('#contentDivSearchPage').load( serverURL,
								function(response, status, xhr) {
									if (status == 'success')
									{
									  unblockUI();
									  hideMessage();
									  timer.stop();
									  busyMessageCounter= 0;
			  						  $("#RabbitHome").trigger('keyup');
									  window.location = $('a#searchDeals').attr('href');
									}
							  });
			}
		}
	});

	var AdjustStorageIfAlreadyPresent = function(inputISBN)
				  {
   					    var maxItemsHistory = 10;
		  				var items = $.jStorage.index();
						var itemFound = false;
						var j = maxItemsHistory - 1;
						for (; j >= maxItemsHistory - items.length; --j)
						{
							var curItem = $.jStorage.get("bookInHistory" + j);
							if (curItem.isbn == inputISBN) // already present in the storage
							{
								$.jStorage.deleteKey("bookInHistory" + j);
								itemFound = true;
								continue;
							}
							if (itemFound)
							{
								$.jStorage.set("bookInHistory" + (j + 1), curItem);
								$.jStorage.deleteKey("bookInHistory" + j);
							}
						}
				  }
	var AddEntryToLocalStorage = function(inputISBN)
				  {
					  var bookName = $('#bookName').html();
					  var thumbNail = $('#bookThumbnail').attr('src');
					  var authorName = $('#authorName').html();
					  var bestPrice = $('#priceGrid .price:first').html();

					  if(!bookName || !thumbNail || !authorName ||!bestPrice)
					  	return;
						
 					    var maxItemsHistory = 10;
					    AdjustStorageIfAlreadyPresent(inputISBN);
		  				var items = $.jStorage.index();
						var key = "bookInHistory"+ (maxItemsHistory - 1 - items.length);
						if (items.length == maxItemsHistory) // List MAX size achieved
						{
							key = "bookInHistory0";
							for (var j = maxItemsHistory - 2; j >=0; --j)
							{
								var itemtoShift = $.jStorage.get("bookInHistory" + j); 
								$.jStorage.set("bookInHistory" + (j + 1), itemtoShift);
							}
						}
						var ItemToPut = {isbn: inputISBN, bookname: bookName, thumbnail: thumbNail, authorname: authorName, bestprice: bestPrice};
						$.jStorage.set(key, ItemToPut);
				  }
	  var is_int = function(value)
				  {
					for (i = 0 ; i < value.length ; i++)
					{
						if ((value.charAt(i) < '0') || (value.charAt(i) > '9')) 
							return false;
					}
					return true;  
				  }
	  var calculateISBN13CheckDigit = function(value)
				  { 
				      // generate checkDigit using the 1st 12 digits
					  var i, digit = 0, checkSum = 0;
					  for (i = 0; i < 12; i++) {
			               digit = value[i] - '0';
 				           if (i % 2 == 1) {
                			    digit *= 3;
			               }
						checkSum += digit;
					  }
					  return (10 - checkSum % 10)%10;
				  }
  	  var is_ISBN_valid = function(value)
				  {
					  if (value.length == 10)
					  {
					      var i, a = 0, b = 0;
    						for (i = 0; i < 10; i++) {
						        a += (value[i] - '0');// converting from ASCII to 0..9
      							b += a;
						    }
						  return (b % 11) == 0;
					  }
					  else if (value.length == 13)
					  {
						  var checkDigit = calculateISBN13CheckDigit(value);
						  return checkDigit == (value[12] - '0');
					  }
					  else 
					  	return false;
				  }

	  String.prototype.replaceAt=function(index, char) {
		  if (index < 0 || index >= this.length)
		  	return this;
	      return this.substr(0, index) + char + this.substr(index+1, this.length-index-1);
	   }
	   
      String.prototype.trim=function(){return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};

	  var ISBN10to13 = function(value)
				  {
					  value = '978' + value;
					  var checkDigit = calculateISBN13CheckDigit(value);
					  value = value.replaceAt(12, checkDigit);
					  return value;
				  }
	});
