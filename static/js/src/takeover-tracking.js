import { getCookie, setCookie} from "./utils/cookies";

(function() {
  // check if user doesn't already have a group
  if (!getCookie("control_or_variant")) {

    // randomly assign to 'control' or 'variant' group
    const group = Math.random() > 0.5 ? "control" : "variant";

    // store group as cookie for 365 days
    setCookie("control_or_variant", group, 365);

    // send group info in GA event
    dataLayer.push({
      'event' : 'test',
      'test_type' : 'element visibility',
      'control_or_variant' : group,
    });
  }
})();
