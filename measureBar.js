
//載入完成才執行所有東西
jQuery(document).ready(function()
{
    
    
    //測試測量
    $('#slider').slider();
    var value=0;
    
    document.getElementById("measure").addEventListener('mousewheel',function(event)
    {
        event.preventDefault();
        value+=0.5*(1/2.54);
        $('#value').html(value.toFixed(1)+' 腰');
    });
    
    
});