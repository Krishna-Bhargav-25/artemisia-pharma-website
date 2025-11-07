(function(){
  if ('IntersectionObserver' in window){
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in-view'); observer.unobserve(e.target); } });
    },{ threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in-view'));
  }
})();
