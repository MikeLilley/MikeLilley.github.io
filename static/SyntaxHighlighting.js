document.addEventListener('DOMContentLoaded', function() {
    function applyPrismHighlighting(language) {
        var codeContainers = document.querySelectorAll(`div.source-code-content.${language}`);

        codeContainers.forEach(function(container) {
            var code = container.innerHTML;
            var tempCodeElement = document.createElement('code');
            tempCodeElement.innerHTML = code.trim();
            tempCodeElement.className = `language-${language}`;
            Prism.highlightElement(tempCodeElement);
            container.innerHTML = tempCodeElement.innerHTML;

            // Add line numbers after highlighting
            addLineNumbers(container);
        });
    }

    function addLineNumbers(container) {
        var lines = container.innerHTML.split('\n');
        var totalLines = lines.length;
        var maxLineDigits = totalLines.toString().length;
    
        var numberedHtml = lines.map(function(line, index) {
            var lineNumber = (index + 1).toString();
            var paddedLineNumber = lineNumber.padStart(maxLineDigits, ' ');
            return '<span class="line-number">' + paddedLineNumber + ' |</span> ' + line;
        }).join('\n');
    
        container.innerHTML = '<div class="line-numbered">' + numberedHtml + '</div>';
    }

    // Dynamically find and apply highlighting to all languages
    var allCodeContainers = document.querySelectorAll('div.source-code-content');
    var languages = new Set();

    allCodeContainers.forEach(function(container) {
        var language = container.classList[1];
        if (language) {
            languages.add(language);
        }
    });

    languages.forEach(function(language) {
        applyPrismHighlighting(language);
    });
});

(function(Prism) {
    Prism.languages.singular = {
        'comment': /\/\/.*$/m,
        'function': /\b(?:ring|ideal|intersect|groebner)\b/,
        'operator': /[+=\-*/^|]/,
        'punctuation': /[.,;(){}[\]]/,
    };
}(Prism));