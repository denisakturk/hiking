heightSetter();
window.addEventListener('resize', heightSetter);
function heightSetter() {
  document.getElementById("hero").style.height = window.innerHeight  + 'px';
  document.getElementById("explore").style.height =  '1114px';
  // document.getElementById("promo").style.height = window.innerHeight  + 'px';
}