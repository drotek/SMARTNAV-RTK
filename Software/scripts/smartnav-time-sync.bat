@echo starting windows time service
@net start w32time 

@echo time sync
@w32tm /resync