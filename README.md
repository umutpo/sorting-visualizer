# Sorting Visualizer

## Instructions
Please install Python >= 3.8 for best results. Python 3.8.12 was used for this project. Using a different version of Python may work but please note it could cause errors and is NOT recommended.

Once you have Python installed, you can start by creating a virtual environment.
```bash
python3 -m venv api/venv && source api/venv/bin/activate  
```

Install dependencies
```bash
npm run install-py && npm install
```

Run the backend and frontend using npm
```bash
npm run fullstack
```

See [package.json](./package.json) for other startup/dev scripts.

Built for 1080p, use 1.25x for 1440p and 0.8x for 720p displays.

<br>

## Notes About Sorting Algorithms
The sorting algorithms must be in-place in order for them to correctly visualized. Following are the fully-tested, generic sorting algorithms that works smoothly in our tool:
- ***Bubble Sort***(https://runestone.academy/runestone/books/published/pythonds/SortSearch/TheBubbleSort.html)
```
def sorting_algorithm(arr):
    for passnum in range(len(arr)-1,0,-1):
        for i in range(passnum):
            if arr[i]>arr[i+1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
```
- ***Insertion Sort***(https://stackabuse.com/insertion-sort-in-python/)
```
def sorting_algorithm(arr):
    for index in range(1, len(arr)):
        currentValue = arr[index]
        currentPosition = index

        while currentPosition > 0 and arr[currentPosition - 1] > currentValue:
            arr[currentPosition] = arr[currentPosition - 1]
            currentPosition = currentPosition - 1

        arr[currentPosition] = currentValue
```
- ***Selection Sort***(https://stackabuse.com/selection-sort-in-python/)
```
def sorting_algorithm(arr):
    for i in range(len(arr)-1):
        min_index = i
        for j in range(i+1, len(arr)):
            if arr[j] < arr[min_index]:
                min_index = j
        arr[i], arr[min_index] = arr[min_index], arr[i]
```
- ***Quick Sort***(custom written for our own tool)
```
def sorting_algorithm(array, begin=0, end=None):
    if end is None:
        end = len(array) - 1
    if begin >= end:
        return
    pivot = begin
    for i in range(begin+1, end+1):
        if array[i] <= array[begin]:
            pivot += 1
            array[i], array[pivot] = array[pivot], array[i]
    array[pivot], array[begin] = array[begin], array[pivot]

    sorting_algorithm(array, begin, pivot-1)
    sorting_algorithm(array, pivot+1, end)
```
- Not a sorting algorithm, however, our tool can visualize it: ***Reverse Array Code***(custom written for our own tool):
```
def sorting_algorithm(arr):
    n = len(arr)
    for i in range(n // 2):
        arr[i], arr[n - i - 1] = arr[n - i - 1], arr[i]
```
