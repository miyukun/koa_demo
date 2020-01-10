$(function() {
    moment.locale('zh-cn');
    $.get('/flow/list', function(res) {
        if (res.data) {
            res.data.forEach((data) => { 
                var names = '';
                 data.nextoper.forEach((u)=>{
                    names+=u.fullname + ','; 
                })
                var tr = $("<tr></tr>");
                var td = $(`<td>${data.application._id}</td>`);
                tr.append(td);
                var createtime = moment(data.application.createtime).format('YYYY-MM-DD HH:mm:ss');
                td = $(`<td>${createtime}</td>`);
                tr.append(td);
                td = $(`<td>${data.application.creator.city[0].des}</td>`);
                tr.append(td);
                td = $(`<td>${data.application.customer.wzicpbah}</td>`);
                tr.append(td);
                td = $(`<td>${data.application.domain.jsym}</td>`);
                tr.append(td);
                td = $(`<td>${data.status}</td>`);
                tr.append(td);
                var updatetime = moment(data.updatetime).format('YYYY-MM-DD HH:mm:ss');
                td = $(`<td>${updatetime}</td>`);
                tr.append(td);
                td = $(`<td>${data.operator.username}</td>`);
                tr.append(td);
                td = $(`<td>${names}</td>`);
                tr.append(td);
                td = $(`<td><input type='button' value='删除'/></td>`);
                tr.append(td);
                $("#datatable").append(tr);
            });
        }
    })

    $("#logout").click(function() {
        $.post('/logout', function(res) {
            if (res.errcode == '0') {
                window.location.href = '/application/listtable'
            }

        });
    })
})
