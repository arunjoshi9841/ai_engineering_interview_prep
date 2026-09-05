function firstAndLastMatch(
  values: number[],
  target: number
): [number, number] {

  function firstSearch(): number {
    let left = 0;
    let right = values.length - 1;
    let result = -1;

    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);

      if (values[mid] === target) {
        result = mid;
        right = mid - 1; // keep searching left
      } else if (values[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return result;
  }

  function lastSearch(): number {
    let left = 0;
    let right = values.length - 1;
    let result = -1;

    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);

      if (values[mid] === target) {
        result = mid;
        left = mid + 1; // keep searching right
      } else if (values[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return result;
  }

  return [firstSearch(), lastSearch()];
}