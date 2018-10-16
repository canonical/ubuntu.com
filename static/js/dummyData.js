var dummyData = {
  optIn: {
    title: 'Opt in',
    dataset: [{
      label: 'Opt-in',
      value: 131.26,
    }, {
      label: 'Opt-out',
      value: 68.74,
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
        value: 150,
      }, {
        value: 72,
      },],
      virtual: [{
        label: 'Virtual',
        show: true,
        value: 100
      }, {
        value: 30
      }]
    }
  },
  osArchitecture: {
    title: 'OS Architecture',
    dataset: [{
      label: 'amd64',
      value: 10,
    }, {
      label: 'i386',
      value: 10,
    },],
  },
  displayServer: {
    title: 'Display Server',
    dataset: [{
      label: 'X11',
      value: 100,
    }, {
      label: 'Wayland',
      value: 10,
    },],
  },
  numberScreens: {
    title: 'Number of screens',
    dataset: [{
      label: 'One screen',
      value: 180,
    }, {
      label: 'Two screens',
      value: 10,
    }, {
      label: 'Three screens',
      value: 4,
    },],
  },
  numberGPUs: {
    title: 'Number of GPUs',
    dataset: [{
      label: 'One GPU',
      value: 170,
    }, {
      label: 'Two GPUs',
      value: 20,
    }, {
      label: 'Three GPUs',
      value: 6,
    },],
  },
  installOrUpgrade: {
    title: 'Clean install or upgrade?',
    dataset: [{
      label: 'Install',
      value: 1000000,
    }, {
      label: 'Upgrade',
      value: 123456,
    },],
  },
  screenSizes: {
    title: 'Popular screen sizes',
    dataset: [{
      label: '800x600',
      value: 256,
    }, {
      label: '1024x768',
      value: 86,
    }, {
      label: '1152x768',
      value: 46,
    }, {
      label: '1152x864',
      value: 25,
    }, {
      label: '1280x1024',
      value: 80,
    }, {
      label: '1280x800',
      value: 50,
    }, {
      label: '1360x768',
      value: 36,
    }, {
      label: '1366x768',
      value: 582,
    }, {
      label: '1440x900',
      value: 65,
    }, {
      label: '1600x900',
      value: 103,
    }, {
      label: '1680x1050',
      value: 169,
    }, {
      label: '1920x1080',
      value: 672,
    }, {
      label: '1920x1200',
      value: 42,
    }, {
      label: '2560x1440',
      value: 33,
    }, {
      label: '3840x2160',
      value: 32,
    }]
  },
  physicalDisk: {
    title: 'Physical disk (GB)',
    dataset: [{
      label: '1-3',
      value: 1876,
    }, {
      label: '4-6',
      value: 282,
    }, {
      label: '8+',
      value: 93,
    },]
  },
  cpus: {
    title: 'Number of CPUs',
    dataset: [{
      label: '1-3',
      value: 1876,
    }, {
      label: '4-6',
      value: 282,
    }, {
      label: '8+',
      value: 93,
    },]
  },
  ram: {
    title: 'Size of RAM (GB)',
    dataset: [{
      label: '1-4',
      value: 1199,
    }, {
      label: '5-8',
      value: 681,
    }, {
      label: '12-24',
      value: 305,
    }, {
      label: '32+',
      value: 61,
    },]
  },
  pixelDensity: {
    title: 'Pixel density',
    dataset: [{
      label: '120',
      value: 413,
    }, {
      label: '160',
      value: 68,
    }, {
      label: '240+',
      value: 14,
    },]
  },
  partitionType: {
    title: 'Partition type',
    dataset: [{
      label: 'Erase existing and reinstall',
      value: 40,
    }, {
      label: 'Manual',
      value: 30,
    }, {
      label: 'Install alongside',
      value: 17,
    }, {
      label: 'Erase device and install',
      value: 16,
    }, {
      label: 'Logical Volume Manager (LVM)',
      value: 8,
    }, {
      label: 'Encrypted LVM',
      value: 6,
    }, {
      label: 'Upgrade',
      value: 3,
    },]
  },
  partitionSize: {
    title: 'Size of partitions (GB)',
    dataset: [{
      label: '<1',
      value: 35,
    }, {
      label: '1-19',
      value: 17,
    }, {
      label: '20-49',
      value: 14,
    }, {
      label: '50-99',
      value: 13,
    }, {
      label: '100-249',
      value: 25,
    }, {
      label: '250-999',
      value: 20,
    }, {
      label: '1TB+',
      value: 15,
    },]
  },
  partitionNum: {
    title: 'Number of partitions',
    dataset: [{
      label: '1',
      value: 36,
    }, {
      label: '2',
      value: 40,
    }, {
      label: '3',
      value: 18,
    }, {
      label: '4+',
      value: 5,
    },]
  },
  defaultSettings: {
    title: 'Default Settings',
    datasets: {
      hardware: [{
        label: 'Physical',
        show: true,
        value: 318,
      }, {
        value: 682,
      },],
      virtual: [{
        label: 'Virtual',
        show: true,
        value: 589,
      }, {
        value: 411,
      },],
    },
  },
  restrictAddOn: {
    title: 'Default Settings',
    datasets: {
      hardware: [{
        label: 'Physical',
        show: true,
        value: 591,
      }, {
        value: 409,
      },],
      virtual: [{
        label: 'Virtual',
        show: true,
        value: 273,
      }, {
        value: 727,
      },],
    },
  },
  autoLogin: {
    datasets: {
      hardware: [{
        label: 'Physical',
        show: true,
        value: 294,
      }, {
        value: 706,
      },],
      virtual: [{
        label: 'Virtual',
        show: true,
        value: 287,
      }, {
        value: 713,
      },],
    },
  },
  minimalInstall: {
    title: 'Minimal Install',
    datasets: {
      hardware: [{
        label: 'Physical',
        show: true,
        value: 134,
      }, {
        value: 866,
      },],
      virtual: [{
        label: 'Virtual',
        show: true,
        value: 141,
      }, {
        value: 859,
      },],
    },
  },
  updateAtInstall: {
    title: 'Users Who Installed Ubuntu While Upgrading',
    datasets: {
      hardware: [{
        label: 'Physical',
        show: true,
        value: 919,
      }, {
        value: 81,
      },],
      virtual: [{
        label: 'Virtual',
        show: true,
        value: 911,
      }, {
        value: 89,
      },],
    },
  },
  languageList: {
    title: 'What language do they use?',
    dataset: [{
      label: 'Chinese (Simplified)',
      value: 700,
    }, {
      label: 'Portuguese (Brazil)',
      value: 800,
    }, {
      label: 'Turkish',
      value: 60,
    }, {
      label: 'French',
      value: 400,
    }, {
      label: 'Italian',
      value: 300,
    }, {
      label: 'English',
      value: 1000,
    }, {
      label: 'Russian',
      value: 500,
    }, {
      label: 'Dutch',
      value: 70,
    }, {
      label: 'Spanish',
      value: 900,
    }, {
      label: 'Hungarian',
      value: 80,
    }, {
      label: 'German',
      value: 600,
    }, {
      label: 'Korean',
      value: 90,
    }, {
      label: 'Polish',
      value: 100,
    }, {
      label: 'Japanese',
      value: 200,
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
