export function maxContainerArea(heights: readonly number[]): number {
  let left = 0;
  let right = heights.length - 1;
  let bestArea = 0;

  while (left < right) {
    const minHeight = Math.min(heights[left], heights[right]);
    const width = right - left;
    
    bestArea = Math.max(bestArea, width * minHeight);

    if (heights[left] <= heights[right]) {
      left++;
    } else {
      right--;
    }
  }

  return bestArea;
}