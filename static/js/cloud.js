if (typeof cloud !== "undefined") {
    throw TypeError('Namespace "cloud" not available');
}
// Define this namespace
var cloud = {};

cloud.formatPrice = function(number) {
  numberWithCommas = Math.ceil(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  amount = '$' + numberWithCommas;
  amount = amount.replace('$-', '-$');
  return amount;
};

cloud.calculator = function() {
  var
  /* Constants */
  daysInYear = 365,
  monthsInYear = 12,
  daysInMonth = 30,
  hoursInDay = 24,
  hoursInMonth = hoursInDay * daysInMonth,
  hoursInYear = hoursInDay * daysInYear,

  /* Settings */
  vmPerHour = 0.05,
  uaPriceVm = 0.03,
  bootstackServerDailyPrice = 15,
  bootstackServerHourlyPrice = bootstackServerDailyPrice / hoursInDay,
  viewBy = 'vms',
  billingPeroid = 'month',
  uaServerHourlyCosts = {
    small: 75000 / hoursInYear,
    medium: 180000 / hoursInYear,
    large: 350000 / hoursInYear
  },
  smallThreshold = 101,
  mediumThreshold = 501,
  /* general elements */
  calculatorForm = document.querySelector('#calculator-form'),
  vmsFieldset = document.querySelector('#vms'),
  serversFieldset = document.querySelector('#servers'),

  /* Input elements */
  numberOfStaffInput = document.querySelector('#number-of-staff'),
  annualSalaryThousandsInput = document.querySelector('#staff-annual-salary'),
  numberOfServersInput = document.querySelector('#number-of-servers'),
  numberOfVmsInput = document.querySelector('#number-of-vms'),
  /* Radio input selectors */
  vmsOrServersInputSelector = '[name=vms-or-servers]:checked',
  billingPeriodInputSelector = '[name=billing-period]:checked',

  /* Output elements */
  bootstackCostOutput = document.querySelector('#bootstack-cost'),
  selfBuiltCostOutput = document.querySelector('#self-built-cost'),
  billingPeriodOutputs = document.querySelectorAll('.billing-period'),
  selfBuiltStaffCostOutputs = document.querySelectorAll('.self-built-staff-cost'),
  selfBuiltUACostOutputs = document.querySelectorAll('.self-built-ua-cost'),
  uaSupportCostOutput = document.querySelector('#ua-support-cost-output'),
  numServerOrVmsOutput = document.querySelector('#num-servers-or-vms-output'),
  serversOrVmsOutput = document.querySelector('#servers-or-vms-output');

  // Function to update the servers variables and update calculations
  function update() {
      var numberOfStaff = parseInt(numberOfStaffInput.value),
          annualSalary = parseInt(annualSalaryThousandsInput.value) * 1000,
          serversOrVms = document.querySelector(vmsOrServersInputSelector).value,
          billingPeriod = document.querySelector(billingPeriodInputSelector).value,
          annualStaffCost = numberOfStaff * annualSalary,
          uaCost = 0,
          numberOfUnits = 0;

      switch(billingPeroid) {
        case 'hour': staffCost = annualStaffCost / hoursInYear; break;
        case 'month': staffCost = annualStaffCost / monthsInYear; break;
        case 'year': staffCost = annualStaffCost; break;
      }

      if (serversOrVms === 'VMs') {
          // VM calculations
          vmsFieldset.classList.remove('is-hidden');
          serversFieldset.classList.add('is-hidden');

          numberOfUnits = parseInt(numberOfVmsInput.value);

          var uaHourlyCost = numberOfUnits * uaPriceVm,
              vmCostPerHour = numberOfUnits * vmPerHour;

          switch(billingPeroid) {
            case 'hour':
              bootstackCost = vmCostPerHour;
              uaCost = uaHourlyCost;
              break;
            case 'month':
              bootstackCost = vmCostPerHour * hoursInMonth;
              uaCost = uaHourlyCost * hoursInMonth;
              break;
            case 'year':
              bootstackCost = vmCostPerHour * hoursInYesr;
              uaCost = uaHourlyCost * hoursInYear;
              break;
          }
      } else if (serversOrVms === 'Servers') {
          // Server calculations
          vmsFieldset.classList.add('is-hidden');
          serversFieldset.classList.remove('is-hidden');

          numberOfUnits = parseInt(numberOfServersInput.value);

          if (numberOfUnits < smallThreshold ) {
            uaServerHourlyCost = uaServerHourlyCosts.small;
          } else if (numberOfUnits < mediumThreshold ) {
            uaServerHourlyCost = uaServerHourlyCosts.medium;
          } else {
            uaServerHourlyCost = uaServerHourlyCosts.large;
          }

          var serverHourlyCost = numberOfUnits * bootstackServerHourlyPrice;

          switch(billingPeroid) {
            case 'hour':
              bootstackCost = serverHourlyCost;
              uaCost = uaServerHourlyCost;
              break;
            case 'month':
              bootstackCost = serverHourlyCost * hoursInMonth;
              uaCost = uaServerHourlyCost * hoursInMonth;
              break;
            case 'year':
              bootstackCost = serverHourlyCost * hoursInYesr;
              uaCost = uaServerHourlyCost * hoursInYear;
              break;
          }
      } else {
        throw "Error in cloud.calculator: Erroneous value for serversOrVMs: " + serversOrVms;
      }

      billingPeriodOutputs.forEach(function(elem) {elem.innerText = billingPeriod;});
      numServerOrVmsOutput.innerText = numberOfUnits;
      serversOrVmsOutput.innerText = serversOrVms;
      selfBuiltStaffCostOutputs.forEach(function(elem) {elem.innerText = cloud.formatPrice(staffCost);});
      selfBuiltUACostOutputs.forEach(function(elem) {elem.innerText = cloud.formatPrice(uaCost);});
      bootstackCostOutput.innerText = cloud.formatPrice(bootstackCost);
      selfBuiltCostOutput.innerText = cloud.formatPrice(uaCost + staffCost);
  }

  // Update everything when input changes
  calculatorForm.addEventListener('change', update);
  calculatorForm.addEventListener('input', update);
  update();
};
