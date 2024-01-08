function loadAndEmbedSVGs() {
  // Get the current page title
  const pageTitle = document.title;

  fetch('/svg_handler/svg_mapping.json')
    .then(response => response.json())
    .then(mapping => {
      // Check if mapping for the current page title exists
      const pageMapping = mapping[pageTitle];
      if (pageMapping) {
        document.querySelectorAll('svg').forEach(svg => {
          const id = svg.id;
          const svgPath = pageMapping[id];
          if (svgPath) {
            fetch(svgPath)
              .then(response => response.text())
              .then(svgContent => {
                svg.innerHTML = svgContent;
                svg.style.cssText += "width: 100%;";

                // Access the newly added SVG to extract dimensions
                const childSvg = svg.querySelector('svg');
                if (childSvg) {
                  let width = parseFloat(childSvg.getAttribute('width'));
                  let height = parseFloat(childSvg.getAttribute('height'));

                  // Increase dimensions by 10 and round up
                  width = Math.ceil(width + 5);
                  height = Math.ceil(height + 5);

                  // Set the viewBox of the parent SVG to match the new dimensions
                  if (!isNaN(width) && !isNaN(height)) {
                    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
                  }
                }
              })
              .catch(error => console.error('Error loading SVG:', error));
          }
        });
      }
    })
    .catch(error => console.error('Error loading JSON mapping:', error));
}

function updateImageClasses() {
  const images = document.getElementsByTagName('svg');
  const bodyClass = document.body.className;
  
  // Determine the new class for the images
  const newClass = bodyClass.includes('dark') ? 'img-dark' : 'img-light';
  
  // Update the class for each image
  for (let img of images) {
      // Check if the SVG does not have the class 'svg-container'
      if (!img.classList.contains('svg-container')) {
          img.setAttribute('class', newClass);
      }
  }

    // Code for top arrow
    const toplink = document.getElementById('top-link');
    const toplinkarrow = document.getElementById('top-link-arrow');
    const newLinkClass = bodyClass.includes('dark') ? 'top-link-dark' : 'top-link-light';
    const newArrowClass = bodyClass.includes('dark') ? 'arrow-icon-dark' : 'arrow-icon';
    toplink.setAttribute('class', newLinkClass);
    toplinkarrow.setAttribute('class', newArrowClass);
}

// Create an observer instance to monitor changes in the class of <body>
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
            updateImageClasses();
        }
    });
});

// Configuration of the observer: observe changes in attributes
const config = { attributes: true };

window.onload = function() {
  // Start observing the <body> tag for changes in the class attribute
  observer.observe(document.body, config);

  // Initial update on page load
  updateImageClasses();
  loadAndEmbedSVGs();
};