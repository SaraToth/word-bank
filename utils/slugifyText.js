const slugifyText = (text) => {
  return text
    .toString()
    .toLowerCase()                // lowercase all letters
    .trim()                      // remove leading/trailing spaces
    .replace(/\s+/g, '-')        // replace spaces with dashes
    .replace(/[^\w\-]+/g, '')    // remove all non-word chars except dash
    .replace(/\-\-+/g, '-');     // replace multiple dashes with one dash
};

module.exports = slugifyText;