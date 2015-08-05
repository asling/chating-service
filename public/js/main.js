function notSupportFixed() {
			    var userAgent = window.navigator.userAgent, 
			        ios = userAgent.match(/(iPad|iPhone|iPod)\s+OS\s([\d_\.]+)/),
			        ios5below = ios && ios[2] && (parseInt(ios[2].replace(/_/g, '.'), 10) < 5),
			        operaMini = /Opera Mini/i.test(userAgent),
			        body = document.body,
			        div, isFixed;
				//console.log(parseInt(ios[2].replace(/_/g, '.'), 10);
			    div = document.createElement('div');
			    div.style.cssText = 'display:none;position:fixed;z-index:100;';
			    body.appendChild(div);
			    isFixed = window.getComputedStyle(div).position != 'fixed';//不支持fixed的会设置成absolute
			    body.removeChild(div);
			    div = null;
				
			    return !!(isFixed || ios5below || operaMini);
			}
			
			if(notSupportFixed()){
				$("body").addClass("iscroll-work");
				var myScroll = new IScroll('#wrapper');	
			}
	
	
		var fileSelect = $("#fileSelect"),
				fileElem = $("#fileElem"),
				container = $("#container"),
				filesLength = 0,scrollFrom = 0;
		var imageType = /^image\//;
		var fileHtml = '<article class="user clearfix"><div class="article-inner">'+
				'<div class="chat-name user-type"> 17:57:17</div>'+
				'<div class="avatar">用户1</div>'+
				'<div class="message type3 positionRelative">'+
				'<div class="inner"><div class="message-content"><img src="" />'+
				'<div class="modal positionAbsolute"><div class="percent">0%</div></div>'+
				'<div class="progress"><div class="bar"></div></div></div></div><div class="upload-status"></div></div></div></article>';

		fileSelect.on("click",function(e){
			if(fileElem){
				fileElem.click();
			}
			e.preventDefault();
		});

		fileElem.on("change",function(e){
			handleFiles(e.currentTarget.files);
		});
		
		function scrollToBottom(scrollTo){
			(function scrollNew(st) {
				tmp = document.body.scrollTop?document.body.scrollTop:document.documentElement.scrollTop;
				scrollFrom = tmp+st+scrollFrom;
		    	document.body.scrollTop = scrollFrom;
		    	document.documentElement.scrollTop = scrollFrom;
		    })(scrollTo+100);
		}
		
		function autoScal(height){
			scrollToBottom(parseFloat(height));
			if(notSupportFixed()) myScroll.refresh();
		}

		function handleFiles(files){
			if(!files.length) return;
			filesLength = files.length;
			for(var i=0;i<filesLength;i++){
				var file = files[i];
				if (!imageType.test(file.type)) continue;
				var imgNode = $(fileHtml);
				container.append(imgNode);
				autoScal(imgNode.css("height"));
				var reader = new FileReader();
				reader.onload = (function(aImg){
					return function(e){
						//console.log(aImg.find("img"));
						var img = aImg.find("img");
						img.attr("src",e.target.result);
						new FileUpload(aImg,file,i);
					};
				})(imgNode);
				reader.readAsDataURL(file);
			}
		}

		function createThrobber(img){
			this.ended = function(){
				img.find(".percent").css("display","none");
				img.find(".modal").css("display","none");
				img.find(".progress").css("display","none");
			}
			this.update = function(percentage){
				img.find(".percent").text(percentage+"%");
				img.find(".bar").css("width",percentage+"%");
			}
			this.success = function(){
				img.addClass("success");
				this.ended();
			}
			this.fail = function(){
				img.addClass("fail");
				this.ended();
			}
			return this;
		}

		function FileUpload(img, file,i) {
			this.ctrl = new createThrobber(img);
			var xhr = new XMLHttpRequest();
			this.xhr = xhr;
			var self = this;
			this.xhr.upload.addEventListener("progress", function(e) {
				if (e.lengthComputable) {
					var percentage = Math.round((e.loaded * 100) / e.total);
					self.ctrl.update(percentage);
				}
			}, false);
			xhr.upload.addEventListener("load", function(e){
				
				self.ctrl.update(100);
				self.ctrl.success();
			}, false);

			xhr.upload.addEventListener("error", function(e){
				self.ctrl.fail();
			}, false);

			xhr.open("POST", '/image-handler');
			xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
			xhr.send(file);
		}

		var  messageHtml = '<article class="user clearfix"><div class="article-inner">'+
				'<div class="chat-name user-type"> 17:57:17</div>'+
				'<div class="avatar">用户1</div>'+
				'<div class="message type2 positionRelative">'+
				'<div class="inner"><div class="message-content"></div></div>'+
				'<div class="upload-status"></div></div></div></article>';
				
		var responseHtml = '<article class="service clearfix"><div class="article-inner">'+
                    '<div class="chat-name service-type">交易猫客服-喵喵:  17:57:17</div>'+
                    '<div class="avatar">客服1</div>'+
                    '<div class="message type2 positionRelative">'+
                        '<div class="inner">'+
                           ' <div class="message-content"></div>'+
                       '</div>'+
                   ' </div>'+
               '</div></article>';

		$("#messageForm").on("submit",function(e){
			e.preventDefault();
			var form = e.target;
			var messageField = $(form[1]);
			var message = messageField.val();
			messageField.val("");
			if(message != ""){
				//handleMessage(messageHtml,message);
				var hm = new handleMessage(messageHtml,message);
				messageUpload(hm);
			}
		});
		
		function handleMessage(html,text){
			this.message = text;
			this.messageHtml = html;
			this.messageNode = $(this.messageHtml);
			this.messageNode.find(".message-content").text(this.message);
			this.appendItem = function(){
				container.append(this.messageNode);
				var height = this.messageNode.css("height");
				autoScal(height);
				//myScroll.refresh();
			}
			return this;
		}

		function messageUpload(obj){
			obj.appendItem();
			var url = '/message-handler';
			$.ajax({
				type: 'GET',
				url: url,
				data: { q: obj.message },
				dataType: 'json',
				context:obj.messageNode,
				timeout: 300,
				success: function(data){
					console.log(data);
					//var response = $.parseJSON(data);
					if(data.status == "1"){
						this.addClass("success");
					}
					if(data.msg && data.msg != ""){
						var hr = new handleMessage(responseHtml,data.msg);
						hr.appendItem();
					}
				},
				error: function(xhr, type){
					this.addClass("fail");
				}
			});
		}
		var overlay = $("#moreOverlay");
		$("#moreButton").on("click",function(e){
			e.stopPropagation();
			overlay.show();
		});
		overlay.on("click",function(e){
			e.stopPropagation();
			overlay.show();
		});

		$(document).on("click",function() {
			overlay.hide();
		});

		$("#moreOverlay").on("clickoutside",function(e){
			if(e.target.attr("id") != "moreOverlay" || !(e.target.parent(".more-overlay"))){
				overlay.hide();
			}
		});