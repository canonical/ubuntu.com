import { createChart } from "./chart";
import {
  smallReleases,
  serverAndDesktopReleases,
  kernelReleases,
  kernelReleaseSchedule,
  kernelReleases2004,
  kernelReleases1804,
  kernelReleases1604,
  kernelReleases1404,
  kernelReleasesALL,
  kernelReleasesLTS,
  openStackReleases,
  kubernetesReleases,
  desktopServerStatus,
  kernelStatus,
  kernelReleaseScheduleStatus,
  kernelStatusLTS,
  kernelStatusALL,
  openStackStatus,
  kubernetesStatus,
  smallReleaseNames,
  desktopServerReleaseNames,
  kernelReleaseNames,
  kernelReleaseScheduleNames,
  kernelReleaseNames2004,
  kernelReleaseNames1804,
  kernelReleaseNames1604,
  kernelReleaseNames1404,
  kernelReleaseNamesLTS,
  kernelReleaseNamesALL,
  openStackReleaseNames,
  kubernetesReleaseNames
} from "./chart-data";

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
}

function buildCharts() {
  if (document.querySelector("#small-eol")) {
    createChart(
      "#small-eol",
      smallReleaseNames,
      desktopServerStatus,
      smallReleases
    );
  }
  if (document.querySelector("#server-desktop-eol")) {
    createChart(
      "#server-desktop-eol",
      desktopServerReleaseNames,
      desktopServerStatus,
      serverAndDesktopReleases
    );
  }
  if (document.querySelector("#kernel-eol")) {
    createChart(
      "#kernel-eol",
      kernelReleaseNames,
      kernelStatus,
      kernelReleases
    );
  }
  if (document.querySelector("#kernel2004")) {
    createChart(
      "#kernel2004",
      kernelReleaseNames2004,
      kernelStatus,
      kernelReleases2004
    );
  }
  if (document.querySelector("#kernel1804")) {
    createChart(
      "#kernel1804",
      kernelReleaseNames1804,
      kernelStatus,
      kernelReleases1804
    );
  }
  if (document.querySelector("#kernel1604")) {
    createChart(
      "#kernel1604",
      kernelReleaseNames1604,
      kernelStatus,
      kernelReleases1604
    );
  }
  if (document.querySelector("#kernel1404")) {
    createChart(
      "#kernel1404",
      kernelReleaseNames1404,
      kernelStatus,
      kernelReleases1404
    );
  }
  if (document.querySelector("#kernellts")) {
    createChart(
      "#kernellts",
      kernelReleaseNamesLTS,
      kernelStatusLTS,
      kernelReleasesLTS
    );
  }
  if (document.querySelector("#kernelall")) {
    createChart(
      "#kernelall",
      kernelReleaseNamesALL,
      kernelStatusALL,
      kernelReleasesALL
    );
  }
  if (document.querySelector("#openstack-eol")) {
    createChart(
      "#openstack-eol",
      openStackReleaseNames,
      openStackStatus,
      openStackReleases
    );
  }
  if (document.querySelector("#kubernetes-eol")) {
    createChart(
      "#kubernetes-eol",
      kubernetesReleaseNames,
      kubernetesStatus,
      kubernetesReleases
    );
  }
  if (document.querySelector("#kernel-schedule")) {
    createChart(
      "#kernel-schedule",
      kernelReleaseScheduleNames,
      kernelReleaseScheduleStatus,
      kernelReleaseSchedule
    );
  }
}

function clearCharts() {
  if (document.querySelector("#small-eol")) {
    document.querySelector("#small-eol").innerHTML = "";
  }
  if (document.querySelector("#server-desktop-eol")) {
    document.querySelector("#server-desktop-eol").innerHTML = "";
  }
  if (document.querySelector("#kernel-eol")) {
    document.querySelector("#kernel-eol").innerHTML = "";
  }
  if (document.querySelector("#kernel2004")) {
    document.querySelector("#kernel2004").innerHTML = "";
  }
  if (document.querySelector("#kernel1804")) {
    document.querySelector("#kernel1804").innerHTML = "";
  }
  if (document.querySelector("#kernel1604")) {
    document.querySelector("#kernel1604").innerHTML = "";
  }
  if (document.querySelector("#kernel1404")) {
    document.querySelector("#kernel1404").innerHTML = "";
  }
  if (document.querySelector("#kernellts")) {
    document.querySelector("#kernellts").innerHTML = "";
  }
  if (document.querySelector("#kernelall")) {
    document.querySelector("#kernelall").innerHTML = "";
  }
  if (document.querySelector("#openstack-eol")) {
    document.querySelector("#openstack-eol").innerHTML = "";
  }
  if (document.querySelector("#kubernetes-eol")) {
    document.querySelector("#kubernetes-eol").innerHTML = "";
  }
  if (document.querySelector("#kernel-schedule")) {
    document.querySelector("#kernel-schedule").innerHTML = "";
  }
}

var mediumBreakpoint = 875;

// A bit of a hack, but chart doesn't load with full year axis on first load,
// It has to be loaded once, and then again
// This will need looking into but this fix will work for now
if (window.innerWidth >= mediumBreakpoint) {
  buildCharts();
  setTimeout(function() {
    clearCharts();
    buildCharts();
  }, 0);
}

window.addEventListener(
  "resize",
  debounce(function() {
    if (window.innerWidth >= mediumBreakpoint) {
      clearCharts();
      buildCharts();
    }
  }, 250)
);
