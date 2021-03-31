var s = document.querySelector('#percent-script');

if (!s) {
    s = document.createElement('script');
    s.setAttribute('src', 'https://raw.githack.com/peterjaric/flex-percent/main/percent.js');
    s.id = 'percent-script';
    s.onload = () => eval("execute()");
    document.body.appendChild(s);
} else {
    execute();
}