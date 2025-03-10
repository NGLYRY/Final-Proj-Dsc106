console.log("global.js loaded");

let pages = [
    { url: 'Final-Proj-Dsc106/', title: 'Survey' },
    { url: 'Final-Proj-Dsc106/writeup/', title: 'Writeup'}
  ];
  
  // Detect if we are on the home page using a class in the <html> element
  const ARE_WE_HOME = document.documentElement.classList.contains('home');

  let nav = document.createElement('nav');
  document.body.prepend(nav);

  for (let p of pages) {
    let url = p.url;
    let title = p.title;

    // Adjust URL for relative paths if we're not on the home page
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);
  }