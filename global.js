console.log("global.js loaded");

let pages = [
    { url: '../index.html', title: 'Survey' },
    { url: '../writeup/writeup.html', title: 'Writeup' }
  ];
  
  let nav = document.createElement('nav');
  document.body.prepend(nav);

  for (let p of pages) {
    let url = p.url;
    let title = p.title;
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);
  }