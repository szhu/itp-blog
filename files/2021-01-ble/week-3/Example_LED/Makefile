INO := $(shell basename $(shell pwd)).ino

all: /tmp/arduino-last-upload-timestamp monitor

/tmp/arduino-last-upload-timestamp: $(INO)
	arduino-cli compile \
		--fqbn arduino:samd:nano_33_iot
	arduino-cli upload $(INO) \
		--fqbn arduino:samd:nano_33_iot \
		--port /dev/cu.usbmodem*
	@touch /tmp/arduino-last-upload-timestamp
	@echo
	@sleep 2

monitor:
	cat /dev/cu.usbmodem*

.PHONY: all monitor
