from api.logger import Logger
from api.config import OPERATION_MODIFY, OPERATION_DELETE, OPERATION_INIT, OPERATION_INSERT


class InstrumentedList(list):
    def __init__(self, arr=[], logger=None):
        super().__init__(arr)
        self.logger = logger or Logger(arr)
        self.logger.add_to_log(super().copy(), OPERATION_INIT)

    def __setitem__(self, i, val):
        super().__setitem__(i, val)
        self.logger.add_to_log(super().copy(), OPERATION_MODIFY, i)

    def __delitem__(self, i):
        val = self[i]
        super().__delitem__(i)
        if i == len(self):
            i = -1
        else:
            self.logger.add_to_log(super().copy(), OPERATION_DELETE, i)

    def __add__(self, other):
        super().__add__(other)
        self.logger.add_to_log(super().copy(), OPERATION_INSERT)

    def append(self, val):
        super().append(val)
        self.logger.add_to_log(super().copy(), OPERATION_INSERT)

    def pop(self, i=-1):
        if i == -1:
            val = super().pop()
        else:
            val = super().pop(i)
        self.logger.add_to_log(super().copy(), OPERATION_DELETE, i)
        return val

    def remove(self, val):
        i = super().index(val)
        super().remove(val)
        self.logger.add_to_log(super().copy(), OPERATION_DELETE, i)

    def insert(self, i, val):
        super().insert(i, val)
        self.logger.add_to_log(super().copy(), OPERATION_INSERT, i)

    def sort(self, *args, **kwargs):
        super().sort(*args, **kwargs)
        self.logger.add_to_log(super().copy(), OPERATION_MODIFY)
