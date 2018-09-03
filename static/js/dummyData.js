var dummyData = {
  optIn: {
    title: 'Opt in',
    dataset: [
      {
        label: 'Opt-in',
        value: 130,
      }, {
        label: 'Opt-out',
        value: 70,
      },
    ],
  },
  realOrVirtual: {
    title: 'Real or Virtual Machine?',
    dataset: [
      {
        label: 'Physical',
        value: 90,
      }, {
        label: 'Unknown',
        value: 75,
      }, {
        label: 'VM',
        value: 40,
      },
    ],
  },
  firmware: {
    title: 'Firmware',
    dataset: [
      {
        label: 'BIOS',
        value: 150,
      }, {
        label: 'EFI',
        value: 72,
      },
    ],
  },
  osArchitecture: {
    title: 'OS Architecture',
    dataset: [
      {
        label: 'amd64',
        value: 100000,
      }, {
        label: 'i386',
        value: 10,
      },
    ],
  },
  displayServer: {
    title: 'Display Server',
    dataset: [
      {
        label: 'X11',
        value: 100000,
      }, {
        label: 'Wayland',
        value: 10,
      },
    ],
  },
  numberScreens: {
    title: 'Number of screens',
    dataset: [
      {
        label: 'Have one screen',
        value: 180,
      }, {
        label: 'Have two screens',
        value: 10,
      }, {
        label: 'Have three screens',
        value: 4,
      },
    ],
  },
  numberGPUs: {
    title: 'Number of GPUs',
    dataset: [
      {
        label: 'Have one GPU',
        value: 170,
      }, {
        label: 'Have two GPUs',
        value: 20,
      }, {
        label: 'Have three GPUs',
        value: 6,
      },
    ],
  },
  installOrUpgrade: {
    title: 'Clean install or upgrade?',
    dataset: [
      {
        label: 'Install',
        value: 1000000,
      }, {
        label: 'Upgrade',
        value: 123456,
      },
    ],
  },
  screenSizes: {
    title: 'Popular screen sizes',
    dataset: [
      {
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
      }
    ]
  },
  physicalDisk: {
    title: 'Physical disk (GB)',
    dataset: [
      {
        label: '<30',
        value: 255,
      }, {
        label: '30-99',
        value: 154,
      }, {
        label: '100-249',
        value: 211,
      }, {
        label: '250-499',
        value: 168,
      }, {
        label: '500-999',
        value: 93,
      }, {
        label: '1TB+',
        value: 19,
      },
    ]
  },
  cpus: {
    title: 'Number of CPUs',
    dataset: [
      {
        label: '1-3',
        value: 1876,
      }, {
        label: '4-6',
        value: 282,
      }, {
        label: '8+',
        value: 93,
      },
    ]
  },
  ram: {
    title: 'Size of RAM (GB)',
    dataset: [
      {
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
      },
    ]
  },
  pixelDensity: {
    title: 'Pixel density',
    dataset: [
      {
        label: '120',
        value: 413,
      }, {
        label: '160',
        value: 68,
      }, {
        label: '240+',
        value: 14,
      }, 
    ]
  },
  partitionType: {
    title: 'Partition type',
    dataset: [
      {
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
      }, 
    ]
  },
  partitionSize: {
    title: 'Size of partitions (GB)',
    dataset: [
      {
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
      },
    ]
  },
  partitionNum: {
    title: 'Number of partitions',
    dataset: [
      {
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
      },
    ]
  },
  defaultSettings: {
    datasets: {
      hardware: [
        {
          show: true,
          value: 318,
        }, {
          value: 682,
        },
      ],
      virtual: [
        {
          show: true,
          value: 589,
        }, {
          value: 411,
        },
      ],
    },
  },
  restrictAddOn: {
    datasets: {
      hardware: [
        {
          show: true,
          value: 591,
        }, {
          value: 409,
        },
      ],
      virtual: [
        {
          show: true,
          value: 273,
        }, {
          value: 727,
        },
      ],
    },
  },
  autoLogin: {
    datasets: {
      hardware: [
        {
          show: true,
          value: 294,
        }, {
          value: 706,
        },
      ],
      virtual: [
        {
          show: true,
          value: 287,
        }, {
          value: 713,
        },
      ],
    },
  },
  minimalInstall: {
    datasets: {
      hardware: [
        {
          show: true,
          value: 134,
        }, {
          value: 866,
        },
      ],
      virtual: [
        {
          show: true,
          value: 141,
        }, {
          value: 859,
        },
      ],
    },
  },
  updateAtInstall: {
    datasets: {
      hardware: [
        {
          show: true,
          value: 919,
        }, {
          value: 81,
        },
      ],
      virtual: [
        {
          show: true,
          value: 911,
        }, {
          value: 89,
        },
      ],
    },
  },
  languageList: {
    title: 'What language do they use?',
    dataset: [
      {
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
      },
    ],
  },
};
