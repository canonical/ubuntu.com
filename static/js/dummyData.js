var dummyData = {
  optIn: {
    title: 'Opt in',
    dataset: [{
      label: 'Opt-in',
      value: 65.64,
    }, {
      label: 'Opt-out',
      value: 33.36,
    },],
  },
  realOrVirtual: {
    title: 'Real or Virtual Machine?',
    dataset: [{
      label: 'Physical',
      value: 43.47,
    }, {
      label: 'Unknown',
      value: 35.91,
    }, {
      label: 'VM',
      value: 20.6,
    }]
  },
  firmware: {
    title: 'Firmware',
    datasets: {
      hardware: [{
        label: 'Physical',
        show: true,
        value: 54.64
      }, {
        value: 45.36,
      },],
      virtual: [{
        label: 'Virtual',
        show: true,
        value: 92.63,
      }, {
        value: 7.37
      }]
    }
  },
  osArchitecture: {
    title: 'OS Architecture',
    dataset: [{
      label: 'amd64',
      value: 3500000,
    }, {
      label: 'i386',
      value: 49500,
    },{
      label: 'arm64',
      value: 1127,
    },{
      label: 'armhf',
      value: 77,
    },{
      label: 'ppc64el',
      value: 10,
    }],
  },
  displayServer: {
    title: 'Display Server',
    dataset: [{
      label: 'X11',
      value: 4000000,
    }, {
      label: 'Wayland',
      value: 17000,
    },],
  },
  numberScreens: {
    title: 'Number of screens',
    dataset: [{
      label: 'One screen',
      value: 3300000,
    }, {
      label: 'Two screens',
      value: 228000,
    }, {
      label: 'Three screens',
      value: 18000,
    }, {
      label: 'Four+ screens',
      value: 1000,
    }],
  },
  numberGPUs: {
    title: 'Number of GPUs',
    dataset: [{
      label: 'One GPU',
      value: 2670000,
    }, {
      label: 'Two GPUs',
      value: 162500,
    }, {
      label: 'Three GPUs',
      value: 5800,
    }],
  },
  installOrUpgrade: {
    title: 'Clean install or upgrade?',
    dataset: [{
      label: 'Clean Install',
      value: 80,
    }, {
      label: 'Upgrades',
      value: 20,
    },],
  },
  screenSizes: {
    title: 'Popular screen sizes',
    dataset: [{
      label: '800x600',
      value: 415150,
    }, {
      label: '1024x768',
      value: 135510,
    }, {
      label: '1152x768',
      value: 78970,
    }, {
      label: '1152x864',
      value: 42850,
    }, {
      label: '1280x1024',
      value: 127410,
    }, {
      label: '1280x800',
      value: 81670,
    }, {
      label: '1360x768',
      value: 57130,
    }, {
      label: '1366x768',
      value: 912800,
    }, {
      label: '1440x900',
      value: 105780,
    }, {
      label: '1600x900',
      value: 162670,
    }, {
      label: '1680x1050',
      value: 273930,
    }, {
      label: '1920x1080',
      value: 1041230,
    }, {
      label: '1920x1200',
      value: 64800,
    }, {
      label: '2560x1440',
      value: 48800,
    }, {
      label: '3840x2160',
      value: 47360,
    }]
  },
  physicalDisk: {
    title: 'Physical disk (GB)',
    dataset: [{
      label: '0 - 499',
      value: 974065,
    }, {
      label: '500 - 2000',
      value: 161000,
    }, {
      label: '>2000',
      value: 95000,
    },]
  },
  cpus: {
    title: 'Number of CPUs',
    dataset: [{
      label: '1-3',
      value: 2493900,
    }, {
      label: '4-6',
      value: 1096000,
    }, {
      label: '7+',
      value: 346000,
    },]
  },
  ram: {
    title: 'Size of RAM (GB)',
    dataset: [{
      label: '1-4',
      value: 1716700,
    }, {
      label: '5-8',
      value: 1061000,
    }, {
      label: '12-24',
      value: 463000,
    }, {
      label: '32+',
      value: 93541,
    },]
  },
  pixelDensity: {
    title: 'Pixel density',
    dataset: [{
      label: '120',
      value: 110120,
    }, {
      label: '160',
      value: 180690,
    }, {
      label: '240+',
      value: 37024,
    },]
  },
  partitionType: {
    title: 'Partition type',
    dataset: [{
      label: 'Erase existing and reinstall',
      value: 826,
    }, {
      label: 'Manual',
      value: 2144,
    }, {
      label: 'Install alongside',
      value: 869,
    }, {
      label: 'Erase device and install',
      value: 5410,
    }, {
      label: 'Logical Volume Manager (LVM)',
      value: 350,
    }, {
      label: 'Encrypted LVM',
      value: 300,
    }, {
      label: 'Upgrade',
      value: 100,
    },]
  },
  partitionSize: {
    title: 'Size of partitions (GB)',
    dataset: [{
      label: '<1',
      value: 1000000,
    }, {
      label: '1-19',
      value: 815000,
    }, {
      label: '20-49',
      value: 596000,
    }, {
      label: '50-99',
      value: 406000,
    }, {
      label: '100-249',
      value: 800000,
    }, {
      label: '250-999',
      value: 518000,
    }, {
      label: '1TB+',
      value: 317000,
    },]
  },
  partitionNum: {
    title: 'Number of partitions',
    dataset: [{
      label: '1',
      value: 1300000,
    }, {
      label: '2',
      value: 849000,
    }, {
      label: '3',
      value: 331000,
    }, {
      label: '4+',
      value: 100600,
    },]
  },
  defaultSettings: {
    title: 'Default Settings',
    datasets: {
      hardware: [{
        label: 'Physical',
        show: true,
        value: 3381,
      }, {
        value: 6619,
      },],
      virtual: [{
        label: 'Virtual',
        show: true,
        value: 6145,
      }, {
        value: 3855,
      },],
    },
  },
  restrictAddOn: {
    title: 'Default Settings',
    datasets: {
      hardware: [{
        label: 'Physical',
        show: true,
        value: 5685,
      }, {
        value: 4315,
      },],
      virtual: [{
        label: 'Virtual',
        show: true,
        value: 2470,
      }, {
        value: 7530,
      },],
    },
  },
  autoLogin: {
    datasets: {
      hardware: [{
        label: 'Physical',
        show: true,
        value: 2981,
      }, {
        value: 7081,
      },],
      virtual: [{
        label: 'Virtual',
        show: true,
        value: 2947,
      }, {
        value: 7053,
      },],
    },
  },
  minimalInstall: {
    title: 'Minimal Install',
    datasets: {
      hardware: [{
        label: 'Physical',
        show: true,
        value: 1274,
      }, {
        value: 8726,
      },],
      virtual: [{
        label: 'Virtual',
        show: true,
        value: 1359,
      }, {
        value: 8641,
      },],
    },
  },
  updateAtInstall: {
    title: 'Users Who Installed Ubuntu While Upgrading',
    datasets: {
      hardware: [{
        label: 'Physical',
        show: true,
        value: 9182,
      }, {
        value: 818,
      },],
      virtual: [{
        label: 'Virtual',
        show: true,
        value: 9187,
      }, {
        value: 813,
      },],
    },
  },
  languageList: {
    title: 'What language do they use?',
    dataset: [{
      label: 'Chinese',
      value: 88228,
    }, {
      label: 'Portuguese',
      value: 101000,
    }, {
      label: 'French',
      value: 102110,
    }, {
      label: 'Italian',
      value: 42368,
    }, {
      label: 'English',
      value: 1141671,
    }, {
      label: 'Russian',
      value: 62000,
    }, {
      label: 'Spanish',
      value: 150063,
    }, {
      label: 'German',
      value: 83292,
    }, {
      label: 'Polish',
      value: 24000,
    }, {
      label: 'Others',
      value: 110729,
    },],
  },
  howLongRunning: {
    datasets: {
      hardware: [{
        show: true,
        value: 19455,
      }, {
        value: 18880,
      },],
      virtual: [{
        show: true,
        value: 19662,
      }, {
        value: 19450,
      },],
    },
  },
  configure: {
    datasets: {
      hardware: [{
        show: true,
        value: 20433,
      }, {
        value: 18880,
      },],
      virtual: [{
        show: true,
        value: 34566,
      }, {
        value: 19450,
      },],
    },
  },
  whereUsersAre: {
    datasets: {
      legend: {
        colors: [
          '#FFFFFF',
          '#F7C3B1',
          '#F5B29B',
          '#F29879',
          '#ED764D',
          '#E95420'
        ]
      },
      countryStats: [{
        id: 4,
        users: 1000,
        total: 1000
      },
      {
        id: 8,
        users: 1000,
        total: 4000
      },
      {
        id: 24,
        users: 100,
        total: 100
      },
      {
        id: 32,
        users: 1000,
        total: 5000
      },
      {
        id: 36,
        users: 2000,
        total: 5000
      },
      {
        id: 56,
        users: 3000,
        total: 5000
      },
      {
        id: 76,
        users: 4000,
        total: 5000
      },
      {
        id: 170,
        users: 5000,
        total: 25000
      },
      {
        id: 188,
        users: 1000,
        total: 66790
      },
      {
        id: 208,
        users: 4456,
        total: 4700
      },
      {
        id: 818,
        users: 3555,
        total: 4000
      },
      {
        id: 276,
        users: 679304,
        total: 4567812
      },
      {
        id: 352,
        users: 3545,
        total: 883093
      },
      {
        id: 392,
        users: 3456,
        total: 23734
      },
      {
        id: 410,
        users: 674848,
        total: 1534690
      },
      {
        id: 484,
        users: 67890,
        total: 15260
      },
      {
        id: 504,
        users: 3456,
        total: 2300
      },
      {
        id: 566,
        users: 34567,
        total: 230000
      },
      {
        id: 591,
        users: 345,
        total: 2300
      },
      {
        id: 604,
        users: 67,
        total: 2300
      },
      {
        id: 616,
        users: 56789,
        total: 456000
      },
      {
        id: 620,
        users: 5543,
        total: 40000
      },
      {
        id: 643,
        users: 7659,
        total: 2300
      },
      {
        id: 710,
        users: 67,
        total: 5000
      },
      {
        id: 716,
        users: 67,
        total: 400
      },
      {
        id: 724,
        users: 67,
        total: 456
      },
      {
        id: 752,
        users: 678,
        total: 2300
      },
      {
        id: 784,
        users: 56748456,
        total: 5000
      },
      {
        id: 788,
        users: 78,
        total: 5000
      },
      {
        id: 858,
        users: 879,
        total: 5000
      },
      {
        id: 894,
        users: 879,
        total: 3490
      }
      ]
    }
  }
};
