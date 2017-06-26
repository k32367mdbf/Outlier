
//載入完成才執行所有東西
jQuery(document).ready(function()
{
	var duration = 250,
		epsilon = (1000 / 60 / duration) / 4,
		firstCustomMinaAnimation = bezier(.42,.03,.77,.63, epsilon),
		secondCustomMinaAnimation = bezier(.27,.5,.6,.99, epsilon),
		animating = false;
    
    
    
	//無限執行此函式
	$('.cd-slider-wrapper').each(
    function()
    {
        initSlider($(this));
    });
    
    
    //==================初始化函式====================//
	function initSlider(sliderWrapper)
    {
		//jQuery 物件快取
		var slider = sliderWrapper.find('.cd-slider'),
			sliderNav = sliderWrapper.find('.cd-slider-navigation'),
			sliderControls = sliderWrapper.find('.cd-slider-controls').find('li');
        
        
		//儲存動畫路徑	
		var pathArray = [];
		pathArray[0] = slider.data('step1');
		pathArray[1] = slider.data('step4');
		pathArray[2] = slider.data('step2');
		pathArray[3] = slider.data('step5');
		pathArray[4] = slider.data('step3');
		pathArray[5] = slider.data('step6');

        
		//按下><時更新圖片
		sliderNav.on('click', '.next-slide', //按下時子元素.next-slide執行...
        function(event)
        { 
			event.preventDefault(); //防止默認動作
			nextSlide(slider, sliderControls, pathArray); //呼叫nextSlide
		});
        
		sliderNav.on('click', '.prev-slide', //按下時子元素.prev-slide執行...
        function(event)
        { 
			event.preventDefault(); //防止默認動作
			prevSlide(slider, sliderControls, pathArray); //呼叫prevSlide
		});

        
		//手機滑動時更新圖片
		slider.on('swipeleft', //往左滑時執行...
        function(event)
        { 
			nextSlide(slider, sliderControls, pathArray); //呼叫nextSlide
		});
        
        
		slider.on('swiperight', //往右滑時執行...
        function(event)
        { 
			prevSlide(slider, sliderControls, pathArray); //呼叫prevSlide
		});

        
		//按下面的點時更新圖片
		sliderControls.on('click', //按下時執行...
        function(event)
        {
			event.preventDefault(); //防止默認動作
            
			var selectedItem = $(this); //紀錄被按下的元素
            
            //如果不是已經選到的那個
			if(!selectedItem.hasClass('selected'))
            { 
				var selectedSlidePosition = selectedItem.index(), //紀錄被按下的元素的編號
					selectedSlide = slider.children('li').eq(selectedSlidePosition), //找到對應的圖
					visibleSlide = slider.find('.visible'), //找到目前顯示的圖片
					visibleSlidePosition = visibleSlide.index(), //紀錄目前顯示圖片的編號
					direction = ''; //宣告方向
                
				direction = ( visibleSlidePosition < selectedSlidePosition) ? 'next': 'prev'; //決定方向
                
				updateSlide(visibleSlide, selectedSlide, direction, sliderControls, pathArray); //更新圖片
			}
		});

        
		//按鍵盤左右時更新圖片
		$(document).keydown( //按下鍵盤時
        function(event)
        {
            //按左且載入完全(沒在動畫中)
			if( event.which=='37' && elementInViewport(slider.get(0)) )
            { 
				prevSlide(slider, sliderControls, pathArray); //換成前一張
			}
            //按右且載入完全(沒在動畫中)
            else if( event.which=='39' && elementInViewport(slider.get(0)) )
            { 
				nextSlide(slider, sliderControls, pathArray); //換成下一張
			}
		});
        
        
        //自動刷新圖片
        setInterval(function(){ nextSlide(slider, sliderControls, pathArray); } , 3000);
        
	}
    
    
    //下一張圖
	function nextSlide(slider, sliderControls, pathArray )
    {
		var visibleSlide = slider.find('.visible'), //找到目前顯示的圖片
            //找到下一張圖片(到底了就換第一張)
            nextSlide = ( visibleSlide.next('li').length > 0 ) ? visibleSlide.next('li') : slider.find('li').eq(0);
            updateSlide(visibleSlide, nextSlide, 'next', sliderControls, pathArray); //更新圖片
	}
    
    
    //上一張圖
	function prevSlide(slider, sliderControls, pathArray )
    {
		var visibleSlide = slider.find('.visible'), //找到目前顯示的圖片
            //找到上一張圖片(到頭了就換最後一張)
            prevSlide = ( visibleSlide.prev('li').length > 0 ) ? visibleSlide.prev('li') : slider.find('li').last();
            updateSlide(visibleSlide, prevSlide, 'prev', sliderControls, pathArray); //更新圖片
	}
    
    
    //更新圖片
	function updateSlide(oldSlide, newSlide, direction, controls, paths)
    {
		if(!animating)
        {
			//don't animate if already animating
			animating = true;
			var clipPathId = newSlide.find('path').attr('id'), //取得新圖片path的ID
				clipPath = Snap('#'+clipPathId); //用此ID宣告一個snap物件

            //決定動畫的方向
			if( direction == 'next' )
            {
				var path1 = paths[0],
					path2 = paths[2],
					path3 = paths[4];
			}
            else
            {
				var path1 = paths[1],
					path2 = paths[3],
					path3 = paths[5];
			}

			updateNavSlide(newSlide, controls);//更新下面的點
            
			newSlide.addClass('is-animating'); //新增class(css會放最上層)
            
            //把新圖片d值  
			clipPath.attr('d', path1).animate({'d': path2}, duration,firstCustomMinaAnimation, //先剪成一條線(path1，不顯示，但在最上面)，然後動畫到path2
            function() //做完後動畫到path3
            {
                clipPath.animate({'d': path3},duration,secondCustomMinaAnimation,
                function() //做完後
                {
                    //隱藏舊圖
                    oldSlide.removeClass('visible');
                    //顯示新圖並標註做完動畫
                    newSlide.addClass('visible').removeClass('is-animating');
                    animating = false;
                });
            });
		}
	}

    
    //更新下面的點
	function updateNavSlide(actualSlide, controls)
    {
		var position = actualSlide.index(); //取得新點位置
		controls.removeClass('selected').eq(position).addClass('selected'); //重新標註現在在哪個點
	}
    
    
    
    //=========================貝茲曲線值轉custom mina easing？============================
    //convert a cubic bezier value to a custom mina easing
    //http://stackoverflow.com/questions/25265197/how-to-convert-a-cubic-bezier-value-to-a-custom-mina-easing-snap-svg
    //https://github.com/arian/cubic-bezier
	function bezier(x1, y1, x2, y2, epsilon)
    {
		var curveX = function(t)
        {
			var v = 1 - t;
			return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
		};

		var curveY = function(t)
        {
			var v = 1 - t;
			return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
		};

		var derivativeCurveX = function(t)
        {
			var v = 1 - t;
			return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
		};

		return function(t)
        {
			var x = t, t0, t1, t2, x2, d2, i;

			// First try a few iterations of Newton's method -- normally very fast.
			for (t2 = x, i = 0; i < 8; i++)
            {
				x2 = curveX(t2) - x;
                
				if(Math.abs(x2) < epsilon)
                    return curveY(t2);
                
				d2 = derivativeCurveX(t2);
                
				if(Math.abs(d2) < 1e-6)
                    break;
				t2 = t2 - x2 / d2;
			}

			t0 = 0, t1 = 1, t2 = x;

			if(t2 < t0)
                return curveY(t0);
			if(t2 > t1)
                return curveY(t1);

			// Fallback to the bisection method for reliability.
			while(t0 < t1)
            {
				x2 = curveX(t2);
                
				if(Math.abs(x2 - x) < epsilon)
                    return curveY(t2);
				if(x > x2)
                    t0 = t2;
				else
                    t1 = t2;
                
				t2 = (t1 - t0) * .5 + t0;
			}

			// Failure
			return curveY(t2);
		};
	};

    
	//=====================分辨元素是否可視=====================
    //http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
	function elementInViewport(el)
    {
		var top = el.offsetTop;
		var left = el.offsetLeft;
		var width = el.offsetWidth;
		var height = el.offsetHeight;

		while(el.offsetParent)
        {
		    el = el.offsetParent;
		    top += el.offsetTop;
		    left += el.offsetLeft;
		}

		return(   //括號不能換行
		    top < (window.pageYOffset + window.innerHeight) &&
		    left < (window.pageXOffset + window.innerWidth) &&
		    (top + height) > window.pageYOffset &&
		    (left + width) > window.pageXOffset
		);
	}
    
    
//end of jQuery(document).ready(function(){
});