var serverAndDesktopReleases = [
  {
    startDate: new Date('2010-04-01T00:00:00'),
    endDate: new Date('2012-07-01T00:00:00'),
    taskName: 'Ubuntu 10.04 LTS',
    status: 'HARDWARE_AND_MAINTENANCE_UPDATES'
  },
  {
    startDate: new Date('2012-07-01T00:00:00'),
    endDate: new Date('2015-04-01T00:00:00'),
    taskName: 'Ubuntu 10.04 LTS',
    status: 'MAINTENANCE_UPDATES'
  },
  {
    startDate: new Date('2012-04-01T00:00:00'),
    endDate: new Date('2014-10-01T00:00:00'),
    taskName: 'Ubuntu 12.04 LTS',
    status: 'HARDWARE_AND_MAINTENANCE_UPDATES'
  },
  {
    startDate: new Date('2014-10-01T00:00:00'),
    endDate: new Date('2017-04-01T00:00:00'),
    taskName: 'Ubuntu 12.04 LTS',
    status: 'MAINTENANCE_UPDATES'
  },
  {
    startDate: new Date('2017-04-01T00:00:00'),
    endDate: new Date('2020-04-01T00:00:00'),
    taskName: 'Ubuntu 12.04 LTS',
    status: 'EXTENDED_SECURITY_MAINTENANCE_FOR_CUSTOMERS'
  },
  {
    startDate: new Date('2014-04-01T00:00:00'),
    endDate: new Date('2016-10-01T00:00:00'),
    taskName: 'Ubuntu 14.04 LTS',
    status: 'HARDWARE_AND_MAINTENANCE_UPDATES'
  },
  {
    startDate: new Date('2016-10-01T00:00:00'),
    endDate: new Date('2019-04-01T00:00:00'),
    taskName: 'Ubuntu 14.04 LTS',
    status: 'MAINTENANCE_UPDATES'
  },
  {
    startDate: new Date('2016-04-01T00:00:00'),
    endDate: new Date('2018-10-01T00:00:00'),
    taskName: 'Ubuntu 16.04 LTS',
    status: 'HARDWARE_AND_MAINTENANCE_UPDATES'
  },
  {
    startDate: new Date('2018-10-01T00:00:00'),
    endDate: new Date('2021-04-01T00:00:00'),
    taskName: 'Ubuntu 16.04 LTS',
    status: 'MAINTENANCE_UPDATES'
  },
  {
    startDate: new Date('2017-10-01T00:00:00'),
    endDate: new Date('2018-07-01T00:00:00'),
    taskName: 'Ubuntu 17.10',
    status: 'STANDARD_RELEASE'
  },
  {
    startDate: new Date('2018-04-01T00:00:00'),
    endDate: new Date('2020-10-01T00:00:00'),
    taskName: 'Ubuntu 18.04 LTS',
    status: 'HARDWARE_AND_MAINTENANCE_UPDATES'
  },
  {
    startDate: new Date('2020-10-01T00:00:00'),
    endDate: new Date('2023-04-01T00:00:00'),
    taskName: 'Ubuntu 18.04 LTS',
    status: 'MAINTENANCE_UPDATES'
  },
  {
    startDate: new Date('2018-10-01T00:00:00'),
    endDate: new Date('2019-07-01T00:00:00'),
    taskName: 'Ubuntu 18.10',
    status: 'STANDARD_RELEASE'
  },
  {
    startDate: new Date('2019-04-01T00:00:00'),
    endDate: new Date('2019-12-31T00:00:00'),
    taskName: 'Ubuntu 19.04',
    status: 'STANDARD_RELEASE'
  },
  {
    startDate: new Date('2019-10-01T00:00:00'),
    endDate: new Date('2020-07-01T00:00:00'),
    taskName: 'Ubuntu 19.10',
    status: 'STANDARD_RELEASE'
  },
  {
    startDate: new Date('2020-04-01T00:00:00'),
    endDate: new Date('2022-10-01T00:00:00'),
    taskName: 'Ubuntu 20.04 LTS',
    status: 'HARDWARE_AND_MAINTENANCE_UPDATES'
  },
  {
    startDate: new Date('2022-10-01T00:00:00'),
    endDate: new Date('2025-04-01T00:00:00'),
    taskName: 'Ubuntu 20.04 LTS',
    status: 'MAINTENANCE_UPDATES'
  }
];

var kernelReleases = [
  {
    startDate: new Date('2012-04-01T00:00:00'),
    endDate: new Date('2017-04-01T00:00:00'),
    taskName: 'Ubuntu 12.04.0 LTS (v3.2)',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2017-04-01T00:00:00'),
    endDate: new Date('2020-04-01T00:00:00'),
    taskName: 'Ubuntu 12.04.0 LTS (v3.2)',
    status: 'EXTENDED_SECURITY_MAINTENANCE_FOR_CUSTOMERS'
  },
  {
    startDate: new Date('2012-07-01T00:00:00'),
    endDate: new Date('2017-04-01T00:00:00'),
    taskName: 'Ubuntu 12.04.1 LTS (v3.2)',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2017-04-01T00:00:00'),
    endDate: new Date('2020-04-01T00:00:00'),
    taskName: 'Ubuntu 12.04.1 LTS (v3.2)',
    status: 'EXTENDED_SECURITY_MAINTENANCE_FOR_CUSTOMERS'
  },
  {
    startDate: new Date('2014-04-01T00:00:00'),
    endDate: new Date('2018-07-01T00:00:00'),
    taskName: 'Ubuntu 14.04.0 LTS (v3.13)',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2014-07-01T00:00:00'),
    endDate: new Date('2017-04-01T00:00:00'),
    taskName: 'Ubuntu 12.04.5 LTS (v3.13)',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2017-04-01T00:00:00'),
    endDate: new Date('2020-04-01T00:00:00'),
    taskName: 'Ubuntu 12.04.5 LTS (v3.13)',
    status: 'EXTENDED_SECURITY_MAINTENANCE_FOR_CUSTOMERS'
  },
  {
    startDate: new Date('2014-07-01T00:00:00'),
    endDate: new Date('2018-07-01T00:00:00'),
    taskName: 'Ubuntu 14.04.1 LTS (v3.13)',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2016-04-01T00:00:00'),
    endDate: new Date('2021-07-01T00:00:00'),
    taskName: 'Ubuntu 16.04.0 LTS (v4.4)',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2016-07-01T00:00:00'),
    endDate: new Date('2018-07-01T00:00:00'),
    taskName: 'Ubuntu 14.04.5 LTS',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2016-04-01T00:00:00'),
    endDate: new Date('2021-07-01T00:00:00'),
    taskName: 'Ubuntu 16.04.1 LTS (v4.4)',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2017-10-01T00:00:00'),
    endDate: new Date('2018-10-01T00:00:00'),
    taskName: 'Ubuntu 17.10 (v4.13)',
    status: 'STANDARD_RELEASE'
  },
  {
    startDate: new Date('2018-01-01T00:00:00'),
    endDate: new Date('2018-10-01T00:00:00'),
    taskName: 'Ubuntu 16.04.4 LTS (v4.13)',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2018-04-01T00:00:00'),
    endDate: new Date('2023-07-01T00:00:00'),
    taskName: 'Ubuntu 18.04.0 LTS (v4.15)',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2018-07-01T00:00:00'),
    endDate: new Date('2021-07-01T00:00:00'),
    taskName: 'Ubuntu 16.04.5 LTS (v4.15)',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2018-07-01T00:00:00'),
    endDate: new Date('2023-07-01T00:00:00'),
    taskName: 'Ubuntu 18.04.1 LTS (v4.15)',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2018-10-01T00:00:00'),
    endDate: new Date('2019-10-01T00:00:00'),
    taskName: 'Ubuntu 18.10',
    status: 'STANDARD_RELEASE'
  },
  {
    startDate: new Date('2019-01-01T00:00:00'),
    endDate: new Date('2019-10-01T00:00:00'),
    taskName: 'Ubuntu 18.04.2 LTS',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2019-04-01T00:00:00'),
    endDate: new Date('2020-04-01T00:00:00'),
    taskName: 'Ubuntu 19.04',
    status: 'STANDARD_RELEASE'
  },
  {
    startDate: new Date('2019-07-01T00:00:00'),
    endDate: new Date('2020-04-01T00:00:00'),
    taskName: 'Ubuntu 18.04.3 LTS',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2019-10-01T00:00:00'),
    endDate: new Date('2020-10-01T00:00:00'),
    taskName: 'Ubuntu 19.10',
    status: 'STANDARD_RELEASE'
  },
  {
    startDate: new Date('2020-01-01T00:00:00'),
    endDate: new Date('2020-10-01T00:00:00'),
    taskName: 'Ubuntu 18.04.4 LTS',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2020-04-01T00:00:00'),
    endDate: new Date('2025-07-01T00:00:00'),
    taskName: 'Ubuntu 20.04 LTS',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2020-07-01T00:00:00'),
    endDate: new Date('2023-07-01T00:00:00'),
    taskName: 'Ubuntu 18.04.5 LTS',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  }
];

var openStackReleases = [
  {
    startDate: new Date('2014-04-01T00:00:00'),
    endDate: new Date('2019-04-01T00:00:00'),
    taskName: 'Ubuntu 14.04 LTS',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2014-04-01T00:00:00'),
    endDate: new Date('2019-04-01T00:00:00'),
    taskName: 'OpenStack Icehouse',
    status: 'MATCHING_OPENSTACK_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2015-04-01T00:00:00'),
    endDate: new Date('2016-10-01T00:00:00'),
    taskName: 'OpenStack Kilo',
    status: 'MATCHING_OPENSTACK_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2016-10-01T00:00:00'),
    endDate: new Date('2018-04-01T00:00:00'),
    taskName: 'OpenStack Kilo',
    status: 'EXTENDED_SUPPORT_FOR_CUSTOMERS'
  },
  {
    startDate: new Date('2016-04-01T00:00:00'),
    endDate: new Date('2019-04-01T00:00:00'),
    taskName: 'OpenStack Mitaka',
    status: 'MATCHING_OPENSTACK_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2016-04-01T00:00:00'),
    endDate: new Date('2021-04-01T00:00:00'),
    taskName: 'Ubuntu 16.04 LTS',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2016-04-01T00:00:00'),
    endDate: new Date('2021-04-01T00:00:00'),
    taskName: 'OpenStack Mitaka',
    status: 'MATCHING_OPENSTACK_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2016-10-01T00:00:00'),
    endDate: new Date('2018-04-01T00:00:00'),
    taskName: 'OpenStack Newton',
    status: 'MATCHING_OPENSTACK_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2017-02-01T00:00:00'),
    endDate: new Date('2018-08-01T00:00:00'),
    taskName: 'OpenStack Ocata',
    status: 'MATCHING_OPENSTACK_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2018-08-01T00:00:00'),
    endDate: new Date('2020-02-01T00:00:00'),
    taskName: 'OpenStack Ocata',
    status: 'EXTENDED_SUPPORT_FOR_CUSTOMERS'
  },
  {
    startDate: new Date('2017-08-01T00:00:00'),
    endDate: new Date('2019-02-01T00:00:00'),
    taskName: 'OpenStack Pike',
    status: 'MATCHING_OPENSTACK_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2018-03-01T00:00:00'),
    endDate: new Date('2021-04-01T00:00:00'),
    taskName: 'OpenStack Queens',
    status: 'MATCHING_OPENSTACK_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2018-04-01T00:00:00'),
    endDate: new Date('2023-04-01T00:00:00'),
    taskName: 'Ubuntu 18.04 LTS',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2018-04-01T00:00:00'),
    endDate: new Date('2023-04-01T00:00:00'),
    taskName: 'OpenStack Queens',
    status: 'MATCHING_OPENSTACK_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2018-08-01T00:00:00'),
    endDate: new Date('2020-02-01T00:00:00'),
    taskName: 'OpenStack Rocky',
    status: 'MATCHING_OPENSTACK_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2019-04-01T00:00:00'),
    endDate: new Date('2020-10-01T00:00:00'),
    taskName: 'OpenStack Stein',
    status: 'MATCHING_OPENSTACK_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2020-10-01T00:00:00'),
    endDate: new Date('2022-04-01T00:00:00'),
    taskName: 'OpenStack Stein',
    status: 'EXTENDED_SUPPORT_FOR_CUSTOMERS'
  },
  {
    startDate: new Date('2019-08-01T00:00:00'),
    endDate: new Date('2021-02-01T00:00:00'),
    taskName: 'OpenStack T',
    status: 'MATCHING_OPENSTACK_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2020-02-01T00:00:00'),
    endDate: new Date('2023-04-01T00:00:00'),
    taskName: 'OpenStack U',
    status: 'MATCHING_OPENSTACK_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2020-04-01T00:00:00'),
    endDate: new Date('2025-04-01T00:00:00'),
    taskName: 'Ubuntu 20.04 LTS',
    status: 'UBUNTU_LTS_RELEASE_SUPPORT'
  },
  {
    startDate: new Date('2020-04-01T00:00:00'),
    endDate: new Date('2025-04-01T00:00:00'),
    taskName: 'OpenStack U',
    status: 'MATCHING_OPENSTACK_RELEASE_SUPPORT'
  },
];

var desktopServerStatus = {
  HARDWARE_AND_MAINTENANCE_UPDATES: 'chart__bar--orange',
  MAINTENANCE_UPDATES: 'chart__bar--orange-light',
  STANDARD_RELEASE: 'chart__bar--grey',
  EXTENDED_SECURITY_MAINTENANCE_FOR_CUSTOMERS: 'chart__bar--aubergine'
};

var kernelStatus = {
  UBUNTU_LTS_RELEASE_SUPPORT: 'chart__bar--orange',
  STANDARD_RELEASE: 'chart__bar--grey',
  EXTENDED_SECURITY_MAINTENANCE_FOR_CUSTOMERS: 'chart__bar--aubergine'
};

var openStackStatus = {
  UBUNTU_LTS_RELEASE_SUPPORT: 'chart__bar--orange',
  MATCHING_OPENSTACK_RELEASE_SUPPORT: 'chart__bar--grey',
  EXTENDED_SUPPORT_FOR_CUSTOMERS: 'chart__bar--aubergine'
};

var desktopServerReleaseNames = [
  'Ubuntu 20.04 LTS',
  'Ubuntu 19.10',
  'Ubuntu 19.04',
  'Ubuntu 18.10',
  'Ubuntu 18.04 LTS',
  'Ubuntu 17.10',
  'Ubuntu 16.04 LTS',
  'Ubuntu 14.04 LTS',
  'Ubuntu 12.04 LTS',
  'Ubuntu 10.04 LTS'
];

var kernelReleaseNames = [
  'Ubuntu 18.04.5 LTS',
  'Ubuntu 20.04 LTS',
  'Ubuntu 18.04.4 LTS',
  'Ubuntu 19.10',
  'Ubuntu 18.04.3 LTS',
  'Ubuntu 19.04',
  'Ubuntu 18.04.2 LTS',
  'Ubuntu 18.10',
  'Ubuntu 18.04.1 LTS (v4.15)',
  'Ubuntu 16.04.5 LTS (v4.15)',
  'Ubuntu 18.04.0 LTS (v4.15)',
  'Ubuntu 16.04.4 LTS (v4.13)',
  'Ubuntu 17.10 (v4.13)',
  'Ubuntu 16.04.1 LTS (v4.4)',
  'Ubuntu 14.04.5 LTS',
  'Ubuntu 16.04.0 LTS (v4.4)',
  'Ubuntu 14.04.1 LTS (v3.13)',
  'Ubuntu 12.04.5 LTS (v3.13)',
  'Ubuntu 14.04.0 LTS (v3.13)',
  'Ubuntu 12.04.1 LTS (v3.2)',
  'Ubuntu 12.04.0 LTS (v3.2)'
];

var openStackReleaseNames = [
  'Ubuntu 20.04 LTS',
  'OpenStack U',
  'OpenStack T',
  'OpenStack Stein',
  'OpenStack Rocky',
  'Ubuntu 18.04 LTS',
  'OpenStack Queens',
  'OpenStack Pike',
  'OpenStack Ocata',
  'OpenStack Newton',
  'Ubuntu 16.04 LTS',
  'OpenStack Mitaka',
  'OpenStack Kilo',
  'OpenStack Icehouse',
  'Ubuntu 14.04 LTS'
];
