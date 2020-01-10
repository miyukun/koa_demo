$(function(){
    

    $("button[name=edit]").click(function(){
        var id = $($(this).parents('tr').children()[0]).text();
        var username = $($(this).parents('tr').children()[1]).text();
        var fullname = $($(this).parents('tr').children()[2]).text();
        var group = $($(this).parents('tr').children()[3]).text();
        var phone = $($(this).parents('tr').children()[4]).text();
        var email = $($(this).parents('tr').children()[5]).text();
        var city = $($(this).parents('tr').children()[6]).text().split(',');
        var modules = $($(this).parents('tr').children()[7]).text().split(',');
        $("#id").val(id);
        $("#username").val(username);
        $("#fullname").val(fullname);
        $("#group").val(group);
        $("#phone").val(phone);
        $("#email").val(email);
        $("input[name='city']").each(function(){
            var that = $(this);
            that.prop('checked',false) 
            $(city).each(function(idx,v){ 
                if(v==that.attr('text')){
                    that.prop('checked',true)
                }
            }) 
        })
        $("input[name='modules']").each(function(){
            var that = $(this);
            that.prop('checked',false) 
            $(modules).each(function(idx,v){ 
                if(v==that.attr('text')){
                    that.prop('checked',true)
                }
            }) 
        })
        
        
    });
    $("button[name=delete]").click(function(){
        var id = $($(this).parents('tr').children()[0]).text();
        $.post('/modules/del',{_id:id},function(r){
            if(r.errcode==0){
                window.location.reload();
            }else{
                alert(r.errmsg)
            }
        });
    });  
    $("#add").click(function(){   
        var param = {
            _id:$("#id").val(),
            des:$("#des").val(),
            path:$("#path").val() 
        }
        $.post('/modules/addorsave',param,function(r){
            if(r.errcode==0){
                window.location.reload();
            }else{
                alert(r.errmsg)
            }
        })
    }); 
})