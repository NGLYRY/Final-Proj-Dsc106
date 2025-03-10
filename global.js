console.log("global.js loaded");

let pages = [
    { url: '', title: 'Survey'},
    { url: 'writeup/', title: 'Writeup'}
  ];
  
  let nav = document.createElement('nav');
  document.body.prepend(nav);

  const ARE_WE_HOME = document.documentElement.classList.contains('home');

  for (let p of pages) {
    let url = p.url;
    let title = p.title;
    
    if (ARE_WE_HOME) {
      url = url ? url : 'index.html';
    } else {
      url = url ? url : '../index.html';
    }

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);
  }