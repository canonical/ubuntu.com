function initImageDownload(imagePath, GAlabel) {
  dataLayer.push({
    event: "GAEvent",
    eventCategory: "Download",
    eventAction: "Downloaded",
    eventLabel: "User downloaded Ubuntu (" + GAlabel + ")",
    eventValue: undefined,
  });

  fetch("/mirrors.json")
    .then((response) => response.json())
    .then((mirrors) => {
      startDownload(mirrors, imagePath);
    })
    .catch(() => {
      // in case of error just download the default image
      startDownload([], imagePath);
    });
}

function startDownload(mirrors, imagePath) {
  var defaultLocation = "https://releases.ubuntu.com/";
  // Select a random mirror from list
  var selectedMirror = chooseRandomMirror(mirrors);
  var downloadLocation = defaultLocation;

  // Build the download link
  if (selectedMirror && selectedMirror.link) {
    downloadLocation = selectedMirror.link;
  }

  var downloadLink = downloadLocation + imagePath;

  // Start download
  delayStartDownload(downloadLink, 3000);
}

/**
 * Kick off a download link
 * after a certain delay in milliseconds
 */
function delayStartDownload(downloadLink, delay) {
  window.setTimeout(function () {
    window.location.href = downloadLink;
  }, delay);
}

/**
 * Choose randomly from a given list of mirrors
 * Weight the choice by the bandwidth of each mirror
 */
function chooseRandomMirror(mirrors) {
  var selectedMirror = null;

  // Calculate total bandwidth
  var totalBandwidth = 0;

  mirrors.forEach(function (mirror) {
    mirror.bandwidth = parseInt(mirror.bandwidth)
      ? parseInt(mirror.bandwidth)
      : 0;
    totalBandwidth += mirror.bandwidth;
  });

  // Random weight-point to download
  var downloadPoint = Math.floor(Math.random() * totalBandwidth);
  var weightPoint = 0;

  // Select a mirror based on weighting
  for (var mirrorIndex = 0; mirrorIndex < mirrors.length; mirrorIndex++) {
    var mirror = mirrors[mirrorIndex];
    weightPoint += mirror.bandwidth;

    // If this is the random point to download
    if (downloadPoint < weightPoint) {
      selectedMirror = mirror;
      break;
    }
  }

  return selectedMirror;
}

window.initImageDownload = initImageDownload;
