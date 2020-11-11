import Quartz
import sys

try:
  while True:
    raw_input()
    # https://stackoverflow.com/a/11511419
    cg_session = Quartz.CGSessionCopyCurrentDictionary()
    print(cg_session.valueForKeyPath_("CGSSessionScreenIsLocked"))
    sys.stdout.flush()

except KeyboardInterrupt:
  pass
