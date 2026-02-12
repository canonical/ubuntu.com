function initImageDownload(imagePath, GAlabel) {
  dataLayer.push({
    event: "GAEvent",
    eventCategory: "Download",
    eventAction: "Downloaded",
    eventLabel: "User downloaded Ubuntu (" + GAlabel + ")",
    eventValue: undefined,
  });

  // Get the user's timezone and use this to find the country_code before fetching the mirrors
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  fetch(`/user-country-tz.json?tz=${timezone}`)
    .then((response) => response.json())
    .then((userData) =>
      fetch(
        `/mirrors.json?local=${!!userData?.country_code}&country_code=${
          userData?.country_code || ""
        }`,
      ),
    )
    .then((response) => response.json())
    .then((mirrors) => startDownload(mirrors, imagePath))
    .catch(() => {
      // in case of error just download the default image
      startDownload([], imagePath);
    });
}

function startDownload(mirrors, imagePath) {
  var defaultLocation = "https://releases.ubuntu.com/";
  var defaultLink = defaultLocation + imagePath;

  // Select a random mirror from list
  var selectedMirror = chooseRandomMirror(mirrors);

  // If a mirror was selected, verify the file exists before redirecting
  if (selectedMirror && selectedMirror.link) {
    var mirrorLink = selectedMirror.link + imagePath;

    // Check the mirror exists before attempting to download
    fetch(
      `/mirror-check?mirror_url=${encodeURIComponent(mirrorLink)}`,
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (data.available) {
          // Mirror has the file, download from mirror
          delayStartDownload(mirrorLink, 3000);
        } else {
          // Mirror doesn't have the file, download from default
          delayStartDownload(defaultLink, 3000);
        }
      })
      .catch(function () {
        // Error checking mirror, download from default
        delayStartDownload(defaultLink, 3000);
      });
  } else {
    // No mirror selected, download from default
    delayStartDownload(defaultLink, 3000);
  }
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
