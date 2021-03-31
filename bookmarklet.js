function addScript() {
    if (!document.querySelector('#percent-script')) {
        var s = document.createElement( 'script');
        s.setAttribute( 'src', 'https://raw.githack.com/peterjaric/flex-percent/main/percent.js');
        s.id = 'percent-script';
        document.body.appendChild(s);
    }
}

addScript();
execute();
