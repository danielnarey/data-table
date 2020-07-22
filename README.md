# data-table

[Experimental] A promise API for data wrangling in JavaScript

*This repository is no longer in active development*

## Validate

### isDataTable 

**`[*] => promise<boolean>`**

Evaluates to *true* if the following are satisfied: 

- the argument is an object or promise resolving to an object
- the object is not empty (i.e., has at least one key)
- the value of every key is an array (may contain any data type)
- arrays are of equal length

## Describe

### size

**`promise<dataTable> => promise<object>`**

Given a data table, returns a promise for an object containing the following key-value pairs:

- variables: the number of variables (arrays) in the data table
- observations: the number of observations (array length) for each variable

### variables

**`promise<dataTable> => promise<array<string>>`**

Given a data table, returns a promise for an array of variable names. 

### values

**`promise<dataTable>, string => promise<array>`**

Given a data table and a variable name, returns a promise for an array containing the variable's observed values.

### index

**`promise<dataTable>, number:int => promise<object>`**

Given a data table and a valid index, returns a promise for an object containing the value of each variable at that index, which represents a single observation across all variables in the data set.

### head

**`promise<dataTable>, [number:int] => promise<dataTable>`**

Given a data table and an optional output size `n` (defaults to 5), returns a promise for a data table containing only the first `n` observations.

## Functional Transforms

### apply

**`promise<dataTable>, function<dataTable, ...[*] => *>, ...[*] => promise<*>`**

Apply an arbitrary function on a data table, returning a promise for the result.

### apply2

**`promise<dataTable>, promise<dataTable>, function<dataTable, dataTable, ...[*] => *>, ...[*] => promise<*>`**

Apply an arbitrary function on two data tables, returning a promise for the result.

### mapVars

**`promise<dataTable>, array<string>, function<array, ...[*] => array>, ...[*] => promise<dataTable>`**

Apply an arbitrary function **on one or more variable arrays** in a data table, returning a promise for a new data table with the resulting arrays. 

### mapValues

**`promise<dataTable>, array<string>, function<*, ...[*] => *>, ...[*] => promise<dataTable>`**

Apply an arbitrary function **on every observed value** for one or more variable arrays in a data table, returning a promise for a new data table with the resulting values. 

## Combine/Split

### assign

**`promise<dataTable>, promise<dataTable> => promise<dataTable>`**

Assign the variables of two source data tables to a new target (analogous to `Object.assign({}, a, b)`). The two source data tables must have the same number of observations. If variable names are shared between the sources, the second overwrites the first. Returns a promise for the new combined data table.

### select

**`promise<dataTable>, array<string> => promise<dataTable>`**

Given a data table and an array of variable names, returns a promise for a data table containing only the selected variables. 

### filter

**`promise<dataTable>, function<object, [number:int], [dataTable] => boolean>  => promise<dataTable>`**

Given a data table and a filtering function, returns a promise for a data table filtered according the return values of the function, where `true` means keep and `false` means drop. The filtering function's first parameter is an object containing the value of each variable at index `i`, the second (optional) parameter is the value of `i`, and the third (optional) parameter is the data table being filtered. Analogous to `Array.prototype.filter`.

### sample
