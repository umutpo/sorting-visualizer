from api.config import ARRAY_SIZE_POWER_MULTIPLIER, OPERATION_SWAP, OPERATION_MODIFY
from api.errors import UserException


class Logger:
    def __init__(self, array):
        self.logs = []
        self.array = array
        self.initial_array_size = len(self.array)

    def add_to_log(self, arr, op, index=-1):
        """
        Adds current array state to Log

        :param arr: Current array after the modification
        :param op: Operation performed on array [0-2]
        :param index: Indices on where the operation was performed.
       """
        if len(self.logs) > 0 and len(self.logs) >= self.initial_array_size ** ARRAY_SIZE_POWER_MULTIPLIER:
            raise UserException(self.logs, "Execution of algorithm takes too long")
        if not isinstance(index, list):
            index = [index]
        self.logs.append({
            "operation": op,
            "array": arr,
            "indices": index
        })
        self.change_insert_to_swap_if_occurred()

    def change_insert_to_swap_if_occurred(self):
        """
        It checks if a swap has taken place. If it did, method replaces last two inserts
        with a swap operation.
        If not, it adds the original insert to the log
        """
        # No swap when len < 3 (one for initialization)
        if len(self.logs) < 3:
            return

        # If a modification didn't happen last, switch didn't happen either
        if self.logs[-1]["operation"] != OPERATION_MODIFY or \
                self.logs[-2]["operation"] != OPERATION_MODIFY or \
                self.logs[-1]["indices"] == -1:
            return

        modified_index1 = self.logs[-1]["indices"][0]
        modified_index2 = self.logs[-2]["indices"][0]

        final_array = self.logs[-1]["array"]
        array_before_modifications = self.logs[-3]["array"]

        if final_array[modified_index1] == array_before_modifications[modified_index2] and \
           final_array[modified_index2] == array_before_modifications[modified_index1]:
            # Remove modification logs
            self.logs = self.logs[:-2]
            # Insert a custom log with two indices instead of values TODO integrate both and remove value
            self.add_to_log(final_array, OPERATION_SWAP, [modified_index1, modified_index2])
