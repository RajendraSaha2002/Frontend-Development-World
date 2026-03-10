document.addEventListener("contextmenu", function(e){
    e.preventDefault();
});

document.addEventListener("keydown", function(e){

    if(e.ctrlKey && e.key === 'p'){
        e.preventDefault();
        alert("Printing Disabled");
    }

    if(e.key === "PrintScreen"){
        alert("Screenshot Blocked");
        navigator.clipboard.writeText("");
    }

});