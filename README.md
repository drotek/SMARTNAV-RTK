# SMARTNAV-RTK
Drotek SMARTNAV RTK - Hardware and Software

Modified version to work on SBC by Dror Gluska

Original Project by Drotek is at https://github.com/drotek/SMARTNAV-RTK

Please support the original Drotek Smartnav products at https://drotek.com

Have a look at our wiki for all the instructions! https://drotek.com/en/docs/



# Installation

## Building str2str and rtkrcv
- install gyp from https://github.com/bnoordhuis/gyp
- export GYP_PATH="$HOME/Projects/gyp/gyp" or set GYP_PATH="$HOME/Projects/gyp/gyp"
- cd Software/rtklib-smartnav
- execute bash build_linux.sh or build_windows.bat, for the moment it builds debug versions
- copy the binaries (str2str and rtkrcv) from ./build.linux/out/Debug/ to ../binary/

## running RTKLIB-Server and RTKLIB-WebConsole
- install pm2: npm install pm2 -g
- cd Software/webconsole/RTKLIB-Server
- npm install
- cd Software/webconsole/RTKLIB-WebConsole
- npm install
- pm2 start pm2production.yaml

It should start 4 services, str2str monitoring, rtkrcv monitoring, a server and the webserver.

If you wish to see the logs:
pm2 logs


# Configuration
config.js


# Deployment


# Todo:
- add simple vector map to show the general place or google maps
- document all settings, either from documentation or from https://rtklibexplorer.wordpress.com/2016/09/22/rtklib-customizing-the-input-configuration-file/
# References
- RTKLib Documentation - http://www.rtklib.com/prog/manual_2.4.2.pdf
- optional fun https://github.com/taroz/GNSS-Radar

# APIs
- http://localhost:3000/positions - Get Last Position
- http://localhost:3002/lastPosition - Get Last Position
- http://localhost:3002/getSatellite - Get Satellites
- http://localhost:3002/getObserv - Get Observations
- http://localhost:3002/getNavidata - Get Navigation Data
- http://localhost:3002/getStream - Get Streams/Statistics
- http://localhost:3001/listCommands - List Available Startup Commands

And plenty more to control and monitor rtkrcv and str2str