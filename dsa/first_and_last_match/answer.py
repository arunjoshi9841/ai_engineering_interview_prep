def firstAndLastMatch(values: list[int], target: int) -> tuple[int, int]:
   

    def first_search():
        left = 0
        right = len(values) -1
        result = -1
        
        while left <=right:
            mid = (right - left) // 2
            
            if values[mid] == target:
                result = mid
                right = mid - 1
            elif values[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return result
    
    def last_search():
        left = 0
        right = len(values) -1
        result = -1
        
        while left <=right:
            mid = (right - left) // 2
            
            if values[mid] == target:
                result = mid
                left = mid  + 1
            elif values[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return result
    
    return [first_search(), last_search()]
            
        
    
    
