import { createChart, createChartWithTitles } from "./chart";
import { debounce } from "./utils/debounce.js";
import {
  serverAndDesktopReleases,
  kernelReleases,
  kernelReleaseSchedule,
  kernelReleases2204,
  kernelReleases2004,
  kernelReleases1804,
  kernelReleases1604,
  kernelReleases1404,
  kernelReleasesALL,
  kernelReleasesLTS,
  openStackReleases,
  kubernetesReleases,
  microStackReleases,
  desktopServerStatus,
  kernelStatus,
  kernelReleaseScheduleStatus,
  kernelStatusLTS,
  kernelStatusALL,
  openStackStatus,
  kubernetesStatus,
  microStackStatus,
  desktopServerReleaseNames,
  kernelReleaseNames,
  kernelVersionNames,
  kernelReleaseScheduleNames,
  kernelReleaseNames2204,
  kernelReleaseNames2004,
  kernelReleaseNames1804,
  kernelReleaseNames1604,
  kernelReleaseNames1404,
  kernelReleaseNamesLTS,
  kernelReleaseNamesALL,
  openStackReleaseNames,
  kubernetesReleaseNames,
  microStackReleaseNames,
} from "./chart-data";

function buildCharts() {
  if (document.querySelector("#server-desktop-eol")) {
    delete desktopServerStatus.MAINTENANCE_UPDATES;
    createChart(
      "#server-desktop-eol",
      desktopServerReleaseNames,
      desktopServerStatus,
      serverAndDesktopReleases
    );
  }
  if (document.querySelector("#eol-1604")) {
    delete desktopServerStatus.MAINTENANCE_UPDATES;
    createChart(
      "#eol-1604",
      desktopServerReleaseNames,
      desktopServerStatus,
      serverAndDesktopReleases,
      false,
      [],
      "16.04"
    );
  }
  if (document.querySelector("#kernel-eol")) {
    createChartWithTitles(
      "#kernel-eol",
      kernelReleaseNames,
      "Ubuntu",
      kernelStatus,
      kernelReleases,
      kernelVersionNames,
      "Kernel"
    );
  }
  if (document.querySelector("#kernel2204")) {
    createChart(
      "#kernel2204",
      kernelReleaseNames2204,
      kernelStatus,
      kernelReleases2204
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
      kubernetesReleases,
      false,
      true
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
  if (document.querySelector("#microstack-eol")) {
    createChart(
      "#microstack-eol",
      microStackReleaseNames,
      microStackStatus,
      microStackReleases
    );
  }
}

function clearCharts() {
  const serverDesktopEol = document.querySelector("#server-desktop-eol");
  if (serverDesktopEol) {
    serverDesktopEol.innerHTML = "";
  }
  const eol1604 = document.querySelector("#eol-1604");
  if (eol1604) {
    eol1604.innerHTML = "";
  }
  const kernelEol = document.querySelector("#kernel-eol");
  if (kernelEol) {
    kernelEol.innerHTML = "";
  }
  const kernel2204 = document.querySelector("#kernel2204");
  if (kernel2204) {
    kernel2204.innerHTML = "";
  }
  const kernel2004 = document.querySelector("#kernel2004");
  if (kernel2004) {
    kernel2004.innerHTML = "";
  }
  const kernel1804 = document.querySelector("#kernel1804");
  if (kernel1804) {
    kernel1804.innerHTML = "";
  }
  const kernel1604 = document.querySelector("#kernel1604");
  if (kernel1604) {
    kernel1604.innerHTML = "";
  }
  const kernel1404 = document.querySelector("#kernel1404");
  if (kernel1404) {
    kernel1404.innerHTML = "";
  }
  const kernellts = document.querySelector("#kernellts");
  if (kernellts) {
    kernellts.innerHTML = "";
  }
  const kernelall = document.querySelector("#kernelall");
  if (kernelall) {
    kernelall.innerHTML = "";
  }
  const openstackEol = document.querySelector("#openstack-eol");
  if (openstackEol) {
    openstackEol.innerHTML = "";
  }
  const kubernetesEol = document.querySelector("#kubernetes-eol");
  if (kubernetesEol) {
    kubernetesEol.innerHTML = "";
  }
  const kernelSchedule = document.querySelector("#kernel-schedule");
  if (kernelSchedule) {
    kernelSchedule.innerHTML = "";
  }
  const microstackEol = document.querySelector("#microstack-eol");
  if (microstackEol) {
    microstackEol.innerHTML = "";
  }
}

var mediumBreakpoint = 620;

// A bit of a hack, but chart doesn't load with full year axis on first load,
// It has to be loaded once, and then again
// This will need looking into but this fix will work for now
if (window.innerWidth >= mediumBreakpoint) {
  buildCharts();
  setTimeout(function () {
    clearCharts();
    buildCharts();
  }, 0);
}

window.addEventListener(
  "resize",
  debounce(function () {
    if (window.innerWidth >= mediumBreakpoint) {
      clearCharts();
      buildCharts();
    }
  }, 250)
);
