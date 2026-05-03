# Task 2: Fix Logical Bugs in Product API

## Objective
Fix incorrect behavior in the `/products` endpoint.

## Known Issues
- Search is case-sensitive
- Search does not trim whitespace
- Sorting is applied before filtering
- Combining filters produces incorrect results
- Some filters override others incorrectly

## Requirements
- Ensure all filters work together correctly
- Ensure correct order: filter → search → sort
- Ensure consistent behavior across all inputs

## Notes
- Do not change API structure
- Do not remove features