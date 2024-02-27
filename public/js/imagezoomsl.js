jQuery(function(){
               
  if(!$.fn.imagezoomsl){

     $('.msg').show();
     return;
   }
   else $('.msg').hide();

   // plugin initialization
   $('.image').imagezoomsl({
     innerzoommagnifier: false,
     classmagnifier: "round-loope",
     // magnifiersize: [150, 150],
     // disables the scrolling of the document with the mouse wheel when the cursor is over the image
     disablewheel: false,
     zoomrange: [2, 12],
     //magnifiersize: [800, 800], //容器的寬高，預設為小圖片的寬高
     scrollspeedanimate: 10, //放大圖片的動畫速度，接受1000範圍內的整數與分數
     loopspeedanimate: 5, //移動光標和大容器區域後的鼠標在透鏡效果模式，接受1000範圍內的整數與分數
     cursorshadeborder: "2px solid black", //光標區域的外邊框
     switchsides:true //如果沒有足夠的空間顯示容器的邊緣時，將考慮到螢幕邊緣的小圖片的另一邊。
     // magnifiereffectanimate: "slideIn"
   

   });
 });