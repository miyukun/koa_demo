 
$(function() {
    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    $("#jzymadd").click(function() {
        var count = $(":not(#jzymtemplate)[name='jzym']").length;
        var h = $("#jzymtemplate").clone();
        h.html(h.html().replace(/idx/g, count));
        $("#jzymdiv").append(h);
        h.show();
        h.attr('id', '');
    });

    $("#jzymdiv").on('click', "[name=jzymdel]", function() {
        $(this).parent().remove()
    });

    $("#applicationadd").click(function() {
        var params = $("#applicationform").serializeJSON()
        delete(params.domain.jzym.idx)
        $.post('/application/addorsave', params, function(r) {
            if (r.errcode == 0) {
                window.location.reload();
            } else {
                alert(r.errmsg)
            }
        })
    });

    $("#uploadbtn").click(function() {
        var fileObj = document.getElementById("fileupload").files[0];
        var formFile = new FormData();
        // formFile.append("action", "UploadVMKImagePath");
        formFile.append("file", fileObj);
        $.ajax({
            url: "/fileupload",
            data: formFile,
            type: "Post",
            dataType: "json",
            cache: false, //上传文件无需缓存
            processData: false, //用于对data参数进行序列化处理 这里必须false
            contentType: false, //必须
            success: function(result) {
                if (result.success) {
                    $("#aqbazlname").val(result.filePath);
                    $("#aqbazlpath").val(result.fileName);
                }
            },
        })
    })


    $("button[name=edit]").click(function() {
        $.get('/application/find?id=' + $($(this).parents('tr').children()[0]).text(), function(res) {
            var app = res.data;
            if (app) {
                $("#id").val(app._id);
                $("#customerkhmc").val(app.customer.khmc);
                $("#customerwzym").val(app.customer.wzym);
                $("#customerwzicpbah").val(app.customer.wzicpbah);
                $("#customerxsjl").val(app.customer.xsjl);
                $("#customerxsjldh").val(app.customer.xsjldh);
                $("#customerxsjlyx").val(app.customer.xsjlyx);
                $("#customersqgcs").val(app.customer.sqgcs);
                $("#customersqgcsdh").val(app.customer.sqgcsdh);
                $("#customersqgcsyx").val(app.customer.sqgcsyx);
                $("#customerzyfzr").val(app.customer.zyfzr);
                $("#customerzyfzrdh").val(app.customer.zyfzrdh);
                $("#customerzyfzryx").val(app.customer.zyfzryx);
                $("#customerbz").val(app.customer.bz);

                $("#domainjsym").val(app.domain.jsym);
                if (app.domain.hcclqr.zxyzheader) $("#domainhcclqrzxyzheader").attr('checked', true);
                if (app.domain.hcclqr.headersz) $("#domainhcclqrheadersz").attr('checked', true);
                if (app.domain.hcclqr.cdnszhccl) $("#domainhcclqrcdnszhccl").attr('checked', true);
                $("#domainhcclqrhczylx").val(app.domain.hcclqr.hczylx);
                $("#domainhcclqrhcsj").val(app.domain.hcclqr.hcsj);
                if (app.domain.hcclqr.tsyq) $("#domainhcclqrtsyq").attr('checked', true);

                if (app.domain.urlfdl && app.domain.urlfdl.sfydturl) $("#domainurlfdlsfydturl").attr('checked', true);
                if (app.domain.urlfdl && app.domain.urlfdl.fsyfdl) $("#domainurlfdlfsyfdl").attr('checked', true);
                if (app.domain.urlfdl && app.domain.urlfdl.fdldzkf) $("#domainurlfdlfdldzkf").attr('checked', true);

                if (app.domain.rzfw && app.domain.rzfw.sfxyrztsfw) $("#domainrzfwsfxyrztsfw").attr('checked', true);
                $("#domainrzfwrzgs").val(app.domain.rzfw.rzgs);
                $("#domaincsurllj").val(app.domain.csurllj);

                if (app.domain.yzsfzccnamedd) $("#domainyzsfzccnamedd").attr('checked', true);

                $("#aqbazlname").val(app.aqbazlname);
                $("#aqbazlpath").val(app.aqbazlpath);

                app.domain.jzym.forEach(function(v, idx) {
                    var h = $("#jzymtemplate").clone();
                    h.html(h.html().replace(/idx/g, idx));
                    $("#jzymdiv").append(h);
                    h.show();
                    h.attr('id', '');

                    $(`input[name='domain[jzym][${idx}][ym]']`).val(v.ym);
                    $(`input[name='domain[jzym][${idx}][dk]']`).val(v.dk);
                    $(`input[name='domain[jzym][${idx}][hyip]']`).val(v.hyip);
                    $(`input[name='domain[jzym][${idx}][hyzyym]']`).val(v.hyzyym);
                    $(`input[name='domain[jzym][${idx}][sfydtnrjzb]']`).val(v.sfydtnrjzb);
                    $(`input[name='domain[jzym][${idx}][ccrl]']`).val(v.ccrl);
                    $(`input[name='domain[jzym][${idx}][ydyhdkfz]']`).val(v.ydyhdkfz);
                    $(`input[name='domain[jzym][${idx}][ywlx]']`).val(v.ywlx);
                });
            }
        })
    });

    $("button[name=delete]").click(function() {
        var id = $($(this).parents('tr').children()[0]).text();
        $.post('/application/del', {
            _id: id
        }, function(r) {
            if (r.errcode == 0) {
                window.location.reload();
            } else {
                alert(r.errmsg)
            }
        });
    });

    $("button[name=submit]").click(function() {
        var id = $($(this).parents('tr').children()[0]).text();
        var spans = $($(this).parents('tr').children()[8]).find('span'); 
        var nextoper = [];
        spans.each(function(idx,v){
            nextoper.push($(v).attr('value')); 
        }) 

        $.post('/flow/add', {
            application: id,
            nextoper:nextoper
        }, function(r) {
            if (r.errcode == 0) {
                window.location.reload();
            } else {
                alert(r.errmsg)
            }
        });
    }); 

    $("div[name='nextoperdiv']").droppable({ 
        activeClass: "ui-state-hover",
        hoverClass: "ui-state-active",
        drop: function(event, ui) {
            var children = $(this).children();
            var added = false;
             
           children.each(function(idx,h){
               if($(h).attr('value')==ui.draggable.attr('value')){
                added=true;
               } 
           }) 
            if(!added){ 
                var o = ui.draggable.clone();  
                o.appendTo($(this)) 
            } 
        }
    });
    $("#group").change(function() {
        $.get('/users/groupuser', {
            group: $("#group").val()
        }, function(res) {
            $("#userdiv").empty();
            res.data.forEach(function(o) {
                var span = $(`<span style="background-color:#ccc;margin:5px;" class='ui-widget-content ui-draggable' value=${o._id}>${o.fullname}</span>`);
                span.draggable({
                    helper: 'clone',
                 });
                $("#userdiv").append(span)
            })
        })
    })

    $.get('/users/group', function(res) {
        res.data.forEach(function(o) {
            var opt = $("<option></option>");
            opt.val(o.id);
            opt.text(o.des);
            $("#group").append(opt)
        })
        $("#group").change();
    })

})
