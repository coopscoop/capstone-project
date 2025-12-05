-- Each of these users won't ever be deleted so we can use them for testing. Just dummy data to have something to show with the more social searching features.

-- 3 users
INSERT INTO users (user_id, email, password, is_admin, display_name, bio) VALUES
(1, 'admin@example.com', '$2a$11$XxhFP1u/bc0ocwVEmXo.JONv/cS6s8JIRTGJgewmo7MV71oGKRFda', TRUE, 'CodeMaster', 'I love algorithms and data structures'),
(2, 'user@example.com', '$2a$11$IMkYkaUjsFRp.6Ahd9zXS.OaYQ7D7oMrzs4HTe9nAkfOWSwYBR2Oi', FALSE, 'MathWizard', 'Mathematics and problem solving enthusiast'),
(3, 'coopscoop8515@example.com', '$2a$11$yRNEs5BGNDJ/9jrvHe7/Q.F0A5QARhWoXealDC8p/MeV/7QndV9RC', FALSE, 'PythonPro', 'Python developer and coding instructor');


-- User 1 Posts (5 visible, 5 hidden)
INSERT INTO posts (user_id, title, description, number_of_likes, code, is_visible) VALUES
(1, 'Standard Deviation Calculator', 'Calculate standard deviation from a list of numbers', 45, 'def standard_deviation(numbers):\n    n = len(numbers)\n    mean = sum(numbers) / n\n    variance = sum((x - mean) ** 2 for x in numbers) / n\n    return variance ** 0.5\n\ndata = [2, 4, 6, 8, 10]\nprint(f"Standard Deviation: {standard_deviation(data):.2f}")', TRUE),
(1, 'Fibonacci Number Generator', 'Generate the nth Fibonacci number', 32, 'def fibonacci(n):\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n\nprint(f"10th Fibonacci: {fibonacci(10)}")\nprint(f"20th Fibonacci: {fibonacci(20)}")', TRUE),
(1, 'Prime Number Checker', 'Check if a number is prime', 28, 'def is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n ** 0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n\nfor num in range(1, 20):\n    if is_prime(num):\n        print(f"{num} is prime")', TRUE),
(1, 'Greatest Common Divisor', 'Find GCD of two numbers using Euclidean algorithm', 67, 'def gcd(a, b):\n    while b:\n        a, b = b, a % b\n    return a\n\nprint(f"GCD of 48 and 18: {gcd(48, 18)}")\nprint(f"GCD of 100 and 35: {gcd(100, 35)}")', TRUE),
(1, 'Factorial Calculator', 'Calculate factorial recursively and iteratively', 41, 'def factorial_recursive(n):\n    if n <= 1:\n        return 1\n    return n * factorial_recursive(n - 1)\n\ndef factorial_iterative(n):\n    result = 1\n    for i in range(2, n + 1):\n        result *= i\n    return result\n\nprint(f"5! = {factorial_iterative(5)}")\nprint(f"10! = {factorial_recursive(10)}")', TRUE),
(1, 'Mean, Median, Mode Calculator', 'Calculate basic statistical measures', 15, 'def mean(numbers):\n    return sum(numbers) / len(numbers)\n\ndef median(numbers):\n    sorted_nums = sorted(numbers)\n    n = len(sorted_nums)\n    mid = n // 2\n    return sorted_nums[mid] if n % 2 != 0 else (sorted_nums[mid-1] + sorted_nums[mid]) / 2\n\ndata = [1, 3, 5, 7, 9, 11]\nprint(f"Mean: {mean(data):.2f}")\nprint(f"Median: {median(data):.2f}")', FALSE),
(1, 'Quadratic Equation Solver', 'Solve ax² + bx + c = 0', 23, 'def solve_quadratic(a, b, c):\n    discriminant = b**2 - 4*a*c\n    if discriminant < 0:\n        return "No real solutions"\n    elif discriminant == 0:\n        x = -b / (2*a)\n        return f"One solution: x = {x}"\n    else:\n        x1 = (-b + discriminant**0.5) / (2*a)\n        x2 = (-b - discriminant**0.5) / (2*a)\n        return f"x1 = {x1:.2f}, x2 = {x2:.2f}"\n\nprint(solve_quadratic(1, -5, 6))', FALSE),
(1, 'Power Function', 'Calculate x^y without using **', 19, 'def power(base, exponent):\n    if exponent == 0:\n        return 1\n    result = 1\n    for _ in range(abs(exponent)):\n        result *= base\n    return result if exponent > 0 else 1 / result\n\nprint(f"2^10 = {power(2, 10)}")\nprint(f"5^3 = {power(5, 3)}")\nprint(f"2^-3 = {power(2, -3)}")', FALSE),
(1, 'Binary to Decimal Converter', 'Convert binary string to decimal number', 12, 'def binary_to_decimal(binary):\n    decimal = 0\n    for digit in binary:\n        decimal = decimal * 2 + int(digit)\n    return decimal\n\nprint(f"1010 in decimal: {binary_to_decimal(''1010'')}")\nprint(f"11111111 in decimal: {binary_to_decimal(''11111111'')}")', FALSE),
(1, 'Palindrome Checker', 'Check if a string is a palindrome', 8, 'def is_palindrome(text):\n    cleaned = text.lower().replace(" ", "")\n    return cleaned == cleaned[::-1]\n\ntest_cases = ["racecar", "hello", "A man a plan a canal Panama"]\nfor word in test_cases:\n    result = "is" if is_palindrome(word) else "is not"\n    print(f"''{word}'' {result} a palindrome")', FALSE);

-- User 2 Posts (5 visible, 5 hidden)
INSERT INTO posts (user_id, title, description, number_of_likes, code, is_visible) VALUES
(2, 'Bubble Sort Implementation', 'Simple sorting algorithm visualization', 89, 'def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr\n\nnumbers = [64, 34, 25, 12, 22, 11, 90]\nprint(f"Sorted: {bubble_sort(numbers)}")', TRUE),
(2, 'Leap Year Checker', 'Determine if a year is a leap year', 54, 'def is_leap_year(year):\n    if year % 4 != 0:\n        return False\n    elif year % 100 != 0:\n        return True\n    elif year % 400 != 0:\n        return False\n    else:\n        return True\n\nfor year in [2000, 2020, 2100, 2024]:\n    result = "is" if is_leap_year(year) else "is not"\n    print(f"{year} {result} a leap year")', TRUE),
(2, 'Temperature Converter', 'Convert between Celsius and Fahrenheit', 38, 'def celsius_to_fahrenheit(c):\n    return (c * 9/5) + 32\n\ndef fahrenheit_to_celsius(f):\n    return (f - 32) * 5/9\n\nprint(f"0°C = {celsius_to_fahrenheit(0):.1f}°F")\nprint(f"100°C = {celsius_to_fahrenheit(100):.1f}°F")\nprint(f"32°F = {fahrenheit_to_celsius(32):.1f}°C")\nprint(f"98.6°F = {fahrenheit_to_celsius(98.6):.1f}°C")', TRUE),
(2, 'Sum of Digits', 'Calculate sum of all digits in a number', 72, 'def sum_of_digits(n):\n    total = 0\n    n = abs(n)\n    while n > 0:\n        total += n % 10\n        n //= 10\n    return total\n\ntest_numbers = [123, 9876, 100, 55555]\nfor num in test_numbers:\n    print(f"Sum of digits in {num}: {sum_of_digits(num)}")', TRUE),
(2, 'String Reverser', 'Reverse a string without using built-in reverse', 44, 'def reverse_string(text):\n    reversed_text = ""\n    for char in text:\n        reversed_text = char + reversed_text\n    return reversed_text\n\ntest_strings = ["hello", "Python", "12345"]\nfor s in test_strings:\n    print(f"''{s}'' reversed: ''{reverse_string(s)}''")', TRUE),
(2, 'Perfect Number Checker', 'Check if a number equals sum of its divisors', 21, 'def is_perfect(n):\n    if n < 2:\n        return False\n    divisor_sum = 1\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            divisor_sum += i\n            if i != n // i:\n                divisor_sum += n // i\n    return divisor_sum == n\n\nfor num in range(1, 30):\n    if is_perfect(num):\n        print(f"{num} is perfect")', FALSE),
(2, 'Armstrong Number Checker', 'Check if number equals sum of cubes of digits', 17, 'def is_armstrong(n):\n    digits = str(n)\n    power = len(digits)\n    total = sum(int(d) ** power for d in digits)\n    return total == n\n\nprint("Armstrong numbers up to 1000:")\nfor num in range(1, 1001):\n    if is_armstrong(num):\n        print(num, end=" ")', FALSE),
(2, 'LCM Calculator', 'Find Least Common Multiple of two numbers', 29, 'def gcd(a, b):\n    while b:\n        a, b = b, a % b\n    return a\n\ndef lcm(a, b):\n    return abs(a * b) // gcd(a, b)\n\nprint(f"LCM of 12 and 18: {lcm(12, 18)}")\nprint(f"LCM of 21 and 6: {lcm(21, 6)}")', FALSE),
(2, 'Decimal to Binary Converter', 'Convert decimal to binary string', 14, 'def decimal_to_binary(n):\n    if n == 0:\n        return "0"\n    binary = ""\n    while n > 0:\n        binary = str(n % 2) + binary\n        n //= 2\n    return binary\n\nfor num in [10, 255, 42, 128]:\n    print(f"{num} in binary: {decimal_to_binary(num)}")', FALSE),
(2, 'Matrix Transpose', 'Transpose a 2D matrix', 11, 'def transpose(matrix):\n    rows = len(matrix)\n    cols = len(matrix[0])\n    result = [[0 for _ in range(rows)] for _ in range(cols)]\n    for i in range(rows):\n        for j in range(cols):\n            result[j][i] = matrix[i][j]\n    return result\n\nmatrix = [[1, 2, 3], [4, 5, 6]]\nprint("Original:", matrix)\nprint("Transposed:", transpose(matrix))', FALSE);

-- User 3 Posts (5 visible, 5 hidden)
INSERT INTO posts (user_id, title, description, number_of_likes, code, is_visible) VALUES
(3, 'Linear Search', 'Find element in unsorted list', 61, 'def linear_search(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target:\n            return i\n    return -1\n\nnumbers = [4, 2, 7, 1, 9, 5]\ntarget = 7\nresult = linear_search(numbers, target)\nif result != -1:\n    print(f"Found {target} at index {result}")\nelse:\n    print(f"{target} not found")', TRUE),
(3, 'Binary Search', 'Efficient search in sorted list', 48, 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\nsorted_nums = [1, 3, 5, 7, 9, 11, 13]\n    print(f"Index of 7: {binary_search(sorted_nums, 7)}")', TRUE),
(3, 'Count Vowels and Consonants', 'Count vowels and consonants in a string', 76, 'def count_letters(text):\n    vowels = "aeiouAEIOU"\n    v_count = 0\n    c_count = 0\n    for char in text:\n        if char.isalpha():\n            if char in vowels:\n                v_count += 1\n            else:\n                c_count += 1\n    return v_count, c_count\n\ntext = "Hello World"\nv, c = count_letters(text)\nprint(f"Vowels: {v}, Consonants: {c}")', TRUE),
(3, 'Remove Duplicates', 'Remove duplicate elements from list', 39, 'def remove_duplicates(lst):\n    unique = []\n    for item in lst:\n        if item not in unique:\n            unique.append(item)\n    return unique\n\nnumbers = [1, 2, 2, 3, 4, 4, 5, 1]\nprint(f"Original: {numbers}")\nprint(f"Unique: {remove_duplicates(numbers)}")', TRUE),
(3, 'Caesar Cipher', 'Encrypt text using Caesar cipher', 83, 'def caesar_cipher(text, shift):\n    result = ""\n    for char in text:\n        if char.isalpha():\n            start = ord(''A'') if char.isupper() else ord(''a'')\n            shifted = (ord(char) - start + shift) % 26 + start\n            result += chr(shifted)\n        else:\n            result += char\n    return result\n\nmessage = "Hello World"\nencrypted = caesar_cipher(message, 3)\nprint(f"Original: {message}")\nprint(f"Encrypted: {encrypted}")', TRUE),
(3, 'Find Max and Min', 'Find maximum and minimum in a list', 25, 'def find_max_min(numbers):\n    if not numbers:\n        return None, None\n    max_val = numbers[0]\n    min_val = numbers[0]\n    for num in numbers:\n        if num > max_val:\n            max_val = num\n        if num < min_val:\n            min_val = num\n    return max_val, min_val\n\ndata = [45, 12, 78, 23, 91, 5]\nmax_num, min_num = find_max_min(data)\nprint(f"Max: {max_num}, Min: {min_num}")', FALSE),
(3, 'Merge Two Sorted Lists', 'Merge two sorted lists into one', 18, 'def merge_sorted(list1, list2):\n    result = []\n    i, j = 0, 0\n    while i < len(list1) and j < len(list2):\n        if list1[i] <= list2[j]:\n            result.append(list1[i])\n            i += 1\n        else:\n            result.append(list2[j])\n            j += 1\n    result.extend(list1[i:])\n    result.extend(list2[j:])\n    return result\n\na = [1, 3, 5]\nb = [2, 4, 6]\nprint(merge_sorted(a, b))', FALSE),
(3, 'Anagram Checker', 'Check if two strings are anagrams', 16, 'def are_anagrams(str1, str2):\n    str1 = str1.lower().replace(" ", "")\n    str2 = str2.lower().replace(" ", "")\n    if len(str1) != len(str2):\n        return False\n    for char in str1:\n        if str1.count(char) != str2.count(char):\n            return False\n    return True\n\nprint(are_anagrams("listen", "silent"))\nprint(are_anagrams("hello", "world"))', FALSE),
(3, 'FizzBuzz', 'Classic FizzBuzz problem', 22, 'def fizzbuzz(n):\n    result = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            result.append("FizzBuzz")\n        elif i % 3 == 0:\n            result.append("Fizz")\n        elif i % 5 == 0:\n            result.append("Buzz")\n        else:\n            result.append(str(i))\n    return result\n\nprint(fizzbuzz(20))', FALSE),
(3, 'Pascal Triangle', 'Generate Pascal triangle rows', 13, 'def pascal_triangle(n):\n    triangle = []\n    for i in range(n):\n        row = [1]\n        if triangle:\n            last_row = triangle[-1]\n            for j in range(len(last_row) - 1):\n                row.append(last_row[j] + last_row[j + 1])\n            row.append(1)\n        triangle.append(row)\n    return triangle\n\nfor row in pascal_triangle(6):\n    print(row)', FALSE);

-- Tags for all posts
INSERT INTO tags (post_id, tag_name) VALUES
-- User 1 Posts
(1, 'statistics'), (1, 'math'), (1, 'data-analysis'),
(2, 'fibonacci'), (2, 'recursion'), (2, 'sequences'),
(3, 'prime-numbers'), (3, 'math'), (3, 'algorithms'),
(4, 'math'), (4, 'algorithms'), (4, 'euclidean'),
(5, 'recursion'), (5, 'math'), (5, 'factorial'),
(6, 'statistics'), (6, 'math'), (6, 'data-analysis'), (6, 'median'),
(7, 'math'), (7, 'algebra'), (7, 'quadratic'),
(8, 'math'), (8, 'recursion'), (8, 'exponents'),
(9, 'binary'), (9, 'conversion'), (9, 'number-systems'),
(10, 'strings'), (10, 'palindrome'), (10, 'text-processing'),

-- User 2 Posts
(11, 'sorting'), (11, 'algorithms'), (11, 'bubble-sort'),
(12, 'date-time'), (12, 'calendar'), (12, 'leap-year'),
(13, 'conversion'), (13, 'temperature'), (13, 'fahrenheit'), (13, 'celsius'),
(14, 'math'), (14, 'digits'), (14, 'numbers'),
(15, 'strings'), (15, 'reverse'), (15, 'text-processing'),
(16, 'math'), (16, 'perfect-numbers'), (16, 'number-theory'),
(17, 'math'), (17, 'armstrong'), (17, 'number-theory'),
(18, 'math'), (18, 'lcm'), (18, 'gcd'), (18, 'number-theory'),
(19, 'binary'), (19, 'conversion'), (19, 'number-systems'),
(20, 'matrix'), (20, 'arrays'), (20, 'linear-algebra'),

-- User 3 Posts
(21, 'searching'), (21, 'algorithms'), (21, 'linear-search'),
(22, 'searching'), (22, 'algorithms'), (22, 'binary-search'), (22, 'sorted'),
(23, 'strings'), (23, 'vowels'), (23, 'text-analysis'),
(24, 'arrays'), (24, 'duplicates'), (24, 'data-processing'),
(25, 'encryption'), (25, 'caesar'), (25, 'cryptography'), (25, 'strings'),
(26, 'arrays'), (26, 'min-max'), (26, 'algorithms'),
(27, 'sorting'), (27, 'merge'), (27, 'algorithms'), (27, 'arrays'),
(28, 'strings'), (28, 'anagram'), (28, 'text-processing'),
(29, 'fizzbuzz'), (29, 'loops'), (29, 'conditionals'),
(30, 'pascal'), (30, 'math'), (30, 'triangles'), (30, 'sequences');