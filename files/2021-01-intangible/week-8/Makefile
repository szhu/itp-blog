INO := $(shell basename $(shell pwd)).ino

all:
	@$(MAKE) upload
	@echo
	@sleep 2
	@$(MAKE) monitor

upload: $(INO)
	arduino-cli compile \
		--fqbn arduino:samd:nano_33_iot
	arduino-cli upload $(INO) \
		--fqbn arduino:samd:nano_33_iot \
		--port /dev/cu.usbmodem*

monitor:
	cat /dev/cu.usbmodem*

.PHONY: all upload monitor
