# smartnav gyp project

{
	'target_defaults': {
		'win_delay_load_hook': 'false',
		'msvs_settings': {
			# This magical incantation is necessary because VC++ will compile
			# object files to same directory... even if they have the same name!
			'VCCLCompilerTool': {
			  'ObjectFile': '$(IntDir)/%(RelativeDir)/',
			  #'AdditionalOptions': [ '/EHsc', '/wd4244']
			  'WarningLevel': 0,
			  'WholeProgramOptimization': 'false',
			  'AdditionalOptions': ['/EHsc'],
			  'ExceptionHandling' : 1, #/EHsc
			},
			
		},
		'configurations':{
			'Debug':{
				'conditions': [
				  #['target_arch=="x64"', {
					#'msvs_configuration_platform': 'x64',
				  #}],
				  ['1==1',{

					'defines':[
						'DEBUG',
					],
					'msvs_settings': {		
						'VCCLCompilerTool': {
						  #'WholeProgramOptimization' : 'false',
						  #'AdditionalOptions': ['/GL-','/w'], #['/wd4244' ,'/wd4018','/wd4133' ,'/wd4090'] #GL- was added because the forced optimization coming from node-gyp is disturbing the weird coding style from ffmpeg.
						  'WarningLevel': 0,
						  'WholeProgramOptimization': 'false',
						  'AdditionalOptions': ['/EHsc'],
						  'ExceptionHandling' : 1, #/EHsc
						  'RuntimeLibrary': 3, # dll debug
						},
						'VCLinkerTool' : {
							'GenerateDebugInformation' : 'true',
							'conditions':[
								#['target_arch=="x64"', {
								#	'TargetMachine' : 17 # /MACHINE:X64
								#}],
							],
							
						}
					}
				
				  }],
				],
				
			},
			'Release':{
				'conditions': [
				  #['target_arch=="x64"', {
					#'msvs_configuration_platform': 'x64',
				  #}],
				],
				'msvs_settings': {			
					'VCCLCompilerTool': {
						'WholeProgramOptimization' : 'false',
						#'AdditionalOptions': ['/GL-','/w'], #['/wd4244' ,'/wd4018','/wd4133' ,'/wd4090'] #GL- was added because the forced optimization coming from node-gyp is disturbing the weird coding style from ffmpeg.
						'WarningLevel': 0,
						  'WholeProgramOptimization': 'false',
						  'AdditionalOptions': ['/EHsc'],
						  'ExceptionHandling' : 1, #/EHsc
						  'RuntimeLibrary': 2, # dll release
					},
					'VCLinkerTool' : {
						'conditions':[
							#['target_arch=="x64"', {
							#	'TargetMachine' : 17 # /MACHINE:X64
							#}],
						],
						
					}
				}
			},
		},
		
		'conditions': [
			['OS == "win"',{
				'defines':[
					'DELAYIMP_INSECURE_WRITABLE_HOOKS',
					"WIN32"
				]
			}],
		  ['OS != "win"', {
			'defines': [
			  '_LARGEFILE_SOURCE',
			  '_FILE_OFFSET_BITS=64',
			  
			],
			'cflags':[
				'-fPIC',
				'-std=c++11',
				'-fexceptions',
			],
			'cflags!': [ '-fno-exceptions' ],
			'cflags_cc!': [ '-fno-exceptions' ],
			'conditions': [
				['OS=="mac"', {
				  'xcode_settings': {
					'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
				  }
				}]
			],
			'conditions': [
			  ['OS=="solaris"', {
				'cflags': [ '-pthreads' ],
			  }],
			  ['OS not in "solaris android"', {
				'cflags': [ '-pthread' ],
			  }],
			],
		}],
		['OS=="android"',{
			'defines':[
				'ANDROID'
			],
		  }],
		],
	  },
	'targets':
	[
		{
			'target_name': 'rtklib',
			'type':'static_library',
			'include_dirs':[
				'src',
			],
			'direct_dependent_settings': {
				'include_dirs': [
					'src'
				],
				'defines':[
					"ENAGLO",
					"ENAGAL",
					"ENAQZS",
					"ENACMP",
					"ENAIRN",
					"ENALEO",
					"TRACE",
				 ],
				 'conditions': [
					['OS == "win"',{
						 'libraries':[
							"Ws2_32.lib",
							"Winmm.lib"
						 ],
					}]
				]
			 },
			 'defines':[
				"ENAGLO",
				"ENAGAL",
				"ENAQZS",
				"ENACMP",
				"ENAIRN",
				"ENALEO",
				"TRACE",
			 ],

			'sources':[
				'src/convgpx.c',
				'src/convkml.c',
				'src/convrnx.c',
				'src/datum.c',
				'src/download.c',
				'src/ephemeris.c',
				'src/geoid.c',
				'src/gis.c',
				'src/ionex.c',
				'src/lambda.c',
				'src/options.c',
				'src/pntpos.c',
				'src/postpos.c',
				'src/ppp.c',
				'src/ppp_ar.c',
				'src/ppp_corr.c',
				'src/preceph.c',
				'src/qzslex.c',
				'src/rcvraw.c',
				'src/rinex.c',
				'src/rtcm.c',
				'src/rtcm2.c',
				'src/rtcm3.c',
				'src/rtcm3e.c',
				'src/rtkcmn.c',
				'src/rtklib.h',
				'src/rtkpos.c',
				'src/rtksvr.c',
				'src/sbas.c',
				'src/solution.c',
				'src/src.pro',
				'src/stream.c',
				'src/streamsvr.c',
				'src/tides.c',
				'src/tle.c',
				'src/rcv/binex.c',
				'src/rcv/cmr.c',
				'src/rcv/crescent.c',
				'src/rcv/gw10.c',
				'src/rcv/javad.c',
				'src/rcv/novatel.c',
				'src/rcv/nvs.c',
				'src/rcv/rcvlex.c',
				'src/rcv/rt17.c',
				'src/rcv/septentrio.c',
				'src/rcv/skytraq.c',
				'src/rcv/ss2.c',
				'src/rcv/ublox.c'
			],
		},
		
		{
			'target_name': 'rtkrcv',
			'type':'executable',
			'dependencies':[
				'rtklib'
			],
			'include_dirs':[
				'app/rtkrcv'
			],
			'sources':[
				'app/rtkrcv/rtkrcv.c',
				'app/rtkrcv/vt.c',
				'app/rtkrcv/vt.h'
			]
		},
		{
			'target_name': 'str2str',
			'type':'executable',
			'dependencies':[
				'rtklib'
			],
			'include_dirs':[
				'app/str2str'
			],
			'sources':[
				'app/str2str/str2str.c'
			]
		},
	]
}