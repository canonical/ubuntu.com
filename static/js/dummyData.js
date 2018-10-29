var dummyData = {
  optIn: {
    title: "Opt in",
    dataset: [
      {
        label: "Opt-in",
        value: 65.64
      },
      {
        label: "Opt-out",
        value: 33.36
      }
    ]
  },
  realOrVirtual: {
    title: "Real or Virtual Machine?",
    dataset: [
      {
        label: "Physical",
        value: 43.47
      },
      {
        label: "Unknown",
        value: 35.91
      },
      {
        label: "VM",
        value: 20.6
      }
    ]
  },
  firmware: {
    title: "Firmware",
    datasets: {
      hardware: [
        {
          label: "Physical",
          show: true,
          value: 54.64
        },
        {
          value: 45.36
        }
      ],
      virtual: [
        {
          label: "Virtual",
          show: true,
          value: 92.63
        },
        {
          value: 7.37
        }
      ]
    }
  },
  osArchitecture: {
    title: "OS Architecture",
    dataset: [
      {
        label: "amd64",
        value: 3500000
      },
      {
        label: "i386",
        value: 49500
      },
      {
        label: "arm64",
        value: 1127
      },
      {
        label: "armhf",
        value: 77
      },
      {
        label: "ppc64el",
        value: 10
      }
    ]
  },
  displayServer: {
    title: "Display Server",
    dataset: [
      {
        label: "X11",
        value: 4000000
      },
      {
        label: "Wayland",
        value: 17000
      }
    ]
  },
  numberScreens: {
    title: "Number of screens",
    dataset: [
      {
        label: "One screen",
        value: 3300000
      },
      {
        label: "Two screens",
        value: 228000
      },
      {
        label: "Three screens",
        value: 18000
      },
      {
        label: "Four+ screens",
        value: 1000
      }
    ]
  },
  numberGPUs: {
    title: "Number of GPUs",
    dataset: [
      {
        label: "One GPU",
        value: 2670000
      },
      {
        label: "Two GPUs",
        value: 162500
      },
      {
        label: "Three GPUs",
        value: 5800
      }
    ]
  },
  installOrUpgrade: {
    title: "Clean install or upgrade?",
    dataset: [
      {
        label: "Clean Install",
        value: 80
      },
      {
        label: "Upgrades",
        value: 20
      }
    ]
  },
  screenSizes: {
    title: "Popular screen sizes",
    dataset: [
      {
        label: "800x600",
        value: 415150
      },
      {
        label: "1024x768",
        value: 135510
      },
      {
        label: "1152x768",
        value: 78970
      },
      {
        label: "1152x864",
        value: 42850
      },
      {
        label: "1280x1024",
        value: 127410
      },
      {
        label: "1280x800",
        value: 81670
      },
      {
        label: "1360x768",
        value: 57130
      },
      {
        label: "1366x768",
        value: 912800
      },
      {
        label: "1440x900",
        value: 105780
      },
      {
        label: "1600x900",
        value: 162670
      },
      {
        label: "1680x1050",
        value: 273930
      },
      {
        label: "1920x1080",
        value: 1041230
      },
      {
        label: "1920x1200",
        value: 64800
      },
      {
        label: "2560x1440",
        value: 48800
      },
      {
        label: "3840x2160",
        value: 47360
      }
    ]
  },
  physicalDisk: {
    title: "Physical disk (GB)",
    dataset: [
      {
        label: "0 - 499",
        value: 974065
      },
      {
        label: "500 - 2000",
        value: 161000
      },
      {
        label: ">2000",
        value: 95000
      }
    ]
  },
  cpus: {
    title: "Number of CPUs",
    dataset: [
      {
        label: "1-3",
        value: 2493900
      },
      {
        label: "4-6",
        value: 1096000
      },
      {
        label: "7+",
        value: 346000
      }
    ]
  },
  ram: {
    title: "Size of RAM (GB)",
    dataset: [
      {
        label: "1-4",
        value: 1716700
      },
      {
        label: "5-8",
        value: 1061000
      },
      {
        label: "12-24",
        value: 463000
      },
      {
        label: "32+",
        value: 93541
      }
    ]
  },
  pixelDensity: {
    title: "Pixel density",
    dataset: [
      {
        label: "120",
        value: 110120
      },
      {
        label: "160",
        value: 180690
      },
      {
        label: "240+",
        value: 37024
      }
    ]
  },
  partitionType: {
    title: "Partition type",
    dataset: [
      {
        label: "Erase existing and reinstall",
        value: 826
      },
      {
        label: "Manual",
        value: 2144
      },
      {
        label: "Install alongside",
        value: 869
      },
      {
        label: "Erase device and install",
        value: 5410
      },
      {
        label: "Logical Volume Manager (LVM)",
        value: 350
      },
      {
        label: "Encrypted LVM",
        value: 300
      },
      {
        label: "Upgrade",
        value: 100
      }
    ]
  },
  partitionSize: {
    title: "Size of partitions (GB)",
    dataset: [
      {
        label: "<1",
        value: 1000000
      },
      {
        label: "1-19",
        value: 815000
      },
      {
        label: "20-49",
        value: 596000
      },
      {
        label: "50-99",
        value: 406000
      },
      {
        label: "100-249",
        value: 800000
      },
      {
        label: "250-999",
        value: 518000
      },
      {
        label: "1TB+",
        value: 317000
      }
    ]
  },
  partitionNum: {
    title: "Number of partitions",
    dataset: [
      {
        label: "1",
        value: 1300000
      },
      {
        label: "2",
        value: 849000
      },
      {
        label: "3",
        value: 331000
      },
      {
        label: "4+",
        value: 100600
      }
    ]
  },
  defaultSettings: {
    title: "Default Settings",
    datasets: {
      hardware: [
        {
          label: "Physical",
          show: true,
          value: 3381
        },
        {
          value: 6619
        }
      ],
      virtual: [
        {
          label: "Virtual",
          show: true,
          value: 6145
        },
        {
          value: 3855
        }
      ]
    }
  },
  restrictAddOn: {
    title: "Default Settings",
    datasets: {
      hardware: [
        {
          label: "Physical",
          show: true,
          value: 5685
        },
        {
          value: 4315
        }
      ],
      virtual: [
        {
          label: "Virtual",
          show: true,
          value: 2470
        },
        {
          value: 7530
        }
      ]
    }
  },
  autoLogin: {
    datasets: {
      hardware: [
        {
          label: "Physical",
          show: true,
          value: 2981
        },
        {
          value: 7081
        }
      ],
      virtual: [
        {
          label: "Virtual",
          show: true,
          value: 2947
        },
        {
          value: 7053
        }
      ]
    }
  },
  minimalInstall: {
    title: "Minimal Install",
    datasets: {
      hardware: [
        {
          label: "Physical",
          show: true,
          value: 1274
        },
        {
          value: 8726
        }
      ],
      virtual: [
        {
          label: "Virtual",
          show: true,
          value: 1359
        },
        {
          value: 8641
        }
      ]
    }
  },
  updateAtInstall: {
    title: "Users Who Installed Ubuntu While Upgrading",
    datasets: {
      hardware: [
        {
          label: "Physical",
          show: true,
          value: 9182
        },
        {
          value: 818
        }
      ],
      virtual: [
        {
          label: "Virtual",
          show: true,
          value: 9187
        },
        {
          value: 813
        }
      ]
    }
  },
  languageList: {
    title: "What language do they use?",
    dataset: [
      {
        label: "Chinese",
        value: 88228
      },
      {
        label: "Portuguese",
        value: 101000
      },
      {
        label: "French",
        value: 102110
      },
      {
        label: "Italian",
        value: 42368
      },
      {
        label: "English",
        value: 1141671
      },
      {
        label: "Russian",
        value: 62000
      },
      {
        label: "Spanish",
        value: 150063
      },
      {
        label: "German",
        value: 83292
      },
      {
        label: "Polish",
        value: 24000
      },
      {
        label: "Others",
        value: 110729
      }
    ]
  },
  howLongRunning: {
    datasets: {
      hardware: [
        {
          show: true,
          value: 19455
        },
        {
          value: 18880
        }
      ],
      virtual: [
        {
          show: true,
          value: 19662
        },
        {
          value: 19450
        }
      ]
    }
  },
  configure: {
    datasets: {
      hardware: [
        {
          show: true,
          value: 20433
        },
        {
          value: 18880
        }
      ],
      virtual: [
        {
          show: true,
          value: 34566
        },
        {
          value: 19450
        }
      ]
    }
  },
  whereUsersAre: {
    datasets: {
      legend: {
        colors: [
          "#F7F7F7",
          "#F7C3B1",
          "#F5B29B",
          "#F29879",
          "#ED764D",
          "#E95420"
        ]
      },
      countryStats: [
        {
          id: 232,
          users: 0.00012792371243824,
          total: 100
        },
        {
          id: 548,
          users: 0.000332601652339424,
          total: 100
        },
        {
          id: 624,
          users: 0.000358186394827072,
          total: 100
        },
        {
          id: 748,
          users: 0.000370978766070896,
          total: 100
        },
        {
          id: 226,
          users: 0.000422148251046192,
          total: 100
        },
        {
          id: 140,
          users: 0.00051169484975296,
          total: 100
        },
        {
          id: 90,
          users: 0.000588449077215904,
          total: 100
        },
        {
          id: 728,
          users: 0.000588449077215904,
          total: 100
        },
        {
          id: 108,
          users: 0.000652410933435024,
          total: 100
        },
        {
          id: 262,
          users: 0.000665203304678848,
          total: 100
        },
        {
          id: 732,
          users: 0.000690788047166496,
          total: 100
        },
        {
          id: 238,
          users: 0.000741957532141792,
          total: 100
        },
        {
          id: 694,
          users: 0.000921050729555328,
          total: 100
        },
        {
          id: 426,
          users: 0.00103618207074974,
          total: 100
        },
        {
          id: 408,
          users: 0.00115131341194416,
          total: 100
        },
        {
          id: 270,
          users: 0.00118969052567563,
          total: 100
        },
        {
          id: 430,
          users: 0.00130482186687005,
          total: 100
        },
        {
          id: 178,
          users: 0.00136878372308917,
          total: 100
        },
        {
          id: 626,
          users: 0.00143274557930829,
          total: 100
        },
        {
          id: 887,
          users: 0.00202119465652419,
          total: 100
        },
        {
          id: 324,
          users: 0.00203398702776802,
          total: 100
        },
        {
          id: 762,
          users: 0.00207236414149949,
          total: 100
        },
        {
          id: 260,
          users: 0.00214911836896243,
          total: 100
        },
        {
          id: 706,
          users: 0.00216191074020626,
          total: 100
        },
        {
          id: 478,
          users: 0.00222587259642538,
          total: 100
        },
        {
          id: 562,
          users: 0.00226424971015685,
          total: 100
        },
        {
          id: 266,
          users: 0.00230262682388832,
          total: 100
        },
        {
          id: 598,
          users: 0.00248172002130186,
          total: 100
        },
        {
          id: 454,
          users: 0.00249451239254568,
          total: 100
        },
        {
          id: 148,
          users: 0.0025073047637895,
          total: 100
        },
        {
          id: 72,
          users: 0.00310854621224923,
          total: 100
        },
        {
          id: 328,
          users: 0.003198092810956,
          total: 100
        },
        {
          id: 740,
          users: 0.00327484703841894,
          total: 100
        },
        {
          id: 64,
          users: 0.00332601652339424,
          total: 100
        },
        {
          id: 242,
          users: 0.00332601652339424,
          total: 100
        },
        {
          id: 499,
          users: 0.00333880889463807,
          total: 100
        },
        {
          id: 96,
          users: 0.00350510972080778,
          total: 100
        },
        {
          id: 768,
          users: 0.00358186394827072,
          total: 100
        },
        {
          id: 795,
          users: 0.00370978766070896,
          total: 100
        },
        {
          id: 854,
          users: 0.00373537240319661,
          total: 100
        },
        {
          id: 180,
          users: 0.00392725797185397,
          total: 100
        },
        {
          id: 646,
          users: 0.0041575206542428,
          total: 100
        },
        {
          id: 44,
          users: 0.00424706725294957,
          total: 100
        },
        {
          id: 418,
          users: 0.00432382148041251,
          total: 100
        },
        {
          id: 204,
          users: 0.00498902478509136,
          total: 100
        },
        {
          id: 332,
          users: 0.00534721117991843,
          total: 100
        },
        {
          id: 466,
          users: 0.00567981283225786,
          total: 100
        },
        {
          id: 304,
          users: 0.00583332128718375,
          total: 100
        },
        {
          id: 894,
          users: 0.00661365593305701,
          total: 100
        },
        {
          id: 192,
          users: 0.00749632954888087,
          total: 100
        },
        {
          id: 4,
          users: 0.00752191429136851,
          total: 100
        },
        {
          id: 540,
          users: 0.00956869369038036,
          total: 100
        },
        {
          id: 716,
          users: 0.00988850297147595,
          total: 100
        },
        {
          id: 512,
          users: 0.00993967245645125,
          total: 100
        },
        {
          id: 414,
          users: 0.0106688376173492,
          total: 100
        },
        {
          id: 24,
          users: 0.0108479308147628,
          total: 100
        },
        {
          id: 104,
          users: 0.0108479308147628,
          total: 100
        },
        {
          id: 434,
          users: 0.0117945662868057,
          total: 100
        },
        {
          id: 275,
          users: 0.0119480747417316,
          total: 100
        },
        {
          id: 120,
          users: 0.0120120365979507,
          total: 100
        },
        {
          id: 800,
          users: 0.0122295069090957,
          total: 100
        },
        {
          id: 760,
          users: 0.0124341848489969,
          total: 100
        },
        {
          id: 450,
          users: 0.0131761423811387,
          total: 100
        },
        {
          id: 231,
          users: 0.0132145194948702,
          total: 100
        },
        {
          id: 516,
          users: 0.013739006715867,
          total: 100
        },
        {
          id: 729,
          users: 0.0147112269303976,
          total: 100
        },
        {
          id: 834,
          users: 0.0155043539475147,
          total: 100
        },
        {
          id: 686,
          users: 0.0158753327135856,
          total: 100
        },
        {
          id: 508,
          users: 0.0171161927242365,
          total: 100
        },
        {
          id: 807,
          users: 0.0172313240654309,
          total: 100
        },
        {
          id: 388,
          users: 0.0183698451061313,
          total: 100
        },
        {
          id: 780,
          users: 0.0185489383035448,
          total: 100
        },
        {
          id: 634,
          users: 0.0236914715435621,
          total: 100
        },
        {
          id: 860,
          users: 0.0243055053632656,
          total: 100
        },
        {
          id: 417,
          users: 0.024714861243068,
          total: 100
        },
        {
          id: 558,
          users: 0.0273245049768081,
          total: 100
        },
        {
          id: 70,
          users: 0.0283606870475578,
          total: 100
        },
        {
          id: 368,
          users: 0.0309063689250788,
          total: 100
        },
        {
          id: 422,
          users: 0.0311366316074676,
          total: 100
        },
        {
          id: 288,
          users: 0.0341300464785224,
          total: 100
        },
        {
          id: 31,
          users: 0.0354348683453925,
          total: 100
        },
        {
          id: 196,
          users: 0.0363047495899725,
          total: 100
        },
        {
          id: 352,
          users: 0.0379165883666943,
          total: 100
        },
        {
          id: 8,
          users: 0.0384026984739597,
          total: 100
        },
        {
          id: 116,
          users: 0.0456303882267202,
          total: 100
        },
        {
          id: 340,
          users: 0.0500949257908148,
          total: 100
        },
        {
          id: 496,
          users: 0.0501716800182777,
          total: 100
        },
        {
          id: 268,
          users: 0.050299603730716,
          total: 100
        },
        {
          id: 630,
          users: 0.0513741629151972,
          total: 100
        },
        {
          id: 400,
          users: 0.0517323493100243,
          total: 100
        },
        {
          id: 442,
          users: 0.053497696541672,
          total: 100
        },
        {
          id: 591,
          users: 0.0547257641810791,
          total: 100
        },
        {
          id: 566,
          users: 0.058000611219498,
          total: 100
        },
        {
          id: 498,
          users: 0.0633478223994165,
          total: 100
        },
        {
          id: 600,
          users: 0.0668017626352489,
          total: 100
        },
        {
          id: 51,
          users: 0.0672622880000266,
          total: 100
        },
        {
          id: 705,
          users: 0.0693986139977452,
          total: 100
        },
        {
          id: 191,
          users: 0.0763832486968731,
          total: 100
        },
        {
          id: 68,
          users: 0.0782637272697153,
          total: 100
        },
        {
          id: 84,
          users: 0.0785195746945917,
          total: 100
        },
        {
          id: 222,
          users: 0.082203777612813,
          total: 100
        },
        {
          id: 703,
          users: 0.0981814492963492,
          total: 100
        },
        {
          id: 428,
          users: 0.0984500890924695,
          total: 100
        },
        {
          id: 784,
          users: 0.0990129534271978,
          total: 100
        },
        {
          id: 788,
          users: 0.0994223093070002,
          total: 100
        },
        {
          id: 12,
          users: 0.100113097354167,
          total: 100
        },
        {
          id: 214,
          users: 0.102441308920543,
          total: 100
        },
        {
          id: 384,
          users: 0.104999783169307,
          total: 100
        },
        {
          id: 233,
          users: 0.125339653446988,
          total: 100
        },
        {
          id: 320,
          users: 0.127386432845999,
          total: 100
        },
        {
          id: 398,
          users: 0.128281898833067,
          total: 100
        },
        {
          id: 858,
          users: 0.134729253939954,
          total: 100
        },
        {
          id: 524,
          users: 0.141867397094008,
          total: 100
        },
        {
          id: 504,
          users: 0.142711693596101,
          total: 100
        },
        {
          id: 404,
          users: 0.145781862694618,
          total: 100
        },
        {
          id: 440,
          users: 0.153252607501012,
          total: 100
        },
        {
          id: 144,
          users: 0.154275997200518,
          total: 100
        },
        {
          id: 682,
          users: 0.170931664559976,
          total: 100
        },
        {
          id: 862,
          users: 0.18067945144777,
          total: 100
        },
        {
          id: 188,
          users: 0.197488627262155,
          total: 100
        },
        {
          id: 586,
          users: 0.236633283268256,
          total: 100
        },
        {
          id: 100,
          users: 0.252930764232888,
          total: 100
        },
        {
          id: 688,
          users: 0.254056492902345,
          total: 100
        },
        {
          id: 458,
          users: 0.257433678910714,
          total: 100
        },
        {
          id: 372,
          users: 0.264392728867355,
          total: 100
        },
        {
          id: 218,
          users: 0.265390533824373,
          total: 100
        },
        {
          id: 818,
          users: 0.278873693115363,
          total: 100
        },
        {
          id: 112,
          users: 0.29468506397273,
          total: 100
        },
        {
          id: 554,
          users: 0.303358291676042,
          total: 100
        },
        {
          id: 50,
          users: 0.309984739980343,
          total: 100
        },
        {
          id: 604,
          users: 0.320935009765057,
          total: 100
        },
        {
          id: 608,
          users: 0.39193267016828,
          total: 100
        },
        {
          id: 364,
          users: 0.39236761079057,
          total: 100
        },
        {
          id: 578,
          users: 0.394695822356946,
          total: 100
        },
        {
          id: 208,
          users: 0.396947279695859,
          total: 100
        },
        {
          id: 376,
          users: 0.401680457056074,
          total: 100
        },
        {
          id: 710,
          users: 0.405364659974295,
          total: 100
        },
        {
          id: 764,
          users: 0.441797333276706,
          total: 100
        },
        {
          id: 300,
          users: 0.473164227566562,
          total: 100
        },
        {
          id: 246,
          users: 0.549918455029506,
          total: 100
        },
        {
          id: 40,
          users: 0.550609243076673,
          total: 100
        },
        {
          id: 203,
          users: 0.556365810136394,
          total: 100
        },
        {
          id: 152,
          users: 0.576245155049296,
          total: 100
        },
        {
          id: 620,
          users: 0.611628853909713,
          total: 100
        },
        {
          id: 642,
          users: 0.613266277428923,
          total: 100
        },
        {
          id: 158,
          users: 0.658602441117035,
          total: 100
        },
        {
          id: 348,
          users: 0.661135330623312,
          total: 100
        },
        {
          id: 756,
          users: 0.670883117511106,
          total: 100
        },
        {
          id: 56,
          users: 0.674413811974401,
          total: 100
        },
        {
          id: 752,
          users: 0.700228817144438,
          total: 100
        },
        {
          id: 792,
          users: 0.717472933581113,
          total: 100
        },
        {
          id: 704,
          users: 0.77831345121674,
          total: 100
        },
        {
          id: 32,
          users: 0.902655299706709,
          total: 100
        },
        {
          id: 170,
          users: 0.911123849470121,
          total: 100
        },
        {
          id: 360,
          users: 0.983375162255239,
          total: 100
        },
        {
          id: 528,
          users: 1.12478203398447,
          total: 100
        },
        {
          id: 410,
          users: 1.14125860814651,
          total: 100
        },
        {
          id: 36,
          users: 1.19744270264939,
          total: 100
        },
        {
          id: 804,
          users: 1.28207703079853,
          total: 100
        },
        {
          id: 392,
          users: 1.87484992949485,
          total: 100
        },
        {
          id: 616,
          users: 1.89808087567363,
          total: 100
        },
        {
          id: 484,
          users: 1.91025921309775,
          total: 100
        },
        {
          id: 124,
          users: 2.03600822242454,
          total: 100
        },
        {
          id: 380,
          users: 2.79659144709734,
          total: 100
        },
        {
          id: 826,
          users: 2.93871469161623,
          total: 100
        },
        {
          id: 643,
          users: 3.59414462466479,
          total: 100
        },
        {
          id: 724,
          users: 3.88251025724307,
          total: 100
        },
        {
          id: 250,
          users: 4.73901068150207,
          total: 100
        },
        {
          id: 276,
          users: 5.74236752764016,
          total: 100
        },
        {
          id: 156,
          users: 5.96697598193922,
          total: 100
        },
        {
          id: 356,
          users: 6.26588252842241,
          total: 100
        },
        {
          id: 76,
          users: 6.82649540581175,
          total: 100
        },
        {
          id: 840,
          users: 22.3479143765657,
          total: 100
        }
      ]
    }
  }
};
