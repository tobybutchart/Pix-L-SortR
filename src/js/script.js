var b = document.getElementById('b');
var c = b.getContext('2d');

var threshold = 0;
var vertical = false;
var invert = false;

var drag = false;
var dragRect = {};

var img = new Image();

function process(el){
    toggleLoading(true);

    f = el.files[0];

    if(!f.type.match('image.*')){
	       return alert('Not an image');
    }

    var reader = new FileReader();

    reader.onload = fileReadComplete;
    reader.readAsDataURL(f);
}


var fileReadComplete = function(e){
    col = document.getElementById("mainCol");
    img.src = e.target.result;

    (function(){
        if (img.complete){
            b.width = img.width;
            b.height = img.height;

            c.drawImage(img, 0, 0);
            start();
        }else{
            setTimeout(arguments.callee, 50);
        }
    })();
};


function start(){
    toggleLoading(true);

    /*in a thread or else the loading gif doesn't display*/
    setTimeout(function(){
        c.drawImage(img, 0, 0);

        threshold = parseInt(document.getElementById('threshold').value);
        threshold = 100 - threshold;
        vertical = document.getElementById('vertical').checked;
        invert = document.getElementById('invert').checked;

        if(vertical){
            pixelSortV();
        }else{
            pixelSortH();
        }

        toggleLoading(false);

    }, 10);
}

function pixelSortH(){
    for(var row = 0; row < b.height; row++){
        var imdata = c.getImageData(0, row, b.width, 1);
        var data = imdata.data;

        var pixels= getPixelsArray(data);

        var start = 0;
        var end = findValueLess(pixels, row, threshold, start);
        while(start<b.width){
            var range = pixels.splice(start, end-start);
            range.sort(invert?simpleMeanSortInverted:simpleMeanSort);
            pixels.splice.apply(pixels, [start,0].concat(range));

            start = end;
            end = findValueLess(pixels, row, threshold, start+1);
        }

        setDataFromPixelsArray(data, pixels);
        c.putImageData(imdata, 0, row);
    }
}


function pixelSortV(){
    for(var col = 0; col< b.width; col++){
        var imdata = c.getImageData(col, 0, 1, b.height);
        var data = imdata.data;

        var pixels = getPixelsArray(data);

        var start = 0;
        var end= findValueLess(pixels, col, threshold, start);
        while(start<b.height){
            var range = pixels.splice(start, end-start);
            range.sort(invert?simpleMeanSortInverted:simpleMeanSort);
            pixels.splice.apply(pixels, [start,0].concat(range));

            start = end;
            end = findValueLess(pixels, col, threshold, start+1);
        }

        setDataFromPixelsArray(data, pixels);
        c.putImageData(imdata, col, 0);
    }
}


function getPixelsArray(data){
    var p = [], c;

    for (var i = 0; i < data.length/4; i++) {
        c = i*4;
        p.push({r: data[c+0], g: data[c+1], b: data[c+2]});
    };

    return p;
}


function simpleMeanSort(a,b){
    var aa = (a.r+a.g+a.b)/3;
    var bb = (b.r+b.g+b.b)/3;
    return aa <bb ? -1 : (aa >bb ? 1 : 0);
}


function simpleMeanSortInverted(a,b){
    var aa= (a.r+a.g+a.b)/3;
    var bb= (b.r+b.g+b.b)/3;
    return aa > bb ? -1 : (aa <bb ? 1 : 0);
}


function setDataFromPixelsArray(data, pixels){
    var c;

    for (var i = 0; i < pixels.length; i++) {
        c = i*4;
        data[c+0] = pixels[i].r;
        data[c+1] = pixels[i].g;
        data[c+2] = pixels[i].b;
    }
}


function findValue(pixels, row, val, start){
    for (var i = start; i < pixels.length; i++){
        if (pixels[i].r === val.r && pixels[i].g === val.g && pixels[i].b === val.b){
            return i;
        }
    }

    return pixels.length;
}


function findValueLess(pixels, row, val, start){
    for (var i = start; i < pixels.length; i++){
        if ((pixels[i].r+pixels[i].g+pixels[i].b)/3 < val) {
            return i;
        }
    }

    return pixels.length;
}


function addClass(el, className) {
    if (el.classList){
        el.classList.add(className);
    }else if(!hasClass(el, className)){
        el.className += " " + className;
    }
}


function removeClass(el, className) {
    if (el.classList){
        el.classList.remove(className);
    }else if(hasClass(el, className)){
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        el.className=el.className.replace(reg, ' ');
    }
}


function downloadImage(url){
    var a = document.getElementById("downloadMe");
    var dt = b.toDataURL('image/jpeg');
    if(url === ""){
        url = 'Pix-L SortR ' + new Date().toString();
    }
    a.download = url;
    a.href = dt;
    a.click();
}


function draw() {
    c.fillRect(dragRect.startX, dragRect.startY, dragRect.w, dragRect.h);
    //c.fillRect(20,20,150,100);

    console.log(dragRect.startX);//horizontal
    console.log(dragRect.startY);//vertical
    //console.log(dragRect.w);
    //console.log(dragRect.h);
}


function toggleLoading(show){
    var s = 'none';
    var d = document.getElementById('loading').style.display;

    if(show){
        s = 'block';
    }

    if(s != d){
        document.getElementById('loading').style.display = s;
    }
}


/* hooks start */
$(document).on('click', '.browse', function(){
    var file = $(this).parent().parent().parent().find('.file');
    file.trigger('click');
});


$(document).on('change', '.file', function(){
    $(this).parent().find('.form-control').val($(this).val().replace(/C:\\fakepath\\/i, ''));
});


// $(document).on('mousedown', '#b', function(e){
//     dragRect.startX = e.pageX - ($('#mainCol').offset().left);
//     dragRect.startY = e.pageY - ($('#mainCol').offset().top + $('#mainRow').offset().top + $('#mainContainer').offset().top);
//
//
//     console.log(e.pageY);
//     console.log(e.clientY);
//     console.log($('#mainCol').offset().top);
//     console.log($('#mainRow').offset().top);
//     console.log($('#mainContainer').offset().top);
//
//
//     drag = true;
// });


// $(document).on('mouseup', '#b', function(e){
//     if(drag){
//         dragRect.w = 50;//(e.pageX - this.offsetLeft) - dragRect.startX;
//         dragRect.h = 50;//(e.pageY - this.offsetTop) - dragRect.startY ;
//
//         //c.clearRect(0, 0, b.width, b.height);
//
//         draw();
//     }
//
//     drag = false;
// });
/* hooks end */
