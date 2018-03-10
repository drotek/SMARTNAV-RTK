#U-Blox UART baudrate
!UBX CFG-PRT 1 0 0 2240 38400 3 3 0 0

#U-Blox rate in ms
!UBX CFG-RATE 1000 1 1

#NAV5 stationary
!UBX CFG-NAV5 1 2 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0

# turn on UBX RXM-RAWX messages on USB and UART1
!UBX CFG-MSG 2 21 0 1 0 1 0 0
# turn on UBX RXM-SFRBX messages on USB and UART1
!UBX CFG-MSG 2 19 0 1 0 1 0 0


# turn on UBX NAV-POSLLH on UART1 and USB
!UBX CFG-MSG 1 2 0 1 0 1 0 0


# turn off extra messages default messages
# NMEA GGA
!UBX CFG-MSG 240 0 0 0 0 0 0 0
# NMEA GLL
!UBX CFG-MSG 240 1 0 0 0 0 0 0
# NMEA GSA
!UBX CFG-MSG 240 2 0 0 0 0 0 0
# NMEA GSV
!UBX CFG-MSG 240 3 0 0 0 0 0 0
# NMEA RMC
!UBX CFG-MSG 240 4 0 0 0 0 0 0
# NMEA VTG
!UBX CFG-MSG 240 5 0 0 0 0 0 0
# NMEA ZDA
!UBX CFG-MSG 240 8 0 0 0 0 0 0





