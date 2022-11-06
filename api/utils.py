import json
import time

from api.errors import UserException
from api.instrumented_list import InstrumentedList
from api.logger import Logger


def create_json_from_log(logger, time_took):
    j = {
        "arrayLog": logger.logs,
        "runtime": time_took
    }

    return json.dumps(j)


def setup_and_execute_code(code, instrumented_list):
    """
    :param instrumented_list: Object to be used dynamically in the exec call
    :param code: user's code
    """
    # Handle recursive calls in exec:
    # https://stackoverflow.com/questions/871887/using-exec-with-recursive-functions/871983#871983
    user_code_with_algorithm_call = "global sorting_algorithm\n" + code + "\n\nsorting_algorithm(instrumented_list)"
    exec(user_code_with_algorithm_call)


def execute_user_code(user_code, array):
    """
    This method is the main entry point for the endpoint that receives the user code
    after decoding. It should manipulate the log and return the log in json form at the end

    :param user_code: User Code in decoded form
    :param array: Array to be sorted
    """

    logger = Logger(array)
    instrumented_list = InstrumentedList(array, logger)

    try:
        start = time.time()
        setup_and_execute_code(user_code, instrumented_list)
        end = time.time()
    except NameError as err:
        error_message = str(err)
        if "sorting_algorithm" in error_message:
            error_message = "Function 'sorting_algorithm' was removed or renamed"
        raise UserException(logger.logs, error_message) from None
    except Exception as err:
        raise UserException(logger.logs, str(err)) from None

    if logger.logs[-1]["array"] != sorted(array):
        raise UserException(logger.logs, "Algorithm does not sort the array")

    return create_json_from_log(logger, (end - start) * 1000)
