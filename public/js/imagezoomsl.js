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
       //magnifiersize: [800, 800], //容器的宽高，默认为小图片的宽高
       scrollspeedanimate: 10, //滚动big图片的动画速度，接受1°°°范围内的整数和分数
       loopspeedanimate: 5, //移动光标和大容器区域后的光标在透镜效果模式，以1°°°°范围内的整数和分数值
       cursorshadeborder: "2px solid black", //光标区域的外边框
       switchsides:true //如果没有足够的空间显示容器的边缘时，将考虑到屏幕边缘的小图片的另一边。
       // magnifiereffectanimate: "slideIn"
     

     });
   });