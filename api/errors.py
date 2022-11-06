class UserException(Exception):
    def __init__(self, logs, message):
        self.logs = logs
        self.code = 400
        super().__init__(message)
