def maxContainerArea(heights: list[int]) -> int:
    left = 0
    right = len(heights) - 1
    best_area = 0

    while left < right:
        height = min(heights[left], heights[right])
        width = right - left
        area = height * width

        best_area = max(area, best_area)

        if heights[left] <= heights[right]:
            left += 1
        else:
            right -= 1

    return best_area