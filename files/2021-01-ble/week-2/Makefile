all:
	arduino-cli compile \
		--fqbn arduino:samd:nano_33_iot
	arduino-cli upload \
		--fqbn arduino:samd:nano_33_iot \
		--port /dev/cu.usbmodem* week-2.ino
	@echo
	@sleep 2
	@echo "Starting serial monitor."
	cat /dev/cu.usbmodem*
