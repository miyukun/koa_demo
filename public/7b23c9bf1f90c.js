var mySingleton = function(){
    var privateVariable = "something private";
    function showPrivate(){
        console.log(privateVariable);
    }

    return {
        publicMethod:function(){
            showPrivate();
        },
        publicVar:'the public can see this!'
    };
};
var single = mySingleton();
single.publicMethod();
console.log(single.publicVar);
