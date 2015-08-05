var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var mime = require('mime');
var cache = {};

function send404(response){
	response.writeHead(404,{'Content-type':'text-plain'});
	response.write("Error 404: resource not found.");
	response.end();
}

function sendFile(response,filePath,fileContents){
	response.writeHead(
		200,
		{'content-type':mime.lookup(path.basename(filePath))}
	);
	//response.write("yes");

	response.end(fileContents);
}

function imgUploadResponse(response){
	response.writeHead(200,{"Content-type":"application/json"});
	response.end(JSON.stringify({status:"1",msg:"您的图片已接收"}));
}

function msgResponse(response){
	response.writeHead(200,{"Content-type":"application/json"});
	response.end(JSON.stringify({status:"1",msg:"很多很多啊..."}));
}

function serverStatic(response,cache,absPath){
	if(cache[absPath]){
		sendFile(response,absPath,cache[absPath]);
	}else{
		fs.exists(absPath,function(exists){
			if(exists){
				fs.readFile(absPath,function(err,data){
					if(err){
						send404(response);
					}else{
						cache[absPath] = data;
						sendFile(response,absPath,data);
					}
				});
			}else{
				send404(response);
			}
		});
	}
}

var server = http.createServer(function(request,response){
	var filePath = false;
	var parseUrl = url.parse(request.url);
	var pathname = parseUrl.pathname;
	if(pathname == '/'){
		filePath = 'public/index.html';
		var absPath = './'+filePath;
		serverStatic(response,cache,absPath);
	}else if(pathname == '/image-handler'){
		imgUploadResponse(response);
	}else if(pathname == '/message-handler'){
		msgResponse(response);
	}else{
		filePath = 'public'+request.url;
		var absPath = './'+filePath;
		serverStatic(response,cache,absPath);
	}

	
});

server.listen(3000,function(){
	console.log("ok");
});


