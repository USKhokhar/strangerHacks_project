export const extractTextFromHtml = (htmlString) => {
    // Create a temporary element to hold the HTML string
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlString;

    // Use the .textContent property to extract the text from the HTML tags
    const extractedText = tempElement.textContent;

    // Remove any whitespace from the extracted text
    const trimmedText = extractedText.replace(/\s+/g, ' ').trim();

    // Return the trimmed text
    return trimmedText;
};