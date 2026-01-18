/**
 * Helper function to parse TSPLIB-formatted content.
 *
 * @param {string} content - Content of the TSPLIB-formatted file.
 * @returns {Object} - Graph object with name and coordinates parsed from the content.
 */
function parseFile(content) {
  const lines = content.split("\n");
  let coordinatesSection = false;
  const coordinates = [];
  let name = "Uploaded Graph";

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("NAME")) {
      name = trimmedLine.split(":")[1].trim();
      continue;
    }

    if (trimmedLine.startsWith("NODE_COORD_SECTION")) {
      coordinatesSection = true;
      continue;
    }

    if (coordinatesSection && trimmedLine === "EOF") {
      break;
    }

    if (coordinatesSection) {
      const [node, x, y] = trimmedLine.split(/\s+/);
      coordinates.push([parseFloat(x), parseFloat(y)]);
    }
  }

  return {
    name: `Uploaded Graph - ${name}`,
    coordinates: coordinates,
    tour: "N/A",
    cost: "N/A",
  };
}

// Export the parseFile function for external use
module.exports = parseFile;
